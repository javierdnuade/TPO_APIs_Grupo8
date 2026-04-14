package com.uade.tpejemplo.repository;

import com.uade.tpejemplo.model.Cuota;
import com.uade.tpejemplo.model.CuotaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CuotaRepository extends JpaRepository<Cuota, CuotaId> {

    List<Cuota> findByIdIdCredito(Long idCredito);

    @Query("SELECT SUM(cu.interes) FROM Cuota cu WHERE cu.pagada = true")
    Double sumarInteresesGanados();

    // Cantidad de cuotas vencidas y no pagadas (Tasa de Mora)
    // Asumiendo que tenés un campo 'fechaVencimiento' y 'pagada'
    @Query("SELECT COUNT(cu) FROM Cuota cu WHERE cu.pagada = false AND cu.fechaVencimiento < CURRENT_DATE")
    Long contarCuotasVencidas();

}
