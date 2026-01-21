import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, Card, Empty, message, Spin, Tag, Modal, Form, Input, Rate, Button, Descriptions } from "antd";
import type { TabsProps } from "antd";
import Header from "../components/Header";
import { getOrderListByStatus, getAvatarUrl, getOrderStatus, submitOrderReview, getReviewOrders } from "../services/api";
import { isSuccess } from "../utils/response";
import { getUserInfo } from "../utils/auth";
import { useStore } from "../zustand/store";
import dayjs from "dayjs";
import "./consumption.scss";

const { TextArea } = Input;

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

// 评价信息接口
interface ReviewInfo {
  reviewId?: number;
  orderId?: string;
  userId?: number;
  rating?: number;
  comment?: string;
  createTime?: string;
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
  review?: ReviewInfo; // 评价信息
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
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentReviewOrder, setCurrentReviewOrder] = useState<OrderInfo | null>(null);
  const [currentDetailOrder, setCurrentDetailOrder] = useState<OrderInfo | null>(null);
  const [reviewForm] = Form.useForm();
  const [submittingReview, setSubmittingReview] = useState(false);

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
  const loadOrderList = useCallback(async (status: number) => {
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
        
        // 如果是已完成状态的订单，需要补充评价信息
        if (status === 5) {
          const currentUserInfo = getUserInfo();
          const currentUserId = currentUserInfo?.userId;
          if (currentUserId) {
            try {
              // 获取所有已评价的订单
              const reviewedResult = await getReviewOrders(currentUserId, true);
              
              if (isSuccess(reviewedResult.code)) {
                const reviewedOrders = Array.isArray(reviewedResult.data) ? reviewedResult.data : [];
                
                // 创建已评价订单的映射（以orderId为key）
                const reviewedOrderMap = new Map<string, any>();
                reviewedOrders.forEach((reviewedOrder: any) => {
                  if (reviewedOrder.orderId && reviewedOrder.review) {
                    reviewedOrderMap.set(reviewedOrder.orderId, reviewedOrder.review);
                  }
                });
                
                // 合并评价信息到订单列表
                orders = orders.map((order) => {
                  if (order.orderId && reviewedOrderMap.has(order.orderId)) {
                    return {
                      ...order,
                      review: reviewedOrderMap.get(order.orderId),
                    };
                  }
                  return order;
                });
              }
            } catch (error) {
              // 如果获取评价信息失败，不影响订单列表的显示
              console.error("获取评价信息失败:", error);
            }
          }
        }
        
        setOrderList(orders);
        
        // 初始化待确认订单的倒计时
        orders.forEach((order) => {
          if (order.orderStatus === 1 && order.orderId) {
            const orderId = order.orderId; // 确保类型为 string
            // 从后端获取订单状态以获取准确的剩余秒数
            getOrderStatus(orderId)
              .then((statusResult) => {
                if (isSuccess(statusResult.code)) {
                  const statusData = statusResult.data as any;
                  if (statusData.expire_seconds !== undefined) {
                    // 使用后端返回的剩余秒数，计算过期时间
                    const expireTime = dayjs().add(statusData.expire_seconds, 'second').toISOString();
                    setOrderCountdown(orderId, expireTime, statusData.expire_seconds);
                  } else if (order.expireTime) {
                    // 如果没有返回剩余秒数，基于过期时间计算
                    setOrderCountdown(orderId, order.expireTime);
                  }
                }
              })
              .catch(() => {
                // 如果获取失败，使用过期时间计算
                if (order.expireTime) {
                  setOrderCountdown(orderId, order.expireTime);
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
  }, [setOrderCountdown]);

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

  // 处理订单卡片点击
  // - 待确认状态（status 1）：跳转到支付页面（定金支付）
  // - 待结算状态（status 4）：跳转到支付页面（结算支付）
  const handleOrderClick = useCallback(async (order: OrderInfo) => {
    if (order.orderStatus === 1 && order.orderId) {
      // 待确认状态：跳转到支付页面（定金支付）
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
      } catch {
        message.error("获取订单信息失败，请稍后重试");
      }
    } else if (order.orderStatus === 4 && order.orderId) {
      // 待结算状态：跳转到结算支付页面（不显示倒计时）
      navigate("/settlement-payment", {
        state: {
          order: {
            orderId: order.orderId,
            totalPrice: order.totalAmount,
            finalAmount: order.finalAmount || order.totalAmount, // 使用最终金额
            depositAmount: order.depositAmount,
            create_time: order.createTime,
            orderStatus: order.orderStatus,
            deposit_paid: order.depositPaid,
          },
        },
      });
    }
    // 已完成状态的订单不再通过点击卡片触发评价，而是通过按钮
  }, [navigate]);
  
  // 处理点击评价按钮
  const handleReviewButtonClick = useCallback((order: OrderInfo) => {
    setCurrentReviewOrder(order);
    reviewForm.resetFields();
    reviewForm.setFieldsValue({
      rating: 5, // 默认5星
      comment: "",
    });
    setReviewModalOpen(true);
  }, [reviewForm]);
  
  // 处理点击查看详情按钮
  const handleViewDetailClick = useCallback((order: OrderInfo) => {
    setCurrentDetailOrder(order);
    setDetailModalOpen(true);
  }, []);
  

  // 处理提交评价
  const handleSubmitReview = async () => {
    try {
      const values = await reviewForm.validateFields();
      if (!currentReviewOrder?.orderId) {
        message.error("订单信息不完整");
        return;
      }

      setSubmittingReview(true);
      const result = await submitOrderReview(
        currentReviewOrder.orderId,
        values.rating,
        values.comment || ""
      );

      if (isSuccess(result.code)) {
        message.success("评价提交成功");
        setReviewModalOpen(false);
        setCurrentReviewOrder(null);
        reviewForm.resetFields();
        // 刷新当前订单列表
        const status = ORDER_STATUS_CONFIG[parseInt(activeTab)]?.status;
        if (status !== undefined) {
          await loadOrderList(status);
        }
      } else {
        message.error(result.msg || "评价提交失败，请稍后重试");
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        "评价提交失败，请稍后重试";
      message.error(errorMsg);
    } finally {
      setSubmittingReview(false);
    }
  };

  // 处理关闭评价弹窗
  const handleReviewModalClose = () => {
    setReviewModalOpen(false);
    setCurrentReviewOrder(null);
    reviewForm.resetFields();
  };
  
  // 处理关闭详情弹窗
  const handleDetailModalClose = () => {
    setDetailModalOpen(false);
    setCurrentDetailOrder(null);
  };

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
  }, [searchParams, loadOrderList]);


  // 渲染订单卡片
  const renderOrderCard = (order: OrderInfo) => {
    const statusConfig = ORDER_STATUS_CONFIG[order.orderStatus || 0];
    const statusLabel = statusConfig?.label || "未知状态";
    const orderStatus = order.orderStatus ?? 0;
    const petInfo = order.petInfo;
    const review = order.review;
    const isPending = orderStatus === 1; // 待确认状态
    const isPendingSettlement = orderStatus === 4; // 待结算状态
    const isCompleted = orderStatus === 5; // 已完成状态
    const isClickable = isPending || isPendingSettlement; // 待确认和待结算状态可点击卡片
    const remainSeconds = countdowns[order.orderId || ""] ?? null;
    const showCountdown = isPending && remainSeconds !== null;
    
    // 判断已完成订单是否已评价
    const hasReview = isCompleted && !!review;
    const canReview = isCompleted && !review; // 已完成且未评价的可以评价

    return (
      <Card 
        key={order.orderId} 
        className={`order-card ${isClickable ? 'order-card-clickable' : ''}`}
        hoverable={isClickable}
        onClick={() => isClickable && handleOrderClick(order)}
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
        
        {/* 操作按钮区域 */}
      
        {/* 已完成订单的操作 */}
        {isCompleted && (canReview || hasReview) && (
          <div className="order-actions" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {canReview && (
              <Button
                type="primary"
                onClick={(e) => {
                  e.stopPropagation(); // 阻止事件冒泡到卡片点击
                  handleReviewButtonClick(order);
                }}
              >
                评价
              </Button>
            )}
            {hasReview && (
              <Button
                onClick={(e) => {
                  e.stopPropagation(); // 阻止事件冒泡到卡片点击
                  handleViewDetailClick(order);
                }}
              >
                查看详情
              </Button>
            )}
          </div>
        )}
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

      {/* 评价弹窗 */}
      <Modal
        title="订单评价"
        open={reviewModalOpen}
        onCancel={handleReviewModalClose}
        footer={[
          <Button key="cancel" onClick={handleReviewModalClose}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submittingReview}
            onClick={handleSubmitReview}
          >
            提交评价
          </Button>,
        ]}
        width={600}
      >
        {currentReviewOrder && (
          <Form form={reviewForm} layout="vertical">
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <strong>订单号：</strong>
                {currentReviewOrder.orderId}
              </div>
              {currentReviewOrder.storeName && (
                <div style={{ marginBottom: 8 }}>
                  <strong>门店名称：</strong>
                  {currentReviewOrder.storeName}
                </div>
              )}
              {currentReviewOrder.petInfo && (
                <div>
                  <strong>宠物：</strong>
                  {currentReviewOrder.petInfo.name || "-"}
                </div>
              )}
            </div>

            <Form.Item
              label="评分"
              name="rating"
              rules={[{ required: true, message: "请选择评分" }]}
            >
              <Rate allowClear={false} />
            </Form.Item>

            <Form.Item
              label="评价内容"
              name="comment"
              rules={[
                { required: true, message: "请输入评价内容" },
                { max: 500, message: "评价内容不能超过500字" },
              ]}
            >
              <TextArea
                rows={6}
                placeholder="请输入您的评价内容（必填，最多500字）"
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
      
      {/* 订单详情弹窗 */}
      <Modal
        title="订单详情"
        open={detailModalOpen}
        onCancel={handleDetailModalClose}
        footer={[
          <Button key="close" onClick={handleDetailModalClose}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {currentDetailOrder && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="订单号">
              {currentDetailOrder.orderId || "-"}
            </Descriptions.Item>
            {currentDetailOrder.storeName && (
              <Descriptions.Item label="门店名称">
                {currentDetailOrder.storeName}
              </Descriptions.Item>
            )}
            {currentDetailOrder.petInfo && (
              <>
                <Descriptions.Item label="宠物名称">
                  {currentDetailOrder.petInfo.name || "-"}
                </Descriptions.Item>
                {currentDetailOrder.petInfo.breed && (
                  <Descriptions.Item label="品种">
                    {currentDetailOrder.petInfo.breed}
                  </Descriptions.Item>
                )}
                {currentDetailOrder.petInfo.type && (
                  <Descriptions.Item label="类型">
                    {currentDetailOrder.petInfo.type}
                  </Descriptions.Item>
                )}
                {currentDetailOrder.petInfo.age !== undefined && (
                  <Descriptions.Item label="年龄">
                    {currentDetailOrder.petInfo.age}岁
                  </Descriptions.Item>
                )}
              </>
            )}
            <Descriptions.Item label="开始日期">
              {formatDate(currentDetailOrder.startDate)}
            </Descriptions.Item>
            <Descriptions.Item label="结束日期">
              {formatDate(currentDetailOrder.endDate)}
            </Descriptions.Item>
            {currentDetailOrder.checkinTime && (
              <Descriptions.Item label="入住时间">
                {formatDateTime(currentDetailOrder.checkinTime)}
              </Descriptions.Item>
            )}
            {currentDetailOrder.checkoutTime && (
              <Descriptions.Item label="退房时间">
                {formatDateTime(currentDetailOrder.checkoutTime)}
              </Descriptions.Item>
            )}
            {currentDetailOrder.totalAmount !== undefined && currentDetailOrder.totalAmount !== null && (
              <Descriptions.Item label="订单总额">
                <span style={{ color: "#fa541c", fontWeight: "bold" }}>
                  ¥{currentDetailOrder.totalAmount.toFixed(2)}
                </span>
              </Descriptions.Item>
            )}
            {currentDetailOrder.finalAmount !== undefined && currentDetailOrder.finalAmount !== null && (
              <Descriptions.Item label="最终金额">
                <span style={{ color: "#fa541c", fontWeight: "bold" }}>
                  ¥{currentDetailOrder.finalAmount.toFixed(2)}
                </span>
              </Descriptions.Item>
            )}
            {currentDetailOrder.review && (
              <>
                <Descriptions.Item label="评分">
                  <Rate disabled value={currentDetailOrder.review.rating || 0} />
                </Descriptions.Item>
                {currentDetailOrder.review.comment && (
                  <Descriptions.Item label="评价内容">
                    {currentDetailOrder.review.comment}
                  </Descriptions.Item>
                )}
                {currentDetailOrder.review.createTime && (
                  <Descriptions.Item label="评价时间">
                    {formatDateTime(currentDetailOrder.review.createTime)}
                  </Descriptions.Item>
                )}
              </>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Consumption;

