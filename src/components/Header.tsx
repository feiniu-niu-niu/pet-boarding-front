import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Dropdown, type MenuProps } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { getUserInfo, logout, isAuthenticated } from "../utils/auth";
import LoginModal from "./LoginModal";
import "../pages/home.scss";
import { getAvatarUrl } from "../services/api";
// 默认头像路径
const DEFAULT_AVATAR = new URL("../img/defult.png", import.meta.url).href;

interface HeaderProps {
  onMenuClick?: (menuKey: string) => void;
}

/**
 * 公共头部组件
 */
const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(getUserInfo());
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserInfo(null);
    setAuthenticated(false);
    setTimeout(() => {
      navigate("/home");
    }, 100);
  };

  const handleLoginClick = () => {
    setLoginModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setUserInfo(getUserInfo());
    setAuthenticated(isAuthenticated());
    setLoginModalOpen(false);
  };

  // 处理点击简介 - 直接跳转到简介页面
  const handleProfileClick = () => {
    if (onMenuClick) {
      // 如果父组件提供了自定义处理函数，先调用它
      onMenuClick("profile");
      return;
    }
    // 如果已经在简介页面，不需要跳转
    if (location.pathname === "/profile") {
      return;
    }
    // 直接跳转到简介页面，由 Profile 组件负责获取用户详情
    navigate("/profile");
  };

  // 下拉菜单点击处理
  const handleMenuClick: MenuProps["onClick"] = (info) => {
    const menuKey = info.key;
    if (onMenuClick) {
      onMenuClick(menuKey);
    } else {
      switch (menuKey) {
        case "profile":
          handleProfileClick();
          break;
        case "consumption":
          navigate("/consumption");
          break;
        case "logout":
          handleLogout();
          break;
        default:
          break;
      }
    }
  };

  // 下拉菜单配置
  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "简介",
    },
    {
      key: "consumption",
      label: "我的消费",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "退出",
      danger: true,
    },
  ];

  return (
    <>
      <header className="home-header">
        <div className="header-content">
          <div className="logo-section" onClick={() => navigate("/home")}>
            <div className="logo-icon">🐾</div>
            <div className="logo-text">
              <div className="logo-title">PetBoarding</div>
              <div className="logo-tagline">省心安全的寄养服务</div>
            </div>
          </div>
          <nav className="header-nav">
            <a href="#services" className="nav-link">附近的宠物服务</a>
            <a href="#sitter" className="nav-link">成为宠物保姆</a>
            <a href="#help" className="nav-link">客户帮助中心</a>
            {authenticated && userInfo ? (
              <Dropdown
                menu={{ items: menuItems, onClick: handleMenuClick }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <div className="user-info-nav">
                  <img
                    src={userInfo?.avatarUrl ? getAvatarUrl(userInfo.avatarUrl, 'user') : DEFAULT_AVATAR}
                    alt="用户头像"
                    className="user-avatar"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                    }}
                  />
                  <span className="user-name">{userInfo.username || "用户"}</span>
                  <DownOutlined className="dropdown-icon" />
                </div>
              </Dropdown>
            ) : (
              <button className="login-register-btn" onClick={handleLoginClick}>
                登录 | 注册
              </button>
            )}
          </nav>
        </div>
      </header>

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Header;

