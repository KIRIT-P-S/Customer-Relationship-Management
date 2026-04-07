import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const data = [
  { month: "Jan", sales: 400 },
  { month: "Feb", sales: 700 },
  { month: "Mar", sales: 500 },
  { month: "Apr", sales: 900 },
];

export default function SalesChart() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-bold mb-4">Sales Overview</h3>

      <LineChart width={500} height={300} data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <CartesianGrid />
        <Line type="monotone" dataKey="sales" />
      </LineChart>
    </div>
  );
}