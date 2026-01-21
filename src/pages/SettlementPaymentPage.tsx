import { useMemo, useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Descriptions, Button, message, Tag, Space, Modal } from "antd";
import { QRCodeSVG } from "qrcode.react";
import dayjs from "dayjs";
import Header from "../components/Header";
import "./paymentPage.scss";
import { getOrderStatus, getSettlementAmount } from "../services/api";
import { isSuccess } from "../utils/response";

interface SettlementOrderInfo {
  orderId: string;
  totalPrice?: number;
  finalAmount?: number; // 最终结算金额
  depositAmount?: number;
  create_time?: string;
  orderStatus?: number;
  deposit_paid?: number;
}

// 结算金额详细信息接口
interface SettlementAmountData {
  orderId?: string;
  totalAmount?: number; // 总金额
  depositAmount?: number; // 已付定金
  treatmentCost?: number; // 治疗费用
  remainingAmount?: number; // 待支付金额（剩余金额）
  msg?: string;
}

const SettlementPaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = (location.state as { order?: SettlementOrderInfo })?.order;

  // 支付状态与金额详情
  const [isPaid, setIsPaid] = useState(false);
  const [settlementData, setSettlementData] = useState<SettlementAmountData | null>(null);
  const [amountLoading, setAmountLoading] = useState(false);

  const statusTag = useMemo(() => {
    if (!order) return null;
    if (isPaid) {
      return <Tag color="green">已支付</Tag>;
    }
    return <Tag color="purple">待结算</Tag>;
  }, [order, isPaid]);

  // 每 30s 检查一次订单状态
  const statusCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!order) {
      message.error("未找到支付信息，将返回订单列表");
      navigate("/consumption");
      return;
    }

    // 拉取待结算应付金额详情
    const loadSettlementAmount = async () => {
      if (!order.orderId) return;
      setAmountLoading(true);
      try {
        const res = await getSettlementAmount(order.orderId);
        if (isSuccess(res.code)) {
          const data = res.data as SettlementAmountData;
          setSettlementData(data);
        }
      } catch (e) {
        console.error("获取待结算金额失败:", e);
        message.error("获取结算信息失败，请稍后重试");
      } finally {
        setAmountLoading(false);
      }
    };

    // 检查订单支付状态
    const checkPaymentStatus = async () => {
      if (!order.orderId) return;
      
      try {
        const res = await getOrderStatus(order.orderId);
        if (isSuccess(res.code)) {
          const data = res.data as any;
          // 如果订单状态已变为已完成（status === 5），表示已支付
          if (data.orderStatus === 5) {
            setIsPaid(true);
            Modal.success({
              title: '支付成功',
              content: '结算支付成功！订单已完成。',
              onOk: () => {
                navigate('/consumption?tab=5');
              },
            });
          }
        }
      } catch (e) {
        console.error("获取订单状态失败:", e);
      }
    };

    // 初始检查一次
    loadSettlementAmount();
    checkPaymentStatus();

    // 每 30s 检查一次订单状态
    statusCheckIntervalRef.current = setInterval(() => {
      if (!isPaid) {
        checkPaymentStatus();
      }
    }, 30000);

    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, [order, isPaid, navigate]);

  if (!order) {
    return null;
  }

  // 使用接口返回的数据，如果没有则使用传入的初始数据
  const displayData = settlementData || {
    orderId: order.orderId,
    totalAmount: order.totalPrice,
    depositAmount: order.depositAmount,
    remainingAmount: order.finalAmount || order.totalPrice,
  };

  const remainingAmount = displayData.remainingAmount ?? displayData.totalAmount ?? 0;
  const amountText = amountLoading ? "加载中..." : `¥${Number(remainingAmount).toFixed(2)}`;

  return (
    <div className="payment-page-container">
      <Header />
      <div className="payment-page-content">
        <Card
          title="结算支付"
          bordered={false}
          className="payment-card"
        >
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="订单号">{displayData.orderId || order.orderId}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {order.create_time
                ? dayjs(order.create_time).format("YYYY-MM-DD HH:mm:ss")
                : "-"}
            </Descriptions.Item>
            {displayData.totalAmount !== undefined && displayData.totalAmount !== null && (
              <Descriptions.Item label="订单总额">
                <span style={{ fontWeight: "bold" }}>
                  ¥{Number(displayData.totalAmount).toFixed(2)}
                </span>
              </Descriptions.Item>
            )}
            {displayData.depositAmount !== undefined && displayData.depositAmount !== null && (
              <Descriptions.Item label="已付定金">
                <span style={{ color: "#52c41a" }}>
                  ¥{Number(displayData.depositAmount).toFixed(2)}
                </span>
              </Descriptions.Item>
            )}
            {displayData.treatmentCost !== undefined && displayData.treatmentCost !== null && displayData.treatmentCost > 0 && (
              <Descriptions.Item label="治疗费用">
                <span style={{ color: "#1890ff" }}>
                  ¥{Number(displayData.treatmentCost).toFixed(2)}
                </span>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="待支付金额">
              <span style={{ color: "#fa541c", fontWeight: "bold", fontSize: "18px" }}>
                {amountText}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="状态">{statusTag}</Descriptions.Item>
          </Descriptions>

          <div className="payment-qrcode">
            <div className="payment-qrcode-title">
              <span>扫码支付</span>
            </div>
            <QRCodeSVG value="http://localhost:3000/" size={200} />
          </div>

          <Space className="payment-actions">
            <Button onClick={() => navigate(-1)}>返回</Button>
            <Button type="primary" onClick={() => navigate("/home")}>
              返回首页
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default SettlementPaymentPage;
