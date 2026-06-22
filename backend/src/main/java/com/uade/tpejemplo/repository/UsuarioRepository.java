package com.uade.tpejemplo.repository;

import com.uade.tpejemplo.model.Usuario;
import com.uade.tpejemplo.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsername(String username);

    boolean existsByUsername(String username);

    List<Usuario> findAllByRolOrderByUsernameAsc(Rol rol);
}
