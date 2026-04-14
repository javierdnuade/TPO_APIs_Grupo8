package com.uade.tpejemplo.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uade.tpejemplo.dto.response.DashboardResponse;
import com.uade.tpejemplo.repository.CreditoRepository;
import com.uade.tpejemplo.repository.CuotaRepository;
import com.uade.tpejemplo.service.DashboardService;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private CreditoRepository creditoRepository;

    @Autowired
    private CuotaRepository cuotaRepository;

    @Override
    public DashboardResponse obtenerEstadisticas() {
        // Obtenemos los datos de los repositorios que definimos en el Paso 2
        Double total = creditoRepository.sumarTotalPrestado();
        Long pendientes = creditoRepository.contarCreditosPendientes();
        Long vencidas = cuotaRepository.contarCuotasVencidas();

        // Evitamos nulos si la base está vacía
        total = (total != null) ? total : 0.0;

        // Construimos y retornamos el DTO
        return DashboardResponse.builder()
                .capitalTotalPrestado(total)
                .cantidadPrestamosPendientes(pendientes)
                .cantidadClientesActivos(creditoRepository.contarClientesConCreditos())
                .tasaDeMora(vencidas.doubleValue()) 
                .build();
    }
}
