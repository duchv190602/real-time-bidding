import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar/Navbar';
import HomePage from '../pages/HomePage/HomePage';
import LoginPage from '../pages/LoginPage/LoginPage';
import RegisterPage from '../pages/RegisterPage/RegisterPage';
import AuctionDetailPage from '../pages/AuctionDetailPage/AuctionDetailPage';

import AdminAuctionListPage from '../pages/AdminAuctionListPage/AdminAuctionListPage';
import CreateAuctionPage from '../pages/CreateAuctionPage/CreateAuctionPage';
import AdminGuard from '../components/AdminGuard/AdminGuard';

/**
 * Guard: redirect to login if not authenticated.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/**
 * Guard: redirect to home if already authenticated.
 */
function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

export default function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auctions/:id" element={<AuctionDetailPage />} />


        {/* Admin auction list */}
        <Route
          path="/admin/auctions"
          element={<ProtectedRoute><AdminGuard><AdminAuctionListPage /></AdminGuard></ProtectedRoute>}
        />
        {/* Admin create auction */}
        <Route
          path="/admin/auctions/create"
          element={<ProtectedRoute><AdminGuard><CreateAuctionPage /></AdminGuard></ProtectedRoute>}
        />
        {/* Guest-only routes */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
