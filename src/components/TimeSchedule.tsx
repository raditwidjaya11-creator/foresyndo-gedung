import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ReferenceLine
} from 'recharts';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Settings, 
  Edit3, 
  Plus, 
  Trash2, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Download, 
  RefreshCw, 
  Sliders, 
  Activity,
  Award,
  FileText,
  AlertTriangle,
  BellRing
} from 'lucide-react';

interface ScheduleTask {
  id: string;
  category: string;
  startWeek: number; // 1 to 20
  endWeek: number; // 2 to 20
  weight: number; // Percentage out of 100
}

export const TimeSchedule: React.FC = () => {
  const { progressItems, projectStats, currentRole, showToast } = useApp();

  const isEditor = currentRole === 'Super Admin' || currentRole === 'Project Manager' || currentRole === 'Konsultan';

  // Base initial schedule mapping to the 8 standard departments
  const [tasks, setTasks] = useState<ScheduleTask[]>([
    { id: 'sch1', category: 'Persiapan', startWeek: 1, endWeek: 3, weight: 5 },
    { id: 'sch2', category: 'Pondasi', startWeek: 2, endWeek: 6, weight: 10 },
    { id: 'sch3', category: 'Basement', startWeek: 4, endWeek: 8, weight: 12 },
    { id: 'sch4', category: 'Struktur', startWeek: 6, endWeek: 14, weight: 35 },
    { id: 'sch5', category: 'Arsitektur', startWeek: 10, endWeek: 17, weight: 20 },
    { id: 'sch6', category: 'MEP', startWeek: 11, endWeek: 18, weight: 10 },
    { id: 'sch7', category: 'Interior', startWeek: 14, endWeek: 19, weight: 6 },
    { id: 'sch8', category: 'Landscape', startWeek: 17, endWeek: 20, weight: 2 }
  ]);

  // UI States
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [currentWeekSimulation, setCurrentWeekSimulation] = useState<number>(12); // The default week representing current time 
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [tempStart, setTempStart] = useState<number>(1);
  const [tempEnd, setTempEnd] = useState<number>(5);
  const [tempWeight, setTempWeight] = useState<number>(5);

  // Form states for adding new task
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newCat, setNewCat] = useState<string>('');
  const [newStart, setNewStart] = useState<number>(1);
  const [newEnd, setNewEnd] = useState<number>(4);
  const [newWeight, setNewWeight] = useState<number>(5);

  const totalTaskWeight = useMemo(() => {
    return tasks.reduce((sum, t) => sum + t.weight, 0);
  }, [tasks]);

  // Map progress items from global AppState to the task items
  const tasksWithProgress = useMemo(() => {
    return tasks.map(t => {
      // Find matching progress percentage in AppState
      const match = progressItems.find(p => p.category.toLowerCase() === t.category.toLowerCase());
      const progressPercent = match ? match.progressPercent : 0;
      const status = match ? match.status : 'Belum Mulai';
      
      return {
        ...t,
        progressPercent,
        status,
        completedWeight: (progressPercent / 100) * t.weight
      };
    });
  }, [tasks, progressItems]);

  // Generate curves matrices for Week 1 to 20
  const scheduleCurveData = useMemo(() => {
    const totalWeeks = 20;
    const weeklyPlanned = Array(totalWeeks).fill(0);
    const weeklyActual = Array(totalWeeks).fill(0);

    // Calculate Planned S-Curve (linear distribution per active week block)
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

    // Calculate Actual S-Curve (releasing weight incrementally according to the progress percentage)
    // We assume the actual progress is spread uniformly from the task's start up to is current progress age
    // which is capped at current simulated week or end week.
    tasksWithProgress.forEach(task => {
      const activeDuration = task.endWeek - task.startWeek + 1;
      if (activeDuration > 0 && task.progressPercent > 0) {
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

    // Accumulate weights to form cumulative curve lines
    let accumulatedPlanned = 0;
    let accumulatedActual = 0;
    
    return Array.from({ length: totalWeeks }, (_, index) => {
      const weekNum = index + 1;
      accumulatedPlanned += weeklyPlanned[index];
      
      // Actual accumulated up to simulation line
      if (weekNum <= currentWeekSimulation) {
        accumulatedActual += weeklyActual[index];
      }

      // To keep a neat exact 100% cap at the final target week for planned
      const roundedPlanned = Math.min(100, Math.round(accumulatedPlanned * 10) / 10);
      const roundedActual = weekNum <= currentWeekSimulation ? Math.min(100, Math.round(accumulatedActual * 10) / 10) : null;

      // Variance (deviasi) calculation
      const variance = roundedActual !== null ? (roundedActual - roundedPlanned) : null;

      return {
        week: weekNum,
        plannedIncremental: weeklyPlanned[index],
        plannedCumulative: roundedPlanned,
        actualIncremental: weekNum <= currentWeekSimulation ? weeklyActual[index] : 0,
        actualCumulative: roundedActual,
        variance: variance !== null ? Math.round(variance * 10) / 10 : null
      };
    });
  }, [tasksWithProgress, currentWeekSimulation]);

  // Current stats derived from simulated week
  const currentWeekMetrics = useMemo(() => {
    const data = scheduleCurveData[currentWeekSimulation - 1];
    if (!data) return { planned: 0, actual: 0, variance: 0 };
    return {
      planned: data.plannedCumulative,
      actual: data.actualCumulative ?? 0,
      variance: data.variance ?? 0
    };
  }, [scheduleCurveData, currentWeekSimulation]);

  // Real-Time Automatic Alerts for progress deviations <= -15%
  const autoAlertData = useMemo(() => {
    const isCumulativeBreached = currentWeekMetrics.variance <= -15;
    
    // Check individual tasks to find any category that has fallen 15% or more below its expected linear progress
    const delayedSectors = tasksWithProgress.map(task => {
      const duration = task.endWeek - task.startWeek + 1;
      let expectedLinearProgress = 0;
      if (currentWeekSimulation >= task.endWeek) {
        expectedLinearProgress = 100;
      } else if (currentWeekSimulation >= task.startWeek) {
        const elapsed = currentWeekSimulation - task.startWeek + 1;
        expectedLinearProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      }
      
      const deficit = task.progressPercent - expectedLinearProgress;
      const isBreaching = deficit <= -15;

      // Recommended recovery guides for each category
      let recoveryAction = "Percepat pengerjaan sub-sektor di lapangan.";
      const catLower = task.category.toLowerCase();
      if (catLower.includes("persiapan")) {
        recoveryAction = "Kerahkan tim pembersihan lahan tambahan & sewa peralatan berat tambahan (excavator, bulldozer).";
      } else if (catLower.includes("pondasi")) {
        recoveryAction = "Tambahkan rig bore-pile kedua, adakan lembur pengecoran bored-pile malam hari berkelanjutan.";
      } else if (catLower.includes("basement")) {
        recoveryAction = "Pasang sistem pompa dewatering berkapasitas tinggi pencegah genangan air hujan malam hari.";
      } else if (catLower.includes("struktur")) {
        recoveryAction = "Tingkatkan produktivitas cetakan beton bekisting dengan sistem aluminum formwork modern.";
      } else if (catLower.includes("arsitektur")) {
        recoveryAction = "Rekrut tukang plester/cat lokal paralel & distribusikan material semen ke seluruh lantai.";
      } else if (catLower.includes("mep")) {
        recoveryAction = "Terapkan fast-tracking paralel untuk penarikan kabel utama vertikal & tray baja.";
      } else if (catLower.includes("interior")) {
        recoveryAction = "Mulai fabrikasi mebel di workshop eksternal paralel sebelum dipasang langsung di ruangan.";
      } else if (catLower.includes("landscape")) {
        recoveryAction = "Gunakan paving-block pra-cetak agar pemasangan area luar berlangsung cepat tanpa cor basah.";
      }

      return {
        category: task.category,
        startWeek: task.startWeek,
        endWeek: task.endWeek,
        weight: task.weight,
        progressPercent: task.progressPercent,
        expectedProgress: expectedLinearProgress,
        deficit: Math.abs(deficit),
        isBreaching,
        recoveryAction
      };
    }).filter(t => t.isBreaching);

    const hasAlert = isCumulativeBreached || delayedSectors.length > 0;

    return {
      hasAlert,
      isCumulativeBreached,
      cumulativeDeficit: Math.abs(currentWeekMetrics.variance),
      delayedSectors
    };
  }, [currentWeekMetrics, tasksWithProgress, currentWeekSimulation]);

  // Handle Edit Submission
  const handleEditTask = (taskId: string) => {
    if (tempStart > tempEnd) {
      showToast('Minggu mulai tidak boleh lebih besar dari minggu selesai', 'error');
      return;
    }
    
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          startWeek: tempStart,
          endWeek: tempEnd,
          weight: tempWeight
        };
      }
      return t;
    }));
    setEditingTaskId(null);
    showToast('Item jadwal berhasil disimpan dan Kurva-S dikalkulasi ulang!', 'success');
  };

  // Start Edit Mode helper
  const startEditMode = (task: ScheduleTask) => {
    setEditingTaskId(task.id);
    setTempStart(task.startWeek);
    setTempEnd(task.endWeek);
    setTempWeight(task.weight);
  };

  // Delete task helper
  const handleDeleteTask = (id: string) => {
    if (tasks.length <= 3) {
      showToast('Kurva membutuhkan minimal 3 item sektor pekerjaan pelaksana', 'error');
      return;
    }
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast('Pekerjaan dihapus. Bobot perencanaan diperbarui.', 'info');
  };

  // Handle Add Task Submission
  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) {
      showToast('Uraian kelompok pekerjaan tidak boleh kosong', 'error');
      return;
    }
    if (newStart > newEnd) {
      showToast('Minggu mulai harus mendahului minggu selesai', 'error');
      return;
    }

    const newTask: ScheduleTask = {
      id: `sch_${Date.now()}`,
      category: newCat.trim(),
      startWeek: newStart,
      endWeek: newEnd,
      weight: newWeight
    };

    setTasks(prev => [...prev, newTask]);
    setNewCat('');
    setShowAddForm(false);
    showToast('Tugas jadwal baru berhasil ditambahkan ke matriks Kurva-S!', 'success');
  };

  // Helper with CORS to parse web image to canvas base 64 string
  const fetchBase64Image = (url: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            resolve(canvas.toDataURL('image/png'));
          } catch (e) {
            resolve('');
          }
        } else {
          resolve('');
        }
      };
      img.onerror = () => resolve('');
      img.src = url;
    });
  };

  // Export current schedule to official PDF format
  const handleExportPDF = async () => {
    showToast('Sedang mempersiapkan perenderan laporan PDF resmi...', 'info');

    const origin = window.location.origin;
    const estQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(origin + '/?verify=EST-TIME-SCH-002')}`;
    const pmQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(origin + '/?verify=PM-TIME-SCH-002')}`;

    try {
      const [estQrBase64, pmQrBase64] = await Promise.all([
        fetchBase64Image(estQrUrl),
        fetchBase64Image(pmQrUrl)
      ]);

      const doc = new jsPDF('p', 'mm', 'a4');

      // --- PAGE 1: EXECUTIVE COVER & WORK DIVISIONS ---
      // Outer border frame
      doc.setDrawColor(30, 58, 138); // Navy blue 900
      doc.setLineWidth(1);
      doc.rect(8, 8, 194, 281);
      doc.rect(9, 9, 192, 279);

      // Corporate Banner
      doc.setFillColor(30, 58, 138);
      doc.rect(10, 10, 190, 22, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('PT FORESYNDO GLOBAL INDONESIA', 20, 19);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('TIME SCHEDULE & SCHEDULE OPTIMIZATION INTERNAL SYSTEM', 20, 26);

      // Title Block
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('JADWAL PELAKSANAAN KERJA (TIME SCHEDULE)', 20, 42);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('KURVA-S INTEGRAL & STRUKTUR PERENCANAAN PROGRES FISIK', 20, 48);

      // Divider line
      doc.setDrawColor(234, 88, 12); // Orange 600
      doc.setLineWidth(1.5);
      doc.line(20, 52, 190, 52);

      // Metadatas
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('PARAMETER TIME SCHEDULE', 20, 60);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(8);

      // Column 1
      doc.setFont('helvetica', 'bold'); doc.text('Nama Proyek:', 20, 67); doc.setFont('helvetica', 'normal');
      doc.text('Pembangunan Gedung 7 Lantai (Foresyndo 2)', 46, 67);
      
      doc.setFont('helvetica', 'bold'); doc.text('Nilai RAB:', 20, 72); doc.setFont('helvetica', 'normal');
      doc.text('Rp 14.472.000.000 (Rp 14,47 M)', 46, 72);

      doc.setFont('helvetica', 'bold'); doc.text('Lokasi:', 20, 77); doc.setFont('helvetica', 'normal');
      doc.text('Kab. Majalengka, Jawa Barat', 46, 77);

      doc.setFont('helvetica', 'bold'); doc.text('Kontraktor:', 20, 82); doc.setFont('helvetica', 'normal');
      doc.text('PT Foresyndo Global Indonesia', 46, 82);

      // Column 2
      doc.setFont('helvetica', 'bold'); doc.text('Tanggal Cetak:', 115, 67); doc.setFont('helvetica', 'normal');
      doc.text(`${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')} WIB`, 140, 67);
      
      doc.setFont('helvetica', 'bold'); doc.text('Simulasi Pekan:', 115, 72); doc.setFont('helvetica', 'normal');
      doc.text(`Minggu Ke-${currentWeekSimulation} dari 20 Pekan`, 140, 72);

      doc.setFont('helvetica', 'bold'); doc.text('Deviasi Kerja:', 115, 77); doc.setFont('helvetica', 'normal');
      doc.text(`${currentWeekMetrics.variance >= 0 ? '+' : ''}${currentWeekMetrics.variance}% (${currentWeekMetrics.variance >= 0 ? 'CEPAT / AHEAD' : 'TERLAMBAT / DELAY'})`, 140, 77);

      doc.setFont('helvetica', 'bold'); doc.text('Akumulasi Aktual:', 115, 82); doc.setFont('helvetica', 'normal');
      doc.text(`${currentWeekMetrics.actual}% (Target Rencana: ${currentWeekMetrics.planned}%)`, 140, 82);

      // Metrics Status Indicator Banner
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.rect(20, 88, 170, 22, 'FD');

      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('ANALISIS STATUS EFISIENSI & PERCEPATAN WAKTU JADWAL', 25, 94);

      if (currentWeekMetrics.variance >= 0) {
        doc.setTextColor(22, 101, 52); // Green 800
        doc.setFontSize(10);
        doc.text(`STATUS PROYEK: SEHAT & OPTIMAL (+${currentWeekMetrics.variance}%)`, 25, 102);
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text('Koordinasi logistik dan pengadaan berada pada jalur kritis yang efisien. Pertahankan efisiensi suplai.', 102, 102);
      } else {
        doc.setTextColor(194, 65, 12); // Orange / red 700
        doc.setFontSize(10);
        doc.text(`STATUS PROYEK: TERLAMBAT / DELAY (${currentWeekMetrics.variance}%)`, 25, 102);
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text('Disarankan penambahan jam kerja lembur (overtime) & fast-tracking di area kritis arsitektural.', 102, 102);
      }

      // Title for Tasks Table
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('MATRIKS PEKERJAAN & PEMBOBOTAN SEKTORAL', 20, 118);

      const taskRows = tasksWithProgress.map((task, idx) => {
        return [
          idx + 1,
          task.category,
          `W-${task.startWeek} s/d W-${task.endWeek}`,
          `${task.endWeek - task.startWeek + 1} Pekan`,
          `${task.weight}%`,
          `${task.progressPercent}%`,
          task.status
        ];
      });

      autoTable(doc, {
        startY: 122,
        margin: { left: 20, right: 20 },
        head: [['No', 'Uraian Kelompok Pekerjaan', 'Rentang Rencana', 'Durasi', 'Bobot Rencana', 'Kemajuan Fisik', 'Status Kerja']],
        body: taskRows,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138], fontSize: 8, font: 'helvetica', fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, font: 'helvetica' },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { cellWidth: 55 },
          2: { halign: 'center', cellWidth: 30 },
          3: { halign: 'center', cellWidth: 15 },
          4: { halign: 'center', cellWidth: 20 },
          5: { halign: 'center', cellWidth: 20 },
          6: { halign: 'center', cellWidth: 20 }
        }
      });

      // footer with page number
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Dicetak melalui Foresyndo Internal System. Hak Cipta dilindungi.`, 20, 282);
      doc.text(`Halaman 1 dari 2`, 190 - 10, 282);


      // --- PAGE 2: S-CURVE WEEKLY REKAP & DIGITAL SIGNATURES ---
      doc.addPage();
      
      // Page 2 frame
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(1);
      doc.rect(8, 8, 194, 281);
      doc.rect(9, 9, 192, 279);

      // Page 2 Brand Banner
      doc.setFillColor(30, 58, 138);
      doc.rect(10, 10, 190, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('PT FORESYNDO GLOBAL INDONESIA - TIME SCHEDULE & KURVA-S REKAPITULASI', 15, 18);

      // Section Title
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('DETAIL DATA PERKEMBANGAN KUMULATIF MINGGUAN (KURVA-S)', 15, 30);

      // Build data grid for 20 weeks
      const curveRows = scheduleCurveData.map((wData) => {
        const isPastOrCurrent = wData.week <= currentWeekSimulation;
        const varianceVal = wData.variance;
        let statusText = '-';
        if (isPastOrCurrent && varianceVal !== null) {
          statusText = varianceVal >= 0 ? 'Ahead (+)' : 'Delay (-)';
        }
        return [
          `Minggu Ke-${wData.week}`,
          `${wData.plannedIncremental.toFixed(1)}%`,
          `${wData.plannedCumulative.toFixed(1)}%`,
          isPastOrCurrent ? `${wData.actualIncremental.toFixed(1)}%` : '-',
          isPastOrCurrent ? `${(wData.actualCumulative ?? 0).toFixed(1)}%` : '-',
          isPastOrCurrent && varianceVal !== null ? `${varianceVal >= 0 ? '+' : ''}${varianceVal.toFixed(1)}%` : '-',
          statusText
        ];
      });

      autoTable(doc, {
        startY: 34,
        margin: { left: 15, right: 15 },
        head: [['Minggu', 'Rencana Pekan', 'Kumulatif Rencana', 'Realisasi Pekan', 'Kumulatif Realisasi', 'Deviasi Kumulatif', 'Keterangan']],
        body: curveRows,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138], fontSize: 7.5, font: 'helvetica', fontStyle: 'bold' },
        bodyStyles: { fontSize: 7, font: 'helvetica' },
        columnStyles: {
          0: { halign: 'center', cellWidth: 20 },
          1: { halign: 'right', cellWidth: 22 },
          2: { halign: 'right', cellWidth: 27 },
          3: { halign: 'right', cellWidth: 22 },
          4: { halign: 'right', cellWidth: 30 },
          5: { halign: 'center', cellWidth: 28 },
          6: { halign: 'center', cellWidth: 31 }
        }
      });

      // Digital signoff
      // Render Signatures
      let currentY = (doc as any).lastAutoTable.finalY + 12;
      if (currentY > 210) {
        doc.addPage();
        // Frame on added page
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(1);
        doc.rect(8, 8, 194, 281);
        doc.rect(9, 9, 192, 279);
        currentY = 25;
      }

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(15, currentY, 195, currentY);

      // Section title
      doc.setTextColor(30, 58, 138); // Blue 900
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('LEMBAR SYNC & VALIDASI JADWAL PELAKSANAAN RESMI', 15, currentY + 6);
      
      doc.setDrawColor(234, 88, 12); // Orange 600
      doc.line(15, currentY + 8, 115, currentY + 8);

      const sigBoxY = currentY + 12;

      // Draw Column 1: Estimator
      doc.setFillColor(248, 250, 252);
      doc.rect(15, sigBoxY, 82, 48, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, sigBoxY, 82, 48, 'D');

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text('DISIAPKAN & DIHITUNG OLEH', 18, sigBoxY + 5);
      doc.setTextColor(30, 58, 138);
      doc.setFontSize(8);
      doc.text('Tim Perencana & Estimasi PT FGI', 18, sigBoxY + 10);

      if (estQrBase64) {
        doc.addImage(estQrBase64, 'PNG', 18, sigBoxY + 14, 22, 22);
      }
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.text('STATUS: VERIFIED ON TIME-SCH', 44, sigBoxY + 18);
      doc.text('SECURE KEY: EST-TIME-SCH-002', 44, sigBoxY + 22);
      doc.text('Daftar Perkiraan Direkonsiliasi.', 44, sigBoxY + 26);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('Eko Prasetyo, S.T.', 18, sigBoxY + 41);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text('Lead Estimator Project', 18, sigBoxY + 44);

      // Draw Column 2: PM / Lead Engineer
      doc.setFillColor(248, 250, 252);
      doc.rect(113, sigBoxY, 82, 48, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(113, sigBoxY, 82, 48, 'D');

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text('DIREVIU & DISESUAIKAN OLEH', 116, sigBoxY + 5);
      doc.setTextColor(30, 58, 138);
      doc.setFontSize(8);
      doc.text('Project Manager & Engineering', 116, sigBoxY + 10);

      if (pmQrBase64) {
        doc.addImage(pmQrBase64, 'PNG', 116, sigBoxY + 14, 22, 22);
      }
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.text('STATUS: VALIDATED OK', 142, sigBoxY + 18);
      doc.text('SECURE KEY: PM-TIME-SCH-002', 142, sigBoxY + 22);
      doc.text('Disetujui untuk Laporan Bulanan.', 142, sigBoxY + 26);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('Ir. Hermawan Baskoro, M.T.', 116, sigBoxY + 41);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text('Engineering & Project Director', 116, sigBoxY + 44);

      // footer with page number
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Dicetak melalui Foresyndo Internal System. Hak Cipta dilindungi.`, 15, 282);
      doc.text(`Halaman 2 dari 2`, 190 - 10, 282);

      doc.save(`Foresyndo2_TimeSchedule_Minggu_${currentWeekSimulation}.pdf`);
      showToast('Berkas PDF Berhasil Diekspor!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Gagal memproses ekspor PDF, mendownload TXT alternatif...', 'error');
      handleExportSchedule();
    }
  };

  // Export current schedule to txt file
  const handleExportSchedule = () => {
    let outputString = `========================================================================\n`;
    outputString += `                PT. FORESYNDO GLOBAL INDONESIA\n`;
    outputString += `         TIME SCHEDULE & KURVA-S MONITORING FORESYNDO 2\n`;
    outputString += `========================================================================\n`;
    outputString += `Tanggal Cetak      : ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')} WIB\n`;
    outputString += `Simulasi Minggu Ke : ${currentWeekSimulation} (Fisik Aktual: ${projectStats.physicalProgress}%)\n`;
    outputString += `Status Deviasi     : ${currentWeekMetrics.variance >= 0 ? '+' : ''}${currentWeekMetrics.variance}% (${currentWeekMetrics.variance >= 0 ? 'CEPAT/AHEAD' : 'TERLAMBAT/DELAY'})\n`;
    outputString += `------------------------------------------------------------------------\n\n`;

    outputString += `MATRIKS HUBUNGAN BOBOT JADWAL KERJA:\n`;
    outputString += `------------------------------------------------------------------------\n`;
    outputString += `No. | Kelompok Pekerjaan     | Mng Mulai | Mng Selesai | Bobot (%) | Ak. Progres\n`;
    outputString += `------------------------------------------------------------------------\n`;
    tasksWithProgress.forEach((t, i) => {
      outputString += `${String(i+1).padEnd(3)} | ${t.category.padEnd(22)} | ${String(t.startWeek).padEnd(9)} | ${String(t.endWeek).padEnd(11)} | ${String(t.weight).padEnd(9)} | ${t.progressPercent}%\n`;
    });
    outputString += `------------------------------------------------------------------------\n`;
    outputString += `Total Alokasi Rencana Bobot: ${totalTaskWeight}%\n\n`;

    outputString += `REKAPITULASI PROGRES MINGGUAN (KURVA S):\n`;
    outputString += `------------------------------------------------------------------------\n`;
    outputString += `Minggu | Rencana Kumulatif (%) | Aktual Kumulatif (%) | Deviasi Kerja (%)\n`;
    outputString += `------------------------------------------------------------------------\n`;
    scheduleCurveData.forEach(d => {
      outputString += `M-${String(d.week).padEnd(5)} | ${String(d.plannedCumulative).padEnd(21)} | ${(d.actualCumulative !== null ? String(d.actualCumulative) : '-').padEnd(20)} | ${(d.variance !== null ? (d.variance >= 0 ? '+' : '') + d.variance : '-')}%\n`;
    });
    outputString += `========================================================================\n`;

    const blob = new Blob([outputString], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Foresyndo2_TimeSchedule_Minggu_${currentWeekSimulation}.txt`;
    link.click();
    showToast('File laporan time-schedule berhasil diekspor!', 'success');
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      
      {/* HEADER HERO */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block">PT. FGI &bull; TIME SCHEDULE &amp; MONITORING</span>
          <h1 className="text-2xl font-bold text-[#1E3A8A] mt-1">Jadwal Pelaksanaan Kerja &amp; Kurva-S</h1>
          <p className="text-slate-500 text-sm font-light mt-0.5">Analisis hubungan bobot waktu rencana (kurva S) vs realisasi lapangan secara real-time.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-gradient-to-r from-[#1E3A8A] to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white rounded-xl transition text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-sm border border-transparent"
          >
            <FileText className="w-4 h-4 text-orange-400" />
            Cetak PDF Resmi
          </button>
          <button
            onClick={handleExportSchedule}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition text-xs font-mono font-bold flex items-center gap-2 cursor-pointer border border-slate-200"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Ekspor Data TXT
          </button>
        </div>
      </div>

      {/* AUTOMATED ALERTS: NOTIFICATION ENGINE (THRESHOLD DEVIATION STATUS) */}
      {autoAlertData.hasAlert && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-red-100 text-red-600 rounded-xl relative flex justify-center items-center">
                <BellRing className="w-5 h-5 animate-pulse" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
              </span>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-red-600 font-black uppercase block">
                  REAL-TIME AUTOMATION ALERT &bull; DEVIATION BREACH
                </span>
                <h3 className="text-sm font-extrabold text-red-900 font-sans">
                  Sistem Peringatan Otomatis: Progres Kerja berada di bawah batas toleransi (-15%)
                </h3>
              </div>
            </div>
            <div className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-[10px] font-mono font-black border border-red-350">
              AMBANG BATAS LIMIT BREACHED &gt;= 15.0%
            </div>
          </div>

          <p className="text-xs text-red-850 leading-relaxed font-light">
            Sistem analisis penjadwalan mendeteksi deviasi kritis di luar batas toleransi proyek (lebih lambat dari -15% dibandingkan rencana) di Minggu ke-{currentWeekSimulation}. Diperlukan koordinasi crash-program guna mengembalikan lini perkembangan Kurva-S.
          </p>

          <div className="grid md:grid-cols-2 gap-4 pt-1">
            {/* Left Panel: Cumulative Deviation */}
            <div className="p-3.5 bg-white/70 border border-red-150 rounded-xl font-sans text-xs space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-red-600 animate-bounce" />
                <strong className="text-red-950 font-bold">Keterlambatan Kumulatif Proyek</strong>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-slate-100 pt-1.5">
                <div>
                  <span className="text-slate-400 text-[9px] block">TARGET SEHARUSNYA</span>
                  <strong className="text-slate-700 font-bold">{currentWeekMetrics.planned}%</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] block">REALISASI KINI</span>
                  <strong className="text-red-700 font-black">{currentWeekMetrics.actual}%</strong>
                </div>
              </div>
              <p className="text-[10px] text-red-800 leading-snug font-light mt-1">
                Kondisi keterlambatan kumulatif terdeteksi pada level:{' '}
                <strong className="font-mono text-red-600 font-bold text-xs">{currentWeekMetrics.variance}%</strong>. 
                Disarankan penambahan sumber daya ganda atau pembagian jam kerja lembur malam 7 hari seminggu.
              </p>
            </div>

            {/* Right Panel: Breached Individual Departments */}
            <div className="p-3.5 bg-white/70 border border-slate-150 rounded-xl text-xs space-y-3">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block tracking-wider">
                DEPARTEMEN / SEKTOR TERDAMPAK DELAY &gt;= 15%
              </span>
              
              {autoAlertData.delayedSectors.length > 0 ? (
                <div className="space-y-3 overflow-y-auto max-h-[160px] pr-1">
                  {autoAlertData.delayedSectors.map((sector) => (
                    <div key={sector.category} className="p-2 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <strong className="text-[#1E3A8A] font-bold">{sector.category}</strong>
                        <span className="font-mono text-red-600 font-bold bg-red-100 px-1 rounded text-[10px]">
                          Defisit: -{sector.deficit.toFixed(0)}%
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-400 font-mono">
                        <div>
                          <span>Saran: <strong>{sector.expectedProgress}%</strong></span>
                        </div>
                        <div>
                          <span>Fisik: <strong>{sector.progressPercent}%</strong></span>
                        </div>
                        <div>
                          <span>Bobot: <strong>{sector.weight}%</strong></span>
                        </div>
                      </div>

                      {/* Tailored recommendations */}
                      <p className="text-[10px] text-orange-850 font-light leading-snug pt-0.5 border-t border-slate-100 mt-1">
                        <strong className="text-orange-950 font-medium">Saran Korektif:</strong> {sector.recoveryAction}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-xs italic py-3 flex items-center gap-1">
                  <Info className="w-4 h-4 text-slate-400" />
                  <span>Tidak ada deviasi internal divisi penanggung jawab harian di atas 15%.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* THREE BENTO METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-gradient-to-br from-[#1E3A8A] to-blue-900 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden border border-blue-850">
          <div className="absolute right-3 top-3 opacity-15">
            <Calendar className="w-16 h-16 text-white" />
          </div>
          <span className="text-[10px] font-mono tracking-wider text-blue-200 uppercase font-semibold">Simulasi Minggu Proyek</span>
          <div className="flex items-center gap-3 mt-1.5Packed">
            <h3 className="text-2xl font-black font-mono">Minggu {currentWeekSimulation}</h3>
            <span className="text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded font-mono font-medium leading-none">Aktif</span>
          </div>
          {/* Slider input to adjust simulation time and dynamically re-plot actual curve */}
          <div className="mt-3.5 space-y-1">
            <input 
              type="range"
              min="1"
              max="20"
              value={currentWeekSimulation}
              onChange={(e) => setCurrentWeekSimulation(Number(e.target.value))}
              className="w-full h-1.5 bg-blue-950 rounded-lg appearance-none cursor-pointer accent-orange-500" 
            />
            <div className="flex justify-between text-[8px] font-mono text-blue-300">
              <span>W-1 Mulai</span>
              <span>Geser Target S-Curve</span>
              <span>W-20 Selesai</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-mono tracking-wider text-slate-450 uppercase font-semibold block">Target Rencana (S-Curve)</span>
          <h3 className="text-2xl font-black font-mono text-slate-900 mt-1">{currentWeekMetrics.planned}%</h3>
          <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed">
            Akumulasi target kemajuan rencana kerja hingga Minggu {currentWeekSimulation}.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-mono tracking-wider text-slate-450 uppercase font-semibold block">Realisasi Aktual Lapangan</span>
          <h3 className="text-2xl font-black font-mono text-[#1E3A8A] mt-1">{currentWeekMetrics.actual}%</h3>
          <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed">
            Bobot aktual yang dicapai berdasarkan kemajuan persentase per divis harian.
          </p>
        </div>

        {/* Metric 4 */}
        <div className={`rounded-2xl p-5 border shadow-sm relative overflow-hidden transition-all ${
          currentWeekMetrics.variance >= 0 
            ? 'bg-emerald-50/70 border-emerald-100 text-emerald-900' 
            : 'bg-orange-50/70 border-orange-100 text-orange-900'
        }`}>
          <div className="absolute right-3 top-3 opacity-25">
            <TrendingUp className="w-12 h-12" />
          </div>
          <span className="text-[10px] font-mono tracking-wider uppercase font-extrabold block">
            Deviasi / Varian Jadwal
          </span>
          <h3 className="text-2xl font-black font-mono mt-1">
            {currentWeekMetrics.variance >= 0 ? '+' : ''}{currentWeekMetrics.variance}%
          </h3>
          <div className="mt-2 text-[11px] font-medium leading-relaxed flex items-center gap-1.5 font-sans">
            <span className={`w-2 h-2 rounded-full ${currentWeekMetrics.variance >= 0 ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500 animate-pulse'}`}></span>
            {currentWeekMetrics.variance >= 0 ? (
              <span>Proyek berjalan <strong>lebih cepat</strong> dari jadwal rencana</span>
            ) : (
              <span>Proyek mendeteksi <strong>keterlambatan</strong> waktu rencana</span>
            )}
          </div>
        </div>

      </div>

      {/* S-CURVE INTERACTIVE SVG GRAPH & THE ACCELERATION PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Primary Interactive curve visualizer */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2">
                <Activity className="text-orange-500 w-5 h-5" /> Grafik Kurva-S Integral (Kemajuan Kumulatif)
              </h3>
              <p className="text-xs text-slate-500">Arahkan kursor Anda ke lingkaran titik koordinat minggu untuk meninjau deviasi presisi.</p>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400 block"></span> Rencana Rujukan</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-[#1E3A8A] rounded-full block"></span> Aktual Lapangan</span>
            </div>
          </div>

          {/* Interactive S-Curve Chart (using Recharts) */}
          <div className="relative pt-4 w-full">
            <div className="w-full text-xs font-mono h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={scheduleCurveData}
                  margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
                  onMouseMove={(state) => {
                    if (state && state.activeTooltipIndex !== undefined && state.activeTooltipIndex !== null) {
                      setHoveredWeek(Number(state.activeTooltipIndex) + 1);
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredWeek(null);
                  }}
                  onClick={(state) => {
                    if (state && state.activeTooltipIndex !== undefined && state.activeTooltipIndex !== null) {
                      setCurrentWeekSimulation(Number(state.activeTooltipIndex) + 1);
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="planGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  
                  <XAxis 
                    dataKey="week" 
                    tickFormatter={(week) => `M-${week}`}
                    stroke="#94A3B8"
                    style={{ fontSize: '9px', fontWeight: 'bold', fontFamily: 'monospace' }}
                  />
                  
                  <YAxis 
                    stroke="#94A3B8"
                    tickFormatter={(val) => `${val}%`}
                    style={{ fontSize: '9px', fontWeight: 'bold', fontFamily: 'monospace' }}
                    domain={[0, 100]}
                  />
                  
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const isLate = (data.variance ?? 0) < 0;
                        return (
                          <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-2xl shadow-xl font-sans text-xs space-y-1.5 transition-all text-slate-800">
                            <p className="font-mono font-bold text-[#1E3A8A] text-left">Minggu ke-{data.week}</p>
                            <div className="space-y-1 text-left">
                              <p className="flex justify-between gap-6">
                                <span className="text-slate-450">Target Rencana:</span>
                                <span className="font-mono font-bold">{data.plannedCumulative}%</span>
                              </p>
                              <p className="flex justify-between gap-6">
                                <span className="text-slate-450">Realisasi Lapangan:</span>
                                <span className="font-mono font-bold text-[#1E3A8A]">
                                  {data.actualCumulative !== null ? `${data.actualCumulative}%` : 'Belum Mulai'}
                                </span>
                              </p>
                              {data.variance !== null && (
                                <p className="flex justify-between gap-6 border-t border-slate-100 pt-1">
                                  <span className="text-slate-500 font-medium">Deviasi Kumulatif:</span>
                                  <span className={`font-mono font-black ${isLate ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {data.variance >= 0 ? '+' : ''}{data.variance}%
                                  </span>
                                </p>
                              )}
                            </div>
                            <p className="text-[8px] text-[#EA580C] font-mono font-bold mt-1 text-left">* Klik diagram untuk simulasi pekan ini</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="plannedCumulative"
                    stroke="#94A3B8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="url(#planGrad)"
                    name="Rencana Kumulatif"
                  />

                  <Area
                    type="monotone"
                    dataKey="actualCumulative"
                    stroke="#1E3A8A"
                    strokeWidth={3}
                    fill="url(#actualGrad)"
                    connectNulls
                    name="Realisasi Kumulatif"
                    dot={{ stroke: '#1E3A8A', strokeWidth: 1.5, r: 3, fill: '#FFFFFF' }}
                    activeDot={{ r: 6, strokeWidth: 1.5, stroke: '#FFFFFF', fill: '#1E3A8A' }}
                  />

                  {/* Vertical indicator for current week simulation */}
                  <ReferenceLine 
                    x={currentWeekSimulation} 
                    stroke="#EA580C" 
                    strokeDasharray="3 3"
                    strokeWidth={2}
                    label={{ 
                      value: `M-${currentWeekSimulation} (Simulasi)`, 
                      position: 'top', 
                      fill: '#EA580C', 
                      fontSize: '9px', 
                      fontWeight: 'extrabold',
                      fontFamily: 'monospace'
                    }} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* FLOAT FLOATING PORTABLE WINDOW FOR DETAILS */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between min-h-[76px] transition-all relative">
            {hoveredWeek !== null ? (
              (() => {
                const hoverData = scheduleCurveData[hoveredWeek - 1];
                if (!hoverData) return null;
                const isLate = (hoverData.variance ?? 0) < 0;
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full animate-fadeIn font-mono text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Detail Terpilih</span>
                      <strong className="text-slate-900 font-extrabold text-[#1E3A8A]">Minggu {hoverData.week}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Target Rencana Rujukan</span>
                      <strong className="text-slate-700 font-bold">{hoverData.plannedCumulative}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Pencapaian Realisasi</span>
                      <strong className="text-slate-700 font-bold">
                        {hoverData.actualCumulative !== null ? `${hoverData.actualCumulative}%` : 'Belum Ditarget'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Status Selisih</span>
                      {hoverData.variance !== null ? (
                        <strong className={`font-black ${isLate ? 'text-red-600' : 'text-emerald-650'}`}>
                          {hoverData.variance >= 0 ? '+' : ''}{hoverData.variance}% {isLate ? 'Lambat' : 'Cepat'}
                        </strong>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="flex items-center gap-2.5 text-slate-500 text-xs w-full justify-center py-1">
                <Info className="w-4 h-4 text-slate-450 shrink-0" />
                <span>Layangkan kursor mouse di atas diagram garis koordinat untuk melihat nilai komulatif spesifik minggu.</span>
              </div>
            )}
          </div>

        </div>

        {/* ACCELERATION & ANALYTICS HELPER PANEL */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#1E3A8A] flex items-center gap-2">
              <Settings className="text-orange-500 w-4 h-4" /> Analisis Percepatan (Time Optimization)
            </h3>
            
            {currentWeekMetrics.variance < 0 ? (
              <div className="space-y-4">
                <div className="flex gap-2.5 bg-orange-50 border border-orange-100 p-3.5 rounded-xl text-orange-950 text-xs leading-relaxed font-light">
                  <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold font-mono text-[10px] uppercase block text-orange-800 tracking-wider mb-1">Peringatan Keterlambatan</span>
                    Sistem mendeteksi bahwa proyek mengalami keterlambatan kumulatif sebesar <strong className="text-orange-600">{currentWeekMetrics.variance}%</strong> pada Minggu ke-{currentWeekSimulation}.
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider font-mono block">Rekomendasi Kontraktor (FGI Guide)</span>
                  <div className="p-2 border border-slate-150 rounded-lg flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
                    <p><strong>Kerja Lembur (Overtime):</strong> Tambahkan ekstra 3 jam kerja pada pekerjaan Struktur &amp; MEP.</p>
                  </div>
                  <div className="p-2 border border-slate-150 rounded-lg flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
                    <p><strong>Crashing Tenaga Kerja:</strong> Tambah kelompok tukang sipil untuk pekerjaan finishing arsitektur.</p>
                  </div>
                  <div className="p-2 border border-slate-150 rounded-lg flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
                    <p><strong>Fast-Tracking:</strong> Mulai persiapan interior di area kamar lantai bawah paralel tanpa menunggu lantai 7 selesai dicor.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex gap-2.5 bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-emerald-950 text-xs leading-relaxed font-light">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold font-mono text-[10px] uppercase block text-emerald-800 tracking-wider mb-1">Status Sehat &amp; Optimal</span>
                    Kombinasi kemajuan fisik berada di jalur yang benar! Efisiensi jadwal berada di <strong className="text-emerald-700">+{currentWeekMetrics.variance}%</strong> dibanding rencana standar.
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  Metode koordinasi antar sub-kontraktor yang efisien dan cuaca cerah di wilayah Majalengka mendukung percepatan fondasi substruktur dan pengerjaan cor plat. Pertahankan efisiensi suplai logistik semen dan pasir.
                </p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Estimasi Selesai:</span>
                  <strong className="text-emerald-700">Tepat Waktu (Des 2026)</strong>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-[#1E3A8A] to-[#111827] text-white rounded-3xl p-6 shadow-md border border-slate-900/40 relative overflow-hidden space-y-4">
            <span className="text-[10px] font-mono tracking-widest text-[#3B82F6] font-extrabold uppercase block">Ulasan Milestone Utama</span>
            
            <div className="space-y-3.5">
              <div className="flex items-start gap-2.5 text-xs">
                <div className="p-1 px-1.5 bg-emerald-550 rounded font-mono text-[9px] font-bold mt-0.5 text-white">W-2</div>
                <div>
                  <h4 className="font-bold text-slate-200">Selesai Pekerjaan Persiapan</h4>
                  <p className="text-[11px] text-slate-400 font-light mt-0.5">Pagar pembatas, kantor lapangan direksi keet, dan pembersihan area.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs border-t border-white/5 pt-3">
                <div className="p-1 px-1.5 bg-emerald-550 rounded font-mono text-[9px] font-bold mt-0.5 text-white">W-6</div>
                <div>
                  <h4 className="font-bold text-slate-200">Bored Pile Fondasi Substruktur</h4>
                  <p className="text-[11px] text-slate-400 font-light mt-0.5">Penyelesaian penanaman fondasi dalam &amp; pengujian slab loading test.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs border-t border-white/5 pt-3">
                <div className="p-1 px-1.5 bg-[#EA580C] rounded font-mono text-[9px] font-semibold mt-0.5 text-white animate-pulse">W-14</div>
                <div>
                  <h4 className="font-bold text-slate-200">Topping Off Sektor Atap</h4>
                  <p className="text-[11px] text-slate-400 font-light mt-0.5">Pengecoran slab atap lantai 7 dan persemian struktur utama laydown.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs border-t border-white/5 pt-3">
                <div className="p-1 px-1.5 bg-slate-800 rounded font-mono text-[9px] font-semibold mt-0.5 text-slate-400">W-20</div>
                <div>
                  <h4 className="font-bold text-slate-400">Serah Terima Fisik (PHO)</h4>
                  <p className="text-[11px] text-slate-500 font-light mt-0.5">Uji kelayakan sarana MEP se-area kost dan hotel siap beroperasi.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* DETAILED GANTT CHART & INTERACTIVE EDITING PANEL */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2">
              <Sliders className="text-[#EA580C] w-5 h-5" /> Penentuan Durasi Sektor &amp; Jadwal Batang Gantt
            </h3>
            <p className="text-xs text-slate-500">Sesuaikan rentang pekan mulai (Start Week) dan pekan selesai (End Week) untuk mensinkronisasi rujukan Kurva S rencana.</p>
          </div>

          <div className="flex items-center gap-2.5">
            {isEditor && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-[#EA580C] hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow duration-200 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                Tambah Baris Pekerjaan
              </button>
            )}
          </div>
        </div>

        {/* Validasi Bobot Total Alert */}
        {totalTaskWeight !== 100 && (
          <div className="flex gap-2 bg-amber-50 border border-amber-250 p-3.5 rounded-xl text-amber-900 text-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-mono tracking-wider text-[10px] uppercase text-amber-800">Perhatian Alokasi Bobot Perencanaan</strong>
              Total bobot yang terdistribusi saat ini adalah <strong className="font-mono text-amber-950 font-bold">{totalTaskWeight}%</strong>. S-Curve terbaik teralokasi optimal saat total keseluruhan bobot berjumlah tepat <strong className="font-mono font-bold">100%</strong>. Harap sesuaikan agar hitungan proporsional.
            </div>
          </div>
        )}

        {/* Form add task */}
        {showAddForm && (
          <form onSubmit={handleAddTaskSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-scaleIn max-w-2xl">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">Formulir Tambah Kelompok Pekerjaan RAB Baru</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-mono font-bold text-slate-400 block mb-1">KELOMPOK KHUSUS</label>
                <input 
                  type="text"
                  required
                  placeholder="Contoh: Pekerjaan Cafe / Pekerjaan Kolam Renang"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-xs p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono font-bold text-slate-400 block mb-1">BOBOT RENCANA (%)</label>
                <input 
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={newWeight}
                  onChange={(e) => setNewWeight(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 text-xs font-mono p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-mono font-bold text-slate-400 block mb-1">Mulai Pekan</label>
                  <select
                    value={newStart}
                    onChange={(e) => setNewStart(parseInt(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-xs font-mono p-2.5 rounded-xl outline-none cursor-pointer"
                  >
                    {Array.from({ length: 20 }, (_, i) => (
                      <option key={i+1} value={i+1}>Minggu {i+1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-mono font-bold text-slate-400 block mb-1">Selesai Pekan</label>
                  <select
                    value={newEnd}
                    onChange={(e) => setNewEnd(parseInt(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-xs font-mono p-2.5 rounded-xl outline-none cursor-pointer"
                  >
                    {Array.from({ length: 20 }, (_, i) => (
                      <option key={i+1} value={i+1}>Minggu {i+1}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition border border-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow cursor-pointer"
              >
                Simpan &amp; Hubungkan
              </button>
            </div>
          </form>
        )}

        {/* Real Dynamic Grid Table with Gantt columns */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-xs text-left text-slate-600 border-collapse">
            <thead className="bg-[#1E3A8A] text-white text-[10px] font-mono uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-bold">Menu / Divisi Pekerjaan</th>
                <th className="py-3.5 px-4 text-center font-bold">Bobot (%)</th>
                <th className="py-3.5 px-4 text-center font-bold">Mng Mulai</th>
                <th className="py-3.5 px-4 text-center font-bold">Mng Akhir</th>
                <th className="py-3.5 px-4 font-bold">Batang Gantt Chart (Minggu 1 s/d 20)</th>
                {isEditor && <th className="py-3.5 px-4 text-center font-bold">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {tasksWithProgress.map((task) => {
                const isEditing = editingTaskId === task.id;
                const totalDuration = task.endWeek - task.startWeek + 1;
                
                return (
                  <tr key={task.id} className="hover:bg-slate-50 transition">
                    
                    {/* Category Title */}
                    <td className="py-4 px-4 font-semibold text-slate-800">
                      <div className="flex flex-col">
                        <span>{task.category}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase mt-0.5">
                          Status Fisik: {task.progressPercent}% ({task.status})
                        </span>
                      </div>
                    </td>

                    {/* Weight (Bobot) */}
                    <td className="py-4 px-4 text-center font-bold font-mono">
                      {isEditing ? (
                        <input 
                          type="number"
                          value={tempWeight}
                          onChange={(e) => setTempWeight(parseInt(e.target.value) || 0)}
                          className="w-16 p-1 border border-slate-300 text-center rounded focus:ring-1 focus:ring-orange-500 font-mono text-xs"
                        />
                      ) : (
                        <span>{task.weight}%</span>
                      )}
                    </td>

                    {/* Start Week */}
                    <td className="py-4 px-4 text-center font-mono">
                      {isEditing ? (
                        <select
                          value={tempStart}
                          onChange={(e) => setTempStart(parseInt(e.target.value))}
                          className="p-1 border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 text-xs font-mono"
                        >
                          {Array.from({ length: 20 }, (_, i) => (
                            <option key={i+1} value={i+1}>{i+1}</option>
                          ))}
                        </select>
                      ) : (
                        <span>W-{task.startWeek}</span>
                      )}
                    </td>

                    {/* End Week */}
                    <td className="py-4 px-4 text-center font-mono">
                      {isEditing ? (
                        <select
                          value={tempEnd}
                          onChange={(e) => setTempEnd(parseInt(e.target.value))}
                          className="p-1 border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 text-xs font-mono"
                        >
                          {Array.from({ length: 20 }, (_, i) => (
                            <option key={i+1} value={i+1}>{i+1}</option>
                          ))}
                        </select>
                      ) : (
                        <span>W-{task.endWeek}</span>
                      )}
                    </td>

                    {/* Gantt Bar graphic representation */}
                    <td className="py-4 px-4 min-w-[280px]">
                      <div className="w-full bg-slate-100 h-6 rounded-lg relative overflow-hidden flex items-center border border-slate-200/50">
                        
                        {/* Shading active span */}
                        {task.startWeek <= task.endWeek && (
                          <div 
                            className="absolute bg-gradient-to-r from-blue-700 to-orange-500 text-white text-[9px] font-mono leading-none h-full flex items-center px-2 shadow-inner font-extrabold transition-all duration-150 select-none animate-fadeIn"
                            style={{
                              left: `${((task.startWeek - 1) / 20) * 100}%`,
                              width: `${(totalDuration / 20) * 100}%`,
                            }}
                          >
                            <span className="truncate block drop-shadow-sm">
                              {totalDuration} Mng ({task.progressPercent}%)
                            </span>
                          </div>
                        )}

                        {/* Split tick marks represent weeks 1-20 inside Gantt lane for easier measurement */}
                        {Array.from({ length: 19 }).map((_, weekIdx) => (
                          <div
                            key={weekIdx}
                            className="absolute bg-slate-200/60 w-[1px] h-full"
                            style={{ left: `${((weekIdx + 1) / 20) * 100}%` }}
                          />
                        ))}

                      </div>
                    </td>

                    {/* Actions editor buttons */}
                    {isEditor && (
                      <td className="py-4 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleEditTask(task.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer transition shadow"
                              title="Simpan"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={() => setEditingTaskId(null)}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded text-[10px] font-bold cursor-pointer transition"
                              title="Batal"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => startEditMode(task)}
                              className="p-1.5 text-blue-650 hover:bg-blue-50 rounded-lg cursor-pointer transition"
                              title="Edit Durasi Gantt"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* S-Curve Information guide box */}
        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex gap-3 text-xs leading-relaxed text-slate-550">
          <Info className="w-5 h-5 text-[#1E3A8A] shrink-0 mt-0.5" />
          <div className="space-y-1 text-slate-600 font-light">
            <h4 className="font-bold text-slate-800 font-sans">Pedoman Konsultan Mengenai Distribusi Pembobotan Rencana (Kurva-S)</h4>
            <p>
              Setiap penyesuaian bobot penting dikonsolidasikan dengan Rencana Anggaran Biaya (RAB) resmi PT. FGI senilai <strong>Rp 14,47 Milyar</strong>. Total penjumlahan bobot otomatis diverifikasi di <strong>100.0%</strong> demi keabsahan laporan kemajuan yang dikirimkan ke pihak Owner, Konsultan Pengawas, maupun Investor Utama.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
