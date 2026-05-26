package com.uade.tpejemplo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpejemplo.dto.response.CobranzaMensualResponse;
import com.uade.tpejemplo.dto.response.DashboardResponse;
import com.uade.tpejemplo.dto.response.MorosidadDashboardResponse;
import com.uade.tpejemplo.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardResponse> getStats() {
        return ResponseEntity.ok(dashboardService.obtenerEstadisticas());
    }

    @GetMapping("/morosidad")
    public ResponseEntity<MorosidadDashboardResponse> getMorosidad() {
        return ResponseEntity.ok(dashboardService.obtenerMorosidad());
    }

    @GetMapping("/cobranzas-mensuales")
    public ResponseEntity<List<CobranzaMensualResponse>> getCobranzasMensuales() {
        return ResponseEntity.ok(
            dashboardService.obtenerCobranzaMensual()
        );
    }

}
