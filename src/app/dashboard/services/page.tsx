export default function ServicesPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Services</h1>
        <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
          New Service
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-center py-12">
          No services yet. Create one to get started.
        </p>
      </div>
    </div>
  );
}