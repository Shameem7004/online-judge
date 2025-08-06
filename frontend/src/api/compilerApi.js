import axios from 'axios';

const COMPILER_API = axios.create({
    baseURL: import.meta.env.VITE_COMPILER_API_URL,
});

export const runCode = (language, code, input = "") =>
    COMPILER_API.post('/run', { language, code, input });