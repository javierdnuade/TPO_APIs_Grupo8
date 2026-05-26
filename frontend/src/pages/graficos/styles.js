const styles = {
  page:  { padding: '32px 20px', maxWidth: '1100px', margin: '0 auto' },
  title: { color: '#1e3a5f', marginBottom: '8px' },
  subtitle: { color: '#607d8b', marginTop: 0, marginBottom: '24px' },
  subtitleSmall: { color: '#607d8b', marginTop: 0, marginBottom: '12px', fontSize: '0.95rem' },
  card:  {
    background: 'white',
    padding: '28px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    border: '1px solid #e3f2fd',
    borderTop: '4px solid #90caf9',
    marginBottom: '24px',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  h3: { margin: 0, color: '#1e3a5f' },
  meta: { color: '#78909c', fontSize: '0.9rem', marginBottom: '8px' },

  row: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  inline: { display: 'flex', alignItems: 'center', gap: '8px' },
  labelInline: { color: '#607d8b', fontSize: '0.9rem' },

  filtersForm: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' },
  fieldsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' },
  checkboxesRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  actionsRow: { display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' },

  input: { padding: '10px', border: '1px solid #ccc', borderRadius: '6px', minWidth: '170px', flex: '1' },
  select: { padding: '10px', border: '1px solid #ccc', borderRadius: '6px', minWidth: '220px', background: 'white' },
  checkbox: { display: 'flex', gap: '8px', alignItems: 'center', color: '#455a64', fontSize: '0.95rem' },

  btn: { padding: '10px 20px', backgroundColor: '#1e3a5f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnSecondary: { padding: '10px 16px', backgroundColor: '#90caf9', color: '#1e3a5f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnDisabled: { opacity: 0.7, cursor: 'not-allowed' },

  error: { background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', marginTop: '12px', fontSize: '0.95rem' },
  empty: { color: '#999', margin: 0 },
};

export default styles;
