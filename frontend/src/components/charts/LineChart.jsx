import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function LineChart({ items }) {

  return (
    <div style={{ width: '100%', height: 350 }}>

      <ResponsiveContainer>

        <RechartsLineChart data={items}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="label" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#1e3a5f"
            strokeWidth={3}
          />

        </RechartsLineChart>

      </ResponsiveContainer>

    </div>
  );
}