import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

export const registerUser = (data) => API.post('/users/register', data);
export const loginUser = (userData) => API.post('/users/login', userData);
export const logoutUser = () => API.post('/users/logout');
export const getCurrentUser = () => API.get('/users/profile');
export const getLeaderboard = () => API.get('/users/leaderboard');
export const getUserProfile = (username) => API.get(`/users/${username}`);
export const updateUserProfile = (data) => API.put('/users/profile', data);

