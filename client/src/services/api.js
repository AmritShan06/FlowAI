import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: false
});

client.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export const register = (data) => client.post('/auth/register', data);
export const login = (data) => client.post('/auth/login', data);

export const saveFlowchart = (payload) => client.post('/flowchart/save', payload);
export const loadFlowchart = (id) => client.get(`/flowchart/${id}`);

export const listFlowcharts = () => client.get('/flowchart');

export const aiSuggest = (flowchart) => client.post('/ai/suggest', { flowchart });
