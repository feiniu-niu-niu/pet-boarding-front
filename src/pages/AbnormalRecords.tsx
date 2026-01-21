import { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Empty, message, Spin, Tag, Descriptions, Modal, Button, Tabs, Form, Input, InputNumber, DatePicker, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TabsProps } from "antd";
import dayjs from "dayjs";
import Header from "../components/Header";
import { getAbnormalRecordList, getAvatarUrl, addTreatmentRecord } from "../services/api";
import { isSuccess } from "../utils/response";
import { getUserInfo } from "../utils/auth";
import "./abnormal-records.scss";

// 宠物信息接口
interface PetInfo {
  petId?: number;
  name?: string;
  breed?: string;
  type?: string;
  age?: number;
  weight?: number;
  avatarUrl?: string;
  specialHabits?: string;
  vaccinationInfo?: string;
  medicalHistory?: string;
  [key: string]: any;
}

// 异常记录接口（根据后端实际返回的数据结构）
interface AbnormalRecord {
  recordId?: number;
  orderId?: string;
  petId?: number;
  storeId?: number;
  userId?: number;
  cageId?: number;
  abnormalType?: string;
  description?: string;
  suggestionAction?: string;
  suggestedTreatment?: string;
  isNotified?: number;
  isTreatment?: number;
  recordCreateTime?: string;
  approvalId?: number;
  approvalStatus?: number;
  approvalCreateTime?: string;
  ownerDecision?: number;
  ownerDecisionTime?: string;
  orderStatus?: number;
  startDate?: string;
  endDate?: string;
  checkinTime?: string;
  petInfo?: PetInfo;
  [key: string]: any;
}

/**
 * 异常记录页面
 */
const AbnormalRecords: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [recordList, setRecordList] = useState<AbnormalRecord[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<AbnormalRecord | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [treatmentModalOpen, setTreatmentModalOpen] = useState(false);
  const [treatmentForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // 从用户信息中获取 storeId
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo && (userInfo as any).storeId) {
      setStoreId((userInfo as any).storeId);
    } else {
      message.error("获取门店信息失败，请重新登录");
    }
  }, []);

  // 加载异常记录列表
  const loadAbnormalRecords = useCallback(async (approvalStatus?: number) => {
    if (!storeId) {
      return;
    }

    setLoading(true);
    try {
      const result = await getAbnormalRecordList(storeId, approvalStatus);
      if (isSuccess(result.code)) {
        let records: AbnormalRecord[] = [];
        
        // 处理返回的数据
        if (Array.isArray(result.data)) {
          records = result.data as AbnormalRecord[];
        } else if (result.data && typeof result.data === "object") {
          const listData = (result.data as any).list || (result.data as any).data || (result.data as any).records || [];
          records = Array.isArray(listData) ? (listData as AbnormalRecord[]) : [];
        }

        setRecordList(records);
      } else {
        message.error(result.msg || "查询异常记录失败");
        setRecordList([]);
      }
    } catch (error: any) {
      console.error("加载异常记录列表失败:", error);
      const errorMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        "加载异常记录列表失败，请稍后重试";
      message.error(errorMsg);
      setRecordList([]);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // storeId 或 activeTab 变化时加载数据
  useEffect(() => {
    if (storeId) {
      // 根据当前 tab 决定 approvalStatus
      const approvalStatusMap: Record<string, number | undefined> = {
        all: undefined,      // 全部
        pending: 0,          // 待处理
        agreed: 1,           // 已同意
        rejected: 2,         // 已拒绝
        expired: 3,          // 已过期
      };
      loadAbnormalRecords(approvalStatusMap[activeTab]);
    }
  }, [storeId, activeTab, loadAbnormalRecords]);

  // 格式化日期时间
  const formatDateTime = (dateTimeStr?: string | null): string => {
    if (!dateTimeStr) return "-";
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateTimeStr;
    }
  };

  // 处理查看详情
  const handleViewDetail = useCallback((record: AbnormalRecord) => {
    setCurrentRecord(record);
    setDetailModalOpen(true);
  }, []);

  // 处理关闭详情弹窗
  const handleDetailModalClose = () => {
    setDetailModalOpen(false);
    setCurrentRecord(null);
  };

  // 处理 tab 切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // 处理打开新增治疗弹窗
  const handleAddTreatment = useCallback((record: AbnormalRecord) => {
    if (!record.approvalId) {
      message.error("缺少审批ID，无法新增治疗记录");
      return;
    }
    setCurrentRecord(record);
    treatmentForm.resetFields();
    // 设置默认值为当前记录的信息
    treatmentForm.setFieldsValue({
      approvalId: record.approvalId,
      actualTreatment: record.suggestedTreatment || "",
      treatmentTime: dayjs(),
    });
    setTreatmentModalOpen(true);
  }, [treatmentForm]);

  // 处理关闭新增治疗弹窗
  const handleTreatmentModalClose = () => {
    setTreatmentModalOpen(false);
    setCurrentRecord(null);
    treatmentForm.resetFields();
  };

  // 处理提交治疗记录
  const handleSubmitTreatment = async () => {
    try {
      const values = await treatmentForm.validateFields();
      if (!currentRecord?.approvalId) {
        message.error("缺少审批ID");
        return;
      }

      setSubmitting(true);
      const result = await addTreatmentRecord({
        approvalId: currentRecord.approvalId,
        actualTreatment: values.actualTreatment,
        medicationsUsed: values.medicationsUsed,
        // 后端 LocalDateTime 需要 ISO 字符串格式（含 T），例如：2026-01-15T10:31:20
        treatmentTime: values.treatmentTime.format("YYYY-MM-DDTHH:mm:ss"),
        actualCost: values.actualCost,
      });

      if (isSuccess(result.code)) {
        message.success("新增治疗记录成功");
        handleTreatmentModalClose();
        // 刷新列表
        const approvalStatusMap: Record<string, number | undefined> = {
          all: undefined,
          pending: 0,
          agreed: 1,
          rejected: 2,
          expired: 3,
        };
        loadAbnormalRecords(approvalStatusMap[activeTab]);
      } else {
        message.error(result.msg || "新增治疗记录失败");
      }
    } catch (error: any) {
      if (error?.errorFields) {
        // 表单验证错误
        return;
      }
      console.error("提交治疗记录失败:", error);
      const errorMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        "提交治疗记录失败，请稍后重试";
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Tab 配置
  const tabItems: TabsProps["items"] = [
    {
      key: "all",
      label: "全部",
    },
    {
      key: "pending",
      label: "待决定",
    },
    {
      key: "agreed",
      label: "已同意",
    },
    {
      key: "rejected",
      label: "已拒绝",
    },
    {
      key: "expired",
      label: "已过期",
    },
  ];

  // 表格列定义（根据activeTab动态显示操作按钮）
  const columns: ColumnsType<AbnormalRecord> = useMemo(() => [
    {
      title: "订单号",
      dataIndex: "orderId",
      key: "orderId",
      width: 180,
      align: "center",
    },
    {
      title: "宠物名称",
      key: "petName",
      width: 150,
      align: "center",
      render: (_: any, record: AbnormalRecord) => {
        const petName = record.petInfo?.name;
        const petAvatarUrl = record.petInfo?.avatarUrl;
        if (petAvatarUrl) {
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
              <img
                src={getAvatarUrl(petAvatarUrl, "pet")}
                alt={petName || "宠物"}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect fill='%23f0f0f0' width='32' height='32'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3E🐾%3C/text%3E%3C/svg%3E";
                }}
              />
              <span>{petName || "-"}</span>
            </div>
          );
        }
        return petName || "-";
      },
    },
    {
      title: "异常类型",
      dataIndex: "abnormalType",
      key: "abnormalType",
      width: 120,
      align: "center",
      render: (text: string) => text || "-",
    },
    {
      title: "是否通知",
      dataIndex: "isNotified",
      key: "isNotified",
      width: 100,
      align: "center",
      render: (value: number) => (
        <Tag color={value === 1 ? "green" : "default"}>
          {value === 1 ? "已通知" : "未通知"}
        </Tag>
      ),
    },
    {
      title: "是否治疗",
      dataIndex: "isTreatment",
      key: "isTreatment",
      width: 100,
      align: "center",
      render: (value: number) => (
        <Tag color={value === 1 ? "orange" : "default"}>
          {value === 1 ? "需要治疗" : "不需要"}
        </Tag>
      ),
    },
    {
      title: "主人决定",
      dataIndex: "ownerDecision",
      key: "ownerDecision",
      width: 100,
      align: "center",
      render: (value: number) => {
        if (value === 1) {
          return <Tag color="green">同意治疗</Tag>;
        } else if (value === 0) {
          return <Tag color="red">拒绝治疗</Tag>;
        }
        return <Tag>待决定</Tag>;
      },
    },
    {
      title: "记录创建时间",
      dataIndex: "recordCreateTime",
      key: "recordCreateTime",
      width: 180,
      align: "center",
      render: (text: string) => formatDateTime(text),
    },
    {
      title: "操作",
      key: "action",
      width: 180,
      align: "center",
      fixed: "right",
      render: (_: any, record: AbnormalRecord) => (
        <Space size="small">
          <Button type="link" onClick={() => handleViewDetail(record)}>
            查看详情
          </Button>
          {activeTab === "agreed" && (
            <Button type="link" onClick={() => handleAddTreatment(record)}>
              新增治疗
            </Button>
          )}
        </Space>
      ),
    },
  ], [activeTab, handleViewDetail, handleAddTreatment]);

  return (
    <div className="abnormal-records-container">
      <Header />
      <div className="abnormal-records-content">
        <div className="page-header">
          <h1>异常记录</h1>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          style={{ marginBottom: 16 }}
        />

        <Spin spinning={loading}>
          {recordList.length === 0 && !loading ? (
            <Empty description="暂无异常记录" />
          ) : (
            <Table
              columns={columns}
              dataSource={recordList}
              rowKey={(record) => record.recordId?.toString() || record.orderId || ""}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: 1200 }}
            />
          )}
        </Spin>

        {/* 新增治疗弹窗 */}
        <Modal
          title="新增治疗记录"
          open={treatmentModalOpen}
          onCancel={handleTreatmentModalClose}
          onOk={handleSubmitTreatment}
          confirmLoading={submitting}
          width={600}
        >
          <Form
            form={treatmentForm}
            layout="vertical"
            initialValues={{
              treatmentTime: dayjs(),
            }}
          >
            <Form.Item
              label="审批ID"
              name="approvalId"
              hidden
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="实际执行的治疗方案"
              name="actualTreatment"
              rules={[{ required: true, message: "请输入实际执行的治疗方案" }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="请输入实际执行的治疗方案"
              />
            </Form.Item>
            <Form.Item
              label="药物详情"
              name="medicationsUsed"
              rules={[{ required: true, message: "请输入药物详情" }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="请输入使用的药物详情"
              />
            </Form.Item>
            <Form.Item
              label="治疗时间"
              name="treatmentTime"
              rules={[{ required: true, message: "请选择治疗时间" }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: "100%" }}
                placeholder="请选择治疗时间"
              />
            </Form.Item>
            <Form.Item
              label="实际治疗费用"
              name="actualCost"
              rules={[
                { required: true, message: "请输入实际治疗费用" },
                { type: "number", min: 0, message: "费用不能为负数" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="请输入实际治疗费用"
                min={0}
                precision={2}
                addonBefore="¥"
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* 详情弹窗 */}
        <Modal
          title="异常记录详情"
          open={detailModalOpen}
          onCancel={handleDetailModalClose}
          footer={[
            <Button key="close" onClick={handleDetailModalClose}>
              关闭
            </Button>,
          ]}
          width={700}
        >
          {currentRecord && (
            <Descriptions column={1} bordered>
              <Descriptions.Item label="订单号">
                {currentRecord.orderId || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="宠物信息">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {currentRecord.petInfo?.avatarUrl && (
                    <img
                      src={getAvatarUrl(currentRecord.petInfo.avatarUrl, "pet")}
                      alt={currentRecord.petInfo.name || "宠物"}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect fill='%23f0f0f0' width='50' height='50'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3E🐾%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      {currentRecord.petInfo?.name || "-"}
                    </div>
                    <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                      {currentRecord.petInfo?.type || ""} · {currentRecord.petInfo?.breed || ""}
                      {currentRecord.petInfo?.age && ` · ${currentRecord.petInfo.age}岁`}
                      {currentRecord.petInfo?.weight && ` · ${currentRecord.petInfo.weight}kg`}
                    </div>
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="订单状态">
                {currentRecord.orderStatus === 1 && <Tag color="orange">待确认</Tag>}
                {currentRecord.orderStatus === 2 && <Tag color="blue">已预约(定金已付)</Tag>}
                {currentRecord.orderStatus === 3 && <Tag color="green">寄养中(已入托)</Tag>}
                {currentRecord.orderStatus === 4 && <Tag color="purple">待结算</Tag>}
                {currentRecord.orderStatus === 5 && <Tag color="success">已完成</Tag>}
                {currentRecord.orderStatus === 0 && <Tag color="default">已取消</Tag>}
                {!currentRecord.orderStatus && "-"}
              </Descriptions.Item>
              <Descriptions.Item label="寄养时间">
                {currentRecord.startDate
                  ? formatDateTime(currentRecord.startDate).split(" ")[0]
                  : "-"}{" "}
                ~{" "}
                {currentRecord.endDate
                  ? formatDateTime(currentRecord.endDate).split(" ")[0]
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="异常类型">
                {currentRecord.abnormalType || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="异常描述">
                {currentRecord.description || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="建议措施">
                {currentRecord.suggestionAction || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="建议治疗">
                {currentRecord.suggestedTreatment || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="是否通知">
                <Tag color={currentRecord.isNotified === 1 ? "green" : "default"}>
                  {currentRecord.isNotified === 1 ? "已通知" : "未通知"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="是否治疗">
                <Tag color={currentRecord.isTreatment === 1 ? "orange" : "default"}>
                  {currentRecord.isTreatment === 1 ? "需要治疗" : "不需要"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="主人决定">
                {currentRecord.ownerDecision === 1 && (
                  <Tag color="green">同意治疗</Tag>
                )}
                {currentRecord.ownerDecision === 0 && (
                  <Tag color="red">拒绝治疗</Tag>
                )}
                {currentRecord.ownerDecision === undefined && (
                  <Tag>待决定</Tag>
                )}
              </Descriptions.Item>
              {currentRecord.ownerDecisionTime && (
                <Descriptions.Item label="决定时间">
                  {formatDateTime(currentRecord.ownerDecisionTime)}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="记录创建时间">
                {formatDateTime(currentRecord.recordCreateTime)}
              </Descriptions.Item>
              {currentRecord.approvalCreateTime && (
                <Descriptions.Item label="审批创建时间">
                  {formatDateTime(currentRecord.approvalCreateTime)}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AbnormalRecords;
