import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  withCredentials: true,
});

/**
 * Requests an AI analysis for a given submission ID.
 * @param {string} submissionId - The ID of the submission to analyze.
 * @returns {Promise} - The promise that resolves with the API response.
 */
export const getAIAnalysis = (submissionId) => API.post(`/ai/${submissionId}/analyze`);