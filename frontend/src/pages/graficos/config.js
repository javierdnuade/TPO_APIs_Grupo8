import { validateDateRange, validateRange } from '../../utils/validation';

export const CLIENTES_FILTROS_INICIALES = {
  dni: '',
  nombre: '',
  deudaTotalMin: '',
  deudaTotalMax: '',
  saldoPendienteMin: '',
  saldoPendienteMax: '',
  montoCobradoMin: '',
  montoCobradoMax: '',
  cantidadCreditosMin: '',
  cantidadCreditosMax: '',
  cuotasPendientesMin: '',
  cuotasPendientesMax: '',
  soloConDeudaPendiente: '',
  soloConCobranza: '',
};

export const CREDITOS_FILTROS_INICIALES = {
  dniCliente: '',
  nombreCliente: '',
  deudaMin: '',
  deudaMax: '',
  importeCuotaMin: '',
  importeCuotaMax: '',
  cantidadCuotasMin: '',
  cantidadCuotasMax: '',
  fechaDesde: '',
  fechaHasta: '',
  montoCobradoMin: '',
  montoCobradoMax: '',
  saldoPendienteMin: '',
  saldoPendienteMax: '',
  cuotasPagadasMin: '',
  cuotasPagadasMax: '',
  cuotasPendientesMin: '',
  cuotasPendientesMax: '',
  soloConCuotasPendientes: '',
};

export const CLIENTES_FIELDS = [
  { key: 'dni', placeholder: 'DNI' },
  { key: 'nombre', placeholder: 'Nombre' },
  { key: 'deudaTotalMin', placeholder: 'Deuda total min', type: 'number' },
  { key: 'deudaTotalMax', placeholder: 'Deuda total max', type: 'number' },
  { key: 'saldoPendienteMin', placeholder: 'Saldo pendiente min', type: 'number' },
  { key: 'saldoPendienteMax', placeholder: 'Saldo pendiente max', type: 'number' },
  { key: 'montoCobradoMin', placeholder: 'Monto cobrado min', type: 'number' },
  { key: 'montoCobradoMax', placeholder: 'Monto cobrado max', type: 'number' },
  { key: 'cantidadCreditosMin', placeholder: 'Créditos min', type: 'number' },
  { key: 'cantidadCreditosMax', placeholder: 'Créditos max', type: 'number' },
  { key: 'cuotasPendientesMin', placeholder: 'Cuotas pendientes min', type: 'number' },
  { key: 'cuotasPendientesMax', placeholder: 'Cuotas pendientes max', type: 'number' },
];

export const CLIENTES_CHECKBOXES = [
  { key: 'soloConDeudaPendiente', label: 'Solo con deuda pendiente' },
  { key: 'soloConCobranza', label: 'Solo con cobranza' },
];

export const CREDITOS_FIELDS = [
  { key: 'dniCliente', placeholder: 'DNI cliente' },
  { key: 'nombreCliente', placeholder: 'Nombre cliente' },
  { key: 'deudaMin', placeholder: 'Deuda min', type: 'number' },
  { key: 'deudaMax', placeholder: 'Deuda max', type: 'number' },
  { key: 'importeCuotaMin', placeholder: 'Importe cuota min', type: 'number' },
  { key: 'importeCuotaMax', placeholder: 'Importe cuota max', type: 'number' },
  { key: 'cantidadCuotasMin', placeholder: 'Cuotas min', type: 'number' },
  { key: 'cantidadCuotasMax', placeholder: 'Cuotas max', type: 'number' },
  { key: 'fechaDesde', placeholder: 'Fecha desde', type: 'date' },
  { key: 'fechaHasta', placeholder: 'Fecha hasta', type: 'date' },
  { key: 'montoCobradoMin', placeholder: 'Monto cobrado min', type: 'number' },
  { key: 'montoCobradoMax', placeholder: 'Monto cobrado max', type: 'number' },
  { key: 'saldoPendienteMin', placeholder: 'Saldo pendiente min', type: 'number' },
  { key: 'saldoPendienteMax', placeholder: 'Saldo pendiente max', type: 'number' },
  { key: 'cuotasPagadasMin', placeholder: 'Cuotas pagadas min', type: 'number' },
  { key: 'cuotasPagadasMax', placeholder: 'Cuotas pagadas max', type: 'number' },
  { key: 'cuotasPendientesMin', placeholder: 'Cuotas pendientes min', type: 'number' },
  { key: 'cuotasPendientesMax', placeholder: 'Cuotas pendientes max', type: 'number' },
];

export const CREDITOS_CHECKBOXES = [
  { key: 'soloConCuotasPendientes', label: 'Solo con cuotas pendientes' },
];

export const METRICAS_CLIENTES = {
  deudaTotal: { label: 'Deuda total', kind: 'money' },
  montoCobradoTotal: { label: 'Monto cobrado', kind: 'money' },
  saldoPendienteTotal: { label: 'Saldo pendiente', kind: 'money' },
  porcentajeCobranza: { label: '% cobranza', kind: 'percent' },
  cantidadCreditos: { label: 'Cantidad de créditos', kind: 'number' },
  cuotasPendientes: { label: 'Cuotas pendientes', kind: 'number' },
  cuotasPagadas: { label: 'Cuotas pagadas', kind: 'number' },
};

export const METRICAS_CREDITOS = {
  deudaOriginal: { label: 'Deuda original', kind: 'money' },
  montoCobrado: { label: 'Monto cobrado', kind: 'money' },
  saldoPendiente: { label: 'Saldo pendiente', kind: 'money' },
  cantidadCuotas: { label: 'Cantidad de cuotas', kind: 'number' },
  cuotasPendientes: { label: 'Cuotas pendientes', kind: 'number' },
  cuotasPagadas: { label: 'Cuotas pagadas', kind: 'number' },
};

export function validateClientesFiltros(filtros) {
  return (
    validateRange(filtros.deudaTotalMin, filtros.deudaTotalMax, 'Deuda total') ||
    validateRange(filtros.saldoPendienteMin, filtros.saldoPendienteMax, 'Saldo pendiente') ||
    validateRange(filtros.montoCobradoMin, filtros.montoCobradoMax, 'Monto cobrado') ||
    validateRange(filtros.cantidadCreditosMin, filtros.cantidadCreditosMax, 'Cantidad de créditos') ||
    validateRange(filtros.cuotasPendientesMin, filtros.cuotasPendientesMax, 'Cuotas pendientes')
  );
}

export function validateCreditosFiltros(filtros) {
  return (
    validateRange(filtros.deudaMin, filtros.deudaMax, 'Deuda') ||
    validateRange(filtros.importeCuotaMin, filtros.importeCuotaMax, 'Importe cuota') ||
    validateRange(filtros.cantidadCuotasMin, filtros.cantidadCuotasMax, 'Cantidad de cuotas') ||
    validateDateRange(filtros.fechaDesde, filtros.fechaHasta) ||
    validateRange(filtros.montoCobradoMin, filtros.montoCobradoMax, 'Monto cobrado') ||
    validateRange(filtros.saldoPendienteMin, filtros.saldoPendienteMax, 'Saldo pendiente') ||
    validateRange(filtros.cuotasPagadasMin, filtros.cuotasPagadasMax, 'Cuotas pagadas') ||
    validateRange(filtros.cuotasPendientesMin, filtros.cuotasPendientesMax, 'Cuotas pendientes')
  );
}
