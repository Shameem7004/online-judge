import apiClient from './apiClient';

// Submit an appeal (flagged users only)
export const createAppeal = (data) => apiClient.post('/appeals', data);

// Get current user's pending appeal status
export const getMyAppealStatus = () => apiClient.get('/appeals/status');