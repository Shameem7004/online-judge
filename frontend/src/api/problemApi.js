import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});


// get the problem
export const getAllProblems = () => API.get('/problems');

// get a single problem by id or slug
export const getProblem = (idOrSlug) => API.get(`/problems/${idOrSlug}`);

// create the problem (admin only -> will do later)
export const createProblem =  (data) => API.post('/problems', data);


// (Optional) update or delete -> will do later
// export const updateProblem = (id, data) => API.put(`/problems/${id}`, data);
// export const deleteProblem = (id) => API.delete(`/problems/${id}`);

