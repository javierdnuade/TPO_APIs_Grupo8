package com.uade.tpejemplo.repository;

import com.uade.tpejemplo.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, String>, JpaSpecificationExecutor<Cliente> {

    Optional<Cliente> findByDni(String dni);

    boolean existsByDni(String dni);
}
