import { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Descriptions, Button, message, Tag, Space, Modal } from "antd";
import { QRCodeSVG } from "qrcode.react";
import dayjs from "dayjs";
import Header from "../components/Header";
import "./paymentPage.scss";
import { getOrderStatus, payDeposit } from "../services/api";
import { useStore } from "../zustand/store";
import { isSuccess } from "../utils/response";

interface PaymentOrderInfo {
  orderId: string;
  totalPrice?: number;
  depositAmount?: number;
  create_time?: string;
  orderStatus?: number;
  deposit_paid?: number;
  // 后端直接返回的剩余秒数
  expire_seconds?: number;
}

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = (location.state as { order?: PaymentOrderInfo })?.order;

  // 使用 zustand store 管理倒计时
  const { setOrderCountdown, getOrderRemainSeconds, updateOrderCountdown } = useStore();

  // 剩余支付秒数
  const [remainSeconds, setRemainSeconds] = useState<number | null>(null);
  
  // 支付状态
  const [isPaid, setIsPaid] = useState(false);
  
  // 模拟支付的定时器引用
  const autoPayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTriggeredAutoPayRef = useRef(false);

  const statusTag = useMemo(() => {
    if (!order) return null;
    const paid = isPaid || order.deposit_paid === 1;
    if (paid) {
      return <Tag color="green">已支付定金</Tag>;
    }
    if (order.orderStatus === 1) {
      return <Tag color="orange">待支付</Tag>;
    }
    return <Tag>待处理</Tag>;
  }, [order, isPaid]);

  useEffect(() => {
    if (!order) {
      message.error("未找到支付信息，将返回门店列表");
      navigate("/stores");
      return;
    }

    // 初始化倒计时：先从 store 读取，如果没有则从后端获取
    const initCountdown = async () => {
      if (!order.orderId) return;
      
      // 先从 store 读取已有的倒计时
      let seconds = getOrderRemainSeconds(order.orderId);
      
      if (seconds === null || seconds <= 0) {
        // 如果 store 中没有或已过期，从后端获取
        try {
          const res = await getOrderStatus(order.orderId);
          if (isSuccess(res.code)) {
            const data = res.data as any;
            const expireSeconds = data.expire_seconds;
            
            // 如果后端返回了剩余秒数，使用它
            if (typeof expireSeconds === "number" && expireSeconds > 0) {
              // 计算过期时间（当前时间 + 剩余秒数）
              const expireTime = dayjs().add(expireSeconds, 'second').toISOString();
              setOrderCountdown(order.orderId, expireTime, expireSeconds);
              seconds = expireSeconds;
            } else if (order.create_time) {
              // 如果没有返回剩余秒数，但有创建时间，假设15分钟后过期
              const expireTime = dayjs(order.create_time).add(15, 'minute').toISOString();
              setOrderCountdown(order.orderId, expireTime);
              seconds = Math.max(0, Math.floor((new Date(expireTime).getTime() - Date.now()) / 1000));
            }
          }
        } catch (e) {
          console.error("初始化倒计时失败:", e);
          // 如果获取失败，使用传入的 expire_seconds 或默认值
          if (typeof order.expire_seconds === "number" && order.expire_seconds > 0) {
            const expireTime = dayjs().add(order.expire_seconds, 'second').toISOString();
            setOrderCountdown(order.orderId, expireTime, order.expire_seconds);
            seconds = order.expire_seconds;
          }
        }
      }
      
      if (seconds !== null) {
        setRemainSeconds(seconds);
      }
    };

    initCountdown();
  }, [order, navigate, setOrderCountdown, getOrderRemainSeconds]);

  // 前端本地倒计时：每秒从 store 读取并更新
  useEffect(() => {
    if (!order?.orderId) return;

    const timer = setInterval(() => {
      const seconds = getOrderRemainSeconds(order.orderId);
      if (seconds !== null) {
        setRemainSeconds(seconds);
        // 更新 store 中的倒计时
        updateOrderCountdown(order.orderId);
      } else {
        setRemainSeconds(0);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [order?.orderId, getOrderRemainSeconds, updateOrderCountdown]);

  // 每 30s 去后端校验一次订单状态（是否已支付 / 是否过期）
  useEffect(() => {
    if (!order?.orderId || isPaid) return;

    const check = async () => {
      try {
        const res = await getOrderStatus(order.orderId);
        if (isSuccess(res.code)) {
          const data = res.data as any;
          // 使用后端返回的剩余秒数更新 store
          if (typeof data.expire_seconds === "number" && data.expire_seconds > 0) {
            const expireTime = dayjs().add(data.expire_seconds, 'second').toISOString();
            setOrderCountdown(order.orderId, expireTime, data.expire_seconds);
            setRemainSeconds(data.expire_seconds);
          } else {
            // 订单已过期或已支付
            setRemainSeconds(0);
          }
        }
      } catch (e) {
        console.error("获取订单状态失败:", e);
      }
    };

    // 先检查一次
    check();
    const intervalId = setInterval(check, 30000);
    return () => clearInterval(intervalId);
  }, [order?.orderId, setOrderCountdown, isPaid]);

  // 模拟支付：10秒后自动支付
  useEffect(() => {
    if (!order?.orderId || isPaid || hasTriggeredAutoPayRef.current) return;
    
    // 如果订单状态不是待支付（status === 1），不触发自动支付
    if (order.orderStatus !== 1) return;

    autoPayTimerRef.current = setTimeout(async () => {
      if (hasTriggeredAutoPayRef.current || isPaid) return;
      hasTriggeredAutoPayRef.current = true;

      try {
        // 调用支付接口
        const result = await payDeposit(order.orderId);
        
        if (isSuccess(result.code)) {
          setIsPaid(true);
          
          // 显示支付成功提示
          Modal.success({
            title: '支付成功',
            content: '定金支付成功！订单状态已更新。',
            onOk: () => {
              // 支付成功后可以跳转到订单列表或返回
              navigate('/consumption?tab=2');
            },
          });
        } else {
          message.error(result.msg || '支付失败，请重试');
          hasTriggeredAutoPayRef.current = false;
        }
      } catch (error: any) {
        console.error('支付失败:', error);
        const errorMsg = error?.response?.data?.msg || error?.message || '支付失败，请重试';
        message.error(errorMsg);
        hasTriggeredAutoPayRef.current = false;
      }
    }, 10000); // 10秒后触发

    return () => {
      if (autoPayTimerRef.current) {
        clearTimeout(autoPayTimerRef.current);
      }
    };
  }, [order?.orderId, order?.orderStatus, isPaid, navigate]);

  if (!order) {
    return null;
  }

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

  const displayCountdown =
    remainSeconds !== null
      ? formatCountdown(remainSeconds)
      : "—";

  return (
    <div className="payment-page-container">
      <Header />
      <div className="payment-page-content">
        <Card
          title="订单支付"
          bordered={false}
          className="payment-card"
          extra={<span className="payment-countdown">支付剩余时间：{displayCountdown}</span>}
        >
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="订单号">{order.orderId}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {order.create_time
                ? dayjs(order.create_time).format("YYYY-MM-DD HH:mm:ss")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="总金额">
              ¥{Number(order.totalPrice ?? 0).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="定金金额">
              ¥{Number(order.depositAmount ?? 0).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="状态">{statusTag}</Descriptions.Item>
          </Descriptions>

          <div className="payment-qrcode">
            <div className="payment-qrcode-title">
              <span>扫码支付</span>
              <span className="payment-countdown-inline">{displayCountdown}</span>
            </div>
            <QRCodeSVG value="http://localhost:3000/" size={200} />
            {/* <div className="payment-qrcode-url">http://localhost:3000/</div> */}
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

export default PaymentPage;

