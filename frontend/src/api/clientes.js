import { api } from './apiClient';

export const getClientes  = ()      => api.get('/clientes');
export const getCliente   = (dni)   => api.get(`/clientes/${dni}`);
export const crearCliente = (data)  => api.post('/clientes', data);

export const getClientesDashboard = (filtros = {}) => {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const query = params.toString();
  return api.get(`/clientes/dashboard${query ? `?${query}` : ''}`);
};
