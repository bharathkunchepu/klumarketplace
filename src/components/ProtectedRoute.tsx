import { Navigate } from 'react-router-dom';
import { authUtils } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, requires auth. If false, requires no auth (for login/signup pages)
}

const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const isLoggedIn = authUtils.isLoggedIn();

  // If route requires auth and user is not logged in, redirect to login
  if (requireAuth && !isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If route requires no auth (login/signup) and user is logged in, redirect to products
  if (!requireAuth && isLoggedIn) {
    return <Navigate to="/products" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

