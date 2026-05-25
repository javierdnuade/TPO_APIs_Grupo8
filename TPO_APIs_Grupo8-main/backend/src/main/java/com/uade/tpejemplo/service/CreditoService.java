package com.uade.tpejemplo.service;

import com.uade.tpejemplo.dto.request.CreditoRequest;
import com.uade.tpejemplo.dto.response.CreditoDashboardResponse;
import com.uade.tpejemplo.dto.response.CreditoResponse;

import java.math.BigDecimal;
import java.time.LocalDate;

import java.util.List;

public interface CreditoService {

    CreditoResponse crear(CreditoRequest request);

    CreditoResponse buscarPorId(Long id);

    List<CreditoResponse> listarPorCliente(String dniCliente);

    List<CreditoDashboardResponse> filtrarParaDashboard(
        String dniCliente,
        String nombreCliente,
        BigDecimal deudaMin,
        BigDecimal deudaMax,
        BigDecimal importeCuotaMin,
        BigDecimal importeCuotaMax,
        Integer cantidadCuotasMin,
        Integer cantidadCuotasMax,
        LocalDate fechaDesde,
        LocalDate fechaHasta,
        BigDecimal montoCobradoMin,
        BigDecimal montoCobradoMax,
        BigDecimal saldoPendienteMin,
        BigDecimal saldoPendienteMax,
        Integer cuotasPagadasMin,
        Integer cuotasPagadasMax,
        Integer cuotasPendientesMin,
        Integer cuotasPendientesMax,
        Boolean soloConCuotasPendientes
    );
}
