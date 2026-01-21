import { useState } from "react";
import { Modal, Descriptions, Button, message, Space, Avatar } from "antd";
import { decideTreatmentApproval } from "../services/api";
import { isSuccess } from "../utils/response";
import dayjs from "dayjs";

interface TreatmentApprovalData {
  approvalId: number;
  abnormalType: string;
  description: string;
  suggestedTreatment: string;
  expireTime: string;
  petName?: string;
  petAvatarUrl?: string;
}

interface TreatmentApprovalModalProps {
  open: boolean;
  data: TreatmentApprovalData | null;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * 治疗审批弹窗组件（宠物主人视角）
 * 位置：右上角偏中间
 */
const TreatmentApprovalModal: React.FC<TreatmentApprovalModalProps> = ({
  open,
  data,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDecision = async (decision: number) => {
    if (!data || !data.approvalId) {
      message.error("审批数据不完整");
      return;
    }

    setLoading(true);
    try {
      const result = await decideTreatmentApproval({
        approvalId: data.approvalId,
        decision: decision,
      });

      if (isSuccess(result.code)) {
        message.success(decision === 1 ? "已同意治疗" : "已拒绝治疗");
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        message.error(result.msg || "提交失败");
      }
    } catch (error: any) {
      console.error("提交治疗审批决策失败:", error);
      const errorMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        "提交失败，请稍后重试";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return null;
  }

  return (
    <Modal
      title="治疗审批"
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      style={{
        position: "fixed",
        top: "20%",
        right: "5%",
        margin: 0,
      }}
      mask={true}
      maskClosable={false}
    >
      {/* 宠物信息展示 */}
      {(data.petName || data.petAvatarUrl) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
            padding: 12,
            backgroundColor: "#f5f5f5",
            borderRadius: 4,
          }}
        >
          <Avatar
            src={data.petAvatarUrl}
            size={48}
            style={{ flexShrink: 0 }}
          >
            {data.petName?.charAt(0) || "宠"}
          </Avatar>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 500 }}>
              {data.petName || "未知宠物"}
            </div>
          </div>
        </div>
      )}

      <Descriptions column={1} bordered size="middle">
        <Descriptions.Item label="异常类型">
          {data.abnormalType || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="异常描述">
          {data.description || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="建议治疗">
          {data.suggestedTreatment || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="过期时间">
          {data.expireTime
            ? dayjs(data.expireTime).format("YYYY-MM-DD HH:mm:ss")
            : "-"}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 24, textAlign: "right" }}>
        <Space>
          <Button
            onClick={() => handleDecision(0)}
            loading={loading}
            danger
          >
            拒绝
          </Button>
          <Button
            type="primary"
            onClick={() => handleDecision(1)}
            loading={loading}
          >
            同意
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default TreatmentApprovalModal;
