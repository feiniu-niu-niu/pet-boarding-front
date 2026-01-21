import { useState, useEffect, useRef, useCallback } from "react";
import { getUserInfo } from "../utils/auth";
import { getBackendBaseUrl, getPendingTreatmentApprovals } from "../services/api";
import { isSuccess } from "../utils/response";
import TreatmentApprovalModal from "./TreatmentApprovalModal";
import { useStore } from "../zustand/store";

interface TreatmentApprovalData {
  approvalId: number;
  abnormalType: string;
  description: string;
  suggestedTreatment: string;
  expireTime: string;
  petName?: string;
  petAvatarUrl?: string;
}

/**
 * 全局治疗审批管理器
 * 负责监听 SSE 事件并显示审批弹窗
 * 使用 Fetch API + ReadableStream 实现，支持 Authorization header
 */
const TreatmentApprovalManager: React.FC = () => {
  const [approvalData, setApprovalData] = useState<TreatmentApprovalData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasCheckedPendingRef = useRef<number | null>(null); // 追踪已经查询过的 userId
  const checkIntervalRef = useRef<number | null>(null); // 存储检查 interval
  const lastTokenRef = useRef<string | null>(null); // 追踪最后一次查询时的 token
  const dismissedApprovalsRef = useRef<Set<number>>(new Set()); // 记录用户已关闭的审批 ID
  
  // 使用 store
  const { setPendingApprovalCount, setTriggerCheckApprovals } = useStore();

  // 显示审批弹窗的辅助函数
  const showApprovalModal = useCallback((data: any) => {
    const approvalData = {
      approvalId: data.approvalId,
      abnormalType: data.abnormalType || "",
      description: data.description || "",
      suggestedTreatment: data.suggestedTreatment || "",
      expireTime: data.expireTime || "",
      petName: data.petName || "",
      petAvatarUrl: data.petAvatarUrl || "",
    };
    setApprovalData(approvalData);
    setModalOpen(true);
  }, []);

  // 查询待处理审批的通用函数（可以被外部调用）
  const checkPendingApprovals = useCallback(async (forceCheck: boolean = false, shouldShowModal: boolean = true) => {
    const userInfo = getUserInfo();
    const token = localStorage.getItem("token");
    
    // 只对宠物主人（userType !== 2）查询待处理审批
    if (!userInfo) {
      setPendingApprovalCount(0);
      // 用户未登录时，重置标记，以便下次登录后能够查询
      hasCheckedPendingRef.current = null;
      lastTokenRef.current = null;
      return;
    }
    
    if (userInfo.userType === 2) {
      setPendingApprovalCount(0);
      // 门店员工不需要查询，重置标记但不清除 interval（保持运行，以防用户切换为宠物主人）
      hasCheckedPendingRef.current = null;
      lastTokenRef.current = null;
      return;
    }
    
    if (!userInfo.userId) {
      setPendingApprovalCount(0);
      return;
    }

    if (!token) {
      setPendingApprovalCount(0);
      // 没有 token 时，重置标记
      hasCheckedPendingRef.current = null;
      lastTokenRef.current = null;
      return;
    }

    // 如果强制查询，重置标记
    if (forceCheck) {
      hasCheckedPendingRef.current = null;
      lastTokenRef.current = null;
    }

    // 如果 token 变化了（用户退出登录后重新登录），重置标记
    if (lastTokenRef.current !== null && lastTokenRef.current !== token) {
      hasCheckedPendingRef.current = null;
    } else if (lastTokenRef.current === null && token !== null) {
      // 从退出登录状态恢复到登录状态，重置标记以便重新查询
      hasCheckedPendingRef.current = null;
    }

    // 如果 userId 变化了（用户切换），重置标记
    if (hasCheckedPendingRef.current !== null && hasCheckedPendingRef.current !== userInfo.userId) {
      hasCheckedPendingRef.current = null;
    }

    // 如果已经查询过这个 userId 的审批（在同一登录会话中，即 token 相同）且不是强制查询，跳过查询
    if (!forceCheck && hasCheckedPendingRef.current === userInfo.userId && lastTokenRef.current === token) {
      return;
    }
    
    // 标记已查询，防止重复查询（记录 userId 和 token）
    // 注意：先设置标记，避免在异步查询过程中重复触发
    hasCheckedPendingRef.current = userInfo.userId;
    lastTokenRef.current = token;

    try {
      const result = await getPendingTreatmentApprovals();
      
      if (isSuccess(result.code)) {
        // 解析返回的审批列表
        let approvals: any[] = [];
        if (Array.isArray(result.data)) {
          approvals = result.data;
        } else if (result.data && typeof result.data === "object") {
          const listData = (result.data as any).list || (result.data as any).data || (result.data as any).approvals || [];
          approvals = Array.isArray(listData) ? listData : [];
        }

        // 更新待处理审批数量
        setPendingApprovalCount(approvals.length);

        // 如果有待处理审批，且需要显示弹窗
        if (approvals.length > 0 && shouldShowModal) {
          // 如果 shouldShowModal 为 true，说明是手动触发，应该显示第一个审批（无论是否关闭过）
          // 如果 shouldShowModal 为 false，只在用户没有关闭过时显示
          let approvalToShow: any = null;
          
          if (forceCheck) {
            // 强制查询（手动触发），显示第一个审批
            approvalToShow = approvals[0];
          } else {
            // 自动查询，找到第一个用户还没有关闭过的审批
            approvalToShow = approvals.find((approval: any) => 
              approval.approvalId && !dismissedApprovalsRef.current.has(approval.approvalId)
            );
          }
          
          if (approvalToShow) {
            showApprovalModal(approvalToShow);
          }
        }
        
        if (approvals.length === 0) {
          // 如果没有待处理审批了，清空已关闭列表
          dismissedApprovalsRef.current.clear();
        }
      } else {
        setPendingApprovalCount(0);
      }
      // 查询完成（无论成功或失败），保持标记，不再重试
    } catch (error: any) {
      // 如果是 404 错误（接口不存在），静默处理，保持标记，不再重试
      if (error?.response?.status === 404) {
        setPendingApprovalCount(0);
      } else {
        setPendingApprovalCount(0);
      }
      // 保持标记，不再重试（即使接口不存在或出错，也不应该一直重试）
    }
  }, [setPendingApprovalCount, showApprovalModal]);

  // 注册手动查询的回调函数到 store
  useEffect(() => {
    setTriggerCheckApprovals(() => {
      // 手动触发时，清除已关闭标记，关闭当前弹窗（如果有），强制显示弹窗
      dismissedApprovalsRef.current.clear();
      setModalOpen(false);
      setApprovalData(null);
      // 使用 setTimeout 确保状态更新后再查询
      setTimeout(() => {
        checkPendingApprovals(true, true); // 强制查询并显示弹窗
      }, 100);
    });
  }, [setTriggerCheckApprovals, checkPendingApprovals]);

  // 查询待处理审批（登录后主动查询）
  useEffect(() => {
    // 立即执行一次检查（使用 setTimeout 避免同步 setState）
    // 首次登录时，应该显示弹窗
    const timeoutId = setTimeout(() => {
      // 首次登录时，hasCheckedPendingRef.current 为 null，应该显示弹窗
      const isFirstCheck = hasCheckedPendingRef.current === null;
      // 首次检查时，使用 forceCheck=true 来确保即使有已关闭记录也显示（但首次检查时已关闭记录应该是空的）
      checkPendingApprovals(isFirstCheck, isFirstCheck);
    }, 500); // 增加延迟，确保用户信息已加载

    // 设置定期检查（每1秒检查一次），以便在用户登录后能及时检测到
    // 定期检查时，如果用户已经关闭过弹窗，就不自动显示（只更新数量）
    checkIntervalRef.current = setInterval(() => {
      // 只有首次检查时自动显示弹窗，之后都只更新数量
      const isFirstCheck = hasCheckedPendingRef.current === null;
      checkPendingApprovals(false, isFirstCheck);
    }, 1000);

    // 清理函数
    return () => {
      clearTimeout(timeoutId);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [checkPendingApprovals]);

  // SSE 连接（用于接收实时审批通知）
  useEffect(() => {
    const userInfo = getUserInfo();
    
    // 只对宠物主人（userType !== 2）启用 SSE 监听
    if (!userInfo || userInfo.userType === 2 || !userInfo.userId) {
      return;
    }

    const userId = userInfo.userId;
    const token = localStorage.getItem("token");
    
    if (!token) {
      return;
    }

    // 构建 SSE 订阅 URL
    const baseUrl = import.meta.env.DEV 
      ? ''  // 开发环境使用代理，不需要基础 URL（通过 /api 前缀）
      : getBackendBaseUrl();
    const path = import.meta.env.DEV 
      ? '/api/abnormal-record/sse/subscribe'  // 开发环境使用代理路径
      : '/abnormal-record/sse/subscribe';  // 生产环境使用完整路径
    const sseUrl = `${baseUrl}${path}?userId=${userId}`;

    // 使用 Fetch API + ReadableStream 实现 SSE，支持 Authorization header
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const connectSSE = async () => {
      // 保存 checkPendingApprovals 引用，避免依赖问题
      const updateCount = () => {
        // 使用 setTimeout 避免在 SSE 回调中直接调用，减少依赖警告的影响
        setTimeout(() => {
          checkPendingApprovals(true, false);
        }, 100);
      };
      try {
        const response = await fetch(sseUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/event-stream',
            'Authorization': `Bearer ${token}`,
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          return;
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          return;
        }

        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留最后一行不完整的数据

          let currentEventData = '';
          let inDataBlock = false;
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine.startsWith('data:')) {
              // 开始一个新的 data 块
              inDataBlock = true;
              const dataPrefix = 'data:';
              let dataContent = trimmedLine.slice(dataPrefix.length);
              // 如果开头是空格，去掉空格
              if (dataContent.startsWith(' ')) {
                dataContent = dataContent.slice(1);
              }
              currentEventData = dataContent;
            } else if (inDataBlock && trimmedLine === '') {
              // 空行表示一个事件结束，且已有数据
              if (currentEventData) {
                try {
                  const data = JSON.parse(currentEventData);

                  // 解析审批数据
                  if (data.approvalId) {
                    // 检查用户是否已经关闭过这个审批
                    if (dismissedApprovalsRef.current.has(data.approvalId)) {
                      // 仍然更新数量（不显示弹窗）
                      updateCount();
                    } else {
                      showApprovalModal(data);
                      // 显示弹窗后，也更新一下数量
                      updateCount();
                    }
                  }
                } catch {
                  // 解析失败，静默处理
                }
              }
              // 重置状态
              currentEventData = '';
              inDataBlock = false;
            } else if (inDataBlock && trimmedLine !== '') {
              // 在 data 块中，但当前行不是空行，追加到 currentEventData
              // 如果是 JSON 的多行格式，需要添加换行符
              currentEventData += '\n' + trimmedLine;
            }
            // 忽略 event: 行和其他行
          }
        }
      } catch {
        // 连接错误，静默处理
      }
    };

    connectSSE();

    // 清理函数
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [showApprovalModal, checkPendingApprovals]);

  const handleClose = () => {
    // 记录已关闭的审批 ID
    if (approvalData?.approvalId) {
      dismissedApprovalsRef.current.add(approvalData.approvalId);
    }
    setModalOpen(false);
    setApprovalData(null);
    // 关闭弹窗后，重新查询一次，更新数量（但不显示弹窗）
    setTimeout(() => {
      checkPendingApprovals(true, false);
    }, 500);
  };

  const handleSuccess = () => {
    // 审批成功后的回调
    // 审批完成后，从已关闭列表中移除（因为已经处理完了，不再需要记录）
    if (approvalData?.approvalId) {
      dismissedApprovalsRef.current.delete(approvalData.approvalId);
    }
    setModalOpen(false);
    setApprovalData(null);
    // 审批完成后，重新查询一次，更新数量（但不显示弹窗，因为用户已经处理完了）
    setTimeout(() => {
      checkPendingApprovals(true, false);
    }, 500);
  };

  return (
    <TreatmentApprovalModal
      open={modalOpen}
      data={approvalData}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
};

export default TreatmentApprovalManager;
