import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  withCredentials: true,
});

export const initiateSubmission = (data) => API.post('/submissions', data);
export const getAllSubmissions = () => API.get('/submissions');
export const getSubmissionById = (id) => API.get(`/submissions/${id}`);
export const getMySubmissions = () => API.get('/submissions/me');