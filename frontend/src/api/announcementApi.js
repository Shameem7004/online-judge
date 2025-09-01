import apiClient from './apiClient';

// For the public-facing banner
export const getActiveAnnouncements = () => apiClient.get('/announcements/active');

// For the admin management page
export const getAllAnnouncements = () => apiClient.get('/announcements');
export const createAnnouncement = (data) => apiClient.post('/announcements', data);
export const updateAnnouncement = (id, data) => apiClient.put(`/announcements/${id}`, data);
export const deleteAnnouncement = (id) => apiClient.delete(`/announcements/${id}`);