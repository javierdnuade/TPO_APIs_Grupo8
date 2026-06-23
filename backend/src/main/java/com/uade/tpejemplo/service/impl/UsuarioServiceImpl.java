package com.uade.tpejemplo.service.impl;

import com.uade.tpejemplo.dto.request.PermisosRequest;
import com.uade.tpejemplo.dto.response.UsuarioResponse;
import com.uade.tpejemplo.exception.BusinessException;
import com.uade.tpejemplo.exception.ResourceNotFoundException;
import com.uade.tpejemplo.model.Rol;
import com.uade.tpejemplo.model.Usuario;
import com.uade.tpejemplo.repository.UsuarioRepository;
import com.uade.tpejemplo.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public long contarUsuarios() {
        return usuarioRepository.count();
    }

    @Override
    public UsuarioResponse buscarPorUsername(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario", "username", username));
        return UsuarioResponse.from(usuario);
    }

    @Override
    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll().stream()
            .map(UsuarioResponse::from)
            .toList();
    }

    @Override
    public List<UsuarioResponse> listarUsuariosConRolUser() {
        return usuarioRepository.findAllByRolOrderByUsernameAsc(Rol.USER).stream()
            .map(UsuarioResponse::from)
            .toList();
    }

    @Override
    public UsuarioResponse actualizarPermisos(Long usuarioId, PermisosRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));

        if (usuario.getRol() != Rol.USER) {
            throw new BusinessException("Solo se pueden actualizar permisos de usuarios con rol USER");
        }

        usuario.setPuedeAnularCredito(request.isPuedeAnularCredito());
        usuario.setPuedeAnularCobranza(request.isPuedeAnularCobranza());

        usuarioRepository.save(usuario);
        return UsuarioResponse.from(usuario);
    }
}
