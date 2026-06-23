package com.uade.tpejemplo.repository;

import com.uade.tpejemplo.model.Cobranza;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CobranzaRepository extends JpaRepository<Cobranza, Long> {

    List<Cobranza> findByCuotaIdIdCreditoOrderByIdAsc(Long idCredito);

    List<Cobranza> findByCuotaIdIdCreditoAndAnuladaFalse(Long idCredito);

    @Query("""
    SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END
        FROM Cobranza c
        WHERE c.cuota.id.idCredito = :idCredito
          AND c.cuota.id.idCuota = :idCuota
          AND c.anulada = false
    """)
    boolean existsActivaByCreditoYCuota(Long idCredito, Integer idCuota);

    @Query("""
    SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END
        FROM Cobranza c
        WHERE c.cuota.id.idCredito = :idCredito
          AND c.anulada = false
    """)
    boolean existsActivaByCredito(Long idCredito);

    @Query("""
    SELECT 
        YEAR(c.fecha),
        MONTH(c.fecha),
        SUM(c.importe)
        FROM Cobranza c
        WHERE c.anulada = false
        GROUP BY YEAR(c.fecha), MONTH(c.fecha)
        ORDER BY YEAR(c.fecha), MONTH(c.fecha)
    """)
    List<Object[]> obtenerCobranzaPorMes();
}
