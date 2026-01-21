import { useState, useEffect } from "react";
import { Table, Tabs, Modal, Form, Input, Upload, Button, message, Pagination, TimePicker, Spin, Descriptions, Switch } from "antd";
import type { TabsProps, UploadFile } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Header from "../components/Header";
import { getPetListByStoreId, getAvatarUrl, addCareLog, getCareLogDetail, getBackendBaseUrl, addAbnormalRecord } from "../services/api";
import { isSuccess } from "../utils/response";
import { getUserInfo } from "../utils/auth";
import "./daily-care.scss";

const { TextArea } = Input;

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

// 订单信息接口
interface OrderInfo {
  orderId?: string;
  orderStatus?: number;
  storeId?: number;
  userId?: number;
  petId?: number;
  cageId?: number;
  totalAmount?: number;
  depositAmount?: number;
  depositPaid?: number;
  finalAmount?: number;
  startDate?: string;
  endDate?: string;
  createTime?: string;
  expireTime?: string;
  checkinTime?: string;
  checkoutTime?: string;
  petInfo?: PetInfo; // 保留以兼容旧数据格式
  storeName?: string;
  logId?: number; // 照料日志ID（用于已上传标签页）
  logTime?: string | { hour?: number; minute?: number; second?: number }; // 照料时间（字符串格式 "HH:mm:ss" 或对象格式）
  logDate?: string; // 照料日期
  // 新的扁平化字段（后端直接返回）
  petName?: string;
  petType?: string;
  petBreed?: string;
  petWeight?: number;
  petAge?: number;
  petAvatarUrl?: string;
  careItem?: string;
  carePhoto?: string | null;
  details?: string;
  [key: string]: any;
}

/**
 * 日常照料页面
 */
const DailyCare: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("pending"); // "uploaded" | "pending"
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [orderList, setOrderList] = useState<OrderInfo[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [currentRecord, setCurrentRecord] = useState<OrderInfo | null>(null); // 当前选中的记录
  const [detailModalOpen, setDetailModalOpen] = useState(false); // 查看详情模态框
  const [careLogDetail, setCareLogDetail] = useState<any>(null); // 照料日志详情
  const [loadingDetail, setLoadingDetail] = useState(false); // 加载详情状态
  const [currentDetailRecord, setCurrentDetailRecord] = useState<OrderInfo | null>(null); // 当前查看详情的记录（用于获取宠物信息）
  const [abnormalRecordModalOpen, setAbnormalRecordModalOpen] = useState(false); // 异常记录模态框
  const [abnormalRecordForm] = Form.useForm(); // 异常记录表单
  const [currentAbnormalRecord, setCurrentAbnormalRecord] = useState<OrderInfo | null>(null); // 当前选中的异常记录

  // 从用户信息中获取 storeId
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo && (userInfo as any).storeId) {
      setStoreId((userInfo as any).storeId);
    } else {
      message.error("获取门店信息失败，请重新登录");
    }
  }, []);

  // 加载宠物列表（根据标签页状态：已上传/待上传）
  const loadPetList = async () => {
    if (!storeId) {
      return;
    }

    setLoading(true);
    try {
      // 根据标签页状态确定 isUploaded 参数
      // "uploaded" -> isUploaded: true
      // "pending" -> isUploaded: false
      const isUploaded = activeTab === "uploaded" ? true : activeTab === "pending" ? false : undefined;
      
      const result = await getPetListByStoreId(storeId, isUploaded);
      if (isSuccess(result.code)) {
        let pets: any[] = [];
        
        // 处理返回的数据
        if (Array.isArray(result.data)) {
          pets = result.data;
        } else if (result.data && typeof result.data === "object") {
          const listData = (result.data as any).list || (result.data as any).data || (result.data as any).pets || [];
          pets = Array.isArray(listData) ? listData : [];
        }
        
        // 后端返回的数据已经是扁平化格式，直接使用
        const formattedData = pets.map((pet: any) => {
          // 如果数据中有 petInfo，保留它（兼容旧格式）
          // 同时确保新的扁平化字段可以直接访问
          return pet;
        });
        
        setOrderList(formattedData);
        setTotal(formattedData.length);
      } else {
        message.error(result.msg || "获取宠物列表失败");
        setOrderList([]);
        setTotal(0);
      }
    } catch (error: any) {
      console.error("加载宠物列表失败:", error);
      const errorMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        "加载宠物列表失败，请稍后重试";
      message.error(errorMsg);
      setOrderList([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和标签页切换时重新加载
  useEffect(() => {
    if (storeId) {
      loadPetList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, activeTab]);

  // 标签页配置
  const tabItems: TabsProps["items"] = [
    {
      key: "uploaded",
      label: "已上传",
    },
    {
      key: "pending",
      label: "待上传",
    },
  ];

  // 表格列配置
  const columns = [
    {
      title: "序号",
      dataIndex: "index",
      key: "index",
      width: 80,
      align: "center" as const,
      render: (_: any, __: any, index: number) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "头像",
      key: "avatar",
      width: 100,
      align: "center" as const,
      render: (_: any, record: OrderInfo) => {
        // 使用后端返回的扁平化字段
        const avatarUrl = (record as any).avatarUrl || record.petInfo?.avatarUrl;
        const petName = (record as any).name || record.petInfo?.name || "宠物";
        
        if (avatarUrl) {
          return (
            <img
              src={getAvatarUrl(avatarUrl, "pet")}
              alt={petName}
              style={{
                width: 50,
                height: 50,
                objectFit: "cover",
                borderRadius: "4px",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect fill='%23f0f0f0' width='50' height='50'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3E🐾%3C/text%3E%3C/svg%3E";
              }}
            />
          );
        }
        return (
          <div
            style={{
              width: 50,
              height: 50,
              backgroundColor: "#f0f0f0",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            🐾
          </div>
        );
      },
    },
    {
      title: "宠物名称",
      key: "name",
      width: 120,
      align: "center" as const,
      render: (_: any, record: OrderInfo) => (record as any).name || record.petInfo?.name || "-",
    },
    {
      title: "宠物类型",
      key: "type",
      width: 100,
      align: "center" as const,
      render: (_: any, record: OrderInfo) => (record as any).type || record.petInfo?.type || "-",
    },
    {
      title: "宠物品种",
      key: "breed",
      width: 120,
      align: "center" as const,
      render: (_: any, record: OrderInfo) => (record as any).breed || record.petInfo?.breed || "-",
    },
    {
      title: "体重",
      key: "weight",
      width: 100,
      align: "center" as const,
      render: (_: any, record: OrderInfo) => {
        const weight = (record as any).weight !== undefined && (record as any).weight !== null 
          ? (record as any).weight 
          : record.petInfo?.weight;
        return weight !== undefined && weight !== null ? `${weight}kg` : "-";
      },
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      align: "center" as const,
      fixed: "right" as const,
      render: (_: any, record: OrderInfo) => {
        // 根据标签页显示不同的操作按钮
        if (activeTab === "uploaded") {
          // 已上传标签页：显示"查看"和"异常记录"按钮
          return (
            <>
              <Button type="link" onClick={() => handleViewCareLogDetail(record)}>
                查看
              </Button>
              <Button type="link" onClick={() => handleAddAbnormalRecord(record)}>
                上传异常
              </Button>
            </>
          );
        } else {
          // 待上传标签页：显示"上传"和"异常记录"按钮
          return (
            <>
              <Button type="link" onClick={() => handleViewDetails(record)}>
                上传
              </Button>
              <Button type="link" onClick={() => handleAddAbnormalRecord(record)}>
                上传异常
              </Button>
            </>
          );
        }
      },
    },
  ];

  // 处理查看详情
  const handleViewDetails = (record: OrderInfo) => {
    // 使用后端返回的扁平化字段
    const petName = (record as any).name || record.petInfo?.name || "";
    const petType = (record as any).type || record.petInfo?.type || "";
    const petAge = (record as any).age || record.petInfo?.age;
    const petBreed = (record as any).breed || record.petInfo?.breed || "";
    const specialHabits = record.petInfo?.specialHabits || "";
    
    // 保存当前选中的记录，以便提交时获取 orderId
    setCurrentRecord(record);
    
    form.setFieldsValue({
      petName: petName,
      petType: petType,
      petAge: petAge,
      petBreed: petBreed,
      specialHabits: specialHabits,
      careItem: "",
      careDetails: "",
      careTime: undefined,
      certificateUrl: "",
    });

    setFileList([]);
    setModalOpen(true);
  };

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setCurrentPage(1);
    // 数据加载由 useEffect 监听 activeTab 变化自动触发
  };

  // 处理分页变化
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  };

  // 处理模态框取消
  const handleCancel = () => {
    setModalOpen(false);
    form.resetFields();
    setFileList([]);
    setCurrentRecord(null); // 清空当前选中的记录
  };

  // 处理查看照料日志详情（已上传标签页）
  const handleViewCareLogDetail = async (record: OrderInfo) => {
    const logId = record.logId;
    if (!logId) {
      message.error("无法获取日志ID，请重试");
      return;
    }

    // 保存当前记录（包含宠物信息）
    setCurrentDetailRecord(record);

    setLoadingDetail(true);
    setDetailModalOpen(true);
    try {
      const result = await getCareLogDetail(logId);
      if (isSuccess(result.code)) {
        setCareLogDetail(result.data);
      } else {
        message.error(result.msg || "获取照料日志详情失败");
        setDetailModalOpen(false);
      }
    } catch (error: any) {
      console.error("获取照料日志详情失败:", error);
      const errorMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        "获取照料日志详情失败，请稍后重试";
      message.error(errorMsg);
      setDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // 处理详情模态框关闭
  const handleDetailModalClose = () => {
    setDetailModalOpen(false);
    setCareLogDetail(null);
    setCurrentDetailRecord(null);
  };

  // 处理添加异常记录
  const handleAddAbnormalRecord = (record: OrderInfo) => {
    setCurrentAbnormalRecord(record);
    abnormalRecordForm.resetFields();
    abnormalRecordForm.setFieldsValue({
      isTreatment: false,
      isNotified: false,
    });
    setAbnormalRecordModalOpen(true);
  };

  // 处理异常记录表单提交
  const handleAbnormalRecordSubmit = async () => {
    try {
      const values = await abnormalRecordForm.validateFields();
      
      // 获取用户信息
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.userId) {
        message.error("获取用户信息失败，请重新登录");
        return;
      }

      // 获取订单ID和门店ID（从当前选中的记录中获取）
      const orderId = currentAbnormalRecord?.orderId;
      if (!orderId) {
        message.error("无法获取订单信息，请重试");
        return;
      }

      if (!storeId) {
        message.error("无法获取门店信息，请重试");
        return;
      }

      // 构建异常记录DTO
      const dto = {
        abnormalType: values.abnormalType,
        description: values.description,
        isNotified: values.isNotified ? 1 : 0,
        isTreatment: values.isTreatment ? 1 : 0,
        operatorId: userInfo.userId,
        orderId: orderId,
        storeId: storeId,
        suggestionAction: values.suggestionAction,
      };

      // 调用 API 提交异常记录
      setLoading(true);
      try {
        const result = await addAbnormalRecord(dto);

        if (isSuccess(result.code)) {
          // 根据返回值显示不同的提示信息
          const data = result.data as any;
          if (data?.notified === 1 && data?.approvalId) {
            message.success("异常记录提交成功，已通知主人并生成治疗审批");
          } else if (data?.notified === 1) {
            message.success("异常记录提交成功，已通知主人");
          } else {
            message.success("异常记录提交成功");
          }
          setAbnormalRecordModalOpen(false);
          abnormalRecordForm.resetFields();
          setCurrentAbnormalRecord(null);
        } else {
          message.error(result.msg || "提交失败");
        }
      } catch (error: any) {
        console.error("提交异常记录失败:", error);
        const errorMsg =
          error?.response?.data?.msg ||
          error?.response?.data?.message ||
          error?.message ||
          "提交失败，请稍后重试";
        message.error(errorMsg);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };

  // 处理异常记录模态框关闭
  const handleAbnormalRecordCancel = () => {
    setAbnormalRecordModalOpen(false);
    abnormalRecordForm.resetFields();
    setCurrentAbnormalRecord(null);
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 获取用户信息
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.userId) {
        message.error("获取用户信息失败，请重新登录");
        return;
      }

      // 获取订单ID（从当前选中的记录中获取）
      const orderId = currentRecord?.orderId;
      if (!orderId) {
        message.error("无法获取订单信息，请重试");
        return;
      }

      // 构建照料时间字符串（如果有选择时间）
      // 后端 LocalTime 需要字符串格式 "HH:mm:ss"
      // 虽然 TypeScript 类型定义是 LocalTime 对象，但后端实际期望的是字符串格式
      let logTime: string | undefined;
      if (values.careTime) {
        // careTime 是 dayjs 对象，格式化为 "HH:mm:ss" 字符串
        logTime = values.careTime.format('HH:mm:ss');
      }

      // 获取今天的日期时间（后端 LocalDateTime 需要 ISO 字符串格式，含 T）
      const logDate = dayjs().startOf('day').format('YYYY-MM-DDTHH:mm:ss');

      // 构建 CareLogDto 对象（使用请求体，类似创建订单）
      // 使用类型断言，因为后端实际期望 logTime 是字符串格式 "HH:mm:ss"，而不是 LocalTime 对象
      const careLogDto: any = {
        careItem: values.careItem, // 照料项目（必填）
        details: values.careDetails, // 详细记录
        logDate: logDate, // 日志日期
        logTime: logTime, // 照料时间字符串 "HH:mm:ss"
        operatorId: userInfo.userId, // 用户（员工）id
        orderId: orderId, // 关联订单（必填）
      };

      // 调用 API 提交照料日志
      setLoading(true);
      try {
        const result = await addCareLog(careLogDto);

        if (isSuccess(result.code)) {
          message.success("提交成功");
          handleCancel();
          loadPetList(); // 重新加载列表
        } else {
          message.error(result.msg || "提交失败");
        }
      } catch (error: any) {
        console.error("提交照料日志失败:", error);
        const errorMsg =
          error?.response?.data?.msg ||
          error?.response?.data?.message ||
          error?.message ||
          "提交失败，请稍后重试";
        message.error(errorMsg);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };

  // 处理文件上传
  const handleUploadChange = (info: any) => {
    let newFileList = [...info.fileList];
    
    // 只保留最后一个文件
    newFileList = newFileList.slice(-1);

    // 如果是新上传的文件，模拟上传成功
    newFileList = newFileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(newFileList);
  };

  // 处理文件上传前的验证
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("只能上传图片文件！");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("图片大小不能超过 2MB！");
      return false;
    }
    return false; // 阻止自动上传，手动处理
  };

  // 获取当前页数据
  const getCurrentPageData = () => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return orderList.slice(start, end);
  };

  return (
    <div className="daily-care-container">
      <Header />
      <div className="daily-care-content">
        <div className="daily-care-header">
          <h1>照料日志</h1>
        </div>

        <div className="tabs-section">
          <Tabs
            activeKey={activeTab}
            items={tabItems}
            onChange={handleTabChange}
            className="daily-care-tabs"
          />
        </div>

        <div className="table-section">
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={getCurrentPageData()}
              rowKey={(record) => record.petId?.toString() || record.petInfo?.petId?.toString() || record.orderId || Math.random().toString()}
              pagination={false}
              locale={{ emptyText: "暂无数据" }}
            />
          </Spin>

          {!loading && orderList.length > 0 && (
            <div className="pagination-section">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} 条，共 ${total} 条`
                }
                pageSizeOptions={["10", "20", "50"]}
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
              />
            </div>
          )}
        </div>

        {/* 照料日志模态框 */}
        <Modal
          title="照料日志"
          open={modalOpen}
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={handleSubmit}>
              提交
            </Button>,
          ]}
          width={800}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            className="care-log-form"
          >
            <div className="form-row">
              {/* 左列 */}
              <div className="form-col">
                <Form.Item
                  label="宠物名称"
                  name="petName"
                  rules={[{ required: true, message: "请输入宠物名称" }]}
                >
                  <Input placeholder="请输入宠物名称" />
                </Form.Item>

                <Form.Item
                  label="宠物类型"
                  name="petType"
                  rules={[{ required: true, message: "请输入宠物类型" }]}
                >
                  <Input placeholder="请输入宠物类型" />
                </Form.Item>

                <Form.Item
                  label="宠物年龄"
                  name="petAge"
                  rules={[{ required: true, message: "请输入宠物年龄" }]}
                >
                  <Input type="number" placeholder="请输入宠物年龄" />
                </Form.Item>

                <Form.Item
                  label="上传图片"
                  name="certificateUrl"
                >
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleUploadChange}
                    beforeUpload={beforeUpload}
                    maxCount={1}
                  >
                    {fileList.length < 1 && (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>上传</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </div>

              {/* 右列 */}
              <div className="form-col">
                <Form.Item
                  label="特殊习性"
                  name="specialHabits"
                >
                  <Input placeholder="请输入特殊习性" />
                </Form.Item>

                <Form.Item
                  label="宠物品种"
                  name="petBreed"
                >
                  <Input placeholder="请输入宠物品种" />
                </Form.Item>

                <Form.Item
                  label="照料项目"
                  name="careItem"
                  rules={[{ required: true, message: "请输入照料项目" }]}
                >
                  <Input placeholder="请输入照料项目" />
                </Form.Item>
              </div>
            </div>

            {/* 照料详情 */}
            <Form.Item
              label="照料详情"
              name="careDetails"
            >
              <TextArea
                rows={4}
                placeholder="请输入照料详情"
              />
            </Form.Item>

            {/* 照料时间 */}
            <Form.Item
              label="照料时间"
              name="careTime"
            >
              <TimePicker
                format="HH:mm:ss"
                style={{ width: "100%" }}
                placeholder="请选择照料时间"
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* 查看照料日志详情模态框 */}
        <Modal
          title="照料日志详情"
          open={detailModalOpen}
          onCancel={handleDetailModalClose}
          footer={[
            <Button key="close" onClick={handleDetailModalClose}>
              关闭
            </Button>,
          ]}
          width={800}
          destroyOnClose
        >
          <Spin spinning={loadingDetail}>
            {careLogDetail && (
              <div>
                {/* 宠物信息区域 - 从详情数据或当前记录中获取 */}
                {(careLogDetail.petInfo || careLogDetail.pet || careLogDetail.petName || currentDetailRecord?.petInfo || currentDetailRecord?.petName) && (
                  <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
                    {/* 宠物头像 */}
                    <div>
                      {(() => {
                        // 优先使用新的扁平化字段
                        const avatarUrl = careLogDetail.petAvatarUrl || 
                                         currentDetailRecord?.petAvatarUrl ||
                                         careLogDetail.petInfo?.avatarUrl || 
                                         careLogDetail.pet?.avatarUrl ||
                                         currentDetailRecord?.petInfo?.avatarUrl;
                        const petName = careLogDetail.petName || 
                                       currentDetailRecord?.petName ||
                                       careLogDetail.petInfo?.name || 
                                       careLogDetail.pet?.name ||
                                       currentDetailRecord?.petInfo?.name || 
                                       "宠物";
                        return avatarUrl ? (
                          <img
                            src={getAvatarUrl(avatarUrl, "pet")}
                            alt={petName}
                            style={{
                              width: 80,
                              height: 80,
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23f0f0f0' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3E🐾%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 80,
                              height: 80,
                              backgroundColor: "#f0f0f0",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "32px",
                            }}
                          >
                            🐾
                          </div>
                        );
                      })()}
                    </div>
                    {/* 宠物名称 */}
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
                        {careLogDetail.petName || 
                         currentDetailRecord?.petName ||
                         careLogDetail.petInfo?.name || 
                         careLogDetail.pet?.name ||
                         currentDetailRecord?.petInfo?.name || 
                         "-"}
                      </div>
                    </div>
                  </div>
                )}

                <Descriptions column={1} bordered size="middle">
                  <Descriptions.Item label="照料项目">
                    {careLogDetail.careItem || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="详细描述">
                    {careLogDetail.details || "-"}
                  </Descriptions.Item>
                  {/* 门店员工名称 */}
                  <Descriptions.Item label="门店员工">
                    {careLogDetail.operatorName || "-"}
                  </Descriptions.Item>
                  {careLogDetail.logTime && (
                    <Descriptions.Item label="照料时间">
                      {typeof careLogDetail.logTime === "string"
                        ? careLogDetail.logTime
                        : careLogDetail.logTime.hour !== undefined &&
                          careLogDetail.logTime.minute !== undefined
                        ? `${String(careLogDetail.logTime.hour).padStart(2, "0")}:${String(careLogDetail.logTime.minute).padStart(2, "0")}${
                            careLogDetail.logTime.second !== undefined
                              ? `:${String(careLogDetail.logTime.second).padStart(2, "0")}`
                              : ""
                          }`
                        : "-"}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="日志日期">
                    {careLogDetail.logDate
                      ? dayjs(careLogDetail.logDate).format("YYYY-MM-DD HH:mm:ss")
                      : "-"}
                  </Descriptions.Item>
                  {/* 照料图片 */}
                  {careLogDetail.carePhoto && (
                    <Descriptions.Item label="照料图片">
                      {(() => {
                        // 处理图片 URL：如果是完整 URL 直接使用，否则拼接基础 URL
                        const baseUrl = getBackendBaseUrl();
                        const imageUrl = careLogDetail.carePhoto.startsWith('http://') || careLogDetail.carePhoto.startsWith('https://') 
                          ? careLogDetail.carePhoto 
                          : careLogDetail.carePhoto.startsWith('/') 
                            ? `${baseUrl}${careLogDetail.carePhoto}`
                            : `${baseUrl}/${careLogDetail.carePhoto}`;
                        return (
                          <img
                            src={imageUrl}
                            alt="照料图片"
                            style={{
                              maxWidth: 400,
                              maxHeight: 400,
                              objectFit: "contain",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              window.open(imageUrl, "_blank");
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f0f0f0' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3E图片加载失败%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        );
                      })()}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </div>
            )}
          </Spin>
        </Modal>

        {/* 异常记录模态框 */}
        <Modal
          title="异常记录"
          open={abnormalRecordModalOpen}
          onCancel={handleAbnormalRecordCancel}
          footer={[
            <Button key="cancel" onClick={handleAbnormalRecordCancel}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={handleAbnormalRecordSubmit} loading={loading}>
              提交
            </Button>,
          ]}
          width={600}
          destroyOnClose
        >
          <Form
            form={abnormalRecordForm}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              label="异常类型"
              name="abnormalType"
              rules={[{ required: true, message: "请输入异常类型" }]}
            >
              <Input placeholder="请输入异常类型" />
            </Form.Item>

            <Form.Item
              label="异常描述"
              name="description"
              rules={[{ required: true, message: "请输入异常描述" }]}
            >
              <TextArea
                rows={4}
                placeholder="请输入异常描述"
              />
            </Form.Item>

            <Form.Item
              label="是否需要治疗"
              name="isTreatment"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label="是否通知主人"
              name="isNotified"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label="建议行动"
              name="suggestionAction"
            >
              <TextArea
                rows={3}
                placeholder="请输入建议行动（可选）"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default DailyCare;
