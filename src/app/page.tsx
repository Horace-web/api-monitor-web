export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to API Monitor
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Comprehensive API monitoring and uptime tracking platform
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/auth/login"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </a>
          <a
            href="/auth/register"
            className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
          >
            Sign Up
          </a>
        </div>
      </div>
    </main>
  );
}