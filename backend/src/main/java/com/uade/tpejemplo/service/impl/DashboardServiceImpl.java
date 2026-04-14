package com.uade.tpejemplo.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uade.tpejemplo.dto.response.DashboardResponse;
import com.uade.tpejemplo.repository.CreditoRepository;
import com.uade.tpejemplo.repository.CuotaRepository;
import com.uade.tpejemplo.service.DashboardService;

import java.math.BigDecimal;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private CreditoRepository creditoRepository;

    @Autowired
    private CuotaRepository cuotaRepository;

    @Override
    public DashboardResponse obtenerEstadisticas() {
        // Obtenemos los datos de los repositorios que definimos
        BigDecimal total = creditoRepository.sumarTotalPrestado();
        Long pendientes = creditoRepository.contarCreditosPendientes();
        Long vencidas = cuotaRepository.contarCuotasVencidas();

        // Evitamos nulos si la base está vacía
        total = (total != null) ? total : BigDecimal.ZERO;
        pendientes = (pendientes != null) ? pendientes : 0L;
        vencidas = (vencidas != null) ? vencidas : 0L;

        // Construimos y retornamos el DTO
        return DashboardResponse.builder()
            .capitalTotalPrestado(total.doubleValue())
                .cantidadPrestamosPendientes(pendientes)
                .cantidadClientesActivos(creditoRepository.contarClientesConCreditos())
                .tasaDeMora(vencidas.doubleValue()) 
                .build();
    }
}
