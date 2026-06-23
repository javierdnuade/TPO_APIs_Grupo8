import { api } from './apiClient';

export const getUsuariosConPermisos = () => api.get('/usuarios/gestion-permisos');

export const updatePermisosUsuario = (id, data) =>
  api.put(`/usuarios/${id}/permisos`, data);
