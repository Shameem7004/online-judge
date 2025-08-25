import { createContext, useState, useEffect, useContext } from "react"; // 1. Import useContext
import { getCurrentUser } from '../api/userApi';

export const AuthContext = createContext();

// 2. Create and export the custom useAuth hook
export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await getCurrentUser(); 
                // The actual user object is nested inside the 'user' property
                setUser(res.data.user);
                if (res.data?.user) { /* silent or add debug flag */ }
            } catch (error) {
                // If fetching fails (e.g., no token), set user to null
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {/* This prevents a "flicker" where the app briefly shows a logged-out
              state before the user's session is confirmed.
            */}
            {!loading && children}
        </AuthContext.Provider>
    );
};