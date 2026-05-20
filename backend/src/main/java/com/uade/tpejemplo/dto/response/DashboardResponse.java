package com.uade.tpejemplo.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder // Útil para construir el objeto fácilmente en el Service
public class DashboardResponse {
    // Métricas de dinero
    private Double capitalTotalPrestado;
    
    // Métricas de cantidad
    private Long cantidadPrestamosAprobados;
    private Long cantidadPrestamosPendientes;
    private Long cantidadClientesActivos;

    // Métricas de riesgo
    private Double tasaDeMora; // Porcentaje de cuotas impagas
}
