import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCobranzasPorCredito, addCobranza, deleteCobranza, clearCobranzas } from '../store/slices/cobranzasSlice';

export default function Cobranzas() {
  const dispatch = useDispatch();
  const { lista, loading, error, anulandoId } = useSelector((state) => state.cobranzas);
  const user = useSelector((state) => state.auth.user);
  const [idCredito, setIdCredito] = useState('');
  const [buscado, setBuscado] = useState(false);
  const [form, setForm] = useState({ idCredito: '', idCuota: '', importe: '' });
  const [successMessage, setSuccessMessage] = useState('');

  const puedeAnularCobranza = Boolean(user?.puedeAnularCobranza);

  const buscar = async (e) => {
    e.preventDefault();
    dispatch(clearCobranzas());
    const result = await dispatch(fetchCobranzasPorCredito(idCredito));
    if (result.meta.requestStatus === 'fulfilled') {
      setBuscado(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    const payload = {
      idCredito: Number(form.idCredito),
      idCuota: Number(form.idCuota),
      importe: Number(form.importe),
    };

    const result = await dispatch(addCobranza(payload));
    if (result.meta.requestStatus === 'fulfilled') {
      setSuccessMessage('Cobranza registrada correctamente');
      setForm({ idCredito: '', idCuota: '', importe: '' });
      if (String(form.idCredito) === idCredito) {
        dispatch(fetchCobranzasPorCredito(idCredito));
      }
    }
  };

  const handleAnular = async (id) => {
    if (!window.confirm(`Desea anular la cobranza ${id}?`)) {
      return;
    }

    await dispatch(deleteCobranza(id));
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Cobranzas</h2>

      <div style={styles.card}>
        <h3>Buscar cobranzas por credito</h3>
        <form onSubmit={buscar} style={styles.row}>
          <input
            style={styles.input}
            placeholder="ID del credito"
            type="number"
            value={idCredito}
            onChange={(e) => setIdCredito(e.target.value)}
            required
          />
          <button style={styles.btn}>Buscar</button>
        </form>
      </div>

      <div style={styles.card}>
        <h3>Registrar pago de cuota</h3>
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.row}>
          <input
            style={styles.input}
            placeholder="ID credito"
            type="number"
            value={form.idCredito}
            onChange={(e) => setForm({ ...form, idCredito: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="Nro. cuota"
            type="number"
            min="1"
            value={form.idCuota}
            onChange={(e) => setForm({ ...form, idCuota: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="Importe"
            type="number"
            value={form.importe}
            onChange={(e) => setForm({ ...form, importe: e.target.value })}
            required
          />
          <button style={styles.btn} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>

        {successMessage && (
          <div style={styles.success}>
            {successMessage}
          </div>
        )}
      </div>

      {buscado && (
        <div style={styles.card}>
          <h3>Cobranzas del credito #{idCredito} ({lista.length})</h3>
          {loading && <p style={styles.empty}>Cargando...</p>}
          {!loading && lista.length === 0 && <p style={styles.empty}>Sin cobranzas registradas.</p>}
          {lista.length > 0 && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Credito</th>
                  <th>Cuota</th>
                  <th>Importe</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((cobranza) => (
                  <tr key={cobranza.id} style={cobranza.anulada ? styles.rowAnulada : undefined}>
                    <td>#{cobranza.id}</td>
                    <td>{cobranza.idCredito}</td>
                    <td>{cobranza.idCuota}</td>
                    <td>${cobranza.importe}</td>
                    <td>{cobranza.fecha}</td>
                    <td>{cobranza.anulada ? <span style={styles.badge}>ANULADA</span> : 'ACTIVA'}</td>
                    <td>
                      {!cobranza.anulada && puedeAnularCobranza && (
                        <button
                          type="button"
                          style={{ ...styles.btn, ...styles.dangerBtn }}
                          disabled={loading && anulandoId === cobranza.id}
                          onClick={() => handleAnular(cobranza.id)}
                        >
                          {loading && anulandoId === cobranza.id ? 'Anulando...' : 'Anular'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
  row: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  input: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    flex: '1',
    minWidth: '120px',
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
  success: {
    background: '#d4edda',
    color: '#155724',
    padding: '10px',
    borderRadius: '8px',
    marginTop: '10px',
  },
  empty: { color: '#999' },
  table: { width: '100%', borderCollapse: 'collapse' },
  rowAnulada: { background: '#f5f7f8', color: '#6b7280' },
  badge: {
    background: '#eceff1',
    color: '#455a64',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    letterSpacing: '0.04em',
  },
};
