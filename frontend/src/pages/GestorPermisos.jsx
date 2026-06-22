import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearStatus, fetchUsuariosConPermisos, updatePermisos } from '../store/slices/permisosSlice';

export default function GestorPermisos() {
  const dispatch = useDispatch();
  const { lista, loading, updatingUserId, error, success } = useSelector((state) => state.permisos);

  useEffect(() => {
    dispatch(fetchUsuariosConPermisos());
    return () => {
      dispatch(clearStatus());
    };
  }, [dispatch]);

  const handleToggle = (usuario, field) => {
    const permisos = {
      puedeAnularCredito:
        field === 'puedeAnularCredito'
          ? !usuario.puedeAnularCredito
          : usuario.puedeAnularCredito,
      puedeAnularCobranza:
        field === 'puedeAnularCobranza'
          ? !usuario.puedeAnularCobranza
          : usuario.puedeAnularCobranza,
    };

    dispatch(updatePermisos({ id: usuario.id, permisos }));
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Gestor de permisos</h2>
      <p style={styles.subtitle}>
        Asigna permisos operativos a los usuarios con rol USER.
      </p>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.card}>
        {loading && <p style={styles.empty}>Cargando usuarios...</p>}

        {!loading && lista.length === 0 && (
          <p style={styles.empty}>No hay usuarios USER para administrar.</p>
        )}

        {!loading && lista.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Usuario</th>
                <th style={styles.th}>Rol</th>
                <th style={styles.th}>Puede anular credito</th>
                <th style={styles.th}>Puede anular cobranza</th>
                <th style={styles.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((usuario) => {
                const isUpdating = updatingUserId === usuario.id;

                return (
                  <tr key={usuario.id}>
                    <td style={styles.td}>{usuario.username}</td>
                    <td style={styles.td}>{usuario.rol}</td>
                    <td style={styles.tdCenter}>
                      <input
                        type="checkbox"
                        checked={usuario.puedeAnularCredito}
                        disabled={isUpdating}
                        onChange={() => handleToggle(usuario, 'puedeAnularCredito')}
                      />
                    </td>
                    <td style={styles.tdCenter}>
                      <input
                        type="checkbox"
                        checked={usuario.puedeAnularCobranza}
                        disabled={isUpdating}
                        onChange={() => handleToggle(usuario, 'puedeAnularCobranza')}
                      />
                    </td>
                    <td style={styles.td}>
                      {isUpdating ? 'Guardando...' : 'Listo'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '32px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  title: {
    color: '#1e3a5f',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#546e7a',
    marginBottom: '20px',
  },
  card: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    overflowX: 'auto',
  },
  error: {
    background: '#ffebee',
    color: '#c62828',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '16px',
  },
  success: {
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '16px',
  },
  empty: {
    color: '#78909c',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    borderBottom: '1px solid #dfe6eb',
    padding: '12px 10px',
    color: '#1e3a5f',
  },
  td: {
    borderBottom: '1px solid #eef3f6',
    padding: '12px 10px',
  },
  tdCenter: {
    borderBottom: '1px solid #eef3f6',
    padding: '12px 10px',
    textAlign: 'center',
  },
};
