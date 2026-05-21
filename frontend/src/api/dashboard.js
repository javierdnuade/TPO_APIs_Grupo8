import { api } from './apiClient';

export const getDashboardStats = () => api.get('/dashboard/stats');
