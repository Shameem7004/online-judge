import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = () => {
    const { user, loading } = useContext(AuthContext);

    // While checking user auth, don't render anything
    if (loading) {
        return null; 
    }

    // If the user is logged in and their role is 'admin', render the child components.
    // Otherwise, redirect them to the homepage.
    return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;