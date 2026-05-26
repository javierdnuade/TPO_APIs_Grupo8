package com.uade.tpejemplo.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uade.tpejemplo.dto.response.CobranzaMensualResponse;
import com.uade.tpejemplo.dto.response.DashboardResponse;
import com.uade.tpejemplo.dto.response.MorosidadDashboardResponse;
import com.uade.tpejemplo.repository.CobranzaRepository;
import com.uade.tpejemplo.repository.CreditoRepository;
import com.uade.tpejemplo.repository.CuotaRepository;
import com.uade.tpejemplo.service.DashboardService;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private CreditoRepository creditoRepository;

    @Autowired
    private CuotaRepository cuotaRepository;

    @Autowired
    private CobranzaRepository cobranzaRepository;

    @Override
    public DashboardResponse obtenerEstadisticas() {
        // Obtenemos los datos de los repositorios que definimos
        BigDecimal total = creditoRepository.sumarTotalPrestado();
        Long pendientes = creditoRepository.contarCreditosPendientes();
        Long aprobados = creditoRepository.contarCreditosAprobados();
        Long vencidas = cuotaRepository.contarCuotasVencidas();

        // Evitamos nulos si la base está vacía
        total = (total != null) ? total : BigDecimal.ZERO;
        pendientes = (pendientes != null) ? pendientes : 0L;
        aprobados = (aprobados != null) ? aprobados : 0L;
        vencidas = (vencidas != null) ? vencidas : 0L;

        // Construimos y retornamos el DTO
        return DashboardResponse.builder()
            .capitalTotalPrestado(total.doubleValue())
            .pagadas(aprobados)
            .pendientes(pendientes)
            .cantidadClientesActivos(creditoRepository.contarClientesConCreditos())
            .vencidas(vencidas)
        .build();
    }

    @Override
    public MorosidadDashboardResponse obtenerMorosidad() {

        Long pagadas = cuotaRepository.contarCuotasPagadas();
        Long pendientes = cuotaRepository.contarCuotasPendientes();
        Long vencidas = cuotaRepository.contarCuotasVencidas();

        pagadas = (pagadas != null) ? pagadas : 0L;
        pendientes = (pendientes != null) ? pendientes : 0L;
        vencidas = (vencidas != null) ? vencidas : 0L;

        return new MorosidadDashboardResponse(
            pagadas,
            pendientes,
            vencidas
        );
    }

    @Override
    public List<CobranzaMensualResponse> obtenerCobranzaMensual() {
            
        List<Object[]> resultados = cobranzaRepository.obtenerCobranzaPorMes();

        return resultados.stream()
            .map(r -> new CobranzaMensualResponse(
                ((Number) r[0]).intValue(),
                ((Number) r[1]).intValue(),
                ((Number) r[2]).doubleValue()
            ))
            .toList();
    }

}
