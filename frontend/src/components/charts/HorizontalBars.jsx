import { useMemo } from 'react';

function formatValue(value, kind) {
  if (value === null || value === undefined) return '-';
  if (kind === 'money') return `$${Number(value).toFixed(2)}`;
  if (kind === 'percent') return `${Number(value).toFixed(2)}%`;
  return String(value);
}

export default function HorizontalBars({
  title,
  items,
  valueKind = 'number',
  emptyText = 'Sin datos para mostrar.',
}) {
  const max = useMemo(() => {
    const vals = items.map(i => Number(i.value)).filter(v => Number.isFinite(v));
    return vals.length ? Math.max(...vals) : 0;
  }, [items]);

  return (
    <div style={styles.container}>
      <h4 style={styles.h4}>{title}</h4>
      {items.length === 0 && (
        <div style={styles.emptyBox}>
          <p style={styles.empty}>{emptyText}</p>
        </div>
      )}
      {items.length > 0 && (
        <div style={styles.chart}>
          {items.map((it) => {
            const v = Number(it.value);
            const ratio = max > 0 && Number.isFinite(v) ? (v / max) : 0;
            const widthPct = Math.max(0, Math.min(1, ratio)) * 100;
            return (
              <div key={it.label} style={styles.item} className="ui-chart-item">
                <div style={styles.itemHeader}>
                  <div style={styles.label} title={it.label}>{it.label}</div>
                  <div style={styles.value}>{formatValue(v, valueKind)}</div>
                </div>
                <div style={styles.track}>
                  <div style={{ ...styles.fill, width: `${widthPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { width: '100%' },
  h4: { margin: '12px 0 8px', color: '#1e3a5f' },
  emptyBox: { background: '#e3f2fd', borderRadius: '10px', padding: '12px' },
  empty: { color: '#607d8b', margin: 0 },

  chart: { display: 'flex', flexDirection: 'column', gap: '12px' },
  item: {
    padding: '10px 12px',
    borderRadius: '10px',
    background: 'white',
    border: '1px solid #e3f2fd',
  },
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', marginBottom: '8px' },
  label: { color: '#37474f', fontSize: '0.95rem', lineHeight: 1.2, overflowWrap: 'anywhere' },
  value: { color: '#37474f', textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
  track: { background: '#e3f2fd', borderRadius: '999px', overflow: 'hidden', height: '14px' },
  fill: { background: '#1e3a5f', height: '100%' },
};
