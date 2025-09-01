import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  withCredentials: true,
});

export const getTestcasesByProblem = (problemId) => API.get(`/problems/${problemId}/testcases`);
export const createTestcase = (problemId, data) => API.post(`/problems/${problemId}/testcases`, data);
export const updateTestcase = (problemId, testcaseId, data) =>   API.put(`/problems/${problemId}/testcases/${testcaseId}`, data);
export const deleteTestcase = (problemId, testcaseId) => API.delete(`/problems/${problemId}/testcases/${testcaseId}`);

