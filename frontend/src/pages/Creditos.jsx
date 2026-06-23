import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCreditosPorCliente, addCredito, deleteCredito, clearCreditos } from '../store/slices/creditosSlice';

export default function Creditos() {
  const dispatch = useDispatch();
  const { lista, loading, error, anulandoId } = useSelector((state) => state.creditos);
  const user = useSelector((state) => state.auth.user);
  const [dni, setDni] = useState('');
  const [buscado, setBuscado] = useState(false);
  const [form, setForm] = useState({
    dniCliente: '',
    deudaOriginal: '',
    fecha: '',
    importeCuota: '',
    cantidadCuotas: '',
  });

  const puedeAnularCredito = Boolean(user?.puedeAnularCredito);

  const buscar = async (e) => {
    e.preventDefault();
    dispatch(clearCreditos());
    const result = await dispatch(fetchCreditosPorCliente(dni));
    if (result.meta.requestStatus === 'fulfilled') {
      setBuscado(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      deudaOriginal: Number(form.deudaOriginal),
      importeCuota: Number(form.importeCuota),
      cantidadCuotas: Number(form.cantidadCuotas),
    };

    const result = await dispatch(addCredito(payload));
    if (result.meta.requestStatus === 'fulfilled') {
      setForm({
        dniCliente: '',
        deudaOriginal: '',
        fecha: '',
        importeCuota: '',
        cantidadCuotas: '',
      });
      if (form.dniCliente === dni) {
        dispatch(fetchCreditosPorCliente(dni));
      }
    }
  };

  const handleAnular = async (id) => {
    if (!window.confirm(`Desea anular el credito ${id}?`)) {
      return;
    }

    await dispatch(deleteCredito(id));
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Creditos</h2>

      <div style={styles.card}>
        <h3>Buscar creditos por cliente</h3>
        <form onSubmit={buscar} style={styles.row}>
          <input
            style={styles.input}
            placeholder="DNI del cliente"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
          />
          <button style={styles.btn}>Buscar</button>
        </form>
      </div>

      <div style={styles.card}>
        <h3>Nuevo credito</h3>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.grid}>
          <input
            style={styles.input}
            placeholder="DNI cliente"
            value={form.dniCliente}
            onChange={(e) => setForm({ ...form, dniCliente: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="Deuda original"
            value={form.deudaOriginal}
            onChange={(e) => setForm({ ...form, deudaOriginal: e.target.value })}
            type="number"
            required
          />
          <input
            style={styles.input}
            placeholder="Fecha"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            type="date"
            required
          />
          <input
            style={styles.input}
            placeholder="Importe cuota"
            value={form.importeCuota}
            onChange={(e) => setForm({ ...form, importeCuota: e.target.value })}
            type="number"
            required
          />
          <input
            style={styles.input}
            placeholder="Cant. cuotas"
            value={form.cantidadCuotas}
            onChange={(e) => setForm({ ...form, cantidadCuotas: e.target.value })}
            type="number"
            min="1"
            required
          />
          <button style={{ ...styles.btn, gridColumn: 'span 2' }} disabled={loading}>
            {loading ? 'Guardando...' : 'Crear credito'}
          </button>
        </form>
      </div>

      {buscado && (
        <div style={styles.card}>
          <h3>Creditos del cliente ({lista.length})</h3>
          {loading && <p style={styles.empty}>Cargando...</p>}
          {!loading && lista.length === 0 && <p style={styles.empty}>Sin creditos.</p>}
          {lista.map((credito) => (
            <div
              key={credito.id}
              style={{
                ...styles.creditoBox,
                ...(credito.anulado ? styles.creditoAnulado : {}),
              }}
            >
              <div style={styles.creditoHeader}>
                <p style={styles.creditoResumen}>
                  <strong>ID #{credito.id}</strong> - Deuda: ${credito.deudaOriginal} - {credito.cantidadCuotas} cuotas de ${credito.importeCuota}
                </p>
                <div style={styles.actions}>
                  {credito.anulado && <span style={styles.badge}>ANULADO</span>}
                  {!credito.anulado && puedeAnularCredito && (
                    <button
                      type="button"
                      style={{ ...styles.btn, ...styles.dangerBtn }}
                      disabled={loading && anulandoId === credito.id}
                      onClick={() => handleAnular(credito.id)}
                    >
                      {loading && anulandoId === credito.id ? 'Anulando...' : 'Anular'}
                    </button>
                  )}
                </div>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Vencimiento</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {credito.cuotas.map((cuota) => (
                    <tr key={cuota.idCuota}>
                      <td>{cuota.idCuota}</td>
                      <td>{cuota.fechaVencimiento}</td>
                      <td style={{ color: cuota.pagada ? '#2e7d32' : '#c62828' }}>
                        {cuota.pagada ? 'Pagada' : 'Pendiente'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '32px', maxWidth: '900px', margin: '0 auto' },
  title: { color: '#1e3a5f', marginBottom: '24px' },
  card: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    marginBottom: '24px',
  },
  row: { display: 'flex', gap: '12px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  input: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    width: '100%',
    boxSizing: 'border-box',
  },
  btn: {
    padding: '10px 20px',
    backgroundColor: '#1e3a5f',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  dangerBtn: { backgroundColor: '#b23a48' },
  error: {
    background: '#ffebee',
    color: '#c62828',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '12px',
    fontSize: '0.9rem',
  },
  empty: { color: '#999' },
  creditoBox: { borderLeft: '4px solid #1e3a5f', paddingLeft: '16px', marginBottom: '20px' },
  creditoAnulado: {
    borderLeftColor: '#7f8c8d',
    background: '#f5f7f8',
    padding: '16px',
    borderRadius: '8px',
  },
  creditoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
    flexWrap: 'wrap',
  },
  creditoResumen: { margin: 0 },
  actions: { display: 'flex', alignItems: 'center', gap: '10px' },
  badge: {
    background: '#eceff1',
    color: '#455a64',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    letterSpacing: '0.04em',
  },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '8px' },
};
