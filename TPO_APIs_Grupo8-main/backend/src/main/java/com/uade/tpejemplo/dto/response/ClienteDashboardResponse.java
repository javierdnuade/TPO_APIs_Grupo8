package com.uade.tpejemplo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class ClienteDashboardResponse {

    private String dni;
    private String nombre;
    private Integer cantidadCreditos;
    private BigDecimal deudaTotal;
    private BigDecimal montoCobradoTotal;
    private BigDecimal saldoPendienteTotal;
    private Integer cantidadCuotas;
    private Integer cuotasPagadas;
    private Integer cuotasPendientes;
    private BigDecimal porcentajeCobranza;
}
