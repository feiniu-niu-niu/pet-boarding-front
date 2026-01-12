import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createPetSlice, PetSlice } from './slice/createPetSlice';
import { createUserSlice, UserSlice } from './slice/createUserSlice';
import { createOrderCountdownSlice, OrderCountdownSlice } from './slice/createOrderCountdownSlice';

// 合并后的 Store 类型
export type Store = PetSlice & UserSlice & OrderCountdownSlice;

// 创建统一的 store，合并所有 slice
export const useStore = create<Store>()(
  devtools(
    persist(
      (...a) => ({
        ...createPetSlice(...a),
        ...createUserSlice(...a),
        ...createOrderCountdownSlice(...a),
      }),
      {
        name: 'order-countdown-storage', // localStorage 键名
        partialize: (state) => ({
          // 只持久化倒计时相关的状态
          orderCountdowns: state.orderCountdowns,
        }),
      }
    ),
    { name: 'PetBoardingStore' }
  )
);
