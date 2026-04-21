import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/reports')({
  component: Reports,
})

function Reports() {
  const [logs, setLogs] = useState<any[]>([])

  const fetchLogs = async () => {
    try {
      const res = await fetch('http://localhost:8000/logs')
      setLogs(await res.json())
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-8">
       <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Security Incident Reports</h1>
          <p className="text-slate-500 mt-1">Audit trail stored locally in SQLite database.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#a6c5d7] p-6 rounded-3xl border border-slate-300 shadow-sm">
             <p className="text-[10px] font-black text-[#0f52ba]/70 uppercase tracking-widest mb-2">Primary Method Usage</p>
             <div className="flex items-end gap-4">
                <span className="text-4xl font-black text-[#0f52ba]">82%</span>
                <span className="text-xs font-bold text-[#0f52ba]/60 mb-1 italic">Face ID Success</span>
             </div>
             <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-[#0f52ba] w-[82%]"></div>
             </div>
          </div>
          <div className="bg-[#a6c5d7] p-6 rounded-3xl border border-slate-300 shadow-sm">
             <p className="text-[10px] font-black text-[#0f52ba]/70 uppercase tracking-widest mb-2">Fallback Usage</p>
             <div className="flex items-end gap-4">
                <span className="text-4xl font-black text-[#0f52ba]">18%</span>
                <span className="text-xs font-bold text-[#0f52ba]/60 mb-1 italic">QR Authentications</span>
             </div>
             <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 w-[18%]"></div>
             </div>
          </div>
          <div className="bg-[#a6c5d7] p-6 rounded-3xl border border-slate-300 shadow-sm">
             <p className="text-[10px] font-black text-[#0f52ba]/70 uppercase tracking-widest mb-2">Data Privacy</p>
             <div className="flex items-end gap-4">
                <span className="text-4xl font-black text-[#0f52ba]">LOCAL</span>
                <span className="text-xs font-bold text-[#0f52ba]/60 mb-1 italic">Zero Cloud</span>
             </div>
             <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[100%]"></div>
             </div>
          </div>
       </div>

       <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
             <h2 className="font-bold text-slate-800">Complete Movement History</h2>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-4">Event Timestamp</th>
                    <th className="px-8 py-4">Severity</th>
                    <th className="px-8 py-4">Message</th>
                    <th className="px-8 py-4 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {logs.map(log => (
                     <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4 text-xs font-bold text-slate-700">{new Date(log.timestamp * 1000).toLocaleString()}</td>
                        <td className="px-8 py-4">
                           <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase ${log.type === 'error' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {log.type}
                           </span>
                        </td>
                        <td className="px-8 py-4 text-xs text-slate-800 font-medium">{log.message}</td>
                        <td className="px-8 py-4 text-right">
                           <span className="text-[10px] font-bold text-emerald-600 uppercase italic">Authenticated</span>
                        </td>
                     </tr>
                   ))}
                   {logs.length === 0 && (
                      <tr>
                         <td colSpan={4} className="py-24 text-center text-slate-400 text-xs italic">
                            No security incidents logged.
                         </td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  )
}
