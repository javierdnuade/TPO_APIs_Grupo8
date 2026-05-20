package com.uade.tpejemplo.controller;

import com.uade.tpejemplo.dto.request.CreditoRequest;
import com.uade.tpejemplo.dto.response.CreditoDashboardResponse;
import com.uade.tpejemplo.dto.response.CreditoResponse;
import com.uade.tpejemplo.service.CreditoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/creditos")
@RequiredArgsConstructor
public class CreditoController {

    private final CreditoService creditoService;

    @PostMapping
    public ResponseEntity<CreditoResponse> crear(@Valid @RequestBody CreditoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(creditoService.crear(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CreditoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(creditoService.buscarPorId(id));
    }

    @GetMapping("/cliente/{dni}")
    public ResponseEntity<List<CreditoResponse>> listarPorCliente(@PathVariable String dni) {
        return ResponseEntity.ok(creditoService.listarPorCliente(dni));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<List<CreditoDashboardResponse>> filtrarParaDashboard(
        @RequestParam(required = false) String dniCliente,
        @RequestParam(required = false) String nombreCliente,
        @RequestParam(required = false) BigDecimal deudaMin,
        @RequestParam(required = false) BigDecimal deudaMax,
        @RequestParam(required = false) BigDecimal importeCuotaMin,
        @RequestParam(required = false) BigDecimal importeCuotaMax,
        @RequestParam(required = false) Integer cantidadCuotasMin,
        @RequestParam(required = false) Integer cantidadCuotasMax,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
        @RequestParam(required = false) BigDecimal montoCobradoMin,
        @RequestParam(required = false) BigDecimal montoCobradoMax,
        @RequestParam(required = false) BigDecimal saldoPendienteMin,
        @RequestParam(required = false) BigDecimal saldoPendienteMax,
        @RequestParam(required = false) Integer cuotasPagadasMin,
        @RequestParam(required = false) Integer cuotasPagadasMax,
        @RequestParam(required = false) Integer cuotasPendientesMin,
        @RequestParam(required = false) Integer cuotasPendientesMax,
        @RequestParam(required = false) Boolean soloConCuotasPendientes
    ) {
        return ResponseEntity.ok(creditoService.filtrarParaDashboard(
            dniCliente,
            nombreCliente,
            deudaMin,
            deudaMax,
            importeCuotaMin,
            importeCuotaMax,
            cantidadCuotasMin,
            cantidadCuotasMax,
            fechaDesde,
            fechaHasta,
            montoCobradoMin,
            montoCobradoMax,
            saldoPendienteMin,
            saldoPendienteMax,
            cuotasPagadasMin,
            cuotasPagadasMax,
            cuotasPendientesMin,
            cuotasPendientesMax,
            soloConCuotasPendientes
        ));
    }
}
