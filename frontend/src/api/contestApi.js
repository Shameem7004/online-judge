import apiClient from './apiClient'; // FIX: Import the shared apiClient

// This function now expects the backend to return { success: true, data: [...] }
export const getAllContests = ({ signal } = {}) => apiClient.get('/contests', { signal }); // FIX: Use apiClient and pass signal
export const getContestDetails = (id) => apiClient.get(`/contests/${id}`);
export const registerForContest = (id) => apiClient.post(`/contests/${id}/register`);
export const getContestLeaderboard = (contestId) => apiClient.get(`/contests/${contestId}/leaderboard`);
export const createContest = (contestData) => apiClient.post('/contests', contestData);
export const updateContest = (id, contestData) => apiClient.put(`/contests/${id}`, contestData);
export const deleteContest = (id) => apiClient.delete(`/contests/${id}`);