import axios from 'axios';

const compilerApi = axios.create({
  baseURL: import.meta.env.VITE_COMPILER_API_URL || 'http://localhost:3000/api',
});

// FIX: Change function signature to accept a single object parameter
export const runCode = async ({ code, language, input }) => {
  const response = await compilerApi.post('/run', { code, language, input });
  return response.data;
};