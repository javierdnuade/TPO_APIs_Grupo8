import { api } from './apiClient';

export const getUsuariosConPermisos = () => api.get('/admin/usuarios');

export const updatePermisosUsuario = (id, data) =>
  api.put(`/admin/usuarios/${id}/permisos`, data);
