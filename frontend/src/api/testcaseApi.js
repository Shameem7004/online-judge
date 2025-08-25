import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

// Fetches all test cases for a given problem ID
export const getTestcasesByProblem = (problemId) => API.get(`/problems/${problemId}/testcases`);

// Creates a new test case for a given problem
export const createTestcase = (problemId, data) => API.post(`/problems/${problemId}/testcases`, data);

// Updates an existing test case by its ID
export const updateTestcase = (problemId, testcaseId, data) =>   API.put(`/problems/${problemId}/testcases/${testcaseId}`, data);

// Deletes a test case by its ID
export const deleteTestcase = (problemId, testcaseId) => API.delete(`/problems/${problemId}/testcases/${testcaseId}`);

