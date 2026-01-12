import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

interface ProtectedRouteProps {
  children: React.ReactElement;
}

/**
 * 受保护的路由组件
 * 如果用户未登录，重定向到 /home 页面
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const authenticated = isAuthenticated();

  if (!authenticated) {
    // 未登录，重定向到首页
    return <Navigate to="/home" replace />;
  }

  // 已登录，渲染子组件
  return children;
};

export default ProtectedRoute;







