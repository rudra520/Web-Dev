import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/students')({
  component: StudentDirectory,
})

function StudentDirectory() {
  const [students, setStudents] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    hostelBlock: 'A-Block',
    roomNumber: '',
    parentPhone: '',
    parentEmail: '',
  })

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:8000/students')
      setStudents(await res.json())
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:8000/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (data.success) {
        setIsAdding(false)
        fetchData()
        setFormData({ name: '', studentId: '', hostelBlock: 'A-Block', roomNumber: '', parentPhone: '', parentEmail: '' })
      } else { alert(data.detail || "Enrollment failed") }
    } catch (err: any) { alert("Enrollment failed") }
  }

  // Filter students by Student UUID (student_id)
  const filteredStudents = students.filter(s => 
    s.student_id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-slate-500 mt-1">Standalone Biometric Enrollment (SQLite).</p>
        </div>
        <div className="flex gap-4">
          {/* Search Bar */}
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0f52ba] opacity-50 group-focus-within:opacity-100 transition-opacity">🔍</span>
            <input 
              type="text" 
              placeholder="Search by Student UUID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-6 py-2.5 bg-white/50 border-2 border-slate-200 rounded-xl outline-none focus:border-[#0f52ba] focus:bg-white transition-all w-64 text-sm font-medium"
            />
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="px-6 py-2.5 bg-[#0f52ba] text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-all flex items-center gap-2"
          >
            {isAdding ? "Close Enrollment" : "Enroll New Student"}
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-[#a6c5d7] p-8 rounded-3xl border-2 border-[#0f52ba] shadow-xl animate-in zoom-in-95 duration-200">
           <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#0f52ba]">📝 Enrollment Form</h2>
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Enter student name" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Student UUID (Unique ID)</label>
                <input required value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="STU-2024-XXXX" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Hostel Block</label>
                <select value={formData.hostelBlock} onChange={e => setFormData({...formData, hostelBlock: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                   <option>A-Block</option>
                   <option>B-Block</option>
                   <option>C-Block</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Room Number</label>
                <input required value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Room 201" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Parent Mobile Number</label>
                <input required value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="+91 XXXX-XXXXXX" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Parent Email Address</label>
                <input required value={formData.parentEmail} onChange={e => setFormData({...formData, parentEmail: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="parent@example.com" />
              </div>
              <div className="md:col-span-3 flex justify-end gap-3 mt-4 pt-6 border-t border-slate-100">
                 <button type="submit" className="px-8 py-2.5 bg-[#0f52ba] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10">Complete Enrollment</button>
              </div>
           </form>
        </div>
      )}

      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                <th className="px-8 py-4">Student UUID</th>
                <th className="px-8 py-4">Name</th>
                <th className="px-8 py-4">Location</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Contact</th>
                <th className="px-8 py-4 text-right">Digital Pass</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {filteredStudents.map(student => (
                 <tr key={student.id} className="group hover:bg-white transition-all">
                    <td className="px-8 py-5">
                       <span className="text-[10px] font-black text-[#0f52ba] bg-[#a6c5d7]/30 px-2 py-1 rounded-lg border border-[#0f52ba]/10">
                          {student.student_id}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-sm font-black text-slate-800 tracking-tight">{student.name}</p>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-xs font-bold text-slate-700">{student.hostel_block}</p>
                       <p className="text-[10px] text-slate-500 uppercase">{student.room_number}</p>
                    </td>
                    <td className="px-8 py-5">
                       <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${student.status === 'inside' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                          {student.status}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-xs text-slate-600 font-bold italic">{student.parent_phone}</td>
                    <td className="px-8 py-5 text-right">
                       <div className="inline-flex w-10 h-10 bg-slate-100 rounded-lg items-center justify-center border-2 border-slate-200 cursor-pointer hover:border-[#0f52ba] transition-colors">
                          <span className="text-xl">🔲</span>
                       </div>
                    </td>
                 </tr>
               ))}
               {filteredStudents.length === 0 && (
                 <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                       <div className="text-4xl mb-4 opacity-20">🔎</div>
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No student matches UUID: "{searchQuery}"</p>
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
