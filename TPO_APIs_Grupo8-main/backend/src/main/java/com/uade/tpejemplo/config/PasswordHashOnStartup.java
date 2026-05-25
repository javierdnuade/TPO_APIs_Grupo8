package com.uade.tpejemplo.config;

import com.uade.tpejemplo.model.Usuario;
import com.uade.tpejemplo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PasswordHashOnStartup {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    public void hashPlainPasswords() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        int hashCount = 0;
        
        for (Usuario u : usuarios) {
            String pw = u.getPassword();
            if (pw == null || pw.isBlank()) continue;
            
            // Si ya está hasheada (empieza con $2a$, $2b$, $2y$), salta
            if (isAlreadyHashed(pw)) continue;
            
            // Hashea la contraseña plaintext
            u.setPassword(passwordEncoder.encode(pw));
            usuarioRepository.save(u);
            hashCount++;
            log.info("Password hasheada para usuario: {}", u.getUsername());
        }
        
        if (hashCount > 0) {
            log.info("Total passwords hasheadas al startup: {}", hashCount);
        }
    }

    private boolean isAlreadyHashed(String pw) {
        return pw.startsWith("$2a$") || pw.startsWith("$2b$") || pw.startsWith("$2y$");
    }
}
