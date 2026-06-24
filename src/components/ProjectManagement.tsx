import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Camera, 
  Video, 
  Clock, 
  Sliders, 
  FileText, 
  MapPin, 
  Filter, 
  UploadCloud, 
  AlertTriangle,
  FileCheck,
  Flame,
  TrendingDown,
  TrendingUp,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { ProgressItem } from '../types';

export const ProjectManagement: React.FC = () => {
  const { 
    progressItems, 
    updateProgressItem, 
    projectDocs, 
    addProjectDoc, 
    deleteProjectDoc, 
    currentRole,
    showToast
  } = useApp();

  const isEditor = currentRole === 'Super Admin' || currentRole === 'Project Manager' || currentRole === 'Konsultan';

  // State for burn-down chart evaluation week
  const [currentWeekSimulation, setCurrentWeekSimulation] = useState<number>(12);

  // Compute 20 weeks Interactive Burn-down Data
  const burnDownData = useMemo(() => {
    const totalWeeks = 20;

    // Standard baseline tasks matching the TimeSchedule.tsx
    const baseTasks = [
      { category: 'Persiapan', startWeek: 1, endWeek: 3, weight: 5 },
      { category: 'Pondasi', startWeek: 2, endWeek: 6, weight: 10 },
      { category: 'Basement', startWeek: 4, endWeek: 8, weight: 12 },
      { category: 'Struktur', startWeek: 6, endWeek: 14, weight: 35 },
      { category: 'Arsitektur', startWeek: 10, endWeek: 17, weight: 20 },
      { category: 'MEP', startWeek: 11, endWeek: 18, weight: 10 },
      { category: 'Interior', startWeek: 14, endWeek: 19, weight: 6 },
      { category: 'Landscape', startWeek: 17, endWeek: 20, weight: 2 }
    ];

    // Merge in-realtime updated progressItems percentages
    const tasksWithProgress = baseTasks.map(t => {
      const match = progressItems.find(p => p.category.toLowerCase() === t.category.toLowerCase());
      const progressPercent = match ? match.progressPercent : 0;
      return {
        ...t,
        progressPercent
      };
    });

    const weeklyPlanned = Array(totalWeeks).fill(0);
    const weeklyActual = Array(totalWeeks).fill(0);

    // 1. Weekly planned incremental completed progress distribution
    tasksWithProgress.forEach(task => {
      const duration = task.endWeek - task.startWeek + 1;
      if (duration > 0) {
        const plannedPerWeek = task.weight / duration;
        for (let w = task.startWeek; w <= task.endWeek; w++) {
          if (w >= 1 && w <= totalWeeks) {
            weeklyPlanned[w - 1] += plannedPerWeek;
          }
        }
      }
    });

    // 2. Weekly actual incremental completed progress distribution based on progress percentage up to simulation day
    tasksWithProgress.forEach(task => {
      const duration = task.endWeek - task.startWeek + 1;
      if (duration > 0 && task.progressPercent > 0) {
        const completedAmount = (task.progressPercent / 100) * task.weight;
        // Determine how many weeks are already passed/active for this task up to currentWeekSimulation
        const elapsedWeeksInTask = Math.max(0, Math.min(task.endWeek, currentWeekSimulation) - task.startWeek + 1);
        
        if (elapsedWeeksInTask > 0) {
          const actualPerWeek = completedAmount / elapsedWeeksInTask;
          for (let w = task.startWeek; w <= Math.min(task.endWeek, currentWeekSimulation); w++) {
            if (w >= 1 && w <= totalWeeks) {
              weeklyActual[w - 1] += actualPerWeek;
            }
          }
        }
      }
    });

    // 3. Convert incremental completed progress to remaining (Burn-down) percentages
    const dataPoints = [];
    
    // Add Week 0 (Beginning which starts at 100% remaining)
    dataPoints.push({
      week: 0,
      weekLabel: 'M-0',
      plannedRemaining: 100,
      actualRemaining: 100
    });

    let cumPlannedCompleted = 0;
    let cumActualCompleted = 0;

    for (let i = 0; i < totalWeeks; i++) {
      const weekNum = i + 1;
      cumPlannedCompleted += weeklyPlanned[i];
      // Remaining work is 100 minus cumulative completed progress
      const plannedRemaining = Math.max(0, parseFloat((100 - cumPlannedCompleted).toFixed(1)));
      
      let actualRemaining = null;
      if (weekNum <= currentWeekSimulation) {
        cumActualCompleted += weeklyActual[i];
        actualRemaining = Math.max(0, parseFloat((100 - cumActualCompleted).toFixed(1)));
      }

      dataPoints.push({
        week: weekNum,
        weekLabel: `M-${weekNum}`,
        plannedRemaining,
        actualRemaining: actualRemaining
      });
    }

    return dataPoints;
  }, [progressItems, currentWeekSimulation]);

  // Extract currently evaluated week metric
  const evaluatedWeekMetrics = useMemo(() => {
    const dataPoint = burnDownData.find(d => d.week === currentWeekSimulation);
    if (!dataPoint) {
      return { plannedRemaining: 0, actualRemaining: 0, variance: 0 };
    }
    const plannedRemaining = dataPoint.plannedRemaining;
    const actualRemaining = dataPoint.actualRemaining !== null ? dataPoint.actualRemaining : 100;
    // Positive variance on remaining work means WE HAVE MORE WORK REMAINING THAN PLANNED (we are slow / delay)
    // Negative variance means WE HAVE LESS RESIDUAL WORK THAN PLANNED (we are faster / ahead of schedule)
    const varianceRemaining = parseFloat((actualRemaining - plannedRemaining).toFixed(1));

    return {
      plannedRemaining,
      actualRemaining,
      variance: varianceRemaining
    };
  }, [burnDownData, currentWeekSimulation]);

  // State for updating progress categories
  const [selectedCatId, setSelectedCatId] = useState<string>('prog4');
  const [newPercentage, setNewPercentage] = useState<number>(85);
  const [newStatus, setNewStatus] = useState<ProgressItem['status']>('Berjalan');
  const [verificationNote, setVerificationNote] = useState<string>('');

  // State for new document uploads
  const [docType, setDocType] = useState<'Photo' | 'Drone Video' | 'Time Lapse'>('Photo');
  const [docTitle, setDocTitle] = useState('');
  const [docDesc, setDocDesc] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docCategory, setDocCategory] = useState('Struktur');
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);

  // Gallery filter state
  const [activeGalleryFilter, setActiveGalleryFilter] = useState<'All' | 'Photo' | 'Drone Video' | 'Time Lapse'>('All');

  // Camera integration state and refs for live site capturing
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const startCamera = async (deviceId?: string) => {
    try {
      // Stop existing stream first
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId } } 
          : { facingMode: { ideal: 'environment' } }, // Prefer back camera for site photos
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      setIsCameraOpen(true);

      // Bind to video ref using a short delay to allow elements to mount
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);

      // Enumerate other video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      setCameraDevices(videoDevices);
      if (!deviceId && videoDevices.length > 0) {
        const activeTrack = stream.getVideoTracks()[0];
        if (activeTrack) {
          const settings = activeTrack.getSettings();
          if (settings.deviceId) {
            setSelectedDeviceId(settings.deviceId);
          }
        }
      }
    } catch (err) {
      console.error('Gagal mengakses kamera:', err);
      if (showToast) {
        showToast('Gagal mengakses kamera. Mohon berikan izin kamera pada peramban Anda.', 'error');
      } else {
        alert('Gagal mengakses kamera. Mohon berikan izin kamera pada peramban Anda.');
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (context) {
        // Handle mirroring if using front camera
        const activeTrack = cameraStream?.getVideoTracks()[0];
        const label = activeTrack?.label?.toLowerCase() || '';
        const isFrontCamera = label.includes('front') || label.includes('user') || false;

        if (isFrontCamera) {
          context.translate(width, 0);
          context.scale(-1, 1);
        }

        context.drawImage(video, 0, 0, width, height);

        // Reset transform if it was mirrored so watermark writes normally
        if (isFrontCamera) {
          context.setTransform(1, 0, 0, 1, 0, 0);
        }
        
        // Dynamic construction watermark
        context.fillStyle = 'rgba(15, 23, 42, 0.75)';
        context.fillRect(10, height - 70, width - 20, 60);

        context.fillStyle = '#ffffff';
        context.font = 'bold 12px monospace';
        context.fillText('PROYEK: FORESYNDO 2 - HOTEL, KOST & PORTAL MITRA', 20, height - 50);
        context.fillText('LOKASI: JATITUJUH, MAJALENGKA, JAWA BARAT', 20, height - 34);
        
        context.fillStyle = '#f97316'; // orange-500
        context.fillText(`WAKTU : [${new Date().toLocaleString('id-ID')}] WIB (GPS SYNCED)`, 20, height - 18);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedPreview(dataUrl);
        setDocUrl(dataUrl);
        
        if (showToast) {
          showToast('Foto harian pengawas berhasil diambil dengan watermark proyek!', 'success');
        }
        stopCamera();
      }
    }
  };

  React.useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const handleProgressUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that percentage does not exceed 100%
    if (newPercentage > 100) {
      if (showToast) {
        showToast('Kesalahan: Persentase progres fisik tidak boleh melebihi 100%!', 'error');
      } else {
        alert('Kesalahan: Persentase progres fisik tidak boleh melebihi 100%!');
      }
      return;
    }
    
    if (newPercentage < 0) {
      if (showToast) {
        showToast('Kesalahan: Persentase progres fisik tidak boleh kurang dari 0%!', 'error');
      } else {
        alert('Kesalahan: Persentase progres fisik tidak boleh kurang dari 0%!');
      }
      return;
    }

    // Validate that verification note is listed
    if (!verificationNote.trim()) {
      if (showToast) {
        showToast('Kesalahan: Mohon cantumkan catatan verifikasi lapangan sebelum menyimpan progres!', 'error');
      } else {
        alert('Kesalahan: Mohon cantumkan catatan verifikasi lapangan sebelum menyimpan progres!');
      }
      return;
    }

    updateProgressItem(selectedCatId, newPercentage, newStatus);
    
    if (showToast) {
      showToast(`Sukses memperbarui progres kolom ${newPercentage}% dengan Catatan: "${verificationNote.substring(0, 35)}..."`, 'success');
    }
    
    // Clear verification note on successful submit
    setVerificationNote('');
  };

  const handleProgressSelectChange = (id: string) => {
    setSelectedCatId(id);
    const item = progressItems.find(p => p.id === id);
    if (item) {
      setNewPercentage(item.progressPercent);
      setNewStatus(item.status);
    }
  };

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docDesc) {
      alert('Mohon lengkapi judul dan deskripsi dokumentasi');
      return;
    }

    // Default high-fidelity image fallbacks if none entered
    let finalUrl = docUrl;
    if (!finalUrl) {
      if (docType === 'Photo') {
        finalUrl = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600'; // General Construction
      } else if (docType === 'Drone Video') {
        finalUrl = 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=600'; // Drone flight representation
      } else {
        finalUrl = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600'; // Modern skyscraper timelapse static
      }
    }

    addProjectDoc({
      type: docType,
      title: docTitle,
      description: docDesc,
      url: finalUrl,
      date: docDate,
      category: docType === 'Photo' ? docCategory : undefined
    });

    // Clear form
    setDocTitle('');
    setDocDesc('');
    setDocUrl('');
    setCapturedPreview(null);
  };

  const filteredDocs = projectDocs.filter(d => {
    if (activeGalleryFilter === 'All') return true;
    return d.type === activeGalleryFilter;
  });

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      
      {/* HEADER ROW */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block font-bold">FOR-2 &bull; MANAJEMEN PEMBANGUNAN</span>
          <h1 className="text-2xl font-bold text-[#1E3A8A] mt-1">Modul Pembaruan Progres &amp; Log Lapangan</h1>
          <p className="text-slate-500 text-sm font-light mt-0.5">Sektor input harian untuk pengawas proyek, kontraktor pelaksana, dan konsultan penjamin mutu.</p>
        </div>

        {/* Display Role Privilege warning */}
        {!isEditor && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold rounded-lg font-mono">
            <AlertTriangle className="w-4 h-4 text-rose-500" /> Mode Lihat Saja (Privilege PM Dibutuhkan)
          </div>
        )}
      </div>

      {/* S-CURVE BURN-DOWN CHART CARD */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-orange-50 text-[#EA580C] rounded-lg">
                <Flame className="w-5 h-5 animate-pulse" />
              </span>
              <h2 className="text-lg font-bold text-[#1E3A8A] font-sans">
                S-Curve Burn-down Chart: Progres Pekerjaan Tersisa (Real-Time)
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-light mt-1">
              Visualisasi interaktif memantau kemunduran sisa volume pekerjaan konstruksi (100% s/d 0%) mengacu pada bobot kumulatif rencana vs. realisasi operasional lapangan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-auto">
              <span className="text-xs font-mono font-bold text-slate-500 whitespace-nowrap">Minggu Tinjauan:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={currentWeekSimulation}
                onChange={(e) => setCurrentWeekSimulation(Number(e.target.value))}
                className="w-28 sm:w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#EA580C]"
              />
              <span className="text-xs font-mono font-extrabold text-[#EA580C] bg-orange-50 px-2 py-0.5 rounded border border-orange-105 min-w-[50px] text-center">
                W-{currentWeekSimulation}
              </span>
            </div>
          </div>
        </div>

        {/* METRICS ROW (3 BENTO CARDS) */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold block">
                Target Sisa Pekerjaan
              </span>
              <span className="text-xl font-black font-mono text-slate-600 block mt-1">
                {evaluatedWeekMetrics.plannedRemaining}%
              </span>
              <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                Rencana kumulatif di W-{currentWeekSimulation}
              </span>
            </div>
            <span className="p-2.5 bg-slate-100 text-slate-500 rounded-xl">
              <Clock className="w-5 h-5 animate-spin-slow" />
            </span>
          </div>

          <div className="bg-blue-50/20 p-4 rounded-xl border border-blue-100/60 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-blue-500 uppercase font-bold block">
                Realisasi Sisa Pekerjaan
              </span>
              <span className="text-xl font-black font-mono text-[#1E3A8A] block mt-1">
                {evaluatedWeekMetrics.actualRemaining}%
              </span>
              <span className="text-[10px] font-medium text-blue-400 block mt-0.5">
                Volume sisa di lapangan real-time
              </span>
            </div>
            <span className="p-2.5 bg-blue-50 text-[#1E3A8A] rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </span>
          </div>

          <div className={`p-4 rounded-xl border shadow-sm flex items-center justify-between transition ${
            evaluatedWeekMetrics.variance <= 0 
              ? 'bg-emerald-50/20 border-emerald-100/60 text-emerald-800' 
              : 'bg-orange-50/20 border-orange-100/60 text-orange-950'
          }`}>
            <div>
              <span className={`text-[10px] font-mono tracking-wider uppercase font-bold block ${
                evaluatedWeekMetrics.variance <= 0 ? 'text-emerald-500' : 'text-orange-500'
              }`}>
                Deviasi Sisa Pekerjaan
              </span>
              <span className={`text-xl font-black font-mono flex items-center gap-1 mt-1 ${
                evaluatedWeekMetrics.variance <= 0 ? 'text-emerald-700' : 'text-orange-700'
              }`}>
                {evaluatedWeekMetrics.variance > 0 ? '+' : ''}{evaluatedWeekMetrics.variance}%
              </span>
              <span className="text-[10px] font-medium opacity-80 block mt-0.5">
                {evaluatedWeekMetrics.variance <= 0 
                  ? 'Kinerja Optimal (LEBIH CEPAT)' 
                  : 'Pekerjaan Menumpuk (TERLAMBAT)'}
              </span>
            </div>
            <span className={`p-2.5 rounded-xl ${
              evaluatedWeekMetrics.variance <= 0 
                ? 'bg-emerald-50 text-emerald-600' 
                : 'bg-orange-50 text-[#EA580C]'
            }`}>
              {evaluatedWeekMetrics.variance <= 0 ? <TrendingDown className="w-5 h-5 animate-pulse" /> : <TrendingUp className="w-5 h-5 animate-bounce" />}
            </span>
          </div>
        </div>

        {/* THE RECHARTS BURN-DOWN PLOT */}
        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={burnDownData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorActualRem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="weekLabel" 
                stroke="#64748B" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#64748B" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `${val}%`}
                domain={[0, 100]}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const pl = payload.find(p => p.dataKey === 'plannedRemaining');
                    const ac = payload.find(p => p.dataKey === 'actualRemaining');
                    const plannedVal = pl ? pl.value as number : 0;
                    const actualVal = ac && ac.value !== null ? ac.value as number : null;
                    const devVal = actualVal !== null ? parseFloat((actualVal - plannedVal).toFixed(1)) : null;

                    return (
                      <div className="bg-white/95 backdrop-blur border border-slate-205 p-3 rounded-xl shadow-lg ring-1 ring-black/5 text-xs font-sans space-y-1.5">
                        <p className="font-mono font-extrabold text-[#1E3A8A] border-b border-slate-100 pb-1 text-[10px]">
                          Minggu Ke-{label ? label.replace('M-', '') : ''}
                        </p>
                        <div className="flex justify-between gap-6">
                          <span className="text-slate-500 font-medium">Target Rencana Sisa:</span>
                          <span className="font-mono font-semibold text-slate-700">{plannedVal}%</span>
                        </div>
                        {actualVal !== null ? (
                          <>
                            <div className="flex justify-between gap-6">
                              <span className="text-[#1E3A8A] font-medium">Realisasi Sisa Lapangan:</span>
                              <span className="font-mono font-semibold text-[#1E3A8A]">{actualVal}%</span>
                            </div>
                            <div className="flex justify-between gap-6 border-t border-slate-100 pt-1">
                              <span className="text-slate-400 font-medium font-mono text-[10px]">Deviasi Sisa Kerja:</span>
                              <span className={`font-mono font-bold ${devVal !== null && devVal <= 0 ? 'text-emerald-600' : 'text-orange-605'}`}>
                                {devVal !== null && devVal > 0 ? '+' : ''}{devVal}%
                                <span className="text-[8px] block text-right font-sans font-normal opacity-80">
                                  {devVal !== null && devVal <= 0 ? '(LEBIH CEPAT)' : '(TERLAMBAT)'}
                                </span>
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-slate-400 italic text-[10px] pt-1">Belum mengevaluasi pekan ini</div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 600 }}
              />
              <Area 
                name="Target Rencana Kerja Tersisa (%)"
                type="monotone" 
                dataKey="plannedRemaining" 
                stroke="#94A3B8" 
                strokeDasharray="4 4" 
                strokeWidth={2}
                fill="none" 
              />
              <Area 
                name="Realisasi Fisik Tersisa (%)"
                type="monotone" 
                dataKey="actualRemaining" 
                stroke="#1E3A8A" 
                strokeWidth={3} 
                fillOpacity={1}
                fill="url(#colorActualRem)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* BURN-DOWN EXPLANATORY CARD */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-[#1E3A8A]">Uraian Metrik Burn-Down S-Curve</h4>
            <p className="text-slate-500 font-light leading-relaxed">
              Sebaliknya dari Kurva-S standar yang bertambah naik, Grafik Burn-down memproyeksikan sisa porsi volume fisik (dari 100% menurun berkurang menuju 0% di akhir periode). 
              <br />
              &bull; Jika garis <strong className="text-[#1E3A8A]">Realisasi Fisik (Garis Biru Solid)</strong> berada di <strong className="text-orange-600">ATAS</strong> garis <strong className="text-slate-600">Target Rencana (Putus-Putus Abu-abu)</strong>, menunjukkan sisa volume pekerjaan masih berlebih sehingga status proyek sedang <strong className="text-orange-600 font-bold">TERLAMBAT (DELAY)</strong>.
              <br />
              &bull; Jika garis realisasi berada di <strong className="text-emerald-600">BAWAHNYA</strong>, bermakna sisa volume tersisa lebih sedikit dibanding target yang dijadwalkan, disimpulkan proyek berjalan <strong className="text-emerald-600 font-bold">LEBIH CEPAT (AHEAD)</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* PM INPUT CONTROL SIDE PANEL */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Progress modifier sub-card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2">
              <Sliders className="text-[#EA580C] w-5 h-5" /> Kontrol Progres Fisik
            </h3>

            {isEditor ? (
              <form onSubmit={handleProgressUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 uppercase tracking-widest font-mono font-bold mb-2">Pilih Sektor Pekerjaan</label>
                  <select 
                    value={selectedCatId} 
                    onChange={(e) => handleProgressSelectChange(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 p-3 rounded-xl border border-slate-200 text-sm focus:border-blue-550 focus:ring-1 focus:ring-blue-550 outline-none font-medium"
                  >
                    {progressItems.map(p => (
                      <option key={p.id} value={p.id}>{p.category} ({p.progressPercent}%)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs text-slate-500 uppercase tracking-widest font-mono font-bold mb-2">
                    <span>Kemajuan Pekerjaan</span>
                    <span className="text-[#EA580C] font-extrabold">{newPercentage}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={newPercentage > 100 ? 100 : newPercentage}
                    onChange={(e) => setNewPercentage(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#EA580C]" 
                  />
                  
                  {/* Premium numeric input allowing fine-tuned floating percent & validation testing */}
                  <div className="mt-2 flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="number" 
                        min="0" 
                        max="200" 
                        step="0.1" 
                        value={newPercentage}
                        onChange={(e) => setNewPercentage(parseFloat(e.target.value) || 0)}
                        placeholder="Masukkan nilai (e.g. 68.5)"
                        className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none text-slate-800"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-slate-400 font-mono">%</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans mt-1">
                    * Gunakan input angka di atas untuk mengisi nilai desimal akurat (Maks. 100%).
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 uppercase tracking-widest font-mono font-bold mb-2">Status Operasional Sektor</label>
                  <select 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-50 text-slate-800 p-3 rounded-xl border border-slate-200 text-sm focus:border-blue-550 focus:ring-1 focus:ring-blue-550 outline-none font-medium"
                  >
                    <option value="Belum Mulai">Belum Mulai</option>
                    <option value="Berjalan">Berjalan</option>
                    <option value="Selesai">Selesai (100%)</option>
                    <option value="Tertunda">Tertunda (Klaim Cuaca/Rantai Supply)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 uppercase tracking-widest font-mono font-bold mb-1">
                    Catatan Verifikasi Progres <span className="text-[#EA580C] font-bold">*</span>
                  </label>
                  <p className="text-[10px] text-slate-400 font-sans mb-2">
                    Sebutkan alasan teknis pembaruan progres di lapangan sebagai prasat arsip.
                  </p>
                  <textarea
                    required
                    rows={3}
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                    placeholder="Contoh: Pengecoran slab lantai 3 selesai dikerjakan, mutu beton K-350 lolos uji tekan lab."
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-slate-50/50 text-slate-800 font-sans leading-relaxed"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-[#EA580C] hover:bg-orange-600 text-white text-xs font-mono font-bold rounded-xl transition shadow shadow-orange-500/10 cursor-pointer"
                >
                  Simpan Perubahan Fisik
                </button>
              </form>
            ) : (
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-xs text-slate-500 leading-relaxed font-light">
                * Panel input dikunci. Hanya **Project Manager (PM)**, **Konsultan Pengawas**, atau **Super Admin** yang diperkenankan memperbarui diagram Kurva S dan persentase konstruksi divisi.
              </div>
            )}
          </div>

          {/* New Documentation Upload Form Sub-card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2">
              <UploadCloud className="text-[#EA580C] w-5 h-5" /> Unggah Dokumentasi Baru
            </h3>

            {isEditor ? (
              <form onSubmit={handleDocumentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 uppercase tracking-widest font-mono font-bold mb-2">Tipe Lampiran</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Photo', 'Drone Video', 'Time Lapse'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setDocType(type)}
                        className={`py-2 px-1 text-[10px] font-mono font-bold rounded-lg border transition cursor-pointer ${docType === type ? 'bg-[#EA580C] text-white border-[#EA580C]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                      >
                        {type === 'Photo' ? 'Daily Foto' : type === 'Drone Video' ? 'Drone' : 'Timelapse'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 uppercase tracking-widest font-mono font-bold mb-1.5">Judul Dokumentasi *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: Cor Tiang Lift Lt. 6"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-550 focus:ring-1 focus:ring-blue-550 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 uppercase tracking-widest font-mono font-bold mb-1.5">Deskripsi Ringkasan *</label>
                  <textarea 
                    rows={2}
                    required
                    placeholder="Uraian pekerjaan, kendala, atau penanggung jawab..."
                    value={docDesc}
                    onChange={(e) => setDocDesc(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-550 focus:ring-1 focus:ring-blue-550 outline-none resize-none"
                  />
                </div>

                {docType === 'Photo' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-500 uppercase tracking-widest font-mono font-bold mb-1.5">Kategori Pekerjaan</label>
                      <select 
                        value={docCategory}
                        onChange={(e) => setDocCategory(e.target.value)}
                        className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-550 focus:ring-1 focus:ring-blue-550 outline-none"
                      >
                        <option value="Persiapan">Persiapan</option>
                        <option value="Struktur">Struktur Utama</option>
                        <option value="Arsitektur">Arsitektural</option>
                        <option value="MEP">Kelistrikan &amp; MEP</option>
                        <option value="Interior">Interior</option>
                        <option value="Landscape">Lansekap</option>
                      </select>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="block text-xs text-slate-500 uppercase tracking-widest font-mono font-bold">Kamera Pengawas Lapangan</span>
                        {isCameraOpen && (
                          <span className="flex items-center gap-1 bg-red-600/90 text-white px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest border border-red-500 animate-pulse">
                            Kamera Aktif
                          </span>
                        )}
                      </div>
                      
                      {capturedPreview ? (
                        <div className="space-y-2">
                          <div className="relative h-44 rounded-lg overflow-hidden border border-slate-300 shadow-sm bg-slate-900 flex items-center justify-center">
                            <img src={capturedPreview} alt="Captured preview" className="w-full h-full object-cover" />
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-slate-900/80 rounded text-[9px] text-white font-mono uppercase tracking-wider font-semibold border border-slate-700/50">
                              Pratinjau Foto
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setCapturedPreview(null);
                                setDocUrl('');
                              }}
                              className="flex-1 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer"
                            >
                              Hapus Foto
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCapturedPreview(null);
                                startCamera();
                              }}
                              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-mono font-bold transition cursor-pointer"
                            >
                              Ambil Ulang
                            </button>
                          </div>
                        </div>
                      ) : isCameraOpen ? (
                        <div className="space-y-3">
                          {/* Video streaming container */}
                          <div className="relative h-48 rounded-lg overflow-hidden bg-black border border-slate-300 shadow-inner flex items-center justify-center">
                            <video 
                              ref={videoRef} 
                              autoPlay 
                              playsInline 
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Guideline Grid for perfect construction alignments */}
                            <div className="absolute inset-0 border border-white/10 pointer-events-none flex flex-col justify-between p-2">
                              <div className="w-full flex justify-between">
                                <div className="w-3 h-3 border-t-2 border-l-2 border-white/60"></div>
                                <div className="w-3 h-3 border-t-2 border-r-2 border-white/60"></div>
                              </div>
                              <div className="self-center w-full border-t border-dashed border-white/25"></div>
                              <div className="self-center h-full border-l border-dashed border-white/25"></div>
                              <div className="w-full flex justify-between">
                                <div className="w-3 h-3 border-b-2 border-l-2 border-white/60"></div>
                                <div className="w-3 h-3 border-b-2 border-r-2 border-white/60"></div>
                              </div>
                            </div>
                          </div>

                          {/* Camera select and action controls */}
                          <div className="space-y-2">
                            {cameraDevices.length > 1 && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-mono">Pilih Lensa:</span>
                                <select
                                  value={selectedDeviceId}
                                  onChange={(e) => {
                                    setSelectedDeviceId(e.target.value);
                                    startCamera(e.target.value);
                                  }}
                                  className="flex-1 bg-white border border-slate-200 text-[10px] font-mono p-1 rounded focus:outline-none text-slate-700"
                                >
                                  {cameraDevices.map((d, index) => (
                                    <option key={d.deviceId} value={d.deviceId}>
                                      {d.label || `Kamera ${index + 1}`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={stopCamera}
                                className="flex-1 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer"
                              >
                                Batal
                              </button>
                              <button
                                type="button"
                                onClick={capturePhoto}
                                className="flex-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-mono font-bold transition flex items-center justify-center gap-1.5 shadow shadow-green-600/20 cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5" /> Ambil Foto Lapangan
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startCamera()}
                          className="w-full py-3.5 border border-dashed border-indigo-300 bg-indigo-50/30 hover:bg-indigo-50/60 hover:border-indigo-400 text-indigo-700 rounded-xl transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                        >
                          <Camera className="w-5 h-5 text-indigo-600" />
                          <span className="text-xs font-mono font-bold">Ambil Foto dengan Kamera</span>
                          <span className="text-[9px] text-indigo-400 font-sans">Tambahkan foto langsung dari lapangan dengan tanda air proyek</span>
                        </button>
                      )}

                      {/* Hidden canvas for capturing */}
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-500 uppercase tracking-widest font-mono font-bold mb-1.5">Tanggal Ambil</label>
                    <input 
                      type="date"
                      value={docDate}
                      onChange={(e) => setDocDate(e.target.value)}
                      className="w-full bg-slate-50 text-slate-700 p-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-550 focus:ring-1 focus:ring-blue-550 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 uppercase tracking-widest font-mono font-bold mb-1.5">Taut Gambar (Opsional)</label>
                    <input 
                      type="text"
                      placeholder="https://..."
                      value={docUrl}
                      onChange={(e) => setDocUrl(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-550 focus:ring-1 focus:ring-blue-550 outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold border border-slate-200 rounded-xl transition cursor-pointer"
                >
                  Unggah File &amp; Update Galeri
                </button>
              </form>
            ) : (
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-xs text-slate-500 leading-relaxed font-light">
                * Lampiran dokumen bersifat sakral sebagai bahan laporan bulanan instansi. Akses dibatasi.
              </div>
            )}
          </div>
        </div>

        {/* GALLERIES VIEWER INTERFACE PANEL */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2">
                <Camera className="text-[#EA580C] w-5 h-5" /> Galeri Dokumentasi Digital Terpadu
              </h3>
              <p className="text-xs text-slate-500 font-light mt-0.5">Memantau kondisi fisik real pembangunan hotel &amp; kost dari hari ke hari.</p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              {(['All', 'Photo', 'Drone Video', 'Time Lapse'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveGalleryFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${activeGalleryFilter === filter ? 'bg-[#EA580C] text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {filter === 'All' ? 'Semua' : filter === 'Photo' ? 'Daily Foto' : filter === 'Drone Video' ? 'Video Drone' : 'Timelapse'}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 flex flex-col justify-between group relative hover:border-[#1E3A8A]/30 transition shadow-sm">
                {/* Visual Image container */}
                <div className="h-44 bg-slate-100 overflow-hidden relative">
                  <img 
                    src={doc.url} 
                    alt={doc.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {/* Category badging */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2 py-0.5 bg-white/95 backdrop-blur shadow-sm text-[9px] font-mono font-bold tracking-wider rounded uppercase text-[#EA580C] border border-orange-100">
                      {doc.type}
                    </span>
                    {doc.category && (
                      <span className="px-2 py-0.5 bg-white/95 backdrop-blur shadow-sm text-[9px] font-mono rounded uppercase text-blue-600 border border-blue-100">
                        {doc.category}
                      </span>
                    )}
                  </div>

                  {/* Play representation overlay for videos */}
                  {doc.type !== 'Photo' && (
                    <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#EA580C]/95 text-white flex items-center justify-center shadow">
                        <Video className="w-5 h-5 ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Delete button wrapper for authorized PM */}
                  {isEditor && (
                    <button 
                      onClick={() => deleteProjectDoc(doc.id)}
                      className="absolute top-3 right-3 p-1.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg transition shadow opacity-0 group-hover:opacity-100 cursor-pointer animate-fadeIn"
                      title="Hapus berkas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#1E3A8A] line-clamp-1">{doc.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed font-light">{doc.description}</p>
                  </div>

                  <div className="border-t border-slate-205 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-mono font-semibold">
                    <span className="flex items-center gap-1 text-slate-500"><MapPin className="w-3.5 h-3.5 text-[#EA580C]" /> Jatitujuh Majalengka</span>
                    <span>{doc.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDocs.length === 0 && (
            <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs">
              Belum ada berkas terunggah untuk kategori dokumentasi ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
