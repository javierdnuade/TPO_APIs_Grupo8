import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getClientes, getClientesDashboard } from '../api/clientes';
import { getCreditosDashboard } from '../api/creditos';
import { getCobranzasPorCredito } from '../api/cobranzas';
import { countUsuarios } from '../api/usuarios';
import HorizontalBars from '../components/charts/HorizontalBars';
import FilterForm from '../components/dashboard/FilterForm';
import { parseNumberOrNull } from '../utils/validation';
import useDashboardQuery from '../hooks/useDashboardQuery';
import {
  CLIENTES_CHECKBOXES,
  CLIENTES_FIELDS,
  CLIENTES_FILTROS_INICIALES,
  CREDITOS_CHECKBOXES,
  CREDITOS_FIELDS,
  CREDITOS_FILTROS_INICIALES,
  METRICAS_CLIENTES,
  METRICAS_CREDITOS,
  validateClientesFiltros,
  validateCreditosFiltros,
} from './graficos/config';
import styles from './graficos/styles';
import { getMorosidadDashboard } from '../api/dashboard';
import PieChart from '../components/charts/PieChart';

export default function Graficos() {
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.rol === 'ADMIN';

  const [clientesMetric, setClientesMetric] = useState('saldoPendienteTotal');

  const clientesQuery = useDashboardQuery({
    initialFilters: CLIENTES_FILTROS_INICIALES,
    fetcher: getClientesDashboard,
    validate: validateClientesFiltros,
  });

  const [creditosMetric, setCreditosMetric] = useState('saldoPendiente');

  const creditosQuery = useDashboardQuery({
    initialFilters: CREDITOS_FILTROS_INICIALES,
    fetcher: getCreditosDashboard,
    validate: validateCreditosFiltros,
  });

  const [idCreditoCob, setIdCreditoCob] = useState('');
  const [cobranzasLoading, setCobranzasLoading] = useState(false);
  const [cobranzasError, setCobranzasError] = useState(null);
  const [cobranzasData, setCobranzasData] = useState([]);
  const [cobranzasBuscado, setCobranzasBuscado] = useState(false);

  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState(null);
  const [adminCounts, setAdminCounts] = useState(null);

  const [morosidadData, setMorosidadData] = useState(null);
  const [morosidadLoading, setMorosidadLoading] = useState(false);
  const [morosidadError, setMorosidadError] = useState(null);

  const metricConfigClientes = METRICAS_CLIENTES[clientesMetric] ?? METRICAS_CLIENTES.saldoPendienteTotal;
  const metricConfigCreditos = METRICAS_CREDITOS[creditosMetric] ?? METRICAS_CREDITOS.saldoPendiente;

  const clientesChartItems = useMemo(() => {
    const rows = [...clientesQuery.data]
      .map((c) => ({
        label: `${c.nombre} (${c.dni})`,
        value: c[clientesMetric],
      }))
      .filter((x) => x.value !== null && x.value !== undefined)
      .sort((a, b) => Number(b.value) - Number(a.value))
      .slice(0, 10);

    return rows;
  }, [clientesQuery.data, clientesMetric]);

  const creditosChartItems = useMemo(() => {
    const rows = [...creditosQuery.data]
      .map((c) => ({
        label: `#${c.id} - ${c.nombreCliente}`,
        value: c[creditosMetric],
      }))
      .filter((x) => x.value !== null && x.value !== undefined)
      .sort((a, b) => Number(b.value) - Number(a.value))
      .slice(0, 10);

    return rows;
  }, [creditosQuery.data, creditosMetric]);

  const cobranzasChartItems = useMemo(() => {
    const rows = [...cobranzasData]
      .map((c) => ({ label: `Cuota ${c.idCuota}`, value: c.importe, order: c.idCuota }))
      .filter((x) => x.value !== null && x.value !== undefined)
      .sort((a, b) => Number(a.order) - Number(b.order));
    return rows.map(({ label, value }) => ({ label, value }));
  }, [cobranzasData]);

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

  const cargarMorosidad = async () => {

    setMorosidadError(null);
    setMorosidadLoading(true);

    try {
      const data = await getMorosidadDashboard();
      setMorosidadData(data);
    } catch (error) {
      setMorosidadError(error.message);
    } finally {
      setMorosidadLoading(false);
    }
  };

  const adminChartItems = useMemo(() => {
    if (!adminCounts) return [];
    return [
      { label: 'Usuarios', value: adminCounts.usuarios },
      { label: 'Clientes', value: adminCounts.clientes },
    ];
  }, [adminCounts]);

  const morosidadChartItems = useMemo(() => {

    if (!morosidadData) return [];

    return [
      {
        label: 'Pagadas',
        value: morosidadData.pagadas,
        color: '#4caf50'
      },
      {
        label: 'Pendientes',
        value: morosidadData.pendientes,
        color: '#ff9800'
      },
      {
        label: 'Vencidas',
        value: morosidadData.vencidas,
        color: '#f44336'
      }
    ];

  }, [morosidadData]);

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Gráficos / Dashboards</h2>
      <p style={styles.subtitle}>Usá filtros opcionales y presioná “Buscar”.</p>

      <div style={styles.card} className="ui-card">
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

        {clientesQuery.error && <div style={styles.error}>{clientesQuery.error}</div>}

        <FilterForm
          filters={clientesQuery.filters}
          setFilters={clientesQuery.setFilters}
          fields={CLIENTES_FIELDS}
          checkboxes={CLIENTES_CHECKBOXES}
          onSubmit={clientesQuery.search}
          onClear={clientesQuery.clear}
          loading={clientesQuery.loading}
          styles={styles}
        />

        {clientesQuery.searched && (
          <div style={{ marginTop: 12 }}>
            <div style={styles.meta}>Resultados: {clientesQuery.data.length}</div>
            <HorizontalBars
              title={`Top 10 - ${metricConfigClientes.label}`}
              items={clientesChartItems}
              valueKind={metricConfigClientes.kind}
              emptyText="Sin resultados con esos filtros."
            />
          </div>
        )}
      </div>

      <div style={styles.card} className="ui-card">
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

        {creditosQuery.error && <div style={styles.error}>{creditosQuery.error}</div>}

        <FilterForm
          filters={creditosQuery.filters}
          setFilters={creditosQuery.setFilters}
          fields={CREDITOS_FIELDS}
          checkboxes={CREDITOS_CHECKBOXES}
          onSubmit={creditosQuery.search}
          onClear={creditosQuery.clear}
          loading={creditosQuery.loading}
          styles={styles}
        />

        {creditosQuery.searched && (
          <div style={{ marginTop: 12 }}>
            <div style={styles.meta}>Resultados: {creditosQuery.data.length}</div>
            <HorizontalBars
              title={`Top 10 - ${metricConfigCreditos.label}`}
              items={creditosChartItems}
              valueKind={metricConfigCreditos.kind}
              emptyText="Sin resultados con esos filtros."
            />
          </div>
        )}
      </div>

      <div style={styles.card} className="ui-card">
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
          <button className="ui-btn" style={styles.btn} disabled={cobranzasLoading}>{cobranzasLoading ? 'Buscando...' : 'Buscar'}</button>
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

      <div style={styles.card} className="ui-card">
              <h3 style={styles.h3}>Dashboard de Morosidad</h3>

              <p style={styles.subtitleSmall}>
                Estado general de cuotas pagadas, pendientes y vencidas.
              </p>

              {morosidadError && (
                <div style={styles.error}>
                  {morosidadError}
                </div>
              )}

              <div style={styles.row}>
                <button
                  type="button"
                  className="ui-btn"
                  style={styles.btn}
                  onClick={cargarMorosidad}
                  disabled={morosidadLoading}
                >
                  {morosidadLoading ? 'Cargando...' : 'Cargar dashboard'}
                </button>
              </div>

              {morosidadData && (
                <PieChart items={morosidadChartItems} />
              )}

            </div>

      <div style={styles.card} className="ui-card">
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
              <button className="ui-btn" style={styles.btn} onClick={cargarAdminCounts} disabled={adminLoading}>
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
