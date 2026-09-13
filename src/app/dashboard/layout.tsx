export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900">API Monitor</h2>
        </div>
        <nav className="px-6 py-8 space-y-4">
          <a href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded transition">
            Dashboard
          </a>
          <a href="/dashboard/services" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded transition">
            Services
          </a>
          <a href="/dashboard/monitors" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded transition">
            Monitors
          </a>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}