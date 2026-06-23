package com.uade.tpejemplo.repository;

import com.uade.tpejemplo.model.Credito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface CreditoRepository extends JpaRepository<Credito, Long>, JpaSpecificationExecutor<Credito> {

    List<Credito> findByClienteDni(String dni);

    List<Credito> findByClienteDniOrderByIdAsc(String dni);

    List<Credito> findByClienteDniAndAnuladoFalseOrderByIdAsc(String dni);

    @Query("SELECT COALESCE(SUM(c.deudaOriginal), 0) FROM Credito c WHERE c.anulado = false")
    BigDecimal sumarTotalPrestado();

    @Query("SELECT COUNT(c) FROM Credito c WHERE c.estado = false AND c.anulado = false")
    Long contarCreditosPendientes();

    @Query("SELECT COUNT(c) FROM Credito c WHERE c.estado = true AND c.anulado = false")
    Long contarCreditosAprobados();

    @Query("SELECT COUNT(DISTINCT c.cliente) FROM Credito c WHERE c.anulado = false")
    Long contarClientesConCreditos();
}
