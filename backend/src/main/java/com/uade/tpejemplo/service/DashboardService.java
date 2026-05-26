package com.uade.tpejemplo.service;

import java.util.List;

import com.uade.tpejemplo.dto.response.CobranzaMensualResponse;
import com.uade.tpejemplo.dto.response.DashboardResponse;
import com.uade.tpejemplo.dto.response.MorosidadDashboardResponse;

public interface DashboardService {
    DashboardResponse obtenerEstadisticas();

    MorosidadDashboardResponse obtenerMorosidad();

    List<CobranzaMensualResponse> obtenerCobranzaMensual();
}
