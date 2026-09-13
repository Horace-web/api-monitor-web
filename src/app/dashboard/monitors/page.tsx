export default function MonitorsPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Monitors</h1>
        <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
          New Monitor
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-center py-12">
          No monitors yet. Create a service first.
        </p>
      </div>
    </div>
  );
}