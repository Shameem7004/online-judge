import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    withCredentials: true,
});

// FIX: Add a default empty object {} to the function's parameters.
export const getAllProblems = ({ page = 1, tag = '' } = {}) => {
    const params = new URLSearchParams({ page });
    if (tag) {
        params.append('tag', tag);
    }
    return API.get(`/problems?${params.toString()}`);
};

export const getProblemBySlug = (slug) => API.get(`/problems/${slug}`);
export const getProblemById = (id) => API.get(`/problems/${id}`);
export const createProblem = (data) => API.post('/problems', data);
export const updateProblem = (id, data) => API.put(`/problems/${id}`, data);
export const deleteProblem = (id) => API.delete(`/problems/${id}`);
export const getDailyProblem = () => API.get('/problems/daily');

