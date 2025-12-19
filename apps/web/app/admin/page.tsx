export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-zinc-400">Welcome to the Pie Radio Administration Panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Cards - Mock Data for now */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-sm font-medium text-zinc-400">Pending Review</p>
          <p className="text-3xl font-bold text-white mt-2">12</p>
        </div>
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-sm font-medium text-zinc-400">Total Users</p>
          <p className="text-3xl font-bold text-white mt-2">1,234</p>
        </div>
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-sm font-medium text-zinc-400">Active Listeners</p>
          <p className="text-3xl font-bold text-white mt-2">85</p>
        </div>
      </div>
      
      {/* Quick Actions or charts could go here */}
    </div>
  );
}
