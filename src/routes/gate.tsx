import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'

export const Route = createFileRoute('/gate')({
  component: GateControl,
})

function GateControl() {
  const [mode, setMode] = useState<'face' | 'qr'>('face')
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' })
  const [recognizedStudent, setRecognizedStudent] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [allStudents, setAllStudents] = useState<any[]>([])
  
  const fetchStudents = async () => {
    try {
      const res = await fetch('http://localhost:8000/students')
      setAllStudents(await res.json())
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    fetchStudents()
    if (mode === 'face') {
      const setupWebcam = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          if (videoRef.current) videoRef.current.srcObject = stream
        } catch (err) { console.error(err) }
      }
      setupWebcam()
    }
  }, [mode])

  // Real-time Python Face recognition logic
  const performRecognition = async () => {
    if (!videoRef.current || !canvasRef.current || mode !== 'face' || isProcessing) return
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    const frame = canvas.toDataURL('image/jpeg', 0.5)

    try {
      const response = await fetch('http://localhost:8000/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: frame })
      })
      const data = await response.json()
      if (data.success) {
        setRecognizedStudent(data.student)
      }
    } catch (err) { console.warn("Backend offline") }
  }

  useEffect(() => {
    const interval = setInterval(performRecognition, 2000)
    return () => clearInterval(interval)
  }, [mode, isProcessing])

  const handleGateAction = async (studentId: string, type: 'EXIT' | 'ENTRY') => {
    setIsProcessing(true)
    setStatus({ type: 'idle', message: 'Logging event to SQLite...' })
    try {
      const res = await fetch('http://localhost:8000/gate-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, eventType: type })
      })
      const data = await res.json()
      if (data.success) {
        setStatus({ type: 'success', message: data.message })
        setRecognizedStudent(null)
        fetchStudents()
      } else {
        setStatus({ type: 'error', message: data.message })
      }
    } catch (err) { setStatus({ type: 'error', message: 'Communication error' }) }
    finally { setIsProcessing(false); setTimeout(() => setStatus({ type: 'idle', message: '' }), 4000) }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Gate Access Terminal</h1>
          <p className="text-slate-500 mt-1">Standalone Biometric Authentication (SQLite Powered)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <canvas ref={canvasRef} className="hidden" />
        <div className="space-y-6">
          <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden border-4 border-slate-200 shadow-2xl group">
             {mode === 'face' ? (
               <>
                 <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                 <div className="absolute inset-0 border-[2px] border-blue-500/30 m-8 rounded-2xl pointer-events-none">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                    <div className="absolute left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_15px_blue] animate-[scan_2s_linear_infinite] top-0 opacity-50"></div>
                 </div>
                 
                 {recognizedStudent && (
                   <div className="absolute top-6 left-6 right-6 p-4 bg-blue-600/90 backdrop-blur-md rounded-2xl border border-blue-400 shadow-2xl text-white animate-in slide-in-from-top-4">
                      <div className="flex items-center gap-4">
                         <div className="flex-1">
                            <p className="text-lg font-black tracking-tight">{recognizedStudent.name}</p>
                            <p className="text-[10px] font-bold uppercase opacity-80 mt-1">Room {recognizedStudent.room_number} • {recognizedStudent.hostel_block}</p>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => handleGateAction(recognizedStudent.student_id, 'EXIT')} className="bg-orange-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase">EXIT</button>
                            <button onClick={() => handleGateAction(recognizedStudent.student_id, 'ENTRY')} className="bg-emerald-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase">ENTRY</button>
                         </div>
                      </div>
                   </div>
                 )}
               </>
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold">QR SCANNER MODE ACTIVE</div>
             )}
          </div>

          <div className="flex gap-4">
            <button onClick={() => setMode('face')} className={`flex-1 py-3 rounded-2xl font-bold text-sm ${mode === 'face' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-600'}`}>👤 Face ID</button>
            <button onClick={() => setMode('qr')} className={`flex-1 py-3 rounded-2xl font-bold text-sm ${mode === 'qr' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-600'}`}>🔲 QR Fallback</button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><span>🛡️</span> Access Control</h2>
          
          {status.type !== 'idle' && (
             <div className={`p-4 rounded-2xl border mb-6 ${status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                <p className="text-sm font-bold">{status.message}</p>
             </div>
          )}

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {allStudents.map(student => (
              <div key={student.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-blue-300 transition-all">
                 <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${student.status === 'outside' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                      {student.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{student.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Status: {student.status}</p>
                    </div>
                 </div>
                 <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleGateAction(student.student_id, 'EXIT')} className="bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">EXIT</button>
                    <button onClick={() => handleGateAction(student.student_id, 'ENTRY')} className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">ENTRY</button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan { 0%, 100% { top: 0%; } 50% { top: 100%; } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  )
}
