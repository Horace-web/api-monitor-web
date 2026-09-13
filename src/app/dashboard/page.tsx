export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Services</h3>
          <p className="text-4xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Monitors</h3>
          <p className="text-4xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Incidents</h3>
          <p className="text-4xl font-bold text-red-600">0</p>
        </div>
      </div>
    </div>
  );
}