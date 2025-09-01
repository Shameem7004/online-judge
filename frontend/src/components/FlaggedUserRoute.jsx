import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const FlaggedUserRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  // If flagged => redirect to status page
  if (user && user.isFlagged) {
    return <Navigate to="/account-status" replace />;
  }
  return <Outlet />;
};

export default FlaggedUserRoute;