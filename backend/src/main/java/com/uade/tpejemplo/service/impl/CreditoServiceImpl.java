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
import com.uade.tpejemplo.model.Usuario;
import com.uade.tpejemplo.repository.ClienteRepository;
import com.uade.tpejemplo.repository.CobranzaRepository;
import com.uade.tpejemplo.repository.CreditoRepository;
import com.uade.tpejemplo.repository.CuotaRepository;
import com.uade.tpejemplo.repository.UsuarioRepository;
import com.uade.tpejemplo.service.CreditoService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CreditoServiceImpl implements CreditoService {

    private final CreditoRepository creditoRepository;
    private final ClienteRepository clienteRepository;
    private final CuotaRepository cuotaRepository;
    private final CobranzaRepository cobranzaRepository;
    private final UsuarioRepository usuarioRepository;

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
            false,
            false
        );
        creditoRepository.save(credito);

        List<Cuota> cuotas = new ArrayList<>();
        for (int i = 1; i <= request.getCantidadCuotas(); i++) {
            cuotas.add(new Cuota(
                new CuotaId(credito.getId(), i),
                credito,
                request.getFecha().plusMonths(i),
                false
            ));
        }
        cuotaRepository.saveAll(cuotas);

        return toResponse(credito, cuotas);
    }

    @Override
    public CreditoResponse buscarPorId(Long id) {
        Credito credito = obtenerCredito(id);
        return toResponse(credito, cuotaRepository.findByIdIdCredito(id));
    }

    @Override
    public List<CreditoResponse> listarPorCliente(String dniCliente) {
        if (!clienteRepository.existsByDni(dniCliente)) {
            throw new ResourceNotFoundException("Cliente", "DNI", dniCliente);
        }

        return creditoRepository.findByClienteDniOrderByIdAsc(dniCliente).stream()
            .map(credito -> toResponse(credito, cuotaRepository.findByIdIdCredito(credito.getId())))
            .toList();
    }

    @Override
    @Transactional
    public CreditoResponse anular(Long id) {
        Usuario usuario = obtenerUsuarioAutenticado();
        if (!usuario.isPuedeAnularCredito()) {
            throw new AccessDeniedException("No tiene permisos para anular creditos.");
        }

        Credito credito = obtenerCredito(id);
        if (credito.isAnulado()) {
            return toResponse(credito, cuotaRepository.findByIdIdCredito(id));
        }

        if (cobranzaRepository.existsActivaByCredito(id)) {
            throw new BusinessException("No se puede anular el credito " + id + " porque tiene cobranzas registradas.");
        }

        credito.setAnulado(true);
        creditoRepository.save(credito);

        return toResponse(credito, cuotaRepository.findByIdIdCredito(id));
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
            predicates.add(cb.isFalse(root.get("anulado")));

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
                predicates.add(cb.greaterThanOrEqualTo(root.get("importeCuota"), importeCuotaMin));
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

    private Credito obtenerCredito(Long id) {
        return creditoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Credito", "id", id));
    }

    private Usuario obtenerUsuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("No tiene permisos para anular creditos.");
        }

        return usuarioRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new AccessDeniedException("No tiene permisos para anular creditos."));
    }

    private CreditoResponse toResponse(Credito credito, List<Cuota> cuotas) {
        List<CuotaResponse> cuotasResponse = cuotas.stream()
            .map(cuota -> new CuotaResponse(
                cuota.getId().getIdCredito(),
                cuota.getId().getIdCuota(),
                cuota.getFechaVencimiento(),
                cuota.isPagada()
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
            cuotasResponse,
            credito.isAnulado()
        );
    }

    private CreditoDashboardResponse toDashboardResponse(Credito credito) {
        List<Cuota> cuotas = cuotaRepository.findByIdIdCredito(credito.getId());
        List<Cobranza> cobranzas = cobranzaRepository.findByCuotaIdIdCreditoAndAnuladaFalse(credito.getId());

        BigDecimal montoCobrado = cobranzas.stream()
            .map(Cobranza::getImporte)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal saldoPendiente = credito.getDeudaOriginal().subtract(montoCobrado);
        int cuotasPagadas = (int) cuotas.stream().filter(Cuota::isPagada).count();
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
        return max == null || value.compareTo(max) <= 0;
    }

    private boolean matchesIntegerRange(Integer value, Integer min, Integer max) {
        if (value == null) {
            return min == null && max == null;
        }
        if (min != null && value < min) {
            return false;
        }
        return max == null || value <= max;
    }
}
