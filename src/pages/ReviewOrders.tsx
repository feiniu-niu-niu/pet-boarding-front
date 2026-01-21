import { useState, useEffect, useCallback, useMemo } from "react";
import { Tabs, Card, Empty, message, Spin, Tag, Modal, Form, Input, Rate, Button, Descriptions } from "antd";
import type { TabsProps } from "antd";
import Header from "../components/Header";
import { getReviewOrders, submitOrderReview, getAvatarUrl } from "../services/api";
import { isSuccess } from "../utils/response";
import { getUserInfo } from "../utils/auth";
import dayjs from "dayjs";
import "./review-orders.scss";

const { TextArea } = Input;

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

// 订单信息接口（包含评价信息）
interface ReviewOrderInfo {
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
  checkinTime?: string;
  checkoutTime?: string;
  storeName?: string;
  petInfo?: PetInfo;
  review?: ReviewInfo;
  [key: string]: any;
}

const ReviewOrders: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [orderList, setOrderList] = useState<ReviewOrderInfo[]>([]);
  const [activeTab, setActiveTab] = useState<string>("pending"); // pending: 未评价, reviewed: 已评价
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<ReviewOrderInfo | null>(null);
  const [reviewForm] = Form.useForm();
  const [submittingReview, setSubmittingReview] = useState(false);

  // 获取用户信息
  const userInfo = getUserInfo();
  const userId = userInfo?.userId;

  // 加载订单列表
  const loadOrderList = useCallback(async (reviewed: boolean) => {
    if (!userId) {
      message.error("用户信息不存在，请先登录");
      return;
    }

    setLoading(true);
    try {
      const result = await getReviewOrders(userId, reviewed);
      if (isSuccess(result.code)) {
        const orders = result.data || [];
        setOrderList(Array.isArray(orders) ? orders : []);
      } else {
        message.error(result.msg || "获取订单列表失败");
        setOrderList([]);
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        "获取订单列表失败，请稍后重试";
      message.error(errorMsg);
      setOrderList([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Tab 切换处理
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    const reviewed = key === "reviewed";
    loadOrderList(reviewed);
  };

  // 初始加载
  useEffect(() => {
    if (userId) {
      // 默认加载未评价订单
      loadOrderList(false);
    }
  }, [userId, loadOrderList]);

  // 处理点击评价按钮
  const handleReviewClick = (order: ReviewOrderInfo) => {
    setCurrentOrder(order);
    reviewForm.resetFields();
    setReviewModalOpen(true);
  };

  // 处理提交评价
  const handleSubmitReview = async () => {
    try {
      const values = await reviewForm.validateFields();
      if (!currentOrder?.orderId) {
        message.error("订单信息不完整");
        return;
      }

      setSubmittingReview(true);
      const result = await submitOrderReview(
        currentOrder.orderId,
        values.rating,
        values.comment || ""
      );

      if (isSuccess(result.code)) {
        message.success("评价提交成功");
        setReviewModalOpen(false);
        setCurrentOrder(null);
        reviewForm.resetFields();
        // 刷新当前订单列表
        const reviewed = activeTab === "reviewed";
        await loadOrderList(reviewed);
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
    setCurrentOrder(null);
    reviewForm.resetFields();
  };

  // 处理点击查看详情
  const handleViewDetail = (order: ReviewOrderInfo) => {
    setCurrentOrder(order);
    setDetailModalOpen(true);
  };

  // 处理关闭详情弹窗
  const handleDetailModalClose = () => {
    setDetailModalOpen(false);
    setCurrentOrder(null);
  };

  // Tab 配置
  const tabItems: TabsProps["items"] = [
    {
      key: "pending",
      label: "未评价",
    },
    {
      key: "reviewed",
      label: "已评价",
    },
  ];

  // 渲染订单卡片
  const renderOrderCard = (order: ReviewOrderInfo) => {
    const petInfo = order.petInfo;
    const review = order.review;

    return (
      <Card
        key={order.orderId}
        className="review-order-card"
        hoverable
      >
        <div className="order-header">
          <div className="order-id">订单号：{order.orderId || "-"}</div>
          {order.storeName && (
            <div className="store-name">门店：{order.storeName}</div>
          )}
        </div>

        {petInfo && (
          <div className="pet-info">
            {petInfo.avatarUrl && (
              <img
                src={getAvatarUrl(petInfo.avatarUrl, "pet")}
                alt={petInfo.name || "宠物"}
                className="pet-avatar"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = new URL(
                    "../img/default-pet.png",
                    import.meta.url
                  ).href;
                }}
              />
            )}
            <div className="pet-details">
              <div className="pet-name">{petInfo.name || "-"}</div>
              <div className="pet-meta">
                {petInfo.breed && <span>{petInfo.breed}</span>}
                {petInfo.type && <span>{petInfo.type}</span>}
                {petInfo.age !== undefined && <span>{petInfo.age}岁</span>}
              </div>
            </div>
          </div>
        )}

        <div className="order-info">
          <div className="info-item">
            <span className="label">开始日期：</span>
            <span className="value">{formatDate(order.startDate)}</span>
          </div>
          <div className="info-item">
            <span className="label">结束日期：</span>
            <span className="value">{formatDate(order.endDate)}</span>
          </div>
          {order.totalAmount !== undefined && order.totalAmount !== null && (
            <div className="info-item">
              <span className="label">订单总额：</span>
              <span className="value price">¥{order.totalAmount.toFixed(2)}</span>
            </div>
          )}
        </div>

        {activeTab === "reviewed" && review && (
          <div className="review-preview">
            <div className="review-rating">
              <Rate disabled value={review.rating || 0} />
            </div>
            {review.comment && (
              <div className="review-comment">{review.comment}</div>
            )}
            {review.createTime && (
              <div className="review-time">
                评价时间：{formatDateTime(review.createTime)}
              </div>
            )}
          </div>
        )}

        <div className="order-actions">
          {activeTab === "pending" ? (
            <Button
              type="primary"
              onClick={() => handleReviewClick(order)}
            >
              评价
            </Button>
          ) : (
            <Button onClick={() => handleViewDetail(order)}>
              查看详情
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="review-orders-container">
      <Header />
      <div className="review-orders-content">
        <div className="review-orders-header">
          <h1>评价订单</h1>
        </div>

        <div className="tabs-section">
          <Tabs
            activeKey={activeTab}
            items={tabItems}
            onChange={handleTabChange}
            className="review-orders-tabs"
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
                description={loading ? "加载中..." : activeTab === "pending" ? "暂无待评价订单" : "暂无已评价订单"}
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
        {currentOrder && (
          <Form form={reviewForm} layout="vertical">
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <strong>订单号：</strong>
                {currentOrder.orderId}
              </div>
              {currentOrder.storeName && (
                <div style={{ marginBottom: 8 }}>
                  <strong>门店名称：</strong>
                  {currentOrder.storeName}
                </div>
              )}
              {currentOrder.petInfo && (
                <div>
                  <strong>宠物：</strong>
                  {currentOrder.petInfo.name || "-"}
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

      {/* 详情弹窗 */}
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
        {currentOrder && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="订单号">
              {currentOrder.orderId || "-"}
            </Descriptions.Item>
            {currentOrder.storeName && (
              <Descriptions.Item label="门店名称">
                {currentOrder.storeName}
              </Descriptions.Item>
            )}
            {currentOrder.petInfo && (
              <>
                <Descriptions.Item label="宠物名称">
                  {currentOrder.petInfo.name || "-"}
                </Descriptions.Item>
                {currentOrder.petInfo.breed && (
                  <Descriptions.Item label="品种">
                    {currentOrder.petInfo.breed}
                  </Descriptions.Item>
                )}
                {currentOrder.petInfo.type && (
                  <Descriptions.Item label="类型">
                    {currentOrder.petInfo.type}
                  </Descriptions.Item>
                )}
                {currentOrder.petInfo.age !== undefined && (
                  <Descriptions.Item label="年龄">
                    {currentOrder.petInfo.age}岁
                  </Descriptions.Item>
                )}
              </>
            )}
            <Descriptions.Item label="开始日期">
              {formatDate(currentOrder.startDate)}
            </Descriptions.Item>
            <Descriptions.Item label="结束日期">
              {formatDate(currentOrder.endDate)}
            </Descriptions.Item>
            {currentOrder.checkinTime && (
              <Descriptions.Item label="入住时间">
                {formatDateTime(currentOrder.checkinTime)}
              </Descriptions.Item>
            )}
            {currentOrder.checkoutTime && (
              <Descriptions.Item label="退房时间">
                {formatDateTime(currentOrder.checkoutTime)}
              </Descriptions.Item>
            )}
            {currentOrder.totalAmount !== undefined && currentOrder.totalAmount !== null && (
              <Descriptions.Item label="订单总额">
                <span style={{ color: "#fa541c", fontWeight: "bold" }}>
                  ¥{currentOrder.totalAmount.toFixed(2)}
                </span>
              </Descriptions.Item>
            )}
            {currentOrder.finalAmount !== undefined && currentOrder.finalAmount !== null && (
              <Descriptions.Item label="最终金额">
                <span style={{ color: "#fa541c", fontWeight: "bold" }}>
                  ¥{currentOrder.finalAmount.toFixed(2)}
                </span>
              </Descriptions.Item>
            )}
            {currentOrder.review && (
              <>
                <Descriptions.Item label="评分">
                  <Rate disabled value={currentOrder.review.rating || 0} />
                </Descriptions.Item>
                {currentOrder.review.comment && (
                  <Descriptions.Item label="评价内容">
                    {currentOrder.review.comment}
                  </Descriptions.Item>
                )}
                {currentOrder.review.createTime && (
                  <Descriptions.Item label="评价时间">
                    {formatDateTime(currentOrder.review.createTime)}
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

export default ReviewOrders;
