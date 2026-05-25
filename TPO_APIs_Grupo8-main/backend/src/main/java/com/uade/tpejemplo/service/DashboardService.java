package com.uade.tpejemplo.service;

import com.uade.tpejemplo.dto.response.DashboardResponse;
import com.uade.tpejemplo.dto.response.MorosidadDashboardResponse;

public interface DashboardService {
    DashboardResponse obtenerEstadisticas();

    MorosidadDashboardResponse obtenerMorosidad();
}
