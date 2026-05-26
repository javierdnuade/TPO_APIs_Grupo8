import { api } from './apiClient';

export const getDashboardStats = () => api.get('/dashboard/stats');

export const getMorosidadDashboard = () => api.get('/dashboard/morosidad');

export const getCobranzasMensuales = () => api.get('/dashboard/cobranzas-mensuales');
