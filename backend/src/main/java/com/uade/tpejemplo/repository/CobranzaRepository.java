package com.uade.tpejemplo.repository;

import com.uade.tpejemplo.model.Cobranza;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CobranzaRepository extends JpaRepository<Cobranza, Long> {

    List<Cobranza> findByCuotaIdIdCredito(Long idCredito);

    boolean existsByCuotaIdIdCreditoAndCuotaIdIdCuota(Long idCredito, Integer idCuota);

    @Query("""
    SELECT 
        YEAR(c.fecha),
        MONTH(c.fecha),
        SUM(c.importe)
        FROM Cobranza c
        GROUP BY YEAR(c.fecha), MONTH(c.fecha)
        ORDER BY YEAR(c.fecha), MONTH(c.fecha)
    """)
    List<Object[]> obtenerCobranzaPorMes();
}
