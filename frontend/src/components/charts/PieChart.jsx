import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const RADIAN = Math.PI / 180;

function renderSliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const percentage = ((percent ?? 0) * 100).toFixed(0);

  if (Number(percentage) <= 0) {
    return null;
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      style={styles.label}
    >
      {`${percentage}%`}
    </text>
  );
}

export default function PieChart({ items = [] }) {
  const total = items.reduce((acc, item) => acc + Number(item.value ?? 0), 0);

  return (
    <div style={styles.container}>

      <div style={styles.chartArea}>
        <ResponsiveContainer width="100%" height="100%">

          <RechartsPieChart margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>

            <Pie
              data={items}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={104}
              labelLine={false}
              label={renderSliceLabel}
            >

              {items.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                />
              ))}

            </Pie>

            <Tooltip formatter={(value) => [`${value}`, 'Cuotas']} />

          </RechartsPieChart>

        </ResponsiveContainer>
      </div>

      <div style={styles.legend}>
        {items.map((item) => {
          const percentage = total > 0 ? Math.round((Number(item.value ?? 0) / total) * 100) : 0;

          return (
            <div key={item.label} style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: item.color }} />
              <div>
                <div style={styles.legendLabel}>{item.label}</div>
                <div style={styles.legendMeta}>{item.value} cuotas | {percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

const styles = {

  container: {
    width: '100%',
    marginTop: '20px',
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #ddd'
  },
  chartArea: {
    width: '100%',
    height: '280px'
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    pointerEvents: 'none'
  },
  legend: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
    marginTop: '8px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '10px',
    background: '#f8fbff',
    border: '1px solid #d9e7f5'
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '999px',
    flexShrink: 0
  },
  legendLabel: {
    color: '#1e3a5f',
    fontWeight: 600,
    lineHeight: 1.2
  },
  legendMeta: {
    color: '#607d8b',
    fontSize: '0.85rem',
    marginTop: '2px'
  }
};
