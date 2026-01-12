import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, Card, Empty, message, Spin, Tag } from "antd";
import type { TabsProps } from "antd";
import Header from "../components/Header";
import { getOrderListByStatus, getAvatarUrl, getOrderStatus } from "../services/api";
import { isSuccess } from "../utils/response";
import { useStore } from "../zustand/store";
import dayjs from "dayjs";
import "./consumption.scss";

// 格式化倒计时显示
const formatCountdown = (seconds: number): string => {
  if (seconds <= 0) return "已过期";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
};

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

// 格式化日期（不含时间）
const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

// 订单状态配置
const ORDER_STATUS_CONFIG: { [key: number]: { label: string; status: number } } = {
  1: { label: "待确认", status: 1 },
  2: { label: "已预约(定金已付)", status: 2 },
  3: { label: "寄养中(已入托)", status: 3 },
  4: { label: "待结算", status: 4 },
  5: { label: "已完成", status: 5 },
  0: { label: "已取消", status: 0 },
};

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
  petInfo?: PetInfo;
  storeName?: string;
  [key: string]: any;
}

/**
 * 消费记录页面
 */
const Consumption: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 从URL参数获取初始tab，默认为1
  const initialTab = parseInt(searchParams.get("tab") || "1", 10);
  const [activeTab, setActiveTab] = useState<string>(initialTab.toString());
  const [loading, setLoading] = useState(false);
  const [orderList, setOrderList] = useState<OrderInfo[]>([]);
  const [countdowns, setCountdowns] = useState<Record<string, number>>({});

  // 使用 zustand store 管理倒计时
  const { setOrderCountdown, getOrderRemainSeconds, updateOrderCountdown } = useStore();

  // 标签页配置
  const tabItems: TabsProps["items"] = Object.keys(ORDER_STATUS_CONFIG)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map((key) => {
      const numKey = parseInt(key);
      const config = ORDER_STATUS_CONFIG[numKey];
      return {
        key: key,
        label: config.label,
      };
    });

  // 加载订单列表
  const loadOrderList = async (status: number) => {
    setLoading(true);
    try {
      const result = await getOrderListByStatus(status);
      if (isSuccess(result.code)) {
        let orders: OrderInfo[] = [];
        
        // 处理返回的数据
        if (Array.isArray(result.data)) {
          orders = result.data as OrderInfo[];
        } else if (result.data && typeof result.data === "object") {
          const listData = (result.data as any).list || (result.data as any).data || (result.data as any).orders || [];
          orders = Array.isArray(listData) ? (listData as OrderInfo[]) : [];
        }
        
        setOrderList(orders);
        
        // 初始化待确认订单的倒计时
        orders.forEach((order) => {
          if (order.orderStatus === 1 && order.orderId) {
            // 从后端获取订单状态以获取准确的剩余秒数
            getOrderStatus(order.orderId)
              .then((statusResult) => {
                if (isSuccess(statusResult.code)) {
                  const statusData = statusResult.data as any;
                  if (statusData.expire_seconds !== undefined) {
                    // 使用后端返回的剩余秒数，计算过期时间
                    const expireTime = dayjs().add(statusData.expire_seconds, 'second').toISOString();
                    setOrderCountdown(order.orderId, expireTime, statusData.expire_seconds);
                  } else if (order.expireTime) {
                    // 如果没有返回剩余秒数，基于过期时间计算
                    setOrderCountdown(order.orderId, order.expireTime);
                  }
                }
              })
              .catch(() => {
                // 如果获取失败，使用过期时间计算
                if (order.expireTime) {
                  setOrderCountdown(order.orderId, order.expireTime);
                }
              });
          }
        });
      } else {
        message.error(result.msg || "获取订单列表失败");
        setOrderList([]);
      }
    } catch (error: any) {
      console.error("加载订单列表失败:", error);
      const errorMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        "加载订单列表失败，请稍后重试";
      message.error(errorMsg);
      setOrderList([]);
    } finally {
      setLoading(false);
    }
  };

  // 更新所有倒计时显示
  useEffect(() => {
    const timer = setInterval(() => {
      const newCountdowns: Record<string, number> = {};
      orderList.forEach((order) => {
        if (order.orderStatus === 1 && order.orderId) {
          const remainSeconds = getOrderRemainSeconds(order.orderId);
          if (remainSeconds !== null) {
            newCountdowns[order.orderId] = remainSeconds;
            // 更新 store 中的倒计时
            if (order.expireTime) {
              updateOrderCountdown(order.orderId);
            }
          }
        }
      });
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(timer);
  }, [orderList, getOrderRemainSeconds, updateOrderCountdown]);

  // 处理订单卡片点击（仅待确认状态可点击跳转到支付页面）
  const handleOrderClick = useCallback(async (order: OrderInfo) => {
    if (order.orderStatus === 1 && order.orderId) {
      // 获取订单状态以获取支付信息
      try {
        const statusResult = await getOrderStatus(order.orderId);
        if (isSuccess(statusResult.code)) {
          const statusData = statusResult.data as any;
          // 跳转到支付页面
          navigate("/payment", {
            state: {
              order: {
                orderId: order.orderId,
                totalPrice: order.totalAmount,
                depositAmount: order.depositAmount,
                create_time: order.createTime,
                orderStatus: order.orderStatus,
                deposit_paid: order.depositPaid,
                expire_seconds: statusData.expire_seconds,
              },
            },
          });
        }
      } catch (error) {
        message.error("获取订单信息失败，请稍后重试");
      }
    }
  }, [navigate]);

  // 标签页切换处理
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // 更新URL参数
    setSearchParams({ tab: key });
    // 根据选中的标签页获取对应的订单状态
    const status = ORDER_STATUS_CONFIG[parseInt(key)]?.status;
    if (status !== undefined) {
      loadOrderList(status);
    }
  };

  // 初始加载和URL参数变化时加载数据
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") || "1";
    const status = ORDER_STATUS_CONFIG[parseInt(tabFromUrl)]?.status;
    if (status !== undefined) {
      setActiveTab(tabFromUrl);
      loadOrderList(status);
    }
  }, [searchParams]);


  // 渲染订单卡片
  const renderOrderCard = (order: OrderInfo) => {
    const statusConfig = ORDER_STATUS_CONFIG[order.orderStatus || 0];
    const statusLabel = statusConfig?.label || "未知状态";
    const orderStatus = order.orderStatus ?? 0;
    const petInfo = order.petInfo;
    const isPending = orderStatus === 1; // 待确认状态
    const remainSeconds = countdowns[order.orderId || ""] ?? null;
    const showCountdown = isPending && remainSeconds !== null;

    return (
      <Card 
        key={order.orderId} 
        className={`order-card ${isPending ? 'order-card-clickable' : ''}`}
        hoverable={isPending}
        onClick={() => isPending && handleOrderClick(order)}
      >
        <div className="order-header">
          <div className="order-id">订单号：{order.orderId || "-"}</div>
          <div className="order-status-wrapper">
            <div className="order-status" data-status={orderStatus}>
              {statusLabel}
            </div>
            {showCountdown && (
              <div className="order-countdown">
                剩余: {formatCountdown(remainSeconds)}
              </div>
            )}
          </div>
        </div>
        
        {/* 宠物信息区域 */}
        {petInfo && (
          <div className="pet-info-section">
            <div className="pet-avatar">
              {petInfo.avatarUrl ? (
                <img
                  src={getAvatarUrl(petInfo.avatarUrl, "pet")}
                  alt={petInfo.name || "宠物"}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect fill='%23f0f0f0' width='60' height='60'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3E🐾%3C/text%3E%3C/svg%3E";
                  }}
                />
              ) : (
                <div className="pet-avatar-placeholder">🐾</div>
              )}
            </div>
            <div className="pet-details">
              <div className="pet-name-row">
                <span className="pet-name">{petInfo.name || "-"}</span>
                {petInfo.breed && (
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    {petInfo.breed}
                  </Tag>
                )}
                {petInfo.type && (
                  <Tag color="purple" style={{ marginLeft: 4 }}>
                    {petInfo.type}
                  </Tag>
                )}
              </div>
              <div className="pet-extra-info">
                {petInfo.age !== undefined && petInfo.age !== null && (
                  <span>年龄: {petInfo.age}岁</span>
                )}
                {petInfo.weight !== undefined && petInfo.weight !== null && (
                  <span style={{ marginLeft: 12 }}>
                    体重: {petInfo.weight}kg
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="order-info">
          {/* 门店信息 */}
          {order.storeName && (
            <div className="info-item">
              <span className="label">门店名称：</span>
              <span className="value">{order.storeName}</span>
            </div>
          )}

          {/* 寄养时间 */}
          {/* <div className="info-row"> */}
            <div className="info-item">
              <span className="label">开始日期：</span>
              <span className="value">{formatDate(order.startDate)}</span>
            </div>
            <div className="info-item">
              <span className="label">结束日期：</span>
              <span className="value">{formatDate(order.endDate)}</span>
            </div>
          {/* </div> */}

          {/* 时间信息 */}
          {order.createTime && (
            <div className="info-item">
              <span className="label">创建时间：</span>
              <span className="value">{formatDateTime(order.createTime)}</span>
            </div>
          )}

          {/* 入住和退房时间 */}
          {(order.checkinTime || order.checkoutTime) && (
            <div className="info-row">
              {order.checkinTime && (
                <div className="info-item">
                  <span className="label">入住时间：</span>
                  <span className="value">{formatDateTime(order.checkinTime)}</span>
                </div>
              )}
              {order.checkoutTime && (
                <div className="info-item">
                  <span className="label">退房时间：</span>
                  <span className="value">{formatDateTime(order.checkoutTime)}</span>
                </div>
              )}
            </div>
          )}

          {/* 金额信息 */}
          <div className="amount-section">
            {order.totalAmount !== undefined && order.totalAmount !== null && (
              <div className="info-item">
                <span className="label">订单总额：</span>
                <span className="value price">¥{order.totalAmount.toFixed(2)}</span>
              </div>
            )}
            {order.depositAmount !== undefined && order.depositAmount !== null && (
              <div className="info-item">
                <span className="label">定金：</span>
                <span className="value">
                  ¥{order.depositAmount.toFixed(2)}
                  {order.depositPaid !== undefined && (
                    <Tag
                      color={order.depositPaid === 1 ? "success" : "warning"}
                      style={{ marginLeft: 8 }}
                    >
                      {order.depositPaid === 1 ? "已付" : "未付"}
                    </Tag>
                  )}
                </span>
              </div>
            )}
            {order.finalAmount !== undefined && order.finalAmount !== null && (
              <div className="info-item">
                <span className="label">最终金额：</span>
                <span className="value price">¥{order.finalAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* 其他信息 */}
          {order.cageId && (
            <div className="info-item">
              <span className="label">笼位ID：</span>
              <span className="value">{order.cageId}</span>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="consumption-container">
      <Header />
      <div className="consumption-content">
        <div className="consumption-header">
          <h1>我的消费</h1>
        </div>
        
        <div className="tabs-section">
          <Tabs
            activeKey={activeTab}
            items={tabItems}
            onChange={handleTabChange}
            className="consumption-tabs"
          />
        </div>

        <div className="orders-section">
          <Spin spinning={loading}>
            {orderList.length > 0 ? (
              <div className="order-list">
                {orderList.map((order) => renderOrderCard(order))}
              </div>
            ) : (
              <Empty
                description={loading ? "加载中..." : "暂无订单"}
                style={{ marginTop: "50px" }}
              />
            )}
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default Consumption;

