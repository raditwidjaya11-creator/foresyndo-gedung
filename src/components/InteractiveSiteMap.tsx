import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useApp } from '../context/AppContext';
import { PlayCircle, ShieldCheck, MapPin, Calendar, HardHat, Info, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface MapBlock {
  id: string;
  category: string;
  name: string;
  description: string;
  points: [number, number][];
  supervisor: string;
  startDate: string;
  targetDate: string;
  estimatedCost: string;
}

export const InteractiveSiteMap: React.FC = () => {
  const { progressItems } = useApp();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('prog1');
  const [hoveredBlock, setHoveredBlock] = useState<MapBlock | null>(null);

  // Hardcoded coordinates & definitions for Kertajati Hotel & Kost block sectors on a 100x100 grid scaled nicely
  const blocks: MapBlock[] = [
    {
      id: 'prog1',
      category: 'Persiapan',
      name: 'Sektor A1 - Akses Utama & Mobilisasi',
      description: 'Pembersihan lahan, pendirian pagar proyek, direksikeet, dan jalur keluar masuk kendaraan berat material.',
      points: [[15, 15], [45, 15], [40, 35], [15, 35]],
      supervisor: 'Ahmad Subandi (Assistant PM)',
      startDate: '2026-06-01',
      targetDate: '2026-06-15',
      estimatedCost: 'Rp 145.000.000'
    },
    {
      id: 'prog2',
      category: 'Pondasi',
      name: 'Sektor A2 - Struktur Pondasi Borepile',
      description: 'Pekerjaan galian tanah dalam, pengeboran tiang pancang (borepile), besi tulangan pile cap, dan tie beam.',
      points: [[45, 15], [75, 15], [80, 45], [40, 35]],
      supervisor: 'Budi Hartono (Senior Geotechnical)',
      startDate: '2026-06-16',
      targetDate: '2026-07-15',
      estimatedCost: 'Rp 1.120.000.000'
    },
    {
      id: 'prog3',
      category: 'Basement',
      name: 'Sektor A3 - Parkir Bawah Tanah & Retaining Wall',
      description: 'Konstruksi basement beton kedap air, dinding penahan tanah, serta penempatan tangki penyimpanan air bawah tanah (GWT).',
      points: [[15, 35], [40, 35], [35, 65], [15, 55]],
      supervisor: 'Andri Wijaya (Concrete Specialist)',
      startDate: '2026-07-16',
      targetDate: '2026-08-30',
      estimatedCost: 'Rp 1.890.000.000'
    },
    {
      id: 'prog4',
      category: 'Struktur',
      name: 'Sektor B1 - Rangka Utama Lt. 1 - 7',
      description: 'Pengecoran kolom utama, plat lantai beton komposit, balok penyangga, serta instalasi tangga darurat baja.',
      points: [[40, 35], [80, 45], [75, 75], [35, 65]],
      supervisor: 'Hendrik Pratama (Structure Lead)',
      startDate: '2026-09-01',
      targetDate: '2026-11-15',
      estimatedCost: 'Rp 4.250.000.000'
    },
    {
      id: 'prog5',
      category: 'Arsitektur',
      name: 'Sektor B2 - Fasad ACP & Dinding Modular',
      description: 'Pemasangan dinding bata ringan interlok, kusen aluminium, kaca tempered fasad luar, dan cladding composite panel.',
      points: [[75, 15], [95, 15], [95, 55], [80, 45]],
      supervisor: 'Citra Kirana (Architectural Supervisor)',
      startDate: '2026-11-16',
      targetDate: '2026-12-30',
      estimatedCost: 'Rp 2.100.000.000'
    },
    {
      id: 'prog6',
      category: 'MEP',
      name: 'Sektor B3 - Distribusi Utilitas & Panel Elektrikal',
      description: 'Instalasi jaringan pipa sprinkler pemadam, ducting AC sentral, genset cadangan, panel ATS, dan gardu kabel tegangan menengah.',
      points: [[35, 65], [75, 75], [70, 95], [30, 85]],
      supervisor: 'Dany Setiawan (MEP Engineer)',
      startDate: '2026-11-16',
      targetDate: '2027-01-15',
      estimatedCost: 'Rp 2.850.000.000'
    },
    {
      id: 'prog7',
      category: 'Interior',
      name: 'Sektor C1 - Kamar Hotel & Kost Eksklusif',
      description: 'Pekerjaan plafon gipsum akustik, lantai vinyl premium anti gores, wallpaper modular kamar, serta custom built-in furniture.',
      points: [[15, 55], [35, 65], [30, 85], [15, 75]],
      supervisor: 'Evelyn Taylor (Interior Designer)',
      startDate: '2026-12-01',
      targetDate: '2027-02-15',
      estimatedCost: 'Rp 3.400.000.000'
    },
    {
      id: 'prog8',
      category: 'Landscape',
      name: 'Sektor C2 - Lansekap Hijau & Drop-off Area',
      description: 'Pembuatan taman resapan air, paving stone bermotif, pencahayaan pedestrian bertenaga surya, dan pos keamanan gerbang utama.',
      points: [[30, 85], [70, 95], [85, 95], [15, 95]],
      supervisor: 'Farhan Maulana (Landscape Planner)',
      startDate: '2027-01-16',
      targetDate: '2027-02-28',
      estimatedCost: 'Rp 650.000.000'
    }
  ];

  // Active block merged with current state progressItems from AppContext
  const getBlockProgress = (blockId: string) => {
    return progressItems.find(p => p.id === blockId) || { progressPercent: 0, status: 'Belum Mulai' };
  };

  const selectedBlockObj = blocks.find(b => b.id === selectedBlockId) || blocks[0];
  const selectedProgress = getBlockProgress(selectedBlockObj.id);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawing to enable state redraws safely

    const width = 500;
    const height = 400;

    // Scale helpers to project the 0-100 coordinates into pixel viewport 500x400
    const xScale = d3.scaleLinear().domain([0, 100]).range([20, width - 20]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([20, height - 20]);

    // Setup Main Blueprint Grid Background
    const gridG = svg.append('g').attr('class', 'blueprint-grid');

    // Horizontal blueprint lines
    for (let i = 10; i <= 90; i += 10) {
      gridG.append('line')
        .attr('x1', xScale(0))
        .attr('y1', yScale(i))
        .attr('x2', xScale(100))
        .attr('y2', yScale(i))
        .attr('stroke', '#1E3A8A')
        .attr('stroke-width', 0.15)
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.35);

      gridG.append('line')
        .attr('x1', xScale(i))
        .attr('y1', yScale(0))
        .attr('x2', xScale(i))
        .attr('y2', yScale(100))
        .attr('stroke', '#1E3A8A')
        .attr('stroke-width', 0.15)
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.35);
    }

    // Outer Plot Boundary (Kavling Proyek)
    svg.append('rect')
      .attr('x', xScale(10))
      .attr('y', yScale(10))
      .attr('width', xScale(95) - xScale(10))
      .attr('height', yScale(96) - yScale(10))
      .attr('fill', 'none')
      .attr('stroke', '#3B82F6')
      .attr('stroke-width', 0.8)
      .attr('stroke-dasharray', '4,4')
      .style('opacity', 0.5);

    // Color Interpolator for progress percent
    const getColorForProgress = (pct: number) => {
      if (pct === 0) return '#cbd5e1'; // Light gray for completed 0%
      if (pct === 100) return '#10b981'; // Pristine emerald green for completed
      // Beautiful gradient color sequence for work-in-progress
      return d3.interpolateRgb('#93c5fd', '#1e3a8a')(pct / 100);
    };

    // Hover effect overlay or tooltip
    const tooltipG = svg.append('g')
      .attr('class', 'custom-svg-tooltip')
      .style('display', 'none')
      .style('pointer-events', 'none');

    tooltipG.append('rect')
      .attr('width', 180)
      .attr('height', 42)
      .attr('rx', 6)
      .attr('fill', '#0f172a')
      .attr('opacity', 0.9);

    const tooltipTitle = tooltipG.append('text')
      .attr('x', 12)
      .attr('y', 16)
      .attr('fill', '#ffffff')
      .attr('font-size', '9.5px')
      .attr('font-family', 'sans-serif')
      .attr('font-weight', 'bold');

    const tooltipDesc = tooltipG.append('text')
      .attr('x', 12)
      .attr('y', 30)
      .attr('fill', '#ea580c')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold');

    // Draw polygons for each Map Sector
    const polygonsG = svg.append('g').attr('class', 'map-zones');

    blocks.forEach((block) => {
      const progressInfo = getBlockProgress(block.id);
      const pointsString = block.points.map(p => `${xScale(p[0])},${yScale(p[1])}`).join(' ');

      const fillColor = getColorForProgress(progressInfo.progressPercent);
      const isSelected = selectedBlockId === block.id;

      const group = polygonsG.append('g')
        .attr('class', `zone-group block-${block.id}`)
        .style('cursor', 'pointer');

      // The core polygon
      group.append('polygon')
        .attr('points', pointsString)
        .attr('fill', fillColor)
        .attr('fill-opacity', isSelected ? 0.85 : 0.6)
        .attr('stroke', isSelected ? '#ea580c' : '#1e3a8a')
        .attr('stroke-width', isSelected ? 2.5 : 1)
        .attr('filter', isSelected ? 'drop-shadow(0px 6px 8px rgba(15, 23, 42, 0.45))' : 'drop-shadow(0px 2px 4px rgba(15, 23, 42, 0.15))')
        .style('transform-origin', 'center')
        .style('transform-box', 'fill-box')
        .style('transform', isSelected ? 'scale(1.02)' : 'none')
        .style('transition', 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1), filter 250ms cubic-bezier(0.4, 0, 0.2, 1), fill-opacity 200ms ease, stroke-width 200ms ease')
        .on('mouseover', function(event) {
          d3.select(this)
            .attr('fill-opacity', 0.95)
            .attr('stroke-width', isSelected ? 3 : 2)
            .attr('filter', 'drop-shadow(0px 12px 20px rgba(15, 23, 42, 0.55))')
            .style('transform', 'scale(1.06)');
          
          setHoveredBlock(block);

          // Position tooltip
          const [cx, cy] = d3.pointer(event, svgRef.current);
          tooltipG
            .attr('transform', `translate(${Math.min(cx + 15, width - 200)}, ${Math.min(cy + 15, height - 60)})`)
            .style('display', 'block');
          
          tooltipTitle.text(block.category.toUpperCase());
          tooltipDesc.text(`Kemajuan Fisik: ${progressInfo.progressPercent}%`);
        })
        .on('mousemove', function(event) {
          const [cx, cy] = d3.pointer(event, svgRef.current);
          tooltipG.attr('transform', `translate(${Math.min(cx + 15, width - 200)}, ${Math.min(cy + 15, height - 60)})`);
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('fill-opacity', isSelected ? 0.85 : 0.6)
            .attr('stroke-width', isSelected ? 2.5 : 1)
            .attr('filter', isSelected ? 'drop-shadow(0px 6px 8px rgba(15, 23, 42, 0.45))' : 'drop-shadow(0px 2px 4px rgba(15, 23, 42, 0.15))')
            .style('transform', isSelected ? 'scale(1.02)' : 'none');
          
          setHoveredBlock(null);
          tooltipG.style('display', 'none');
        })
        .on('click', () => {
          setSelectedBlockId(block.id);
        });

      // Simple Sector text coordinates center calculations
      const xs = block.points.map(p => xScale(p[0]));
      const ys = block.points.map(p => yScale(p[1]));
      const cx = d3.mean(xs) || 0;
      const cy = d3.mean(ys) || 0;

      // Draw standard alphanumeric visual label code (e.g. A1, B2)
      group.append('text')
        .attr('x', cx)
        .attr('y', cy - 2)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('fill', progressInfo.progressPercent > 50 || isSelected ? '#ffffff' : '#1e293b')
        .attr('font-size', '10px')
        .attr('font-weight', '900')
        .attr('font-family', 'monospace')
        .text(block.id.replace('prog', 'SEC-0'));

      // Draw miniature percentage marker text
      group.append('text')
        .attr('x', cx)
        .attr('y', cy + 8)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('fill', progressInfo.progressPercent > 50 || isSelected ? '#f8fafc' : '#475569')
        .attr('font-size', '7.5px')
        .attr('font-weight', 'medium')
        .attr('font-family', 'sans-serif')
        .text(`${progressInfo.progressPercent}%`);

      // Pulsing telemetry ring if block is actively in-progress
      if (progressInfo.progressPercent > 0 && progressInfo.progressPercent < 100) {
        group.append('circle')
          .attr('cx', cx)
          .attr('cy', cy - 12)
          .attr('r', 2.5)
          .attr('fill', '#ea580c')
          .append('animate')
          .attr('attributeName', 'opacity')
          .attr('values', '1;0.4;1')
          .attr('dur', '1.5s')
          .attr('repeatCount', 'indefinite');
      }
    });

    // Drawing Legend
    const legendG = svg.append('g')
      .attr('class', 'map-legend')
      .attr('transform', `translate(${25}, ${height - 25})`);

    const legendColors = [
      { label: 'Belum Mulai', color: '#cbd5e1' },
      { label: 'Konstruksi', color: '#4299e1' },
      { label: 'Tuntas', color: '#10b981' }
    ];

    legendColors.forEach((d, index) => {
      const legX = index * 125;
      
      legendG.append('rect')
        .attr('x', legX)
        .attr('y', 0)
        .attr('width', 12)
        .attr('height', 8)
        .attr('rx', 2.5)
        .attr('fill', d.color);

      legendG.append('text')
        .attr('x', legX + 16)
        .attr('y', 7.5)
        .attr('fill', '#64748b')
        .attr('font-size', '8px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text(d.label.toUpperCase());
    });

  }, [progressItems, selectedBlockId]);

  return (
    <div id="interactive_blueprint" className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-md grid md:grid-cols-12 gap-6 items-start">
      
      {/* 2D Interactive Blueprint SVG Canvas Zone (Left Side - 7 Cols) */}
      <div className="md:col-span-7 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C] animate-ping"></div>
            <span className="text-[10px] font-mono font-black text-[#1E3A8A] uppercase tracking-widest">Interactive 2D D3 CAD Blueprint</span>
          </div>
          <div className="flex gap-1.5">
            <button className="p-1 text-slate-400 hover:text-[#1E3A8A] transition rounded hover:bg-slate-100" title="Centering View">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 text-slate-400 hover:text-[#1E3A8A] transition rounded hover:bg-slate-100" title="Zoom In (D3 standard)">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 text-slate-400 hover:text-[#1E3A8A] transition rounded hover:bg-slate-100" title="Zoom Out (D3 standard)">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Blueprint display bounding container */}
        <div className="w-full relative bg-slate-900 border border-slate-950 rounded-2xl overflow-hidden p-3 shadow-inner flex justify-center">
          {/* Subtle background industrial alignment crosshairs */}
          <div className="absolute top-4 left-4 text-[#3B82F6]/30 font-mono text-[7px] pointer-events-none select-none">FGI-JATITUJUH-C2</div>
          <div className="absolute bottom-4 right-4 text-[#3B82F6]/30 font-mono text-[7px] pointer-events-none select-none">GRID-Z-AXIS-001</div>

          <svg 
            ref={svgRef}
            viewBox="0 0 500 400"
            className="w-full max-w-[480px] h-[380px] select-none scale-98 hover:scale-100 transition-all duration-300"
          />
        </div>
        
        {/* Helper Instructions bar */}
        <p className="text-[10px] text-slate-400 font-mono mt-3 text-center">
          * Arahkan kursor atau klik wilayah sektor di atas untuk memantau kemajuan pembangunan real-time.
        </p>
      </div>

      {/* Telemetry Control Panel Area (Right Side - 5 Cols) */}
      <div className="md:col-span-5 space-y-4">
        
        {/* Header Indicator */}
        <div className="bg-[#1E3A8A] text-white p-4 rounded-2xl border-b-4 border-[#EA580C] shadow-sm">
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-blue-200">Kertajati Digital Twin Hub</p>
              <h4 className="text-sm font-bold tracking-tight">Status Sektor Aktif</h4>
            </div>
          </div>
        </div>

        {/* Selected Sector Core Data Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-sm relative overflow-hidden">
          {/* Glowing accent border based on progress */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#1E3A8A] to-[#EA580C]"></div>

          <div className="pl-2 space-y-2">
            <p className="text-[9px] font-mono font-black text-orange-500 uppercase tracking-widest">{selectedBlockObj.category}</p>
            <h3 className="text-base font-black text-slate-900 leading-snug">{selectedBlockObj.name}</h3>
            
            <p className="text-xs text-slate-500 leading-relaxed font-light">{selectedBlockObj.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pl-2 pt-2 border-t border-slate-100">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-slate-400 uppercase font-black">Progress Fisik</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-bold font-mono ${selectedProgress.progressPercent === 100 ? 'text-emerald-600' : 'text-[#1E3A8A]'}`}>
                  {selectedProgress.progressPercent}%
                </span>
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded leading-none ${
                  selectedProgress.progressPercent === 100 ? 'bg-emerald-100 text-emerald-700' :
                  selectedProgress.progressPercent > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {selectedProgress.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-slate-400 uppercase font-black">Anggaran Sektor</span>
              <p className="text-xs font-bold text-slate-700 font-mono">{selectedBlockObj.estimatedCost}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-slate-400 uppercase font-black flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" /> Start Date
              </span>
              <p className="text-xs font-semibold text-slate-600 font-mono">{selectedBlockObj.startDate}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-slate-400 uppercase font-black flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" /> Target End
              </span>
              <p className="text-xs font-semibold text-slate-600 font-mono">{selectedBlockObj.targetDate}</p>
            </div>
          </div>

          {/* Supervisor Card */}
          <div className="pl-2 pt-3 border-t border-slate-100 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
              <HardHat className="w-4 h-4 text-[#1E3A8A]" />
            </div>
            <div>
              <p className="text-[8px] font-mono text-slate-400 uppercase font-black">Lead Supervisor / Pengawas</p>
              <p className="text-xs font-semibold text-slate-800">{selectedBlockObj.supervisor}</p>
            </div>
          </div>

        </div>

        {/* Live Broadcast Feed Alert bar */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 flex gap-2.5">
          <Info className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h5 className="text-[10px] font-bold text-orange-800 uppercase tracking-wide">Ledger Telemetri Digital</h5>
            <p className="text-[9.5px] text-slate-600 leading-relaxed font-light">
              Seluruh rekam data perizinan, volume pengiriman material semen/beton, dan kemajuan lapangan ditandatangani secara kriptografis melalui SPPI Hub.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
