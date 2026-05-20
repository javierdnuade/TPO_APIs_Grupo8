package com.uade.tpejemplo.service.impl;

import com.uade.tpejemplo.dto.request.CreditoRequest;
import com.uade.tpejemplo.dto.response.CreditoDashboardResponse;
import com.uade.tpejemplo.dto.response.CreditoResponse;
import com.uade.tpejemplo.dto.response.CuotaResponse;
import com.uade.tpejemplo.exception.BusinessException;
import com.uade.tpejemplo.exception.ResourceNotFoundException;
import com.uade.tpejemplo.model.Cobranza;
import com.uade.tpejemplo.model.Cliente;
import com.uade.tpejemplo.model.Credito;
import com.uade.tpejemplo.model.Cuota;
import com.uade.tpejemplo.model.CuotaId;
import com.uade.tpejemplo.repository.ClienteRepository;
import com.uade.tpejemplo.repository.CobranzaRepository;
import com.uade.tpejemplo.repository.CreditoRepository;
import com.uade.tpejemplo.repository.CuotaRepository;
import com.uade.tpejemplo.service.CreditoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class CreditoServiceImpl implements CreditoService {

    private final CreditoRepository creditoRepository;
    private final ClienteRepository clienteRepository;
    private final CuotaRepository cuotaRepository;
    private final CobranzaRepository cobranzaRepository;

    @Override
    @Transactional
    public CreditoResponse crear(CreditoRequest request) {
        Cliente cliente = clienteRepository.findByDni(request.getDniCliente())
            .orElseThrow(() -> new ResourceNotFoundException("Cliente", "DNI", request.getDniCliente()));

    Credito credito = new Credito(
        null,
        cliente,
        request.getDeudaOriginal(),
        request.getFecha(),
        request.getImporteCuota(),
        request.getCantidadCuotas(),
        null,
        false
    );
        creditoRepository.save(credito);

        // Generar cuotas automáticamente con vencimiento mensual
        List<Cuota> cuotas = new ArrayList<>();
        for (int i = 1; i <= request.getCantidadCuotas(); i++) {
            Cuota cuota = new Cuota(
                new CuotaId(credito.getId(), i),
                credito,
                request.getFecha().plusMonths(i),
                false
            );
            cuotas.add(cuota);
        }
        cuotaRepository.saveAll(cuotas);

        return toResponse(credito, cuotas);
    }

    @Override
    public CreditoResponse buscarPorId(Long id) {
        Credito credito = creditoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Crédito", "id", id));
        List<Cuota> cuotas = cuotaRepository.findByIdIdCredito(id);
        return toResponse(credito, cuotas);
    }

    @Override
    public List<CreditoResponse> listarPorCliente(String dniCliente) {
        if (!clienteRepository.existsByDni(dniCliente)) {
            throw new ResourceNotFoundException("Cliente", "DNI", dniCliente);
        }
        return creditoRepository.findByClienteDni(dniCliente).stream()
            .map(c -> toResponse(c, cuotaRepository.findByIdIdCredito(c.getId())))
            .toList();
    }

    @Override
    public List<CreditoDashboardResponse> filtrarParaDashboard(
        String dniCliente,
        String nombreCliente,
        BigDecimal deudaMin,
        BigDecimal deudaMax,
        BigDecimal importeCuotaMin,
        BigDecimal importeCuotaMax,
        Integer cantidadCuotasMin,
        Integer cantidadCuotasMax,
        LocalDate fechaDesde,
        LocalDate fechaHasta,
        BigDecimal montoCobradoMin,
        BigDecimal montoCobradoMax,
        BigDecimal saldoPendienteMin,
        BigDecimal saldoPendienteMax,
        Integer cuotasPagadasMin,
        Integer cuotasPagadasMax,
        Integer cuotasPendientesMin,
        Integer cuotasPendientesMax,
        Boolean soloConCuotasPendientes
    ) {
        if (deudaMin != null && deudaMax != null && deudaMin.compareTo(deudaMax) > 0) {
            throw new BusinessException("El filtro deudaMin no puede ser mayor que deudaMax");
        }
        if (importeCuotaMin != null && importeCuotaMax != null && importeCuotaMin.compareTo(importeCuotaMax) > 0) {
            throw new BusinessException("El filtro importeCuotaMin no puede ser mayor que importeCuotaMax");
        }
        if (cantidadCuotasMin != null && cantidadCuotasMax != null && cantidadCuotasMin > cantidadCuotasMax) {
            throw new BusinessException("El filtro cantidadCuotasMin no puede ser mayor que cantidadCuotasMax");
        }
        if (fechaDesde != null && fechaHasta != null && fechaDesde.isAfter(fechaHasta)) {
            throw new BusinessException("El filtro fechaDesde no puede ser posterior a fechaHasta");
        }
        if (montoCobradoMin != null && montoCobradoMax != null && montoCobradoMin.compareTo(montoCobradoMax) > 0) {
            throw new BusinessException("El filtro montoCobradoMin no puede ser mayor que montoCobradoMax");
        }
        if (saldoPendienteMin != null && saldoPendienteMax != null && saldoPendienteMin.compareTo(saldoPendienteMax) > 0) {
            throw new BusinessException("El filtro saldoPendienteMin no puede ser mayor que saldoPendienteMax");
        }
        if (cuotasPagadasMin != null && cuotasPagadasMax != null && cuotasPagadasMin > cuotasPagadasMax) {
            throw new BusinessException("El filtro cuotasPagadasMin no puede ser mayor que cuotasPagadasMax");
        }
        if (cuotasPendientesMin != null && cuotasPendientesMax != null && cuotasPendientesMin > cuotasPendientesMax) {
            throw new BusinessException("El filtro cuotasPendientesMin no puede ser mayor que cuotasPendientesMax");
        }

        Specification<Credito> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (dniCliente != null && !dniCliente.isBlank()) {
                predicates.add(cb.equal(root.get("cliente").get("dni"), dniCliente.trim()));
            }
            if (nombreCliente != null && !nombreCliente.isBlank()) {
                predicates.add(cb.like(
                    cb.lower(root.get("cliente").get("nombre")),
                    "%" + nombreCliente.trim().toLowerCase() + "%"
                ));
            }
            if (deudaMin != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("deudaOriginal"), deudaMin));
            }
            if (deudaMax != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("deudaOriginal"), deudaMax));
            }
            if (importeCuotaMin != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("Cuota"), importeCuotaMin));
            }
            if (importeCuotaMax != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("importeCuota"), importeCuotaMax));
            }
            if (cantidadCuotasMin != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("cantidadCuotas"), cantidadCuotasMin));
            }
            if (cantidadCuotasMax != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("cantidadCuotas"), cantidadCuotasMax));
            }
            if (fechaDesde != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("fecha"), fechaDesde));
            }
            if (fechaHasta != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("fecha"), fechaHasta));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return creditoRepository.findAll(spec).stream()
            .map(this::toDashboardResponse)
            .filter(r -> matchesBigDecimalRange(r.getMontoCobrado(), montoCobradoMin, montoCobradoMax))
            .filter(r -> matchesBigDecimalRange(r.getSaldoPendiente(), saldoPendienteMin, saldoPendienteMax))
            .filter(r -> matchesIntegerRange(r.getCuotasPagadas(), cuotasPagadasMin, cuotasPagadasMax))
            .filter(r -> matchesIntegerRange(r.getCuotasPendientes(), cuotasPendientesMin, cuotasPendientesMax))
            .filter(r -> soloConCuotasPendientes == null || !soloConCuotasPendientes || r.getCuotasPendientes() > 0)
            .toList();
    }

    private CreditoResponse toResponse(Credito credito, List<Cuota> cuotas) {
        List<CuotaResponse> cuotasResponse = cuotas.stream()
            .map(c -> new CuotaResponse(
                c.getId().getIdCredito(),
                c.getId().getIdCuota(),
                c.getFechaVencimiento(),
                cobranzaRepository.existsByCuotaIdIdCreditoAndCuotaIdIdCuota(
                    c.getId().getIdCredito(), c.getId().getIdCuota()
                )
            ))
            .toList();

        return new CreditoResponse(
            credito.getId(),
            credito.getCliente().getDni(),
            credito.getCliente().getNombre(),
            credito.getDeudaOriginal(),
            credito.getFecha(),
            credito.getImporteCuota(),
            credito.getCantidadCuotas(),
            cuotasResponse
        );
    }

    private CreditoDashboardResponse toDashboardResponse(Credito credito) {
        List<Cuota> cuotas = cuotaRepository.findByIdIdCredito(credito.getId());
        List<Cobranza> cobranzas = cobranzaRepository.findByCuotaIdIdCredito(credito.getId());

        BigDecimal montoCobrado = cobranzas.stream()
            .map(Cobranza::getImporte)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal saldoPendiente = credito.getDeudaOriginal().subtract(montoCobrado);
        int cuotasPagadas = cobranzas.size();
        int cuotasPendientes = Math.max(cuotas.size() - cuotasPagadas, 0);

        return new CreditoDashboardResponse(
            credito.getId(),
            credito.getCliente().getDni(),
            credito.getCliente().getNombre(),
            credito.getDeudaOriginal(),
            montoCobrado,
            saldoPendiente,
            cuotas.size(),
            cuotasPagadas,
            cuotasPendientes,
            credito.getFecha()
        );
    }

    private boolean matchesBigDecimalRange(BigDecimal value, BigDecimal min, BigDecimal max) {
        if (value == null) {
            return min == null && max == null;
        }
        if (min != null && value.compareTo(min) < 0) {
            return false;
        }
        if (max != null && value.compareTo(max) > 0) {
            return false;
        }
        return true;
    }

    private boolean matchesIntegerRange(Integer value, Integer min, Integer max) {
        if (value == null) {
            return min == null && max == null;
        }
        if (min != null && value < min) {
            return false;
        }
        if (max != null && value > max) {
            return false;
        }
        return true;
    }
}
