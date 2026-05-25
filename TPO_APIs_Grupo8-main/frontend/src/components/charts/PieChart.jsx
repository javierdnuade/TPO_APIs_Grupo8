import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function PieChart({ items = [] }) {

  return (
    <div style={styles.container}>

      <ResponsiveContainer width="100%" height={350}>

        <RechartsPieChart>

          <Pie
            data={items}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={({ label, percent }) =>
              `${label} ${(percent * 100).toFixed(0)}%`
            }
          >

            {items.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
              />
            ))}

          </Pie>

          <Tooltip />

          <Legend />

        </RechartsPieChart>

      </ResponsiveContainer>

    </div>
  );
}

const styles = {

  container: {
    width: '100%',
    height: '350px',
    marginTop: '20px',
    background: 'white',
    borderRadius: '12px',
    padding: '12px',
    border: '1px solid #ddd'
  }
};