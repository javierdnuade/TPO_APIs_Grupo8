package com.uade.tpejemplo.service;

import com.uade.tpejemplo.dto.request.ClienteRequest;
import com.uade.tpejemplo.dto.response.ClienteDashboardResponse;
import com.uade.tpejemplo.dto.response.ClienteResponse;

import java.math.BigDecimal;

import java.util.List;

public interface ClienteService {

    ClienteResponse crear(ClienteRequest request);

    ClienteResponse buscarPorDni(String dni);

    List<ClienteResponse> listarTodos();

    List<ClienteDashboardResponse> filtrarParaDashboard(
        String dni,
        String nombre,
        BigDecimal deudaTotalMin,
        BigDecimal deudaTotalMax,
        BigDecimal saldoPendienteMin,
        BigDecimal saldoPendienteMax,
        BigDecimal montoCobradoMin,
        BigDecimal montoCobradoMax,
        Integer cantidadCreditosMin,
        Integer cantidadCreditosMax,
        Integer cuotasPendientesMin,
        Integer cuotasPendientesMax,
        Boolean soloConDeudaPendiente,
        Boolean soloConCobranza
    );
}
