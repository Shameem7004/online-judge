import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// This function now expects the backend to return { success: true, data: [...] }
export const getAllContests = () => API.get('/contests');
export const getContestDetails = (id) => API.get(`/contests/${id}`);
export const registerForContest = (id) => API.post(`/contests/${id}/register`);
export const getContestLeaderboard = (contestId) => API.get(`/contests/${contestId}/leaderboard`);
export const createContest = (contestData) => API.post('/contests', contestData);
export const updateContest = (id, contestData) => API.put(`/contests/${id}`, contestData);
export const deleteContest = (id) => API.delete(`/contests/${id}`);