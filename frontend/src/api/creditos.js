import { api } from './apiClient';

export const getCreditosPorCliente = (dni) => api.get(`/creditos/cliente/${dni}`);
export const getCredito            = (id)  => api.get(`/creditos/${id}`);
export const crearCredito          = (data) => api.post('/creditos', data);

export const getCreditosDashboard = (filtros = {}) => {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const query = params.toString();
  return api.get(`/creditos/dashboard${query ? `?${query}` : ''}`);
};
