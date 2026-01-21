// import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import StoreList from "./pages/StoreList";
import StoreDetail from "./pages/StoreDetail";
import BookingPage from "./pages/BookingPage";
import PaymentPage from "./pages/PaymentPage";
import Consumption from "./pages/Consumption";
import StoreOrders from "./pages/StoreOrders";
import DailyCare from "./pages/DailyCare";
import PetDaily from "./pages/PetDaily";
import AbnormalRecords from "./pages/AbnormalRecords";
import ReviewOrders from "./pages/ReviewOrders";
import ProtectedRoute from "./components/ProtectedRoute";
import TreatmentApprovalManager from "./components/TreatmentApprovalManager";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/stores",
    element: <StoreList />,
  },
  {
    path: "/stores/:storeId",
    element: <StoreDetail />,
  },
  {
    path: "/stores/:storeId/booking",
    element: (
      <ProtectedRoute>
        <BookingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment",
    element: (
      <ProtectedRoute>
        <PaymentPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/consumption",
    element: (
      <ProtectedRoute>
        <Consumption />
      </ProtectedRoute>
    ),
  },
  {
    path: "/store-orders",
    element: (
      <ProtectedRoute>
        <StoreOrders />
      </ProtectedRoute>
    ),
  },
  {
    path: "/daily-care",
    element: (
      <ProtectedRoute>
        <DailyCare />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pet-daily",
    element: (
      <ProtectedRoute>
        <PetDaily />
      </ProtectedRoute>
    ),
  },
  {
    path: "/abnormal-records",
    element: (
      <ProtectedRoute>
        <AbnormalRecords />
      </ProtectedRoute>
    ),
  },
  {
    path: "/review-orders",
    element: (
      <ProtectedRoute>
        <ReviewOrders />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      {/* 全局审批管理器，监听 SSE 事件并显示审批弹窗 */}
      <TreatmentApprovalManager />
    </>
  );
}

export default App;
