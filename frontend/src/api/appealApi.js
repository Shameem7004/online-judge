import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  withCredentials: true,
});

// Submit an appeal (flagged users only)
export const createAppeal = (data) => API.post('/appeals', data);

// Get current user's pending appeal status
export const getMyAppealStatus = () => API.get('/appeals/status');