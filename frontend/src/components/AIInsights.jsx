export default function AIInsights({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Churn Prediction</h3>
        <p>High Risk Customers: <span className="font-semibold">{stats?.atRiskCount ?? "—"}</span></p>
        <p className="text-red-500 font-bold">Risk Level: {stats?.churnRisk ?? "—"}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Sentiment Analysis</h3>
        <p>Positive: {stats?.sentiment?.positive ?? 60}%</p>
        <p>Neutral: {stats?.sentiment?.neutral ?? 20}%</p>
        <p>Negative: {stats?.sentiment?.negative ?? 20}%</p>
      </div>
      {stats?.leadsByStatus && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Leads by Status</h3>
          {Object.entries(stats.leadsByStatus).map(([status, count]) => (
            <p key={status}>{status}: <span className="font-semibold">{count}</span></p>
          ))}
        </div>
      )}
    </div>
  );
}
