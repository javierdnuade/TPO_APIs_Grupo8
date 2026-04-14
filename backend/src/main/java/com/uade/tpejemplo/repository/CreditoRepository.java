package com.uade.tpejemplo.repository;

import com.uade.tpejemplo.model.Credito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditoRepository extends JpaRepository<Credito, Long>, JpaSpecificationExecutor<Credito> {

    List<Credito> findByClienteDni(String dni);

    @Query("SELECT SUM(c.montoTotal) FROM Credito c WHERE c.estado = 'APROBADO'")
    Double sumarTotalPrestado();

    @Query("SELECT COUNT(c) FROM Credito c WHERE c.estado = 'PENDIENTE'")
    Long contarCreditosPendientes();

    @Query("SELECT COUNT(DISTINCT c.cliente) FROM Credito c")
    Long contarClientesConCreditos();
}
