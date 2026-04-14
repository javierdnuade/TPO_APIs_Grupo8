package com.uade.tpejemplo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ClienteRequest {

    @NotBlank(message = "El DNI es obligatorio")
    @Pattern(regexp = "^\\d+$", message = "El DNI solo puede contener numeros")
    @Size(max = 15, message = "El DNI no puede superar los 15 digitos")
    private String dni;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;
}
