package com.uade.tpejemplo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MorosidadDashboardResponse {

    private long pagadas;

    private long pendientes;

    private long vencidas;
}