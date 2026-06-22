package com.uade.tpejemplo.dto.request;

import lombok.Data;

@Data
public class PermisosRequest {

    private boolean puedeAnularCredito;
    private boolean puedeAnularCobranza;
}
