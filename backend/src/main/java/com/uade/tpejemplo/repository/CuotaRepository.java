package com.uade.tpejemplo.repository;

import com.uade.tpejemplo.model.Cuota;
import com.uade.tpejemplo.model.CuotaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CuotaRepository extends JpaRepository<Cuota, CuotaId> {

    List<Cuota> findByIdIdCredito(Long idCredito);

    // Cantidad de cuotas vencidas y no pagadas (Tasa de Mora)
    // Asumiendo que tenés un campo 'fechaVencimiento' y 'pagada'
    @Query("SELECT COUNT(cu) FROM Cuota cu WHERE cu.pagada = false AND cu.fechaVencimiento < CURRENT_DATE AND cu.credito.anulado = false")
    Long contarCuotasVencidas();

    @Query("SELECT COUNT(cu) FROM Cuota cu WHERE cu.pagada = true AND cu.credito.anulado = false")
    Long contarCuotasPagadas();

    @Query("SELECT COUNT(cu) FROM Cuota cu WHERE cu.pagada = false AND cu.fechaVencimiento >= CURRENT_DATE AND cu.credito.anulado = false")
    Long contarCuotasPendientes();

}
