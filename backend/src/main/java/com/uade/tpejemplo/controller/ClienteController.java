package com.uade.tpejemplo.controller;

import com.uade.tpejemplo.dto.request.ClienteRequest;
import com.uade.tpejemplo.dto.response.ClienteDashboardResponse;
import com.uade.tpejemplo.dto.response.ClienteResponse;
import com.uade.tpejemplo.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @PostMapping
    public ResponseEntity<ClienteResponse> crear(@Valid @RequestBody ClienteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.crear(request));
    }

    @GetMapping("/{dni}")
    public ResponseEntity<ClienteResponse> buscarPorDni(@PathVariable String dni) {
        return ResponseEntity.ok(clienteService.buscarPorDni(dni));
    }

    @GetMapping
    public ResponseEntity<List<ClienteResponse>> listarTodos() {
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<List<ClienteDashboardResponse>> filtrarParaDashboard(
        @RequestParam(required = false) String dni,
        @RequestParam(required = false) String nombre,
        @RequestParam(required = false) BigDecimal deudaTotalMin,
        @RequestParam(required = false) BigDecimal deudaTotalMax,
        @RequestParam(required = false) BigDecimal saldoPendienteMin,
        @RequestParam(required = false) BigDecimal saldoPendienteMax,
        @RequestParam(required = false) BigDecimal montoCobradoMin,
        @RequestParam(required = false) BigDecimal montoCobradoMax,
        @RequestParam(required = false) Integer cantidadCreditosMin,
        @RequestParam(required = false) Integer cantidadCreditosMax,
        @RequestParam(required = false) Integer cuotasPendientesMin,
        @RequestParam(required = false) Integer cuotasPendientesMax,
        @RequestParam(required = false) Boolean soloConDeudaPendiente,
        @RequestParam(required = false) Boolean soloConCobranza
    ) {
        return ResponseEntity.ok(clienteService.filtrarParaDashboard(
            dni,
            nombre,
            deudaTotalMin,
            deudaTotalMax,
            saldoPendienteMin,
            saldoPendienteMax,
            montoCobradoMin,
            montoCobradoMax,
            cantidadCreditosMin,
            cantidadCreditosMax,
            cuotasPendientesMin,
            cuotasPendientesMax,
            soloConDeudaPendiente,
            soloConCobranza
        ));
    }
}
