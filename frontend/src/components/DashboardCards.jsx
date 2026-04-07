export default function DashboardCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-gray-600">Total Customers</h3>
        <p className="text-2xl font-bold">120</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-gray-600">Active Users</h3>
        <p className="text-2xl font-bold">80</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-gray-600">Churn Risk</h3>
        <p className="text-2xl font-bold text-red-500">15%</p>
      </div>

    </div>
  );
}