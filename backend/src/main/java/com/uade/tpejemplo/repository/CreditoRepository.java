package com.uade.tpejemplo.repository;

import com.uade.tpejemplo.model.Credito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CreditoRepository extends JpaRepository<Credito, Long>, JpaSpecificationExecutor<Credito> {

    List<Credito> findByClienteDni(String dni);

    @Query("SELECT COALESCE(SUM(c.deudaOriginal), 0) FROM Credito c")
    BigDecimal sumarTotalPrestado();

    @Query("SELECT COUNT(c) FROM Credito c WHERE c.estado = false")
    Long contarCreditosPendientes();

    @Query("SELECT COUNT(c) FROM Credito c WHERE c.estado = true")
    Long contarCreditosAprobados();

    @Query("SELECT COUNT(DISTINCT c.cliente) FROM Credito c")
    Long contarClientesConCreditos();
}
