import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  const [stats, setStats] = useState<any>({ totalStudents: 0, currentlyOut: 0, overdue: 0 })
  const [logs, setLogs] = useState<any[]>([])

  const fetchData = async () => {
    try {
      const statsRes = await fetch('http://localhost:8000/stats')
      setStats(await statsRes.json())
      const logsRes = await fetch('http://localhost:8000/logs')
      setLogs(await logsRes.json())
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#0f52ba]">Security Command Center</h1>
          <p className="text-[#0f52ba]/60 mt-1 font-medium italic">Monitoring live hostel movements & biometric status.</p>
        </div>
        <div className="flex gap-3">
           <Link to="/gate" className="px-6 py-3 bg-[#0f52ba] text-white rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:scale-105 transition-all flex items-center gap-2">
             <span>🛡️</span> GO TO GATE TERMINAL
           </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Students" value={stats.totalStudents} icon="👥" highlight={false} />
        <StatCard label="Currently Outside" value={stats.currentlyOut} icon="🏃" highlight={false} />
        <StatCard label="Overdue / Alerts" value={stats.overdue} icon="⚠️" highlight={stats.overdue > 0} />
        <StatCard label="System Health" value="100%" icon="⚡" highlight={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Section */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-white/50 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/30">
            <h2 className="font-black text-[#0f52ba] uppercase tracking-wider text-sm">Live Movement Stream</h2>
            <Link to="/reports" className="text-xs font-bold text-[#0f52ba] hover:underline underline-offset-4">Full Logs →</Link>
          </div>
          <div className="divide-y divide-slate-100 overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                    <th className="px-8 py-4">Event Description</th>
                    <th className="px-8 py-4 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {logs.slice(0, 6).map(log => (
                     <tr key={log.id} className="group hover:bg-white/50 transition-colors">
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${log.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`}></div>
                              <p className="text-sm font-bold text-slate-700">{log.message}</p>
                           </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <p className="text-xs font-black text-[#0f52ba]/40">{new Date(log.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                     </tr>
                   ))}
                   {logs.length === 0 && (
                     <tr><td colSpan={2} className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Awaiting System Activity...</td></tr>
                   )}
                </tbody>
             </table>
          </div>
        </div>

        {/* Rich Sidebar Widgets */}
        <div className="space-y-6">
           <div className="bg-[#a6c5d7] p-8 rounded-[2.5rem] shadow-lg border border-white/20">
              <h3 className="font-black text-[#0f52ba] mb-6 flex items-center gap-2 uppercase tracking-wider text-xs">
                 <span>📡</span> Standalone Status
              </h3>
              <div className="space-y-5">
                 <StatusItem label="Local SQLite DB" status="ONLINE" active={true} />
                 <StatusItem label="AI Face Engine" status="STANDBY" active={true} />
                 <StatusItem label="Parent SMS API" status="SIMULATED" active={true} />
                 <StatusItem label="CORS Firewall" status="ACTIVE" active={true} />
              </div>
           </div>

           <div className="bg-[#0f52ba] text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="font-black mb-2 uppercase tracking-tighter text-lg">Gate Traffic Peak</h3>
                <p className="text-white/60 text-xs mb-6 font-medium">Expected high volume in 15 mins (Dinner Outing).</p>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-white w-[75%] shadow-[0_0_10px_white]"></div>
                </div>
                <div className="flex justify-between mt-3">
                   <p className="text-[10px] text-white/50 font-bold">Capacity: 75%</p>
                   <p className="text-[10px] text-white/90 font-bold uppercase">Critical Zone</p>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 opacity-10 rotate-12 transition-transform group-hover:scale-125">
                 <span className="text-[10rem]">🛡️</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, highlight = false }: any) {
  return (
    <div className={`p-8 rounded-[2rem] border-2 transition-all hover:-translate-y-1 ${highlight ? 'bg-rose-50 border-rose-300' : 'bg-[#a6c5d7] border-white/40'} shadow-xl`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 rounded-2xl bg-white/40 flex items-center justify-center text-2xl shadow-inner text-[#0f52ba]`}>
          {icon}
        </div>
        {highlight && <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-bounce">URGENT</span>}
      </div>
      <div>
        <p className="text-[#0f52ba]/60 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
        <p className={`text-4xl font-black mt-1 ${highlight ? 'text-rose-600' : 'text-[#0f52ba]'}`}>{value}</p>
      </div>
    </div>
  )
}

function StatusItem({ label, status, active }: { label: string; status: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-[#0f52ba]/80 text-[11px] font-bold uppercase">{label}</span>
       <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#0f52ba] animate-pulse' : 'bg-slate-400'}`}></span>
          <span className="text-[#0f52ba] text-[10px] font-black tracking-widest uppercase">{status}</span>
       </div>
    </div>
  )
}
