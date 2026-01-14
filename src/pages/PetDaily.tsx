import { useState, useEffect, useMemo } from "react";
import { Table, Modal, message, Pagination, Spin, Descriptions, Image, Button, DatePicker, Space } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import Header from "../components/Header";
import { getPetListByUserId, getAvatarUrl, getCareLogDetail, getBackendBaseUrl } from "../services/api";
import { isSuccess } from "../utils/response";
import { getUserInfo } from "../utils/auth";
import "./pet-daily.scss";

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
  logTime?: string | { hour?: number; minute?: number; second?: number }; // 照料时间
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
 * 宠物日常页面（宠物主人视角）
 */
const PetDaily: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [petList, setPetList] = useState<OrderInfo[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false); // 查看详情模态框
  const [careLogDetail, setCareLogDetail] = useState<any>(null); // 照料日志详情
  const [loadingDetail, setLoadingDetail] = useState(false); // 加载详情状态
  const [currentDetailRecord, setCurrentDetailRecord] = useState<OrderInfo | null>(null); // 当前查看详情的记录（用于获取宠物信息）
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null); // 选中的日期

  // 从用户信息中获取 userId
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo && userInfo.userId) {
      setUserId(userInfo.userId);
    } else {
      message.error("获取用户信息失败，请重新登录");
    }
  }, []);

  // 加载宠物列表
  const loadPetList = async () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    try {
      const result = await getPetListByUserId(userId);
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
        
        setPetList(formattedData);
        // 注意：total 会在筛选后的数据中更新
      } else {
        message.error(result.msg || "获取宠物列表失败");
        setPetList([]);
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
      setPetList([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    if (userId) {
      loadPetList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // 处理查看详情
  const handleViewCareLogDetail = async (record: OrderInfo) => {
    if (!record.logId) {
      message.warning("该记录暂无照料日志");
      return;
    }

    setCurrentDetailRecord(record);
    setDetailModalOpen(true);
    setLoadingDetail(true);
    setCareLogDetail(null);

    try {
      const result = await getCareLogDetail(record.logId);
      if (isSuccess(result.code)) {
        setCareLogDetail(result.data);
      } else {
        message.error(result.msg || "获取照料日志详情失败");
      }
    } catch (error: any) {
      console.error("获取照料日志详情失败:", error);
      const errorMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        "获取照料日志详情失败，请稍后重试";
      message.error(errorMsg);
    } finally {
      setLoadingDetail(false);
    }
  };

  // 根据日期筛选数据
  const filteredPetList = useMemo(() => {
    if (!selectedDate) {
      return petList;
    }
    const selectedDateStr = selectedDate.format("YYYY-MM-DD");
    return petList.filter((pet) => {
      if (!pet.logDate) return false;
      try {
        const petDateStr = dayjs(pet.logDate).format("YYYY-MM-DD");
        return petDateStr === selectedDateStr;
      } catch {
        return false;
      }
    });
  }, [petList, selectedDate]);

  // 处理日期变化
  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
    setCurrentPage(1); // 重置到第一页
  };

  // 处理分页变化
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  };

  // 获取当前页数据
  const getCurrentPageData = () => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredPetList.slice(start, end);
  };

  // 表格列配置
  const columns = [
    {
      title: "序号",
      dataIndex: "index",
      key: "index",
      width: 80,
      render: (_: any, __: any, index: number) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "头像",
      key: "avatar",
      width: 100,
      align: "center" as const,
      render: (_: any, record: OrderInfo) => {
        // 优先使用新的扁平化字段，如果没有则使用 petInfo
        const avatarUrl = record.petAvatarUrl || record.petInfo?.avatarUrl;
        const petName = record.petName || record.petInfo?.name || "宠物";
        
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
      key: "petName",
      width: 120,
      align: "center" as const,
      render: (_: any, record: OrderInfo) => record.petName || record.petInfo?.name || "-",
    },
    {
      title: "宠物类型",
      key: "petType",
      width: 100,
      align: "center" as const,
      render: (_: any, record: OrderInfo) => record.petType || record.petInfo?.type || "-",
    },
    {
      title: "宠物品种",
      key: "petBreed",
      width: 120,
      align: "center" as const,
      render: (_: any, record: OrderInfo) => record.petBreed || record.petInfo?.breed || "-",
    },
    {
      title: "体重",
      key: "weight",
      width: 100,
      align: "center" as const,
      render: (_: any, record: OrderInfo) => {
        const weight = record.petWeight !== undefined && record.petWeight !== null 
          ? record.petWeight 
          : record.petInfo?.weight;
        return weight !== undefined && weight !== null ? `${weight}kg` : "-";
      },
    },
    {
      title: "照料日期",
      key: "careDate",
      width: 150,
      align: "center" as const,
      render: (_: any, record: OrderInfo) => {
        if (record.logDate) {
          try {
            return dayjs(record.logDate).format("YYYY-MM-DD");
          } catch {
            return "-";
          }
        }
        return "-";
      },
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      align: "center" as const,
      render: (_: any, record: OrderInfo) => {
        // 如果有 logId，显示查看按钮
        if (record.logId) {
          return (
            <Button type="link" onClick={() => handleViewCareLogDetail(record)}>
              查看
            </Button>
          );
        }
        return <span style={{ color: "#999" }}>暂无日志</span>;
      },
    },
  ];

  return (
    <div className="pet-daily-container">
      <Header />
      <div className="pet-daily-content">
        <div className="pet-daily-header">
          <h1>宠物日常</h1>
        </div>

        {/* 日期筛选区域 */}
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
          <Space>
            <span>筛选日期：</span>
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              format="YYYY-MM-DD"
              placeholder="请选择日期"
              allowClear
              style={{ width: 200 }}
            />
          </Space>
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

          {!loading && filteredPetList.length > 0 && (
            <div className="pagination-section">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredPetList.length}
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

        {/* 照料日志详情模态框 */}
        <Modal
          title="照料日志详情"
          open={detailModalOpen}
          onCancel={() => {
            setDetailModalOpen(false);
            setCareLogDetail(null);
            setCurrentDetailRecord(null);
          }}
          footer={null}
          width={600}
        >
          <Spin spinning={loadingDetail}>
            {careLogDetail && (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="宠物名称">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23f0f0f0' width='40' height='40'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3E🐾%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : null;
                    })()}
                    <span>
                      {careLogDetail.petName || 
                       currentDetailRecord?.petName ||
                       careLogDetail.petInfo?.name || 
                       careLogDetail.pet?.name ||
                       currentDetailRecord?.petInfo?.name || 
                       "-"}
                    </span>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="照料项目">
                  {careLogDetail.careItem || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="详细描述">
                  {careLogDetail.details || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="照料日期">
                  {careLogDetail.logDate
                    ? new Date(careLogDetail.logDate).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "-"}
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
                <Descriptions.Item label="门店员工">
                  {careLogDetail.operatorName || "-"}
                </Descriptions.Item>
                {careLogDetail.carePhoto && (
                  <Descriptions.Item label="照料图片">
                    <Image
                      src={
                        careLogDetail.carePhoto.startsWith("http")
                          ? careLogDetail.carePhoto
                          : `${getBackendBaseUrl()}${careLogDetail.carePhoto}`
                      }
                      alt="照料图片"
                      style={{ maxWidth: "200px", maxHeight: "200px" }}
                      preview={{
                        src:
                          careLogDetail.carePhoto.startsWith("http")
                            ? careLogDetail.carePhoto
                            : `${getBackendBaseUrl()}${careLogDetail.carePhoto}`,
                      }}
                    />
                  </Descriptions.Item>
                )}
              </Descriptions>
            )}
          </Spin>
        </Modal>
      </div>
    </div>
  );
};

export default PetDaily;
