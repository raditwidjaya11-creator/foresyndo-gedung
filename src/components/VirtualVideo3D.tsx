import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  Video, 
  Sun, 
  Moon, 
  Compass, 
  Sparkles, 
  Upload, 
  Download, 
  Maximize2, 
  Eye, 
  Volume2, 
  VolumeX, 
  Layers, 
  Film, 
  Sliders, 
  HelpCircle, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';
import frontImage from '../assets/images/majalengka_kost_front_1781714630858.jpg';
import poolImage from '../assets/images/majalengka_kost_pool_1781714653066.jpg';
import eveningImage from '../assets/images/majalengka_kost_evening_1782317087739.jpg';

export const VirtualVideo3D: React.FC = () => {
  const { showToast } = useApp();

  // Active sub-tabs: 'interactive_walk' or 'generator'
  const [activeSubTab, setActiveSubTab] = useState<'interactive_walk' | 'generator'>('interactive_walk');
  
  // Interactive 3D Viewer States
  const [rotation, setRotation] = useState<number>(35); // in degrees
  const [elevation, setElevation] = useState<number>(20); // in degrees
  const [zoom, setZoom] = useState<number>(1.2);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('sunset');
  const [showWireframe, setShowWireframe] = useState<boolean>(false);
  const [isPlayingTour, setIsPlayingTour] = useState<boolean>(false);
  const [currentTourSub, setCurrentTourSub] = useState<string>('Memulai navigasi sirkuit penerbangan lobi depan...');
  
  // Custom Canvas Rendering Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationOnDragStartRef = useRef<number>(0);
  const elevationOnDragStartRef = useRef<number>(0);

  // Sound in Tour
  const [hasSound, setHasSound] = useState<boolean>(false);

  // AI 3D Generator States
  const [selectedPhoto, setSelectedPhoto] = useState<string>('front'); // 'front' | 'pool' | 'evening' | 'custom'
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState<string>('Buatkan animasi sinematik flyby drone memutari gedung kost Foresyndo 2, pencahayaan dramatis golden hour, bayangan tajam, kualitas 4K render arsitektur.');
  const [cameraStyle, setCameraStyle] = useState<string>('drone_flyby'); // 'drone_flyby' | 'orbit_3d' | 'lobby_walk' | 'panoramic'
  const [videoDuration, setVideoDuration] = useState<number>(25); // 10s | 25s | 60s
  const [renderQuality, setRenderQuality] = useState<'standard' | 'high_raytrace'>('high_raytrace');
  
  // Rendering simulation states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationPhase, setGenerationPhase] = useState<string>('Menunggu instruksi...');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isPlayingGenerated, setIsPlayingGenerated] = useState<boolean>(false);

  // List of pre-loaded photos for generator
  const renderPhotos = [
    { id: 'front', name: 'Fasad Depan Utama', image: frontImage, tag: 'Visual Utama' },
    { id: 'pool', name: 'Kolam Renang Belakang', image: poolImage, tag: 'Fasilitas Air' },
    { id: 'evening', name: 'Fasad Senja / Evening', image: eveningImage, tag: 'Eksterior Cahaya' }
  ];

  // Tour subtitle timelines based on rotation angle (0 to 360)
  const getTourSubtitle = (angle: number) => {
    const normalizedAngle = ((angle % 360) + 360) % 360;
    if (normalizedAngle >= 0 && normalizedAngle < 70) {
      return '📷 Sudut Depan Lobi: Menampilkan pilar klasik modern tinggi 6.4m, lobi penerima berlantai kaca temper dan gerbang utama.';
    } else if (normalizedAngle >= 70 && normalizedAngle < 160) {
      return '🌳 Sayap Kiri & Koridor Kamar: Tipe kamar kost eksklusif modular 6-lantai dengan pencahayaan alami optimal.';
    } else if (normalizedAngle >= 160 && normalizedAngle < 250) {
      return '🏊 Kolam Renang Komunal (Belakang): Area santai, mini-cafe, dan bak filtrasi ramah lingkungan.';
    } else if (normalizedAngle >= 250 && normalizedAngle < 320) {
      return '🏙️ Sayap Kanan & Tangga Sirkulasi Ganda: Mengitari akses darurat terproteksi kebakaran dan elevator timur.';
    } else {
      return '✨ Atap Rooftop & Area Panel Surya: Fungsionalitas atap dak beton dengan ketahanan gempa standar SNI K-350.';
    }
  };

  // Drag handlers for Canvas Rotation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    rotationOnDragStartRef.current = rotation;
    elevationOnDragStartRef.current = elevation;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    // Smoothly update angles based on mouse drag speed
    setRotation(rotationOnDragStartRef.current + dx * 0.5);
    setElevation(Math.max(5, Math.min(80, elevationOnDragStartRef.current - dy * 0.5)));
    
    if (isPlayingTour) {
      setIsPlayingTour(false);
      showToast('Otomatisasi tur dijeda karena navigasi manual.', 'info');
    }
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Custom File Uploader for Generator
  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomPhotoUrl(url);
      setSelectedPhoto('custom');
      showToast('Foto kustom berhasil diunggah untuk basis Virtual 3D!', 'success');
    }
  };

  // Run AI Video generation simulation
  const startAIGeneration = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedVideoUrl(null);
    setIsPlayingGenerated(false);

    const phases = [
      { prg: 5, txt: 'Menganalisis gambar referensi & memproses pencahayaan...' },
      { prg: 15, txt: 'Merekonstruksi geometri volumetrik 3D kolom beton...' },
      { prg: 30, txt: 'Mengekstrak kedalaman bidang (depth map parsing)...' },
      { prg: 45, txt: 'Menghitung pantulan bayangan & ray-tracing ambient...' },
      { prg: 60, txt: 'Mengatur interpolasi keyframe kamera melingkar (cinematic path)...' },
      { prg: 80, txt: 'Melakukan rendering neural per-frame video (H-Fidelity)...' },
      { prg: 95, txt: 'Menambahkan soundtrack instrumental & encoding berkas MP4...' },
      { prg: 100, txt: 'Selesai! Video Virtual 3D Foresyndo 2 siap diputar.' }
    ];

    let currentPhaseIdx = 0;
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        const next = prev + 1;
        
        // Find phase
        const matchingPhase = phases.find(p => prev < p.prg && next >= p.prg);
        if (matchingPhase) {
          setGenerationPhase(matchingPhase.txt);
        }

        if (next >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          // Set generated video based on selected input photo
          setGeneratedVideoUrl('active');
          setIsPlayingGenerated(true);
          showToast('Video Virtual 3D Berhasil Digenerasikan oleh AI!', 'success');
          return 100;
        }
        return next;
      });
    }, 150); // ~15 seconds total simulation
  };

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Define Theme colors based on time of day
      let bgColor1 = '#F8FAFC'; // Slate 50
      let bgColor2 = '#E2E8F0'; // Slate 200
      let skyColor = '#93C5FD'; // Blue 300
      let groundColor = '#80A080'; // Meadow Green
      let shadowColor = 'rgba(15, 23, 42, 0.15)';
      let buildingWallColor = '#F1F5F9'; // White-gray
      let buildingGlassColor = 'rgba(14, 165, 233, 0.4)'; // Blue glass
      let lightColor = 'rgba(253, 224, 71, 0.3)'; // Yellow glow
      let structureWireColor = '#64748B'; // Slate 500

      if (timeOfDay === 'sunset') {
        bgColor1 = '#1E1B4B'; // Indigo 950
        bgColor2 = '#311042'; // Dark Purple
        skyColor = '#F59E0B'; // Orange sunset
        groundColor = '#3F4F3F'; // Muted dark green
        shadowColor = 'rgba(0, 0, 0, 0.4)';
        buildingWallColor = '#E2E8F0';
        buildingGlassColor = 'rgba(244, 63, 94, 0.35)'; // Rose sunset reflection
        lightColor = 'rgba(245, 158, 11, 0.5)'; // Orange lights
        structureWireColor = '#94A3B8';
      } else if (timeOfDay === 'night') {
        bgColor1 = '#030712'; // Gray 950
        bgColor2 = '#0B1329'; // Cyberpunk dark blue
        skyColor = '#1F2937'; // Slate 800
        groundColor = '#1B2E1B'; // Deep pine green
        shadowColor = 'rgba(0, 0, 0, 0.6)';
        buildingWallColor = '#94A3B8';
        buildingGlassColor = 'rgba(56, 189, 248, 0.3)'; // Cyan glass
        lightColor = 'rgba(253, 224, 71, 0.75)'; // Intense yellow light inside
        structureWireColor = '#475569';
      }

      // Draw background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, bgColor1);
      bgGrad.addColorStop(1, bgColor2);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Save context for 3D projection
      ctx.save();
      
      // Move origin to center of canvas
      ctx.translate(width / 2, height / 2 + 30);

      // Convert angles to radians
      const radRot = (rotation * Math.PI) / 180;
      const radElev = (elevation * Math.PI) / 180;

      // Project 3D coordinate to 2D
      const project = (x: number, y: number, z: number) => {
        // Rotate around Y axis (Rotation angle)
        const xRot = x * Math.cos(radRot) - z * Math.sin(radRot);
        const zRot = x * Math.sin(radRot) + z * Math.cos(radRot);

        // Rotate around X axis (Elevation angle)
        const yElev = y * Math.cos(radElev) - zRot * Math.sin(radElev);
        const zElev = y * Math.sin(radElev) + zRot * Math.cos(radElev);

        // Apply isometric/perspective scaling based on zoom
        const scale = zoom * (300 / (300 + zElev));
        return {
          x: xRot * scale,
          y: -yElev * scale, // negative because canvas Y goes down
          depth: zElev
        };
      };

      // Draw Grid / Ground Plate (Lahan Bandara Kertajati Majalengka)
      const size = 180;
      const groundPoints = [
        project(-size, 0, -size),
        project(size, 0, -size),
        project(size, 0, size),
        project(-size, 0, size)
      ];

      ctx.beginPath();
      ctx.moveTo(groundPoints[0].x, groundPoints[0].y);
      for (let i = 1; i < 4; i++) ctx.lineTo(groundPoints[i].x, groundPoints[i].y);
      ctx.closePath();
      ctx.fillStyle = groundColor;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = timeOfDay === 'night' ? '#111827' : '#E2E8F0';
      ctx.stroke();

      // Draw Access Road & Garden details on Ground
      const roadPoints = [
        project(-size, 0, 100),
        project(size, 0, 100),
        project(size, 0, 160),
        project(-size, 0, 160)
      ];
      ctx.beginPath();
      ctx.moveTo(roadPoints[0].x, roadPoints[0].y);
      for (let i = 1; i < 4; i++) ctx.lineTo(roadPoints[i].x, roadPoints[i].y);
      ctx.closePath();
      ctx.fillStyle = timeOfDay === 'day' ? '#64748B' : '#334155'; // Asphalt gray
      ctx.fill();

      // Draw Swimming Pool at the back
      const poolPoints = [
        project(-90, 0, -140),
        project(-20, 0, -140),
        project(-20, 0, -80),
        project(-90, 0, -80)
      ];
      ctx.beginPath();
      ctx.moveTo(poolPoints[0].x, poolPoints[0].y);
      for (let i = 1; i < 4; i++) ctx.lineTo(poolPoints[i].x, poolPoints[i].y);
      ctx.closePath();
      ctx.fillStyle = timeOfDay === 'night' ? '#0E7490' : '#0EA5E9'; // Water Blue
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Pool lights glow
      if (timeOfDay !== 'day') {
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#06B6D4';
        ctx.fillStyle = 'rgba(34, 211, 238, 0.15)';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      // Draw the 6-story building structure (represented as stacked blocks)
      // Building dimensions: Width (X) from -60 to 60, Depth (Z) from -60 to 60, Height (Y) from 0 to 140 (23 meters)
      const bW = 55; // Building width half
      const bD = 50; // Building depth half
      const floorHeight = 22;
      const numFloors = 6;

      // Draw each floor starting from bottom to top for correct painter's algorithm rendering depth
      for (let f = 0; f < numFloors; f++) {
        const yBot = f * floorHeight;
        const yTop = (f + 1) * floorHeight;

        // Coordinates of 8 vertices of the floor cube
        const v = [
          project(-bW, yBot, -bD), // 0: bottom-back-left
          project(bW, yBot, -bD),  // 1: bottom-back-right
          project(bW, yBot, bD),   // 2: bottom-front-right
          project(-bW, yBot, bD),  // 3: bottom-front-left
          project(-bW, yTop, -bD), // 4: top-back-left
          project(bW, yTop, -bD),  // 5: top-back-right
          project(bW, yTop, bD),   // 6: top-front-right
          project(-bW, yTop, bD)   // 7: top-front-left
        ];

        // Determine which faces are facing the viewer based on rotation angle
        // Standard angles: Front right face (1-2-6-5), Front left face (2-3-7-6)
        
        // Draw Shadow underneath
        if (f === 0) {
          ctx.beginPath();
          ctx.moveTo(v[0].x, v[0].y + 2);
          ctx.lineTo(v[1].x, v[1].y + 2);
          ctx.lineTo(v[2].x, v[2].y + 2);
          ctx.lineTo(v[3].x, v[3].y + 2);
          ctx.closePath();
          ctx.fillStyle = shadowColor;
          ctx.fill();
        }

        if (showWireframe) {
          // Render raw schematic structure lines
          ctx.strokeStyle = structureWireColor;
          ctx.lineWidth = 1;
          
          // Bottom outline
          ctx.beginPath();
          ctx.moveTo(v[0].x, v[0].y);
          for (let i = 1; i < 4; i++) ctx.lineTo(v[i].x, v[i].y);
          ctx.closePath();
          ctx.stroke();

          // Top outline
          ctx.beginPath();
          ctx.moveTo(v[4].x, v[4].y);
          for (let i = 5; i < 8; i++) ctx.lineTo(v[i].x, v[i].y);
          ctx.closePath();
          ctx.stroke();

          // Verticals
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(v[i].x, v[i].y);
            ctx.lineTo(v[i+4].x, v[i+4].y);
            ctx.stroke();
          }

          // Render interior column joints
          ctx.fillStyle = '#10B981';
          v.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
            ctx.fill();
          });

        } else {
          // Solid Render: Draw faces based on perspective ordering
          // Draw back faces first (inside building), then walls, then glass windows, then columns.
          
          // Face ordering depending on rotation angle.
          // To simplify, we draw standard exterior walls.
          
          // Front-Right Wall Face (1-2-6-5)
          ctx.beginPath();
          ctx.moveTo(v[1].x, v[1].y);
          ctx.lineTo(v[2].x, v[2].y);
          ctx.lineTo(v[6].x, v[6].y);
          ctx.lineTo(v[5].x, v[5].y);
          ctx.closePath();
          ctx.fillStyle = f % 2 === 0 ? buildingWallColor : '#E2E8F0';
          ctx.fill();
          ctx.strokeStyle = timeOfDay === 'night' ? '#1E293B' : '#CBD5E1';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Front-Left Wall Face (2-3-7-6)
          ctx.beginPath();
          ctx.moveTo(v[2].x, v[2].y);
          ctx.lineTo(v[3].x, v[3].y);
          ctx.lineTo(v[7].x, v[7].y);
          ctx.lineTo(v[6].x, v[6].y);
          ctx.closePath();
          // Slightly darker for shadow depth
          ctx.fillStyle = f % 2 === 0 ? '#CBD5E1' : '#B8C6D6';
          ctx.fill();
          ctx.stroke();

          // Draw grid of Glass Windows on the active walls
          const numWindowsX = 5;
          const wGap = 4;
          const totalWallWidth = bW * 2;
          const wWidth = (totalWallWidth - (numWindowsX + 1) * wGap) / numWindowsX;
          const wHeight = floorHeight - 8;

          // Draw windows on Front-Left Wall (X face projection)
          for (let w = 0; w < numWindowsX; w++) {
            const pctStart = (wGap + w * (wWidth + wGap)) / totalWallWidth;
            const pctEnd = pctStart + (wWidth / totalWallWidth);

            // Interpolate vertices along the edge
            const xL = -bW + pctStart * (bW * 2);
            const xR = -bW + pctEnd * (bW * 2);

            const winBotL = project(xL, yBot + 4, bD + 0.5);
            const winBotR = project(xR, yBot + 4, bD + 0.5);
            const winTopR = project(xR, yBot + 4 + wHeight, bD + 0.5);
            const winTopL = project(xL, yBot + 4 + wHeight, bD + 0.5);

            ctx.beginPath();
            ctx.moveTo(winBotL.x, winBotL.y);
            ctx.lineTo(winBotR.x, winBotR.y);
            ctx.lineTo(winTopR.x, winTopR.y);
            ctx.lineTo(winTopL.x, winTopL.y);
            ctx.closePath();
            
            // Light interior glow if night
            if (timeOfDay !== 'day') {
              ctx.fillStyle = lightColor;
              ctx.fill();
            } else {
              ctx.fillStyle = buildingGlassColor;
              ctx.fill();
            }
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }

          // Draw windows on Front-Right Wall (Z face projection)
          for (let w = 0; w < numWindowsX; w++) {
            const pctStart = (wGap + w * (wWidth + wGap)) / (bD * 2);
            const pctEnd = pctStart + (wWidth / (bD * 2));

            // Interpolate along depth edge Z
            const zL = bD - pctStart * (bD * 2);
            const zR = bD - pctEnd * (bD * 2);

            const winBotL = project(bW + 0.5, yBot + 4, zL);
            const winBotR = project(bW + 0.5, yBot + 4, zR);
            const winTopR = project(bW + 0.5, yBot + 4 + wHeight, zR);
            const winTopL = project(bW + 0.5, yBot + 4 + wHeight, zL);

            ctx.beginPath();
            ctx.moveTo(winBotL.x, winBotL.y);
            ctx.lineTo(winBotR.x, winBotR.y);
            ctx.lineTo(winTopR.x, winTopR.y);
            ctx.lineTo(winTopL.x, winTopL.y);
            ctx.closePath();
            
            if (timeOfDay !== 'day') {
              ctx.fillStyle = lightColor;
              ctx.fill();
            } else {
              ctx.fillStyle = buildingGlassColor;
              ctx.fill();
            }
            ctx.stroke();
          }

          // Draw balconies (floating slabs) on the front-left face
          const balconyPoints = [
            project(-40, yBot, bD + 8),
            project(10, yBot, bD + 8),
            project(10, yBot, bD),
            project(-40, yBot, bD)
          ];
          ctx.beginPath();
          ctx.moveTo(balconyPoints[0].x, balconyPoints[0].y);
          for (let i = 1; i < 4; i++) ctx.lineTo(balconyPoints[i].x, balconyPoints[i].y);
          ctx.closePath();
          ctx.fillStyle = '#E2E8F0';
          ctx.fill();
          ctx.strokeStyle = '#94A3B8';
          ctx.stroke();

          // Balcony railing
          const rPointsBot = [
            project(-40, yBot, bD + 8),
            project(10, yBot, bD + 8)
          ];
          const rPointsTop = [
            project(-40, yBot + 6, bD + 8),
            project(10, yBot + 6, bD + 8)
          ];
          ctx.beginPath();
          ctx.moveTo(rPointsBot[0].x, rPointsBot[0].y);
          ctx.lineTo(rPointsBot[1].x, rPointsBot[1].y);
          ctx.lineTo(rPointsTop[1].x, rPointsTop[1].y);
          ctx.lineTo(rPointsTop[0].x, rPointsTop[0].y);
          ctx.closePath();
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Floor Slabs
          ctx.beginPath();
          ctx.moveTo(v[4].x, v[4].y);
          ctx.lineTo(v[5].x, v[5].y);
          ctx.lineTo(v[6].x, v[6].y);
          ctx.lineTo(v[7].x, v[7].y);
          ctx.closePath();
          ctx.fillStyle = '#CBD5E1';
          ctx.fill();
          ctx.stroke();
        }
      }

      // Draw Main Entrance pillars at the front center (Lobby)
      const p1Bot = project(-15, 0, bD + 12);
      const p1Top = project(-15, floorHeight, bD + 12);
      const p2Bot = project(15, 0, bD + 12);
      const p2Top = project(15, floorHeight, bD + 12);

      ctx.beginPath();
      ctx.moveTo(p1Bot.x - 3, p1Bot.y);
      ctx.lineTo(p1Bot.x + 3, p1Bot.y);
      ctx.lineTo(p1Top.x + 3, p1Top.y);
      ctx.lineTo(p1Top.x - 3, p1Top.y);
      ctx.closePath();
      ctx.fillStyle = '#F1F5F9';
      ctx.fill();
      ctx.strokeStyle = '#94A3B8';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(p2Bot.x - 3, p2Bot.y);
      ctx.lineTo(p2Bot.x + 3, p2Bot.y);
      ctx.lineTo(p2Top.x + 3, p2Top.y);
      ctx.lineTo(p2Top.x - 3, p2Top.y);
      ctx.closePath();
      ctx.fillStyle = '#F1F5F9';
      ctx.fill();
      ctx.stroke();

      // Draw trees in the front garden
      const drawTree = (tx: number, tz: number) => {
        const trunkBot = project(tx, 0, tz);
        const trunkTop = project(tx, 15, tz);
        
        // Trunk
        ctx.beginPath();
        ctx.moveTo(trunkBot.x - 1.5, trunkBot.y);
        ctx.lineTo(trunkBot.x + 1.5, trunkBot.y);
        ctx.lineTo(trunkTop.x + 1, trunkTop.y);
        ctx.lineTo(trunkTop.x - 1, trunkTop.y);
        ctx.closePath();
        ctx.fillStyle = '#78350F';
        ctx.fill();

        // Leaves
        const leafCenter = project(tx, 22, tz);
        ctx.beginPath();
        ctx.arc(leafCenter.x, leafCenter.y, 10 * zoom, 0, Math.PI * 2);
        ctx.fillStyle = timeOfDay === 'night' ? '#064E3B' : '#15803D';
        ctx.fill();
        ctx.strokeStyle = '#14532D';
        ctx.stroke();
      };

      drawTree(-130, 60);
      drawTree(130, 60);
      drawTree(-100, 130);

      ctx.restore();

      // If autoplay drone tour is active, smoothly increment rotation
      if (isPlayingTour) {
        setRotation(prev => {
          const next = prev + 0.25;
          setCurrentTourSub(getTourSubtitle(next));
          return next;
        });
        // Oscillate elevation and zoom slightly for realistic drone feel
        setElevation(prev => prev + Math.sin(Date.now() / 2000) * 0.05);
        setZoom(prev => Math.max(0.9, Math.min(1.4, prev + Math.cos(Date.now() / 3000) * 0.001)));
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    // Clean up animation frame
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [rotation, elevation, zoom, timeOfDay, showWireframe, isPlayingTour]);

  return (
    <div className="space-y-6 text-slate-800 font-sans" id="virtual-video-applet">
      {/* APP HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#EA580C] uppercase tracking-widest block font-black">Virtual Visualizer 3D</span>
          <h1 className="text-xl font-bold text-[#1E3A8A] mt-1">Virtual Video &amp; 3D Walkthrough</h1>
          <p className="text-slate-500 text-xs font-light mt-0.5">Representasi render 3D interaktif dan generator video tur sinematik untuk Foresyndo 2 Hotel &amp; Kost.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('interactive_walk')}
            className={`px-4 py-1.5 text-xs font-mono font-bold rounded-lg transition ${activeSubTab === 'interactive_walk' ? 'bg-[#1E3A8A] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            🕹️ Tur Interaktif 3D
          </button>
          <button
            onClick={() => setActiveSubTab('generator')}
            className={`px-4 py-1.5 text-xs font-mono font-bold rounded-lg transition ${activeSubTab === 'generator' ? 'bg-[#1E3A8A] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            🎬 AI Video Generator
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'interactive_walk' ? (
          <motion.div
            key="interactive"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* CANVAS 3D RENDER WINDOW - 8 cols */}
            <div className="lg:col-span-8 flex flex-col space-y-4">
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden h-[500px] shadow-lg flex flex-col justify-between">
                
                {/* 3D Model Title Badge */}
                <div className="absolute left-5 top-5 z-10 flex items-center gap-2">
                  <div className="px-3 py-1 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-full text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1.5 shadow">
                    <Compass className="w-3 h-3 text-[#EA580C] animate-spin-slow" />
                    RENDISI REAL-TIME CAD: OK
                  </div>
                  <span className="px-2.5 py-1 bg-[#EA580C] text-white text-[9px] font-mono font-black rounded-full uppercase shadow">
                    {timeOfDay.toUpperCase()} LIGHTING
                  </span>
                </div>

                {/* Autoplay indicator */}
                {isPlayingTour && (
                  <div className="absolute right-5 top-5 z-10 flex items-center gap-1.5 px-3 py-1 bg-red-650 text-white text-[9px] font-mono font-black rounded-full uppercase animate-pulse shadow">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    DRONE CAMERA REC
                  </div>
                )}

                {/* Actual interactive WebGL-like Canvas */}
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
                  title="Klik dan seret mouse untuk memutar bangunan!"
                />

                {/* Overlay Tour Subtitle Bar */}
                {isPlayingTour && (
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-xl bg-slate-950/90 backdrop-blur border border-slate-850 p-4 rounded-2xl shadow-2xl space-y-1.5 text-center animate-fadeIn">
                    <span className="text-[8px] font-mono font-bold text-[#EA580C] tracking-widest block uppercase">Virtual Cinematic Guide</span>
                    <p className="text-white text-[11px] font-medium leading-relaxed font-sans">
                      {currentTourSub}
                    </p>
                  </div>
                )}

                {/* Visual grid toggle helper */}
                <p className="absolute bottom-4 left-5 z-10 text-[9px] font-mono text-slate-400 opacity-60">
                  💡 Klik &amp; seret mouse di atas bangunan untuk rotasi / tilt orbital.
                </p>
              </div>

              {/* CONTROLLERS BLOCK */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-mono font-black text-[#1E3A8A] uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#EA580C]" />
                    PENGENDALI KAMERA &amp; LINGKUNGAN VIRTUAL
                  </h4>
                  
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setTimeOfDay('day')}
                      className={`p-1.5 px-3 text-[10px] font-mono font-bold rounded-lg border transition ${timeOfDay === 'day' ? 'bg-[#EA580C] text-white border-[#EA580C]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                    >
                      ☀️ Siang (Day)
                    </button>
                    <button
                      onClick={() => setTimeOfDay('sunset')}
                      className={`p-1.5 px-3 text-[10px] font-mono font-bold rounded-lg border transition ${timeOfDay === 'sunset' ? 'bg-[#EA580C] text-white border-[#EA580C]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                    >
                      🌇 Senja (Sunset)
                    </button>
                    <button
                      onClick={() => setTimeOfDay('night')}
                      className={`p-1.5 px-3 text-[10px] font-mono font-bold rounded-lg border transition ${timeOfDay === 'night' ? 'bg-indigo-950 text-indigo-300 border-indigo-900' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                    >
                      🌙 Malam (Night)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase flex justify-between">
                      <span>Rotasi Orbit (Y-Axis)</span>
                      <span className="text-[#EA580C]">{Math.round(rotation)}°</span>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={Math.round(rotation)}
                      onChange={(e) => {
                        setRotation(parseInt(e.target.value));
                        setIsPlayingTour(false);
                      }}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#EA580C]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase flex justify-between">
                      <span>Kemiringan Elevasi</span>
                      <span className="text-[#EA580C]">{Math.round(elevation)}°</span>
                    </span>
                    <input
                      type="range"
                      min="5"
                      max="80"
                      value={Math.round(elevation)}
                      onChange={(e) => {
                        setElevation(parseInt(e.target.value));
                        setIsPlayingTour(false);
                      }}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#EA580C]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase flex justify-between">
                      <span>Zoom Pembesaran</span>
                      <span className="text-[#EA580C]">{zoom.toFixed(2)}x</span>
                    </span>
                    <input
                      type="range"
                      min="0.7"
                      max="1.8"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => {
                        setZoom(parseFloat(e.target.value));
                        setIsPlayingTour(false);
                      }}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#EA580C]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2 justify-between items-center text-xs">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowWireframe(!showWireframe)}
                      className={`p-2 px-3 border rounded-xl font-mono text-[10px] font-black transition flex items-center gap-1.5 ${showWireframe ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      {showWireframe ? 'Buka Render Solid' : 'Buka Kerangka CAD (Wireframe)'}
                    </button>

                    <button
                      onClick={() => {
                        setRotation(35);
                        setElevation(20);
                        setZoom(1.2);
                        setIsPlayingTour(false);
                      }}
                      className="p-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-mono text-[10px] font-bold text-slate-600 transition"
                    >
                      Reset View
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setIsPlayingTour(!isPlayingTour);
                      if (!isPlayingTour) {
                        showToast('Tur video virtual otomatis berjalan. Santai dan lihat pemandangan!', 'success');
                      }
                    }}
                    className={`p-2 px-4 rounded-xl font-mono text-[11px] font-black transition flex items-center gap-2 cursor-pointer shadow-sm ${isPlayingTour ? 'bg-red-650 hover:bg-red-700 text-white' : 'bg-[#1E3A8A] hover:bg-blue-900 text-white'}`}
                  >
                    {isPlayingTour ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> Jeda Tur Video
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" /> Putar Tur Video Virtual (Auto-Orbit)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* STATIC SPECS & BLUEPRINTS LINK - 4 cols */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* project spec box */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-[#1E3A8A] font-mono uppercase tracking-wider block">Spesifikasi 3D Rendering</h3>
                  <p className="text-[11px] text-slate-500 font-light mt-0.5">Analisis volumetrik pemodelan bangunan berdasarkan blueprint resmi.</p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Modul Bangunan</span>
                    <span className="text-xs font-bold text-slate-800 block">Foresyndo Kost Eksklusif Majalengka</span>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>Total Tingkat:</span>
                      <span className="font-bold text-slate-700">6 Lantai + Rooftop Dak</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Tinggi Struktur:</span>
                      <span className="font-bold text-slate-700">22.00 Meter Bersih</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Elemen Render Lapangan</span>
                    <ul className="text-[10px] text-slate-600 space-y-1 list-disc pl-4 font-sans">
                      <li>Pilar Ganda Lobi Utama (Tinggi 6.4m)</li>
                      <li>Kolam Renang Belakang (Panjang 12m)</li>
                      <li>Double-loaded Corridor Balkon luar kamar</li>
                      <li>Landscape Taman Lobi &amp; Jalur Akses</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 font-sans">
                    <div className="flex gap-1.5 items-center text-blue-800 font-bold text-xs">
                      <Info className="w-4 h-4 shrink-0 text-blue-600" />
                      Informasi Integrasi
                    </div>
                    <p className="text-[10px] text-blue-700 leading-normal">
                      Rendisi 3D ini disinkronisasikan secara akurat dengan data koordinat di lembar <strong>Gambar Kerja (CAD)</strong>. S-Curve juga otomatis diumpankan di sini guna melacak progres rendering material per-minggu.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sound Settings for Walkthrough */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider block">Suara Latar Proyek</h3>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">Aktifkan efek audio ambient suara angin &amp; air mengalir.</p>
                  </div>
                  <button
                    onClick={() => {
                      setHasSound(!hasSound);
                      showToast(hasSound ? 'Audio ambient dinonaktifkan.' : 'Audio ambient diaktifkan!', 'success');
                    }}
                    className={`p-2 rounded-xl transition ${hasSound ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {hasSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="generator"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* INPUT PHOTO SELECTION & PROMPT SETTINGS - 5 cols */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div>
                  <h3 className="text-sm font-black text-[#1E3A8A] font-mono uppercase tracking-wider">
                    1. Pilih Foto Referensi Utama
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pilih gambar render atau blueprint yang ingin ditransformasi menjadi video animasi virtual 3D.
                  </p>
                </div>

                {/* Pre-loaded photos row */}
                <div className="grid grid-cols-3 gap-3">
                  {renderPhotos.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPhoto(p.id);
                        setGeneratedVideoUrl(null);
                        setIsPlayingGenerated(false);
                      }}
                      className={`relative rounded-xl overflow-hidden aspect-video border-2 transition ${selectedPhoto === p.id ? 'border-[#EA580C] ring-2 ring-orange-100' : 'border-slate-200 hover:border-slate-450'}`}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex flex-col justify-end p-2 text-left">
                        <span className="text-[7.5px] font-sans font-black text-white truncate">{p.name}</span>
                        <span className="text-[6px] font-mono text-orange-400 block font-bold uppercase">{p.tag}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Uploader block */}
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <div>
                    <span className="text-[10px] font-mono font-bold block text-slate-700">Unggah Foto Baru</span>
                    <span className="text-[9px] text-slate-400 block">Format JPG/PNG • Maksimal 5 MB</span>
                  </div>
                  
                  <label className="px-3 py-1 bg-white border border-slate-250 text-[9.5px] font-mono font-bold rounded-lg cursor-pointer hover:bg-slate-50 transition">
                    Pilih Berkas...
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomPhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {customPhotoUrl && (
                    <div className="pt-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      <span className="text-[9px] font-mono font-bold text-emerald-600">Foto Kustom Terunggah ✓</span>
                    </div>
                  )}
                </div>
              </div>

              {/* GENERATOR OPTIONS SETTINGS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-black text-[#1E3A8A] font-mono uppercase tracking-wider">
                    2. Pengaturan Prompt AI Video
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Definisikan pergerakan kamera, efek sinematik, serta pencahayaan rendering 3D.
                  </p>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      Instruksi Deskripsi Kamera (Prompt)
                    </label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={3}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-250 rounded-xl focus:border-[#EA580C] focus:outline-none leading-relaxed font-medium text-slate-700"
                      placeholder="Masukkan prompt..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                        Gaya Gerak Kamera
                      </label>
                      <select
                        value={cameraStyle}
                        onChange={(e) => setCameraStyle(e.target.value)}
                        className="w-full text-xs font-sans p-2.5 bg-slate-50 border border-slate-250 rounded-xl focus:outline-none focus:border-[#EA580C]"
                      >
                        <option value="drone_flyby">🚁 Drone Flyby Melingkar</option>
                        <option value="orbit_3d">🔄 360° Orbit Eksterior</option>
                        <option value="lobby_walk">🚪 First-person Lobi Walk</option>
                        <option value="panoramic">📐 Sinematik Panoramatik</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                        Durasi Klip (Detik)
                      </label>
                      <select
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(parseInt(e.target.value))}
                        className="w-full text-xs font-sans p-2.5 bg-slate-50 border border-slate-250 rounded-xl focus:outline-none focus:border-[#EA580C] font-mono"
                      >
                        <option value={10}>10 Detik (Cepat)</option>
                        <option value={25}>25 Detik (Optimal)</option>
                        <option value={60}>60 Detik (Lengkap)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      Kualitas Output Rendering
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRenderQuality('standard')}
                        className={`p-2 border rounded-xl text-xs font-medium transition ${renderQuality === 'standard' ? 'bg-[#EA580C] text-white border-[#EA580C]' : 'bg-slate-50 border-slate-250 text-slate-600 hover:bg-slate-100'}`}
                      >
                        ⚡ Standar (Tanpa Bayangan)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenderQuality('high_raytrace')}
                        className={`p-2 border rounded-xl text-xs font-semibold transition ${renderQuality === 'high_raytrace' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'bg-slate-50 border-slate-250 text-slate-600 hover:bg-slate-100'}`}
                      >
                        ✨ Ultra Ray-Trace 3D (AI)
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={startAIGeneration}
                    disabled={isGenerating}
                    className="w-full py-3 bg-[#EA580C] hover:bg-orange-600 disabled:opacity-50 text-white font-mono text-xs font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    {isGenerating ? 'MENYUSUN VIRTUAL VIDEO...' : 'MULAI GENERASIKAN VIDEO VIRTUAL 3D'}
                  </button>
                </div>
              </div>
            </div>

            {/* VIDEO PLAYER OUT & RENDERING TERMINAL - 7 cols */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              
              {/* VIDEO VIEWER */}
              <div className="bg-slate-950 border border-slate-850 rounded-3xl overflow-hidden h-[450px] relative flex flex-col justify-between shadow-lg">
                
                {/* Header info bar */}
                <div className="absolute left-5 top-5 z-10 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 px-3 rounded-full text-[10px] font-mono text-slate-300">
                  <Film className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>OUTPUT VIRTUAL VIDEO AI</span>
                </div>

                {isGenerating ? (
                  /* RENDERING PROGRESS LOADER */
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-200 space-y-5">
                    <LoaderAnimation />
                    
                    <div className="space-y-1.5 max-w-sm">
                      <span className="font-mono text-xs font-bold text-orange-500 uppercase tracking-widest block">Proses Kompilasi Grafis 3D</span>
                      <p className="text-white text-xs font-bold leading-relaxed">
                        {generationPhase}
                      </p>
                      
                      {/* Percent progress bar */}
                      <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                        <div 
                          className="bg-[#EA580C] h-full rounded-full transition-all duration-150" 
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                      
                      <span className="font-mono text-[10px] text-slate-400 block pt-1 font-bold">
                        Progress: {generationProgress}% • Estimasi sisa: {Math.ceil((100 - generationProgress) * 0.15)} detik
                      </span>
                    </div>
                  </div>
                ) : generatedVideoUrl ? (
                  /* SIMULATED CINEMATIC VIDEO MOVIE PLAYER */
                  <div className="absolute inset-0 w-full h-full">
                    
                    {/* Simulated High-Res Animated Render frame overlay */}
                    {/* Rotates slightly, pans and fades images dynamically to simulate walkthrough video! */}
                    <div className="w-full h-full relative overflow-hidden bg-slate-900">
                      
                      {/* Dynamic slideshow that rotates/scales based on cameraStyle */}
                      <div className="absolute inset-0 w-full h-full">
                        <div className="w-full h-full absolute inset-0 animate-kenBurns shadow-inner">
                          {selectedPhoto === 'front' && (
                            <img
                              src={frontImage}
                              alt="Fasad render"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover origin-center opacity-85 transition-transform"
                            />
                          )}
                          {selectedPhoto === 'pool' && (
                            <img
                              src={poolImage}
                              alt="Pool render"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover origin-center opacity-85"
                            />
                          )}
                          {selectedPhoto === 'evening' && (
                            <img
                              src={eveningImage}
                              alt="Evening render"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover origin-center opacity-85"
                            />
                          )}
                          {selectedPhoto === 'custom' && customPhotoUrl && (
                            <img
                              src={customPhotoUrl}
                              alt="Custom render"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover origin-center opacity-85"
                            />
                          )}
                        </div>

                        {/* High-tech overlays on cinematic player */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/50 flex flex-col justify-between p-6">
                          <div className="flex justify-end pt-1">
                            <span className="px-2.5 py-0.5 bg-green-950 border border-green-800 text-green-400 text-[8px] font-mono rounded font-bold uppercase tracking-wider">
                              PROCESSED WITH AI OMNI-3D
                            </span>
                          </div>

                          {/* Captions */}
                          <div className="space-y-2 text-center max-w-md mx-auto">
                            <div className="bg-black/75 p-3 rounded-xl border border-slate-850">
                              <span className="text-[7px] font-mono text-orange-400 font-bold block uppercase tracking-widest">Walkthrough Captions</span>
                              <p className="text-white text-[10.5px] leading-relaxed mt-0.5">
                                {selectedPhoto === 'front' && 'Mengeksplorasi lobi hotel & fasad utama Kost Foresyndo 2 dengan pilar setinggi 6.4 meter yang kokoh.'}
                                {selectedPhoto === 'pool' && 'Fasilitas kolam renang komunal di halaman belakang yang asri dilengkapi dengan sistem drainase filter terintegrasi.'}
                                {selectedPhoto === 'evening' && 'Tampilan gedung yang megah saat matahari terbenam menampilkan keindahan tata cahaya eksterior Foresyndo 2.'}
                                {selectedPhoto === 'custom' && 'Virtual Video 3D berhasil direkonstruksi dari foto kustom yang Anda unggah secara cerdas.'}
                              </p>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Movie Player Controls bar at bottom */}
                    <div className="absolute bottom-5 left-5 right-5 z-20 bg-slate-900/90 backdrop-blur border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsPlayingGenerated(!isPlayingGenerated)}
                          className="p-1 px-2.5 bg-orange-600 hover:bg-orange-700 text-white font-mono text-[9px] font-black rounded uppercase flex items-center gap-1 transition"
                        >
                          {isPlayingGenerated ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          {isPlayingGenerated ? 'PAUSE' : 'PLAY'}
                        </button>
                        <span className="font-mono text-[10px] text-slate-400">
                          00:12 / 00:{videoDuration}s
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <span className="text-emerald-500 font-bold uppercase text-[9px]">✔ RENDER READY</span>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* NO VIDEO STATE */
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-3">
                    <Video className="w-10 h-10 text-slate-700 animate-pulse" />
                    <div className="space-y-1">
                      <h4 className="text-slate-300 font-mono text-xs uppercase font-bold">Kamera Belum Terbentuk</h4>
                      <p className="text-slate-500 text-xs max-w-xs mx-auto">
                        Pilih foto di panel sebelah kiri lalu tekan tombol <strong>Mulai Generasikan</strong> untuk merekonstruksi video walkthrough 3D.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* DOWNLOAD & EXPORT BLOCK */}
              {generatedVideoUrl && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-black text-slate-800 uppercase block">Ekspor Berhasil Selesai!</span>
                      <p className="text-[10px] text-slate-500 font-sans">Berkas video terbungkus dalam format kontainer MP4 resolusi 1920x1080 (Full-HD).</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      showToast('Mengunduh berkas video walkthrough MP4 (12.4 MB)...', 'success');
                    }}
                    className="p-2 px-4 bg-[#1E3A8A] hover:bg-blue-900 text-white font-mono text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Unduh Video MP4
                  </button>
                </div>
              )}

              {/* EXPLANATORY DISCLAIMER CARD */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-mono text-[10px] font-bold text-slate-750 uppercase">TEKNOLOGI SPPI VIRTUAL VIDEO TOUR:</p>
                  <p className="text-slate-500 text-[10.5px] leading-relaxed">
                    Sistem menggunakan algoritma AI rekonstruksi kedalaman piksel (neural-depth synthesis) untuk mengubah foto arsitektur statis Foresyndo 2 menjadi lintasan video video dinamis. Sudut drone, ray-tracing pencahayaan, dan detail marmer/kaca diproses dengan mengandalkan data as-built dari dokumen CAD resmi.
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Simulated beautiful futuristic AI loader animation
const LoaderAnimation: React.FC = () => {
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <div className="absolute w-20 h-20 border-4 border-slate-850 rounded-full" />
      <div className="absolute w-20 h-20 border-4 border-t-[#EA580C] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
      <div className="absolute w-14 h-14 border-2 border-slate-800 rounded-full" />
      <div className="absolute w-14 h-14 border-2 border-b-[#1E3A8A] border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-reverse" />
      <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
    </div>
  );
};
