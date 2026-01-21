import { StateCreator } from 'zustand';

/**
 * 治疗审批状态管理 Slice
 */
export interface TreatmentApprovalSlice {
  // 待处理审批数量
  pendingApprovalCount: number;
  
  // 设置待处理审批数量
  setPendingApprovalCount: (count: number) => void;
  
  // 增加待处理审批数量
  incrementPendingApprovalCount: () => void;
  
  // 减少待处理审批数量
  decrementPendingApprovalCount: () => void;
  
  // 重置待处理审批数量
  resetPendingApprovalCount: () => void;
  
  // 手动触发查询审批的回调函数（由 TreatmentApprovalManager 设置）
  triggerCheckApprovals?: () => void;
  
  // 设置触发查询的回调函数
  setTriggerCheckApprovals: (callback: () => void) => void;
}

/**
 * 创建治疗审批管理 Slice
 */
export const createTreatmentApprovalSlice: StateCreator<
  TreatmentApprovalSlice,
  [],
  [],
  TreatmentApprovalSlice
> = (set, get) => ({
  pendingApprovalCount: 0,
  triggerCheckApprovals: undefined,

  setPendingApprovalCount: (count) => {
    set({ pendingApprovalCount: Math.max(0, count) });
  },

  incrementPendingApprovalCount: () => {
    set((state) => ({ pendingApprovalCount: state.pendingApprovalCount + 1 }));
  },

  decrementPendingApprovalCount: () => {
    set((state) => ({ pendingApprovalCount: Math.max(0, state.pendingApprovalCount - 1) }));
  },

  resetPendingApprovalCount: () => {
    set({ pendingApprovalCount: 0 });
  },

  setTriggerCheckApprovals: (callback) => {
    set({ triggerCheckApprovals: callback });
  },
});
