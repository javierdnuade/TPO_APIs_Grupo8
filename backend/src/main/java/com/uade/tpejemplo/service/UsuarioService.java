package com.uade.tpejemplo.service;

import com.uade.tpejemplo.dto.request.PermisosRequest;
import com.uade.tpejemplo.dto.response.UsuarioResponse;

import java.util.List;

public interface UsuarioService {

    List<UsuarioResponse> listarUsuariosConRolUser();

    UsuarioResponse actualizarPermisos(Long usuarioId, PermisosRequest request);
}
