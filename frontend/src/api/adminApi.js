import apiClient from './apiClient';

/**
 * Fetches aggregated statistics for the admin dashboard.
 * NOTE: You must create a backend route (e.g., GET /api/v1/admin/dashboard-stats)
 * that returns data in the format: { success: true, stats: { totalUsers, totalProblems, ... } }
 */
export const getDashboardStats = ({ signal } = {}) => {
  return apiClient.get('/admin/dashboard-stats', { signal });
};

/**
 * Fetches all users for the admin management page.
 * NOTE: You must create a backend route (e.g., GET /api/v1/admin/users)
 */
export const getAllUsers = ({ signal } = {}) => {
  return apiClient.get('/admin/users', { signal });
};

/**
 * Fetches all submissions from all users for the admin management page.
 * NOTE: You must create a backend route (e.g., GET /api/v1/admin/submissions)
 */
export const getAllSubmissionsAdmin = ({ signal } = {}) => {
  return apiClient.get('/admin/submissions', { signal });
};

/**
 * Deletes a user by ID.
 * NOTE: You must create a backend route (e.g., DELETE /api/v1/admin/users/:userId)
 */
export const deleteUser = (userId) => apiClient.delete(`/admin/users/${userId}`);

/**
 * Toggles the flag status of a user by ID.
 * NOTE: You must create a backend route (e.g., PUT /api/v1/admin/users/:userId/flag)
 */
export const toggleUserFlag = (userId) => apiClient.put(`/admin/users/${userId}/flag`);

/**
 * Fetches grouped submissions for the admin management page.
 * NOTE: You must create a backend route (e.g., GET /api/v1/admin/submissions/grouped)
 */
export const getGroupedSubmissions = ({ signal } = {}) => apiClient.get('/admin/submissions/grouped', { signal });

/**
 * Deletes a submission by ID.
 * NOTE: You must create a backend route (e.g., DELETE /api/v1/admin/submissions/:submissionId)
 */
export const deleteSubmission = (submissionId) => apiClient.delete(`/admin/submissions/${submissionId}`);

/**
 * Toggles the flag status of a submission by ID.
 * NOTE: You must create a backend route (e.g., PUT /api/v1/admin/submissions/:submissionId/flag)
 */
export const toggleSubmissionFlag = (submissionId) => apiClient.put(`/admin/submissions/${submissionId}/flag`);