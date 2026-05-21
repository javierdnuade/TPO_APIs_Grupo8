import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getClientes, getClientesDashboard } from '../api/clientes';
import { getCreditosDashboard } from '../api/creditos';
import { getCobranzasPorCredito } from '../api/cobranzas';
import { countUsuarios } from '../api/usuarios';

function parseNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function validateRange(minValue, maxValue, label) {
  const min = parseNumberOrNull(minValue);
  const max = parseNumberOrNull(maxValue);
  if (min === null || max === null) return null;
  if (min > max) return `${label}: el mínimo no puede ser mayor que el máximo.`;
  return null;
}

function validateDateRange(from, to) {
  if (!from || !to) return null;
  if (from > to) return 'Fechas: desde no puede ser posterior a hasta.';
  return null;
}

function formatValue(value, kind) {
  if (value === null || value === undefined) return '-';
  if (kind === 'money') return `$${Number(value).toFixed(2)}`;
  if (kind === 'percent') return `${Number(value).toFixed(2)}%`;
  return String(value);
}

function HorizontalBars({ title, items, valueKind = 'number', emptyText = 'Sin datos para mostrar.' }) {
  const max = useMemo(() => {
    const vals = items.map(i => Number(i.value)).filter(v => Number.isFinite(v));
    return vals.length ? Math.max(...vals) : 0;
  }, [items]);

  return (
    <div>
      <h4 style={styles.h4}>{title}</h4>
      {items.length === 0 && <p style={styles.empty}>{emptyText}</p>}
      {items.length > 0 && (
        <div style={styles.chart}>
          {items.map((it) => {
            const v = Number(it.value);
            const ratio = max > 0 && Number.isFinite(v) ? (v / max) : 0;
            const widthPct = Math.max(0, Math.min(1, ratio)) * 100;
            return (
              <div key={it.label} style={styles.barRow}>
                <div style={styles.barLabel} title={it.label}>{it.label}</div>
                <div style={styles.barTrack}>
                  <div style={{ ...styles.barFill, width: `${widthPct}%` }} />
                </div>
                <div style={styles.barValue}>{formatValue(v, valueKind)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Graficos() {
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.rol === 'ADMIN';

  const [clientesFiltros, setClientesFiltros] = useState({
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
  });
  const [clientesMetric, setClientesMetric] = useState('saldoPendienteTotal');
  const [clientesLoading, setClientesLoading] = useState(false);
  const [clientesError, setClientesError] = useState(null);
  const [clientesData, setClientesData] = useState([]);
  const [clientesBuscado, setClientesBuscado] = useState(false);

  const [creditosFiltros, setCreditosFiltros] = useState({
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
  });
  const [creditosMetric, setCreditosMetric] = useState('saldoPendiente');
  const [creditosLoading, setCreditosLoading] = useState(false);
  const [creditosError, setCreditosError] = useState(null);
  const [creditosData, setCreditosData] = useState([]);
  const [creditosBuscado, setCreditosBuscado] = useState(false);

  const [idCreditoCob, setIdCreditoCob] = useState('');
  const [cobranzasLoading, setCobranzasLoading] = useState(false);
  const [cobranzasError, setCobranzasError] = useState(null);
  const [cobranzasData, setCobranzasData] = useState([]);
  const [cobranzasBuscado, setCobranzasBuscado] = useState(false);

  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState(null);
  const [adminCounts, setAdminCounts] = useState(null);

  const metricConfigClientes = useMemo(() => {
    const map = {
      deudaTotal: { label: 'Deuda total', kind: 'money' },
      montoCobradoTotal: { label: 'Monto cobrado', kind: 'money' },
      saldoPendienteTotal: { label: 'Saldo pendiente', kind: 'money' },
      porcentajeCobranza: { label: '% cobranza', kind: 'percent' },
      cantidadCreditos: { label: 'Cantidad de créditos', kind: 'number' },
      cuotasPendientes: { label: 'Cuotas pendientes', kind: 'number' },
      cuotasPagadas: { label: 'Cuotas pagadas', kind: 'number' },
    };
    return map[clientesMetric] ?? map.saldoPendienteTotal;
  }, [clientesMetric]);

  const metricConfigCreditos = useMemo(() => {
    const map = {
      deudaOriginal: { label: 'Deuda original', kind: 'money' },
      montoCobrado: { label: 'Monto cobrado', kind: 'money' },
      saldoPendiente: { label: 'Saldo pendiente', kind: 'money' },
      cantidadCuotas: { label: 'Cantidad de cuotas', kind: 'number' },
      cuotasPendientes: { label: 'Cuotas pendientes', kind: 'number' },
      cuotasPagadas: { label: 'Cuotas pagadas', kind: 'number' },
    };
    return map[creditosMetric] ?? map.saldoPendiente;
  }, [creditosMetric]);

  const clientesChartItems = useMemo(() => {
    const rows = [...clientesData]
      .map((c) => ({
        label: `${c.nombre} (${c.dni})`,
        value: c[clientesMetric],
      }))
      .filter((x) => x.value !== null && x.value !== undefined)
      .sort((a, b) => Number(b.value) - Number(a.value))
      .slice(0, 10);

    return rows;
  }, [clientesData, clientesMetric]);

  const creditosChartItems = useMemo(() => {
    const rows = [...creditosData]
      .map((c) => ({
        label: `#${c.id} - ${c.nombreCliente}`,
        value: c[creditosMetric],
      }))
      .filter((x) => x.value !== null && x.value !== undefined)
      .sort((a, b) => Number(b.value) - Number(a.value))
      .slice(0, 10);

    return rows;
  }, [creditosData, creditosMetric]);

  const cobranzasChartItems = useMemo(() => {
    const rows = [...cobranzasData]
      .map((c) => ({ label: `Cuota ${c.idCuota}`, value: c.importe, order: c.idCuota }))
      .filter((x) => x.value !== null && x.value !== undefined)
      .sort((a, b) => Number(a.order) - Number(b.order));
    return rows.map(({ label, value }) => ({ label, value }));
  }, [cobranzasData]);

  const buscarClientes = async (e) => {
    e.preventDefault();
    setClientesError(null);

    const err =
      validateRange(clientesFiltros.deudaTotalMin, clientesFiltros.deudaTotalMax, 'Deuda total') ||
      validateRange(clientesFiltros.saldoPendienteMin, clientesFiltros.saldoPendienteMax, 'Saldo pendiente') ||
      validateRange(clientesFiltros.montoCobradoMin, clientesFiltros.montoCobradoMax, 'Monto cobrado') ||
      validateRange(clientesFiltros.cantidadCreditosMin, clientesFiltros.cantidadCreditosMax, 'Cantidad de créditos') ||
      validateRange(clientesFiltros.cuotasPendientesMin, clientesFiltros.cuotasPendientesMax, 'Cuotas pendientes');

    if (err) {
      setClientesError(err);
      return;
    }

    setClientesLoading(true);
    try {
      const data = await getClientesDashboard(clientesFiltros);
      setClientesData(Array.isArray(data) ? data : []);
      setClientesBuscado(true);
    } catch (error) {
      setClientesError(error.message);
    } finally {
      setClientesLoading(false);
    }
  };

  const buscarCreditos = async (e) => {
    e.preventDefault();
    setCreditosError(null);

    const err =
      validateRange(creditosFiltros.deudaMin, creditosFiltros.deudaMax, 'Deuda') ||
      validateRange(creditosFiltros.importeCuotaMin, creditosFiltros.importeCuotaMax, 'Importe cuota') ||
      validateRange(creditosFiltros.cantidadCuotasMin, creditosFiltros.cantidadCuotasMax, 'Cantidad de cuotas') ||
      validateDateRange(creditosFiltros.fechaDesde, creditosFiltros.fechaHasta) ||
      validateRange(creditosFiltros.montoCobradoMin, creditosFiltros.montoCobradoMax, 'Monto cobrado') ||
      validateRange(creditosFiltros.saldoPendienteMin, creditosFiltros.saldoPendienteMax, 'Saldo pendiente') ||
      validateRange(creditosFiltros.cuotasPagadasMin, creditosFiltros.cuotasPagadasMax, 'Cuotas pagadas') ||
      validateRange(creditosFiltros.cuotasPendientesMin, creditosFiltros.cuotasPendientesMax, 'Cuotas pendientes');

    if (err) {
      setCreditosError(err);
      return;
    }

    setCreditosLoading(true);
    try {
      const data = await getCreditosDashboard(creditosFiltros);
      setCreditosData(Array.isArray(data) ? data : []);
      setCreditosBuscado(true);
    } catch (error) {
      setCreditosError(error.message);
    } finally {
      setCreditosLoading(false);
    }
  };

  const buscarCobranzas = async (e) => {
    e.preventDefault();
    setCobranzasError(null);

    const id = parseNumberOrNull(idCreditoCob);
    if (!id || id <= 0) {
      setCobranzasError('Ingresá un ID de crédito válido (> 0).');
      return;
    }

    setCobranzasLoading(true);
    try {
      const data = await getCobranzasPorCredito(id);
      setCobranzasData(Array.isArray(data) ? data : []);
      setCobranzasBuscado(true);
    } catch (error) {
      setCobranzasError(error.message);
    } finally {
      setCobranzasLoading(false);
    }
  };

  const cargarAdminCounts = async () => {
    setAdminError(null);
    setAdminLoading(true);
    try {
      const [usuariosCount, clientes] = await Promise.all([
        countUsuarios(),
        getClientes(),
      ]);

      const usuarios = Number(usuariosCount);

      setAdminCounts({
        usuarios: Number.isFinite(usuarios) ? usuarios : 0,
        clientes: Array.isArray(clientes) ? clientes.length : 0,
      });
    } catch (error) {
      setAdminError(error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const adminChartItems = useMemo(() => {
    if (!adminCounts) return [];
    return [
      { label: 'Usuarios', value: adminCounts.usuarios },
      { label: 'Clientes', value: adminCounts.clientes },
    ];
  }, [adminCounts]);

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Gráficos / Dashboards</h2>
      <p style={styles.subtitle}>Usá filtros opcionales y presioná “Buscar”.</p>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.h3}>Clientes</h3>
          <div style={styles.inline}>
            <label style={styles.labelInline}>Métrica</label>
            <select style={styles.select} value={clientesMetric} onChange={(e) => setClientesMetric(e.target.value)}>
              <option value="saldoPendienteTotal">Saldo pendiente</option>
              <option value="deudaTotal">Deuda total</option>
              <option value="montoCobradoTotal">Monto cobrado</option>
              <option value="porcentajeCobranza">% cobranza</option>
              <option value="cantidadCreditos">Cantidad créditos</option>
              <option value="cuotasPendientes">Cuotas pendientes</option>
              <option value="cuotasPagadas">Cuotas pagadas</option>
            </select>
          </div>
        </div>

        {clientesError && <div style={styles.error}>{clientesError}</div>}

        <form onSubmit={buscarClientes} style={styles.filters}>
          <input style={styles.input} placeholder="DNI" value={clientesFiltros.dni} onChange={e => setClientesFiltros({ ...clientesFiltros, dni: e.target.value })} />
          <input style={styles.input} placeholder="Nombre" value={clientesFiltros.nombre} onChange={e => setClientesFiltros({ ...clientesFiltros, nombre: e.target.value })} />

          <input style={styles.input} placeholder="Deuda total min" type="number" value={clientesFiltros.deudaTotalMin} onChange={e => setClientesFiltros({ ...clientesFiltros, deudaTotalMin: e.target.value })} />
          <input style={styles.input} placeholder="Deuda total max" type="number" value={clientesFiltros.deudaTotalMax} onChange={e => setClientesFiltros({ ...clientesFiltros, deudaTotalMax: e.target.value })} />

          <input style={styles.input} placeholder="Saldo pendiente min" type="number" value={clientesFiltros.saldoPendienteMin} onChange={e => setClientesFiltros({ ...clientesFiltros, saldoPendienteMin: e.target.value })} />
          <input style={styles.input} placeholder="Saldo pendiente max" type="number" value={clientesFiltros.saldoPendienteMax} onChange={e => setClientesFiltros({ ...clientesFiltros, saldoPendienteMax: e.target.value })} />

          <input style={styles.input} placeholder="Monto cobrado min" type="number" value={clientesFiltros.montoCobradoMin} onChange={e => setClientesFiltros({ ...clientesFiltros, montoCobradoMin: e.target.value })} />
          <input style={styles.input} placeholder="Monto cobrado max" type="number" value={clientesFiltros.montoCobradoMax} onChange={e => setClientesFiltros({ ...clientesFiltros, montoCobradoMax: e.target.value })} />

          <input style={styles.input} placeholder="Créditos min" type="number" value={clientesFiltros.cantidadCreditosMin} onChange={e => setClientesFiltros({ ...clientesFiltros, cantidadCreditosMin: e.target.value })} />
          <input style={styles.input} placeholder="Créditos max" type="number" value={clientesFiltros.cantidadCreditosMax} onChange={e => setClientesFiltros({ ...clientesFiltros, cantidadCreditosMax: e.target.value })} />

          <input style={styles.input} placeholder="Cuotas pendientes min" type="number" value={clientesFiltros.cuotasPendientesMin} onChange={e => setClientesFiltros({ ...clientesFiltros, cuotasPendientesMin: e.target.value })} />
          <input style={styles.input} placeholder="Cuotas pendientes max" type="number" value={clientesFiltros.cuotasPendientesMax} onChange={e => setClientesFiltros({ ...clientesFiltros, cuotasPendientesMax: e.target.value })} />

          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={clientesFiltros.soloConDeudaPendiente === true}
              onChange={(e) => setClientesFiltros({ ...clientesFiltros, soloConDeudaPendiente: e.target.checked ? true : '' })}
            />
            Solo con deuda pendiente
          </label>

          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={clientesFiltros.soloConCobranza === true}
              onChange={(e) => setClientesFiltros({ ...clientesFiltros, soloConCobranza: e.target.checked ? true : '' })}
            />
            Solo con cobranza
          </label>

          <div style={styles.actionsRow}>
            <button style={styles.btn} disabled={clientesLoading}>{clientesLoading ? 'Buscando...' : 'Buscar'}</button>
            <button
              type="button"
              style={styles.btnSecondary}
              onClick={() => {
                setClientesError(null);
                setClientesBuscado(false);
                setClientesData([]);
                setClientesFiltros({
                  dni: '', nombre: '', deudaTotalMin: '', deudaTotalMax: '', saldoPendienteMin: '', saldoPendienteMax: '',
                  montoCobradoMin: '', montoCobradoMax: '', cantidadCreditosMin: '', cantidadCreditosMax: '',
                  cuotasPendientesMin: '', cuotasPendientesMax: '', soloConDeudaPendiente: '', soloConCobranza: '',
                });
              }}
            >
              Limpiar
            </button>
          </div>
        </form>

        {clientesBuscado && (
          <div style={{ marginTop: 12 }}>
            <div style={styles.meta}>Resultados: {clientesData.length}</div>
            <HorizontalBars
              title={`Top 10 - ${metricConfigClientes.label}`}
              items={clientesChartItems}
              valueKind={metricConfigClientes.kind}
              emptyText="Sin resultados con esos filtros."
            />
          </div>
        )}
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.h3}>Créditos</h3>
          <div style={styles.inline}>
            <label style={styles.labelInline}>Métrica</label>
            <select style={styles.select} value={creditosMetric} onChange={(e) => setCreditosMetric(e.target.value)}>
              <option value="saldoPendiente">Saldo pendiente</option>
              <option value="deudaOriginal">Deuda original</option>
              <option value="montoCobrado">Monto cobrado</option>
              <option value="cantidadCuotas">Cantidad cuotas</option>
              <option value="cuotasPendientes">Cuotas pendientes</option>
              <option value="cuotasPagadas">Cuotas pagadas</option>
            </select>
          </div>
        </div>

        {creditosError && <div style={styles.error}>{creditosError}</div>}

        <form onSubmit={buscarCreditos} style={styles.filters}>
          <input style={styles.input} placeholder="DNI cliente" value={creditosFiltros.dniCliente} onChange={e => setCreditosFiltros({ ...creditosFiltros, dniCliente: e.target.value })} />
          <input style={styles.input} placeholder="Nombre cliente" value={creditosFiltros.nombreCliente} onChange={e => setCreditosFiltros({ ...creditosFiltros, nombreCliente: e.target.value })} />

          <input style={styles.input} placeholder="Deuda min" type="number" value={creditosFiltros.deudaMin} onChange={e => setCreditosFiltros({ ...creditosFiltros, deudaMin: e.target.value })} />
          <input style={styles.input} placeholder="Deuda max" type="number" value={creditosFiltros.deudaMax} onChange={e => setCreditosFiltros({ ...creditosFiltros, deudaMax: e.target.value })} />

          <input style={styles.input} placeholder="Importe cuota min" type="number" value={creditosFiltros.importeCuotaMin} onChange={e => setCreditosFiltros({ ...creditosFiltros, importeCuotaMin: e.target.value })} />
          <input style={styles.input} placeholder="Importe cuota max" type="number" value={creditosFiltros.importeCuotaMax} onChange={e => setCreditosFiltros({ ...creditosFiltros, importeCuotaMax: e.target.value })} />

          <input style={styles.input} placeholder="Cuotas min" type="number" value={creditosFiltros.cantidadCuotasMin} onChange={e => setCreditosFiltros({ ...creditosFiltros, cantidadCuotasMin: e.target.value })} />
          <input style={styles.input} placeholder="Cuotas max" type="number" value={creditosFiltros.cantidadCuotasMax} onChange={e => setCreditosFiltros({ ...creditosFiltros, cantidadCuotasMax: e.target.value })} />

          <input style={styles.input} placeholder="Fecha desde" type="date" value={creditosFiltros.fechaDesde} onChange={e => setCreditosFiltros({ ...creditosFiltros, fechaDesde: e.target.value })} />
          <input style={styles.input} placeholder="Fecha hasta" type="date" value={creditosFiltros.fechaHasta} onChange={e => setCreditosFiltros({ ...creditosFiltros, fechaHasta: e.target.value })} />

          <input style={styles.input} placeholder="Monto cobrado min" type="number" value={creditosFiltros.montoCobradoMin} onChange={e => setCreditosFiltros({ ...creditosFiltros, montoCobradoMin: e.target.value })} />
          <input style={styles.input} placeholder="Monto cobrado max" type="number" value={creditosFiltros.montoCobradoMax} onChange={e => setCreditosFiltros({ ...creditosFiltros, montoCobradoMax: e.target.value })} />

          <input style={styles.input} placeholder="Saldo pendiente min" type="number" value={creditosFiltros.saldoPendienteMin} onChange={e => setCreditosFiltros({ ...creditosFiltros, saldoPendienteMin: e.target.value })} />
          <input style={styles.input} placeholder="Saldo pendiente max" type="number" value={creditosFiltros.saldoPendienteMax} onChange={e => setCreditosFiltros({ ...creditosFiltros, saldoPendienteMax: e.target.value })} />

          <input style={styles.input} placeholder="Cuotas pagadas min" type="number" value={creditosFiltros.cuotasPagadasMin} onChange={e => setCreditosFiltros({ ...creditosFiltros, cuotasPagadasMin: e.target.value })} />
          <input style={styles.input} placeholder="Cuotas pagadas max" type="number" value={creditosFiltros.cuotasPagadasMax} onChange={e => setCreditosFiltros({ ...creditosFiltros, cuotasPagadasMax: e.target.value })} />

          <input style={styles.input} placeholder="Cuotas pendientes min" type="number" value={creditosFiltros.cuotasPendientesMin} onChange={e => setCreditosFiltros({ ...creditosFiltros, cuotasPendientesMin: e.target.value })} />
          <input style={styles.input} placeholder="Cuotas pendientes max" type="number" value={creditosFiltros.cuotasPendientesMax} onChange={e => setCreditosFiltros({ ...creditosFiltros, cuotasPendientesMax: e.target.value })} />

          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={creditosFiltros.soloConCuotasPendientes === true}
              onChange={(e) => setCreditosFiltros({ ...creditosFiltros, soloConCuotasPendientes: e.target.checked ? true : '' })}
            />
            Solo con cuotas pendientes
          </label>

          <div style={styles.actionsRow}>
            <button style={styles.btn} disabled={creditosLoading}>{creditosLoading ? 'Buscando...' : 'Buscar'}</button>
            <button
              type="button"
              style={styles.btnSecondary}
              onClick={() => {
                setCreditosError(null);
                setCreditosBuscado(false);
                setCreditosData([]);
                setCreditosFiltros({
                  dniCliente: '', nombreCliente: '', deudaMin: '', deudaMax: '', importeCuotaMin: '', importeCuotaMax: '',
                  cantidadCuotasMin: '', cantidadCuotasMax: '', fechaDesde: '', fechaHasta: '', montoCobradoMin: '', montoCobradoMax: '',
                  saldoPendienteMin: '', saldoPendienteMax: '', cuotasPagadasMin: '', cuotasPagadasMax: '',
                  cuotasPendientesMin: '', cuotasPendientesMax: '', soloConCuotasPendientes: '',
                });
              }}
            >
              Limpiar
            </button>
          </div>
        </form>

        {creditosBuscado && (
          <div style={{ marginTop: 12 }}>
            <div style={styles.meta}>Resultados: {creditosData.length}</div>
            <HorizontalBars
              title={`Top 10 - ${metricConfigCreditos.label}`}
              items={creditosChartItems}
              valueKind={metricConfigCreditos.kind}
              emptyText="Sin resultados con esos filtros."
            />
          </div>
        )}
      </div>

      <div style={styles.card}>
        <h3 style={styles.h3}>Cobranzas</h3>
        {cobranzasError && <div style={styles.error}>{cobranzasError}</div>}

        <form onSubmit={buscarCobranzas} style={styles.row}>
          <input
            style={styles.input}
            placeholder="ID del crédito"
            type="number"
            min="1"
            value={idCreditoCob}
            onChange={(e) => setIdCreditoCob(e.target.value)}
            required
          />
          <button style={styles.btn} disabled={cobranzasLoading}>{cobranzasLoading ? 'Buscando...' : 'Buscar'}</button>
        </form>

        {cobranzasBuscado && (
          <div style={{ marginTop: 12 }}>
            <div style={styles.meta}>Crédito #{idCreditoCob} — Cobranzas: {cobranzasData.length}</div>
            <HorizontalBars
              title="Importe cobrado por cuota"
              items={cobranzasChartItems}
              valueKind="money"
              emptyText="Sin cobranzas registradas para ese crédito."
            />
          </div>
        )}
      </div>

      <div style={styles.card}>
        <h3 style={styles.h3}>Usuarios (solo ADMIN)</h3>

        {!isAdmin && (
          <p style={styles.empty}>
            Este gráfico es visible solo para administradores.
          </p>
        )}

        {isAdmin && (
          <>
            <p style={styles.subtitleSmall}>
              Compara cantidad de usuarios creados vs clientes creados.
            </p>

            {adminError && <div style={styles.error}>{adminError}</div>}

            <div style={styles.row}>
              <button style={styles.btn} onClick={cargarAdminCounts} disabled={adminLoading}>
                {adminLoading ? 'Cargando...' : (adminCounts ? 'Actualizar' : 'Cargar')}
              </button>
            </div>

            {adminCounts && (
              <div style={{ marginTop: 12 }}>
                <HorizontalBars
                  title="Usuarios vs Clientes"
                  items={adminChartItems}
                  valueKind="number"
                  emptyText="Sin datos."
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page:  { padding: '32px', maxWidth: '1100px', margin: '0 auto' },
  title: { color: '#1e3a5f', marginBottom: '8px' },
  subtitle: { color: '#607d8b', marginTop: 0, marginBottom: '24px' },
  subtitleSmall: { color: '#607d8b', marginTop: 0, marginBottom: '12px', fontSize: '0.95rem' },
  card:  { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '24px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  h3: { margin: 0, color: '#1e3a5f' },
  h4: { margin: '12px 0 8px', color: '#1e3a5f' },
  meta: { color: '#78909c', fontSize: '0.9rem', marginBottom: '8px' },

  row: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  inline: { display: 'flex', alignItems: 'center', gap: '8px' },
  labelInline: { color: '#607d8b', fontSize: '0.9rem' },

  filters: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginTop: '12px' },
  actionsRow: { display: 'flex', gap: '10px', alignItems: 'center' },

  input: { padding: '10px', border: '1px solid #ccc', borderRadius: '6px', minWidth: '170px', flex: '1' },
  select: { padding: '10px', border: '1px solid #ccc', borderRadius: '6px', minWidth: '220px', background: 'white' },
  checkbox: { display: 'flex', gap: '8px', alignItems: 'center', color: '#455a64', fontSize: '0.95rem' },

  btn: { padding: '10px 20px', backgroundColor: '#1e3a5f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnSecondary: { padding: '10px 16px', backgroundColor: '#90caf9', color: '#1e3a5f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },

  error: { background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', marginTop: '12px', fontSize: '0.95rem' },
  empty: { color: '#999', margin: 0 },

  chart: { display: 'flex', flexDirection: 'column', gap: '10px' },
  barRow: { display: 'grid', gridTemplateColumns: '260px 1fr 120px', alignItems: 'center', gap: '12px' },
  barLabel: { color: '#37474f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  barTrack: { background: '#e3f2fd', borderRadius: '999px', overflow: 'hidden', height: '12px' },
  barFill: { background: '#1e3a5f', height: '100%' },
  barValue: { color: '#37474f', textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
};
