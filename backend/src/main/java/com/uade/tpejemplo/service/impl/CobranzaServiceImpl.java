package com.uade.tpejemplo.service.impl;

import com.uade.tpejemplo.dto.request.CobranzaRequest;
import com.uade.tpejemplo.dto.response.CobranzaResponse;
import com.uade.tpejemplo.exception.BusinessException;
import com.uade.tpejemplo.exception.ResourceNotFoundException;
import com.uade.tpejemplo.model.Cobranza;
import com.uade.tpejemplo.model.Credito;
import com.uade.tpejemplo.model.Cuota;
import com.uade.tpejemplo.model.CuotaId;
import com.uade.tpejemplo.model.Usuario;
import com.uade.tpejemplo.repository.CobranzaRepository;
import com.uade.tpejemplo.repository.CuotaRepository;
import com.uade.tpejemplo.repository.UsuarioRepository;
import com.uade.tpejemplo.service.CobranzaService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CobranzaServiceImpl implements CobranzaService {

    private final CobranzaRepository cobranzaRepository;
    private final CuotaRepository cuotaRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public CobranzaResponse registrar(CobranzaRequest request) {
        CuotaId cuotaId = new CuotaId(request.getIdCredito(), request.getIdCuota());

        Cuota cuota = cuotaRepository.findById(cuotaId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Cuota", "idCredito/idCuota", request.getIdCredito() + "/" + request.getIdCuota()
            ));

        Credito credito = cuota.getCredito();
        if (credito.isAnulado()) {
            throw new BusinessException("No se pueden registrar cobranzas sobre un credito anulado.");
        }

        if (cobranzaRepository.existsActivaByCreditoYCuota(
            request.getIdCredito(), request.getIdCuota()
        )) {
            throw new BusinessException(
                "La cuota " + request.getIdCuota() + " del credito " + request.getIdCredito() + " ya fue pagada"
            );
        }

        if (request.getImporte().compareTo(credito.getImporteCuota()) != 0) {
            throw new BusinessException("El importe ingresado debe ser exactamente igual a la cuota.");
        }

        Cobranza cobranza = new Cobranza(null, cuota, request.getImporte(), LocalDate.now(), false);

        cuota.setPagada(true);
        cuotaRepository.save(cuota);
        cobranzaRepository.save(cobranza);

        return toResponse(cobranza);
    }

    @Override
    public List<CobranzaResponse> listarPorCredito(Long idCredito) {
        return cobranzaRepository.findByCuotaIdIdCreditoOrderByIdAsc(idCredito).stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    @Transactional
    public CobranzaResponse anular(Long id) {
        Usuario usuario = obtenerUsuarioAutenticado();
        if (!usuario.isPuedeAnularCobranza()) {
            throw new AccessDeniedException("No tiene permisos para anular cobranzas.");
        }

        Cobranza cobranza = cobranzaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cobranza", "id", id));

        if (cobranza.isAnulada()) {
            return toResponse(cobranza);
        }

        if (!LocalDate.now().equals(cobranza.getFecha())) {
            throw new BusinessException("Solo se pueden anular cobranzas del dia de hoy.");
        }

        cobranza.setAnulada(true);
        cobranzaRepository.save(cobranza);

        Cuota cuota = cobranza.getCuota();
        boolean siguePagada = cobranzaRepository.existsActivaByCreditoYCuota(
            cuota.getId().getIdCredito(),
            cuota.getId().getIdCuota()
        );
        cuota.setPagada(siguePagada);
        cuotaRepository.save(cuota);

        return toResponse(cobranza);
    }

    private Usuario obtenerUsuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("No tiene permisos para anular cobranzas.");
        }

        return usuarioRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new AccessDeniedException("No tiene permisos para anular cobranzas."));
    }

    private CobranzaResponse toResponse(Cobranza cobranza) {
        return new CobranzaResponse(
            cobranza.getId(),
            cobranza.getCuota().getId().getIdCredito(),
            cobranza.getCuota().getId().getIdCuota(),
            cobranza.getImporte(),
            cobranza.getFecha(),
            cobranza.isAnulada()
        );
    }
}
