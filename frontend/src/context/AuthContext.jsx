import { createContext, useState, useEffect, useContext } from "react";
import { getCurrentUser } from '../api/userApi';

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const res = await getCurrentUser();
            setUser(res.data.user);
        } catch (error) {
            setUser(null);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // This is the line that makes the API call on app load
                const res = await getCurrentUser(); 
                setUser(res.data.user);
            } catch (error) {
                // When you are not logged in, the code lands here
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, refreshUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};