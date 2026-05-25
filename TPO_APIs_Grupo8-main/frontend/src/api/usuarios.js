import { api } from './apiClient';

export const countUsuarios = () => api.get('/usuarios/count');
