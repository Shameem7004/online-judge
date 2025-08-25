import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// CHANGE: Renamed to reflect its new purpose
export const initiateSubmission = (data) => API.post('/submissions', data);

// ... (getters remain the same)
export const getAllSubmissions = () => API.get('/submissions');
export const getSubmissionById = (id) => API.get(`/submissions/${id}`);
export const getMySubmissions = () => API.get('/submissions/me');