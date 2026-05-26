package com.uade.tpejemplo.service.impl;

import com.uade.tpejemplo.dto.request.ClienteRequest;
import com.uade.tpejemplo.dto.response.ClienteDashboardResponse;
import com.uade.tpejemplo.dto.response.ClienteResponse;
import com.uade.tpejemplo.exception.BusinessException;
import com.uade.tpejemplo.exception.ResourceNotFoundException;
import com.uade.tpejemplo.model.Cliente;
import com.uade.tpejemplo.model.Cobranza;
import com.uade.tpejemplo.model.Credito;
import com.uade.tpejemplo.model.Cuota;
import com.uade.tpejemplo.repository.CobranzaRepository;
import com.uade.tpejemplo.repository.CreditoRepository;
import com.uade.tpejemplo.repository.CuotaRepository;
import com.uade.tpejemplo.repository.ClienteRepository;
import com.uade.tpejemplo.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;
    private final CreditoRepository creditoRepository;
    private final CuotaRepository cuotaRepository;
    private final CobranzaRepository cobranzaRepository;

    @Override
    public ClienteResponse crear(ClienteRequest request) {
        if (clienteRepository.existsByDni(request.getDni())) {
            throw new BusinessException("Ya existe un cliente con DNI: " + request.getDni());
        }
        Cliente cliente = new Cliente(request.getDni(), request.getNombre(), null);
        clienteRepository.save(cliente);
        return toResponse(cliente);
    }

    @Override
    public ClienteResponse buscarPorDni(String dni) {
        Cliente cliente = clienteRepository.findByDni(dni)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente", "DNI", dni));
        return toResponse(cliente);
    }

    @Override
    public List<ClienteResponse> listarTodos() {
        return clienteRepository.findAll().stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    public List<ClienteDashboardResponse> filtrarParaDashboard(
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
    ) {
        validarRangoDecimal("deudaTotal", deudaTotalMin, deudaTotalMax);
        validarRangoDecimal("saldoPendiente", saldoPendienteMin, saldoPendienteMax);
        validarRangoDecimal("montoCobrado", montoCobradoMin, montoCobradoMax);
        validarRangoEntero("cantidadCreditos", cantidadCreditosMin, cantidadCreditosMax);
        validarRangoEntero("cuotasPendientes", cuotasPendientesMin, cuotasPendientesMax);

        Specification<Cliente> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (dni != null && !dni.isBlank()) {
                predicates.add(cb.equal(root.get("dni"), dni.trim()));
            }
            if (nombre != null && !nombre.isBlank()) {
                predicates.add(cb.like(
                    cb.lower(root.get("nombre")),
                    "%" + nombre.trim().toLowerCase() + "%"
                ));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return clienteRepository.findAll(spec).stream()
            .map(this::toDashboardResponse)
            .filter(r -> deudaTotalMin == null || r.getDeudaTotal().compareTo(deudaTotalMin) >= 0)
            .filter(r -> deudaTotalMax == null || r.getDeudaTotal().compareTo(deudaTotalMax) <= 0)
            .filter(r -> saldoPendienteMin == null || r.getSaldoPendienteTotal().compareTo(saldoPendienteMin) >= 0)
            .filter(r -> saldoPendienteMax == null || r.getSaldoPendienteTotal().compareTo(saldoPendienteMax) <= 0)
            .filter(r -> montoCobradoMin == null || r.getMontoCobradoTotal().compareTo(montoCobradoMin) >= 0)
            .filter(r -> montoCobradoMax == null || r.getMontoCobradoTotal().compareTo(montoCobradoMax) <= 0)
            .filter(r -> cantidadCreditosMin == null || r.getCantidadCreditos() >= cantidadCreditosMin)
            .filter(r -> cantidadCreditosMax == null || r.getCantidadCreditos() <= cantidadCreditosMax)
            .filter(r -> cuotasPendientesMin == null || r.getCuotasPendientes() >= cuotasPendientesMin)
            .filter(r -> cuotasPendientesMax == null || r.getCuotasPendientes() <= cuotasPendientesMax)
            .filter(r -> soloConDeudaPendiente == null || !soloConDeudaPendiente || r.getSaldoPendienteTotal().compareTo(BigDecimal.ZERO) > 0)
            .filter(r -> soloConCobranza == null || !soloConCobranza || r.getMontoCobradoTotal().compareTo(BigDecimal.ZERO) > 0)
            .toList();
    }

    private ClienteResponse toResponse(Cliente cliente) {
        return new ClienteResponse(cliente.getDni(), cliente.getNombre());
    }

    private ClienteDashboardResponse toDashboardResponse(Cliente cliente) {
        List<Credito> creditos = creditoRepository.findByClienteDni(cliente.getDni());

        BigDecimal deudaTotal = creditos.stream()
            .map(Credito::getDeudaOriginal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal montoCobradoTotal = BigDecimal.ZERO;
        int cantidadCuotas = 0;
        int cuotasPagadas = 0;

        for (Credito credito : creditos) {
            List<Cuota> cuotas = cuotaRepository.findByIdIdCredito(credito.getId());
            List<Cobranza> cobranzas = cobranzaRepository.findByCuotaIdIdCredito(credito.getId());

            cantidadCuotas += cuotas.size();
            cuotasPagadas += cobranzas.size();

            BigDecimal cobradoPorCredito = cobranzas.stream()
                .map(Cobranza::getImporte)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            montoCobradoTotal = montoCobradoTotal.add(cobradoPorCredito);
        }

        BigDecimal saldoPendienteTotal = deudaTotal.subtract(montoCobradoTotal);
        int cuotasPendientes = Math.max(cantidadCuotas - cuotasPagadas, 0);
        BigDecimal porcentajeCobranza = BigDecimal.ZERO;

        if (deudaTotal.compareTo(BigDecimal.ZERO) > 0) {
            porcentajeCobranza = montoCobradoTotal
                .multiply(BigDecimal.valueOf(100))
                .divide(deudaTotal, 2, RoundingMode.HALF_UP);
        }

        return new ClienteDashboardResponse(
            cliente.getDni(),
            cliente.getNombre(),
            creditos.size(),
            deudaTotal,
            montoCobradoTotal,
            saldoPendienteTotal,
            cantidadCuotas,
            cuotasPagadas,
            cuotasPendientes,
            porcentajeCobranza
        );
    }

    private void validarRangoDecimal(String campo, BigDecimal min, BigDecimal max) {
        if (min != null && max != null && min.compareTo(max) > 0) {
            throw new BusinessException("El filtro " + campo + "Min no puede ser mayor que " + campo + "Max");
        }
    }

    private void validarRangoEntero(String campo, Integer min, Integer max) {
        if (min != null && max != null && min > max) {
            throw new BusinessException("El filtro " + campo + "Min no puede ser mayor que " + campo + "Max");
        }
    }
}
