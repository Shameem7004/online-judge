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