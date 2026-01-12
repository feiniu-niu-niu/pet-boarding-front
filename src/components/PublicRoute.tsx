import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

interface PublicRouteProps {
  children: React.ReactElement;
}

/**
 * 公共路由组件
 * 如果用户已登录，重定向到 /home 页面（避免已登录用户访问登录/注册页）
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const authenticated = isAuthenticated();

  if (authenticated) {
    // 已登录，重定向到首页
    return <Navigate to="/home" replace />;
  }

  // 未登录，渲染子组件
  return children;
};

export default PublicRoute;







