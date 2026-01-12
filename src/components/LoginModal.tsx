import { useState } from "react";
import { Modal, Tabs, message } from "antd";
import type { TabsProps } from "antd";
import { login, register } from "../services/api";
import { setToken, setUserInfo, getCurrentLocation, setLongitude, setLatitude } from "../utils/auth";
import { isSuccess } from "../utils/response";
import type { User } from "../../generated-api";
import "./loginModal.scss";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  // 登录表单状态
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // 注册表单状态
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("宠物主人");

  // 登录处理
  const handleLogin = async () => {
    if (!loginUsername || !loginPassword) {
      message.warning("请输入用户名和密码");
      return;
    }

    setLoginLoading(true);

    try {
      const result = await login(loginUsername, loginPassword);

      if (isSuccess(result.code)) {
        message.success(result?.msg || "登录成功");

        // 保存 token 和用户信息
        if (result.data && typeof result.data === "object") {
          const data = result.data as any;

          // 保存 token
          if (data.token) {
            setToken(data.token);
          }

          if (data.userId || data.username) {
            const userData: any = {
              userId: data.userId,
              username: data.username,
              userType: data.userType,
              avatarUrl: data.avatarUrl,
            };
            setUserInfo(userData);
          }
        }
        
        // 登录成功后获取位置信息
        try {
          console.log('开始获取位置信息...');
          const location = await getCurrentLocation();
          console.log('位置信息获取成功:', location);
          setLongitude(location.longitude);
          setLatitude(location.latitude);
          console.log('经纬度已保存到 localStorage');
        } catch (error: any) {
          console.error('获取位置信息失败:', error?.message || error);
          // 位置获取失败不影响登录流程
        }
        
        // 重置表单
        setLoginUsername("");
        setLoginPassword("");
        
        // 关闭弹窗并触发成功回调
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        message.error(result.msg || "登录失败");
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "登录失败，请稍后重试";
      message.error(errorMsg);
    } finally {
      setLoginLoading(false);
    }
  };

  // 注册处理
  const handleRegister = async () => {
    if (registerPassword !== confirmPassword) {
      message.error("两次输入的密码不一致");
      return;
    }

    if (!registerUsername || !registerPassword) {
      message.warning("请填写完整信息");
      return;
    }

    setRegisterLoading(true);

    try {
      const userData: User = {
        username: registerUsername,
        password: registerPassword,
        userType: userType === "宠物主人" ? 1 : 2,
      };

      const result = await register(userData);

      if (isSuccess(result.code)) {
        // 显示成功消息，使用 msg 字段或默认消息
        message.success(result.msg || "注册成功，请登录");

        // 重置表单并切换到登录标签
        setRegisterUsername("");
        setRegisterPassword("");
        setConfirmPassword("");
        setActiveTab("login");
        
        // 将注册的用户名填入登录表单
        setLoginUsername(registerUsername);
      } else {
        message.error(result.msg || "注册失败");
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "注册失败，请稍后重试";
      message.error(errorMsg);
    } finally {
      setRegisterLoading(false);
    }
  };

  // 标签页配置
  const tabItems: TabsProps["items"] = [
    {
      key: "login",
      label: "登录",
      children: (
        <div className="login-form">
          <div className="form-item">
            <input
              type="text"
              className="form-input"
              placeholder="用户名"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
            />
          </div>
          <div className="form-item">
            <input
              type="password"
              className="form-input"
              placeholder="密码"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
            />
          </div>
          <button
            className="form-submit-btn"
            onClick={handleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? "登录中..." : "登录"}
          </button>
        </div>
      ),
    },
    {
      key: "register",
      label: "注册",
      children: (
        <div className="register-form">
          <div className="form-item">
            <input
              type="text"
              className="form-input"
              placeholder="用户名"
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
            />
          </div>
          <div className="form-item">
            <input
              type="password"
              className="form-input"
              placeholder="密码"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />
          </div>
          <div className="form-item">
            <input
              type="password"
              className="form-input"
              placeholder="确认密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="form-item">
            <select
              className="form-select"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="宠物主人">宠物主人</option>
              <option value="门店员工">门店员工</option>
            </select>
          </div>
          <button
            className="form-submit-btn"
            onClick={handleRegister}
            disabled={registerLoading}
          >
            {registerLoading ? "注册中..." : "注册"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={420}
      centered
      className="login-modal"
    >
      <div className="modal-header">
        <h2 className="modal-title">欢迎来到宠物寄养平台</h2>
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        centered
      />
    </Modal>
  );
};

export default LoginModal;

