package com.uade.tpejemplo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class CreditoDashboardResponse {

    private Long id;
    private String dniCliente;
    private String nombreCliente;
    private BigDecimal deudaOriginal;
    private BigDecimal montoCobrado;
    private BigDecimal saldoPendiente;
    private Integer cantidadCuotas;
    private Integer cuotasPagadas;
    private Integer cuotasPendientes;
    private LocalDate fechaOtorgamiento;
}
