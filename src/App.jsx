// import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import StoreList from "./pages/StoreList";
import StoreDetail from "./pages/StoreDetail";
import BookingPage from "./pages/BookingPage";
import PaymentPage from "./pages/PaymentPage";
import Consumption from "./pages/Consumption";
import ProtectedRoute from "./components/ProtectedRoute";

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
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
