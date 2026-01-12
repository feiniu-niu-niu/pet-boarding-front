import { StateCreator } from 'zustand';

/**
 * 订单倒计时状态
 */
export interface OrderCountdown {
  orderId: string;
  expireTime: string; // 过期时间 ISO 字符串
  initialRemainSeconds: number; // 初始剩余秒数
  lastUpdateTime: number; // 最后一次更新的时间戳
}

/**
 * 订单倒计时管理 Slice
 */
export interface OrderCountdownSlice {
  // 订单倒计时映射 { orderId: OrderCountdown }
  orderCountdowns: Record<string, OrderCountdown>;
  
  // 设置订单倒计时
  setOrderCountdown: (orderId: string, expireTime: string, initialRemainSeconds?: number) => void;
  
  // 获取订单剩余秒数
  getOrderRemainSeconds: (orderId: string) => number | null;
  
  // 清除订单倒计时
  clearOrderCountdown: (orderId: string) => void;
  
  // 清除所有倒计时
  clearAllCountdowns: () => void;
  
  // 更新订单倒计时（基于过期时间计算）
  updateOrderCountdown: (orderId: string) => void;
}

/**
 * 创建订单倒计时 Slice
 */
export const createOrderCountdownSlice: StateCreator<
  OrderCountdownSlice,
  [],
  [],
  OrderCountdownSlice
> = (set, get) => ({
  orderCountdowns: {},

  setOrderCountdown: (orderId, expireTime, initialRemainSeconds) => {
    const expireTimeMs = new Date(expireTime).getTime();
    const now = Date.now();
    const remainSeconds = initialRemainSeconds ?? Math.max(0, Math.floor((expireTimeMs - now) / 1000));

    set((state) => ({
      orderCountdowns: {
        ...state.orderCountdowns,
        [orderId]: {
          orderId,
          expireTime,
          initialRemainSeconds: remainSeconds,
          lastUpdateTime: now,
        },
      },
    }));
  },

  getOrderRemainSeconds: (orderId) => {
    const state = get();
    const countdown = state.orderCountdowns[orderId];
    
    if (!countdown) {
      return null;
    }

    // 基于过期时间计算当前剩余秒数
    const expireTimeMs = new Date(countdown.expireTime).getTime();
    const now = Date.now();
    const remainSeconds = Math.max(0, Math.floor((expireTimeMs - now) / 1000));
    
    return remainSeconds;
  },

  updateOrderCountdown: (orderId) => {
    const state = get();
    const countdown = state.orderCountdowns[orderId];
    
    if (!countdown) {
      return;
    }

    // 基于过期时间重新计算剩余秒数
    const expireTimeMs = new Date(countdown.expireTime).getTime();
    const now = Date.now();
    const remainSeconds = Math.max(0, Math.floor((expireTimeMs - now) / 1000));

    set((state) => ({
      orderCountdowns: {
        ...state.orderCountdowns,
        [orderId]: {
          ...countdown,
          initialRemainSeconds: remainSeconds,
          lastUpdateTime: now,
        },
      },
    }));
  },

  clearOrderCountdown: (orderId) => {
    set((state) => {
      const { [orderId]: _, ...rest } = state.orderCountdowns;
      return { orderCountdowns: rest };
    });
  },

  clearAllCountdowns: () => {
    set({ orderCountdowns: {} });
  },
});

