package com.uade.tpejemplo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CobranzaMensualResponse {

    private Integer anio;
    private Integer mes;
    private Double totalCobrado;
}
