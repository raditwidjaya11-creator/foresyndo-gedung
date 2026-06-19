import React, { useState, useMemo } from 'react';
import { rabItems, RAB_METADATA, RABItem } from '../data/rabData';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Building, 
  Download, 
  Filter, 
  Printer, 
  CheckCircle2, 
  ChevronRight, 
  BarChart3, 
  QrCode, 
  ArrowUpRight, 
  Info, 
  Tag,
  FileText,
  Loader2,
  ShieldCheck,
  X,
  Layers,
  TrendingDown,
  TrendingUp,
  Truck,
  Scale,
  Briefcase,
  Pencil,
  Trash2,
  Plus,
  Check,
  RotateCcw
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const RABExplorer: React.FC = () => {
  const [items, setItems] = useState<RABItem[]>(() => {
    try {
      const saved = localStorage.getItem('fgi_rab_items');
      return saved ? JSON.parse(saved) : rabItems;
    } catch {
      return rabItems;
    }
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('Semua');
  const [selectedPage, setSelectedPage] = useState<number | 'Semua'>('Semua');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // PDF Export States
  const [showPDFModal, setShowPDFModal] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<string | null>(null);
  const [downloadMode, setDownloadMode] = useState<'seluruh' | 'terpilih' | 'ringkas'>('seluruh');

  // SUB-NAV TABS FOR THE NEW HIGH-FIDELITY MODULE
  const [activeSubTab, setActiveSubTab] = useState<'spreadsheet' | 'materials'>('spreadsheet');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('Semen');
  const [customNegotiationDiscount, setCustomNegotiationDiscount] = useState<number>(0); // manual discount slider simulation
  const [vendorToggles, setVendorToggles] = useState<Record<string, 'sinar_jaya' | 'central_beton' | 'maju_bersama'>>({
    Semen: 'sinar_jaya',
    Besi: 'sinar_jaya',
    ReadyMix: 'central_beton',
    BataAAC: 'maju_bersama',
    Pasir: 'central_beton',
    Keramik: 'maju_bersama',
    Cat: 'sinar_jaya',
    KabelNYM: 'maju_bersama'
  }); // custom selected vendor for each product for interactive quote simulation

  // Modal / Inline Edit States
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editVolume, setEditVolume] = useState<number>(0);
  const [editUnitPrice, setEditUnitPrice] = useState<number>(0);
  const [editDescription, setEditDescription] = useState<string>('');
  const [editUnit, setEditUnit] = useState<string>('');

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCode, setNewCode] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newChapter, setNewChapter] = useState<string>('Pekerjaan Persiapan');
  const [newVolume, setNewVolume] = useState<number>(1);
  const [newUnit, setNewUnit] = useState<string>('m2');
  const [newUnitPrice, setNewUnitPrice] = useState<number>(0);
  const [newPage, setNewPage] = useState<number>(1);

  // Dynamic calculations for metadata
  const dynamicMetadata = useMemo(() => {
    const subTotal = items.reduce((acc, item) => acc + item.totalCost, 0);
    const taxRate = 0.11; // 11% PPN
    const taxAmount = subTotal * taxRate;
    const grandTotal = subTotal + taxAmount;
    
    // An evaluation status based on final grandTotal target
    let status = 'Aman (On-Budget)';
    if (grandTotal > 14600000000) {
      status = 'Melebihi Target Alokasi (Critical)';
    } else if (grandTotal > 14480000000) {
      status = 'Mendekati Batas Alokasi (Warning)';
    }
    
    return {
      ...RAB_METADATA,
      subTotal,
      taxAmount,
      grandTotal,
      status
    };
  }, [items]);

  const saveItems = (newItems: RABItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem('fgi_rab_items', JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to save items to localStorage', e);
    }
  };

  const startEdit = (item: RABItem) => {
    setEditingItemId(item.id);
    setEditVolume(item.volume);
    setEditUnitPrice(item.unitPrice);
    setEditDescription(item.description);
    setEditUnit(item.unit);
  };

  const handleSaveEdit = (itemId: string) => {
    const updated = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          description: editDescription,
          volume: editVolume,
          unit: editUnit,
          unitPrice: editUnitPrice,
          totalCost: editVolume * editUnitPrice
        };
      }
      return item;
    });
    saveItems(updated);
    setEditingItemId(null);
    showToast('Berhasil menyimpan perubahan item pekerjaan!');
  };

  const handleDeleteItem = (itemId: string, itemCode: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus item pekerjaan dengan Kode ${itemCode}?`)) {
      const updated = items.filter(item => item.id !== itemId);
      saveItems(updated);
      showToast(`Item pekerjaan ${itemCode} berhasil dihapus!`);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newDescription || !newUnit || newVolume <= 0 || newUnitPrice <= 0) {
      alert('Mohon lengkapi data item pekerjaan baru dengan benar.');
      return;
    }

    const newItem: RABItem = {
      id: `rab-custom-${Date.now()}`,
      code: newCode,
      description: newDescription,
      volume: newVolume,
      unit: newUnit,
      unitPrice: newUnitPrice,
      totalCost: newVolume * newUnitPrice,
      chapter: newChapter,
      page: newPage
    };

    const updated = [...items, newItem];
    saveItems(updated);
    setShowAddModal(false);
    
    // Clear add form inputs
    setNewCode('');
    setNewDescription('');
    setNewVolume(1);
    setNewUnitPrice(0);
    
    showToast(`Berhasil menambahkan item pekerjaan baru (${newCode})!`);
  };

  const resetToDefault = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan seluruh daftar RAB ke versi awal? Seluruh penyesuaian Anda akan hilang.')) {
      localStorage.removeItem('fgi_rab_items');
      setItems(rabItems);
      showToast('Seluruh daftar RAB berhasil di-reset ke data bawaan!');
    }
  };

  const chapters = useMemo(() => {
    const set = new Set(items.map(item => item.chapter));
    return ['Semua', ...Array.from(set)];
  }, [items]);

  // Static defined rules for realistic construction materials in PT FGI Majalengka project
  const materialsData = useMemo(() => {
    // 1. Semen
    const semenItems = items.filter(item => 
      item.description.toLowerCase().includes('semen') || 
      item.description.toLowerCase().includes('plesteran') || 
      item.description.toLowerCase().includes('bata')
    );
    const semenBaseQty = 8130; // Zak
    
    // 2. Besi
    const besiItems = items.filter(item => 
      item.description.toLowerCase().includes('pembesian') || 
      item.description.toLowerCase().includes('besi') || 
      item.description.toLowerCase().includes('sengkang')
    );
    const besiBaseQty = 189000; // Kg
 
    // 3. Ready Mix
    const concreteItems = items.filter(item => 
      item.description.toLowerCase().includes('beton k-') || 
      item.description.toLowerCase().includes('ready mix')
    );
    const concreteBaseQty = 1130; // m³
 
    // 4. Bata AAC / ringan
    const bataItems = items.filter(item => 
      item.description.toLowerCase().includes('bata') || 
      item.description.toLowerCase().includes('dinding')
    );
    const bataBaseQty = 730; // m³
 
    // 5. Pasir Pasang
    const pasirItems = items.filter(item => 
      item.description.toLowerCase().includes('pasir') || 
      item.description.toLowerCase().includes('urug')
    );
    const pasirBaseQty = 1250; // m³
 
    // 6. Keramik
    const keramikItems = items.filter(item => 
      item.description.toLowerCase().includes('lantai') || 
      item.description.toLowerCase().includes('keramik') || 
      item.description.toLowerCase().includes('tile')
    );
    const keramikBaseQty = 2850; // Dus
 
    // 7. Cat
    const catItems = items.filter(item => 
      item.description.toLowerCase().includes('cat') || 
      item.description.toLowerCase().includes('painting') || 
      item.description.toLowerCase().includes('dinding')
    );
    const catBaseQty = 145; // Pail
 
    // 8. Kabel NYM
    const kabelItems = items.filter(item => 
      item.description.toLowerCase().includes('kabel') || 
      item.description.toLowerCase().includes('instalasi') || 
      item.description.toLowerCase().includes('listrik')
    );
    const kabelBaseQty = 160; // Roll
 
    return [
      {
        id: 'Semen',
        name: 'Semen Abu PCC (Tiga Roda / Gresik)',
        category: 'Struktur & Plesteran',
        unit: 'Zak (@50 Kg)',
        qty: semenBaseQty,
        baselinePrice: 74500,
        formula: 'Rumus: ~5.5 Zak/m³ beton struktur & ~0.15 Zak/m² plesteran acian',
        linkedCount: semenItems.length,
        vendors: {
          sinar_jaya: { name: 'PT Sinar Jaya Utama (Majalengka)', price: 71500, leadTime: '1-2 Hari', moq: '200 Zak', rating: 4.8 },
          central_beton: { name: 'Central Beton Kertajati', price: 76000, leadTime: '1 Hari', moq: '100 Zak', rating: 4.5 },
          maju_bersama: { name: 'Maju Bersama Cirebon', price: 73600, leadTime: '2-3 Hari', moq: '500 Zak', rating: 4.2 }
        }
      },
      {
        id: 'Besi',
        name: 'Besi Beton Ulir & Polos Krakatau Steel',
        category: 'Struktur Pondasi & Kolom',
        unit: 'Kg',
        qty: besiBaseQty,
        baselinePrice: 14800,
        formula: 'Rumus: Rata-rata benchmark pembesian 105 Kg per m³ beton bertulang',
        linkedCount: besiItems.length,
        vendors: {
          sinar_jaya: { name: 'PT Sinar Jaya Utama (Majalengka)', price: 14150, leadTime: '3-4 Hari', moq: '5,000 Kg', rating: 4.9 },
          central_beton: { name: 'Central Beton Kertajati', price: 15300, leadTime: '2 Hari', moq: '2,000 Kg', rating: 4.4 },
          maju_bersama: { name: 'Maju Bersama Cirebon', price: 14850, leadTime: '3-5 Hari', moq: '10,000 Kg', rating: 4.1 }
        }
      },
      {
        id: 'ReadyMix',
        name: 'Beton Cor Ready Mix K-350 Slump 12',
        category: 'Struktur Plat & Balok',
        unit: 'm³',
        qty: concreteBaseQty,
        baselinePrice: 980000,
        formula: 'Rumus: Volume cor struktural basah + toleransi waste bekisting 3%',
        linkedCount: concreteItems.length,
        vendors: {
          sinar_jaya: { name: 'PT Sinar Jaya Utama (Majalengka)', price: 995000, leadTime: '1 Hari', moq: '6 m³ (1 Mixer)', rating: 4.6 },
          central_beton: { name: 'Central Beton Kertajati', price: 928000, leadTime: '1 Hari', moq: '3 m³ (Mini Mixer)', rating: 4.9 },
          maju_bersama: { name: 'Maju Bersama Cirebon', price: 965000, leadTime: '2 Hari', moq: '6 m³ (1 Mixer)', rating: 4.3 }
        }
      },
      {
        id: 'BataAAC',
        name: 'Batu Bata Ringan AAC Heibel (Tebal 10cm)',
        category: 'Arsitektur & Dinding',
        unit: 'm³',
        qty: bataBaseQty,
        baselinePrice: 780000,
        formula: 'Rumus: Luas dinding bata 7,300 m² dikali tebal 10cm',
        linkedCount: bataItems.length,
        vendors: {
          sinar_jaya: { name: 'PT Sinar Jaya Utama (Majalengka)', price: 765000, leadTime: '2 Hari', moq: '12.6 m³ (1 Colt)', rating: 4.7 },
          central_beton: { name: 'Central Beton Kertajati', price: 810000, leadTime: '1-2 Hari', moq: '5 m³', rating: 4.2 },
          maju_bersama: { name: 'Maju Bersama Cirebon', price: 748000, leadTime: '3 Hari', moq: '12.6 m³ (1 Colt)', rating: 4.8 }
        }
      },
      {
        id: 'Pasir',
        name: 'Pasir Beton & Pasir Urang Cimalaka',
        category: 'Pondasi & Pasangan',
        unit: 'm³',
        qty: pasirBaseQty,
        baselinePrice: 290000,
        formula: 'Rumus: Campuran adukan semen-pasir 1:4 s/d 1:6 + urugan bawah lantai',
        linkedCount: pasirItems.length,
        vendors: {
          sinar_jaya: { name: 'PT Sinar Jaya Utama (Majalengka)', price: 285500, leadTime: '1 Hari', moq: '7 m³ (1 Dump)', rating: 4.7 },
          central_beton: { name: 'Central Beton Kertajati', price: 269000, leadTime: '1 Hari', moq: '7 m³ (1 Dump)', rating: 4.8 },
          maju_bersama: { name: 'Maju Bersama Cirebon', price: 310000, leadTime: '2 Hari', moq: '14 m³', rating: 4.0 }
        }
      },
      {
        id: 'Keramik',
        name: 'Granit Tile 60x60 Polished (Eks. Indogress)',
        category: 'Finishing Lantai & Dinding',
        unit: 'Dus',
        qty: keramikBaseQty,
        baselinePrice: 185000,
        formula: 'Rumus: Luas lantai bersih + cadangan waste pecah pemotongan 5%',
        linkedCount: keramikItems.length,
        vendors: {
          sinar_jaya: { name: 'PT Sinar Jaya Utama (Majalengka)', price: 186000, leadTime: '3 Hari', moq: '50 Dus', rating: 4.4 },
          central_beton: { name: 'Central Beton Kertajati', price: 194500, leadTime: '2 Hari', moq: '10 Dus', rating: 4.1 },
          maju_bersama: { name: 'Maju Bersama Cirebon', price: 175500, leadTime: '4 Hari', moq: '100 Dus', rating: 4.9 }
        }
      },
      {
        id: 'Cat',
        name: 'Cat WeatherShield Eksterior/Interior (Jotun)',
        category: 'Finishing Dekoratif Tembok',
        unit: 'Pail (@25 Kg)',
        qty: catBaseQty,
        baselinePrice: 1650000,
        formula: 'Rumus: Estimasi luas pengecatan 7 lantai 11,600 m² (2 lapis s/d 3 lapis)',
        linkedCount: catItems.length,
        vendors: {
          sinar_jaya: { name: 'PT Sinar Jaya Utama (Majalengka)', price: 1590000, leadTime: '2 Hari', moq: '10 Pail', rating: 4.8 },
          central_beton: { name: 'Central Beton Kertajati', price: 1780000, leadTime: '1 Hari', moq: '5 Pail', rating: 4.0 },
          maju_bersama: { name: 'Maju Bersama Cirebon', price: 1550000, leadTime: '3-4 Hari', moq: '20 Pail', rating: 4.7 }
        }
      },
      {
        id: 'KabelNYM',
        name: 'Kabel Tembaga NYM 3x2.5 Sqmm (Supreme SNI)',
        category: 'Instalasi MEP Listrik',
        unit: 'Roll (@50 m)',
        qty: kabelBaseQty,
        baselinePrice: 820000,
        formula: 'Rumus: Tarikan daya per titik outlet stopkontak & saklar kontrol',
        linkedCount: kabelItems.length,
        vendors: {
          sinar_jaya: { name: 'PT Sinar Jaya Utama (Majalengka)', price: 838000, leadTime: '2 Hari', moq: '5 Roll', rating: 4.5 },
          central_beton: { name: 'Central Beton Kertajati', price: 857000, leadTime: '1-2 Hari', moq: '5 Roll', rating: 4.2 },
          maju_bersama: { name: 'Maju Bersama Cirebon', price: 785000, leadTime: '3-4 Hari', moq: '10 Roll', rating: 4.9 }
        }
      }
    ];
  }, [items]);

  // Reactive calculation engine for structural material analysis & vendor options
  const materialsSummary = useMemo(() => {
    let totalBaselineCost = 0;
    let totalSourcedCost = 0;

    const materialsWithStatus = materialsData.map(material => {
      const selectedVendorKey = vendorToggles[material.id] || 'sinar_jaya';
      const vendorInfo = material.vendors[selectedVendorKey];
      
      const baselineSubtotal = material.qty * material.baselinePrice;
      const vendorSubtotal = material.qty * vendorInfo.price;

      totalBaselineCost += baselineSubtotal;
      totalSourcedCost += vendorSubtotal;

      const varianceAbs = vendorSubtotal - baselineSubtotal;
      const variancePercent = baselineSubtotal > 0 ? (varianceAbs / baselineSubtotal) * 100 : 0;

      return {
        ...material,
        selectedVendorKey,
        vendorInfo,
        baselineSubtotal,
        vendorSubtotal,
        varianceAbs,
        variancePercent
      };
    });

    // Apply manual negotiation slider discount if active selected material is discounted
    const currentSelectedMaterial = materialsWithStatus.find(m => m.id === selectedMaterialId);
    let negotiatedSavings = 0;
    if (currentSelectedMaterial && customNegotiationDiscount > 0) {
      negotiatedSavings = currentSelectedMaterial.vendorSubtotal * (customNegotiationDiscount / 100);
      totalSourcedCost -= negotiatedSavings;
    }

    const totalSavings = totalBaselineCost - totalSourcedCost;
    const savingsPercent = totalBaselineCost > 0 ? (totalSavings / totalBaselineCost) * 100 : 0;

    let cheapestSplitCost = 0;
    materialsData.forEach(m => {
      const prices = Object.values(m.vendors as Record<string, any>).map(v => v.price);
      const minPrice = Math.min(...prices, m.baselinePrice);
      cheapestSplitCost += minPrice * m.qty;
    });
    const maxSavings = totalBaselineCost - cheapestSplitCost;
    const maxSavingsPercent = totalBaselineCost > 0 ? (maxSavings / totalBaselineCost) * 100 : 0;

    return {
      materials: materialsWithStatus,
      totalBaselineCost,
      totalSourcedCost,
      totalSavings,
      savingsPercent,
      negotiatedSavings,
      cheapestSplitCost,
      maxSavings,
      maxSavingsPercent
    };
  }, [materialsData, vendorToggles, selectedMaterialId, customNegotiationDiscount]);

  // Format IDR money beautifully
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Filter items matching terms, chapters, or pages
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchChapter = selectedChapter === 'Semua' || item.chapter === selectedChapter;
      const matchPage = selectedPage === 'Semua' || item.page === selectedPage;
      return matchSearch && matchChapter && matchPage;
    });
  }, [items, searchTerm, selectedChapter, selectedPage]);

  // Aggregate stats based on matched data vs full data
  const pageStats = useMemo(() => {
    const totalSelectedCost = filteredItems.reduce((acc, item) => acc + item.totalCost, 0);
    
    // Distribution per chapter on the *entire* RAB dataset
    const chapterDistribution = items.reduce((acc: Record<string, number>, item) => {
      acc[item.chapter] = (acc[item.chapter] || 0) + item.totalCost;
      return acc;
    }, {});

    return {
      totalSelectedCost,
      countSelected: filteredItems.length,
      chapterDistribution
    };
  }, [items, filteredItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const exportCSV = () => {
    const headers = 'Kode,Chapter,Uraian Pekerjaan,Volume,Satuan,Harga Satuan (Rp),Total Biaya (Rp)\n';
    const rows = items.map(item => {
      const descEscaped = `"${item.description.replace(/"/g, '""')}"`;
      return `${item.code},"${item.chapter}",${descEscaped},${item.volume},${item.unit},${item.unitPrice},${item.totalCost}`;
    }).join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `FGI_Detail_RAB_${dynamicMetadata.projectNo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Sukses mengekspor CSV seluruh item RAB!');
  };

  const printDocument = () => {
    window.print();
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

  // Helper to append signatures and QR code sign-offs to PDF
  const renderSignatures = (doc: jsPDF, startY: number, estQr: string, pmQr: string) => {
    // Check if drawing near bottom page and add break
    if (startY > 210) {
      doc.addPage();
      startY = 25;
    }

    // Divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, startY, 195, startY);

    // Section title
    doc.setTextColor(30, 58, 138); // Blue 900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('LEMBAR PENGESAHAN DOKUMEN DIGITAL (PR-2026-FGI-004)', 15, startY + 6);
    
    doc.setDrawColor(234, 88, 12); // Orange 600
    doc.line(15, startY + 8, 115, startY + 8);

    const sigBoxY = startY + 12;

    // Draw Column 1: Estimator
    doc.setFillColor(248, 250, 252);
    doc.rect(15, sigBoxY, 82, 58, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, sigBoxY, 82, 58, 'D');

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('DIRESTRUKTURISASI & DISIAPKAN OLEH', 18, sigBoxY + 5);
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(8);
    doc.text('Tim Estimator Proyek PT FGI', 18, sigBoxY + 10);

    if (estQr) {
      doc.addImage(estQr, 'PNG', 41, sigBoxY + 13, 30, 30);
    }
    
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('ID: EST-RABID-WZWY2', 18, sigBoxY + 47);
    doc.setTextColor(16, 185, 129); // Emerald 500
    doc.setFont('helvetica', 'bold');
    doc.text('VERIFIED QR DIGITAL SIGNATURE', 18, sigBoxY + 51);

    // Draw Column 2: PM
    doc.setFillColor(248, 250, 252);
    doc.rect(113, sigBoxY, 82, 58, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(113, sigBoxY, 82, 58, 'D');

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('DITINJAU & DISETUJUI OLEH', 116, sigBoxY + 5);
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(8);
    doc.text('Project Manager (PM)', 116, sigBoxY + 10);

    if (pmQr) {
      doc.addImage(pmQr, 'PNG', 139, sigBoxY + 13, 30, 30);
    }

    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('ID: PM-RABID-PN1CU', 116, sigBoxY + 47);
    doc.setTextColor(16, 185, 129); // Emerald 500
    doc.setFont('helvetica', 'bold');
    doc.text('VERIFIED QR DIGITAL SIGNATURE', 116, sigBoxY + 51);

    // Disclaimer text at very bottom
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6);
    doc.text('* Seluruh QR-code di atas terintegrasi ke dalam sistem hash blockchain PT Foresyndo Global Indonesia untuk menjamin orisinalitas audit data.', 15, sigBoxY + 65);
    doc.text('  Dan mencegah manipulasi nominal rencana anggaran biaya (RAB).', 15, sigBoxY + 68);
  };

  // Principal high-fidelity PDF Generation Sequence
  const generatePDFDefault = async (mode: 'seluruh' | 'terpilih' | 'ringkas') => {
    setPdfProgress('Mengunduh & memproses QR code pengesahan...');
    
    const origin = window.location.origin;
    const estQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(origin + '/?verify=EST-RABID-WZWY2')}`;
    const pmQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(origin + '/?verify=PM-RABID-PN1CU')}`;

    try {
      const [estQrBase64, pmQrBase64] = await Promise.all([
        fetchBase64Image(estQrUrl),
        fetchBase64Image(pmQrUrl)
      ]);

      setPdfProgress('Menyusun lembar sertifikat & struktur nominal...');
      
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Page 1: COVER SHEET & EXECUTIVE SUMMARY
      // Draw border frame
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
      doc.text(dynamicMetadata.companyName, 20, 19);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('ESTIMATOR & COMPLIANCE PROCUREMENT SYSTEM - BANDARA KERTAJATI', 20, 26);
      
      // Document Metadata Block
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('RENCANA ANGGARAN BIAYA (RAB)', 20, 42);
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text('DOKUMEN AUDIT FISIK & REKONSILIASI KEUANGAN RESMI', 20, 48);
      
      // Divider line
      doc.setDrawColor(234, 88, 12); // Orange 600
      doc.setLineWidth(1.5);
      doc.line(20, 52, 190, 52);
      
      // Information Grid
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('PARAMETER LAPORAN', 20, 60);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(8);
      
      // Col 1 details
      doc.setFont('helvetica', 'bold'); doc.text('Nama Proyek:', 20, 67); doc.setFont('helvetica', 'normal');
      doc.text('Pembangunan Gedung 7 Lantai (Foresyndo 2)', 46, 67);
      
      doc.setFont('helvetica', 'bold'); doc.text('Nomor Kontrak:', 20, 72); doc.setFont('helvetica', 'normal');
      doc.text(dynamicMetadata.projectNo, 46, 72);

      doc.setFont('helvetica', 'bold'); doc.text('Lokasi Audit:', 20, 77); doc.setFont('helvetica', 'normal');
      doc.text(dynamicMetadata.projectLocation, 46, 77);

      doc.setFont('helvetica', 'bold'); doc.text('Pengembang:', 20, 82); doc.setFont('helvetica', 'normal');
      doc.text('PT Foresyndo Global Indonesia', 46, 82);

      // Col 2 details
      doc.setFont('helvetica', 'bold'); doc.text('Tanggal Terbit:', 115, 67); doc.setFont('helvetica', 'normal');
      doc.text(dynamicMetadata.date, 140, 67);
      
      doc.setFont('helvetica', 'bold'); doc.text('Batas Toleransi:', 115, 72); doc.setFont('helvetica', 'normal');
      doc.text('± 5.0% APBD/RAB Sektoral', 140, 72);

      doc.setFont('helvetica', 'bold'); doc.text('NPWP Pajak:', 115, 77); doc.setFont('helvetica', 'normal');
      doc.text('03.111.442.1-411.000', 140, 77);

      doc.setFont('helvetica', 'bold'); doc.text('NIB Nomor:', 115, 82); doc.setFont('helvetica', 'normal');
      doc.text('9120003482711', 140, 82);

      // Outline summary calculation block
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.rect(20, 88, 170, 24, 'FD');

      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('REKAPITULASI NOMINAL INTERNAL - RESMI (TERAUDIT)', 25, 94);
      
      doc.setTextColor(234, 88, 12);
      doc.setFontSize(14);
      doc.text(formatIDR(dynamicMetadata.grandTotal), 25, 104);
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Sudah mencakup Nilai Dasar Pekerjaan Konstruksi dan PPN Pajak Pertambahan Nilai 11%', 102, 104);

      // Summary Chapters Table (Table inside summary page)
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('PROPORSI ANGGARAN & DISTRIBUSI SEKTOR UTAMA', 20, 118);

      const chSummaryRows = Object.keys(pageStats.chapterDistribution).map((ch, idx) => {
        const val = pageStats.chapterDistribution[ch];
        return [
          `Sektor ${idx + 1}`,
          ch,
          formatIDR(val),
          `${((val / dynamicMetadata.grandTotal) * 100).toFixed(1)}%`
        ];
      });

      autoTable(doc, {
        startY: 122,
        margin: { left: 20, right: 20 },
        head: [['Instalasi', 'Rincian Sektor Pekerjaan', 'Rencana Anggaran (Rp)', 'Persentase']],
        body: chSummaryRows,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138], fontSize: 8, font: 'helvetica', fontStyle: 'bold' },
        bodyStyles: { fontSize: 7.5, font: 'helvetica' },
        columnStyles: {
          0: { halign: 'center', cellWidth: 20 },
          1: { cellWidth: 80 },
          2: { halign: 'right', cellWidth: 40 },
          3: { halign: 'center', cellWidth: 30 }
        }
      });

      let nextY = (doc as any).lastAutoTable.finalY + 8;

      if (mode === 'ringkas') {
        renderSignatures(doc, nextY, estQrBase64, pmQrBase64);
      } else {
        setPdfProgress('Menyusun daftar tabel pekerjaan kontruksi detail...');
        doc.addPage();
        
        // Header detail pages
        doc.setLineWidth(0.5);
        doc.setDrawColor(226, 232, 240);
        doc.line(15, 15, 195, 15);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(`Daftar Rincian Pekerjaan Sipil & MEP - Kontrak: ${dynamicMetadata.projectNo}`, 15, 12);
        doc.text(`Hal. 2 (Audit Lampiran)`, 160, 12);

        const itemsToExport = mode === 'terpilih' ? filteredItems : items;

        const tableBody = itemsToExport.map(item => [
          item.code,
          item.description,
          item.volume.toLocaleString('id-ID'),
          item.unit,
          item.unitPrice.toLocaleString('id-ID'),
          item.totalCost.toLocaleString('id-ID')
        ]);

        autoTable(doc, {
          startY: 19,
          margin: { left: 15, right: 15 },
          head: [['Kode', 'Uraian Detail Pekerjaan Konstruksi', 'Volume', 'Sat', 'Harga Satuan (Rp)', 'Total Biaya (Rp)']],
          body: tableBody,
          theme: 'striped',
          headStyles: { fillColor: [30, 58, 138], fontSize: 8, font: 'helvetica', fontStyle: 'bold' },
          bodyStyles: { fontSize: 7, font: 'helvetica' },
          columnStyles: {
            0: { halign: 'center', cellWidth: 15 },
            1: { cellWidth: 73 },
            2: { halign: 'right', cellWidth: 14 },
            3: { halign: 'center', cellWidth: 12 },
            4: { halign: 'right', cellWidth: 32 },
            5: { halign: 'right', cellWidth: 34 }
          },
          didDrawPage: (data) => {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(6.5);
            doc.setTextColor(148, 163, 184);
            doc.text('Laporan Audit Resmi - PT Foresyndo Global Indonesia Digital Procurement System', 15, 290);
            doc.text(`Halaman ${data.pageNumber}`, 180, 290);
          }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 12;
        renderSignatures(doc, finalY, estQrBase64, pmQrBase64);
      }

      setPdfProgress(null);
      setShowPDFModal(false);
      doc.save(`FGI_RAB_${mode === 'terpilih' ? 'FILTERED' : 'FULL'}_${dynamicMetadata.projectNo}.pdf`);
      showToast('Sukses mengunduh Dokumen Laporan Hasil Audit & RAB Resmi (PDF)!');
    } catch (e) {
      console.error(e);
      setPdfProgress(null);
      showToast('Gagal memproses pembuatan berkas PDF. Mohon ulangi beberapa saat lagi.');
    }
  };


  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* GLOBAL BANNER NOTIFIERS */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E3A8A] text-white border-b-4 border-[#EA580C] px-5 py-3.5 rounded-xl shadow-2xl animate-bounce flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-orange-400" />
          <span className="text-xs font-mono font-bold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION METADATA */}
      <div className="bg-[#1E3A8A] text-white rounded-3xl p-6 md:p-8 shadow-xl border-b-4 border-orange-500 relative overflow-hidden">
        {/* Subtle decorative grid overlay */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono tracking-widest text-[#EA580C] font-semibold">
              <span className="px-2 py-0.5 bg-orange-500 text-white rounded text-[10px]">VERIFIED PDF DIRECTORY</span>
              <span>PT FORESYNDO GLOBAL INDONESIA</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight mt-2">
              Rencana Anggaran Biaya (RAB)
            </h1>
            
            <p className="text-blue-100 text-sm mt-1 max-w-2xl font-light">
              Mengekstraksi data asli lembar RAB Struktur, Arsitektur, MEP, Kolam Renang, dan Fasilitas Penunjang untuk Pembangunan Gedung 7 Lantai 12x20 Meter Jati Tujuh - Majalengka.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-xs font-mono text-blue-200">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-orange-400" />
                No. Proyek: {dynamicMetadata.projectNo}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                {dynamicMetadata.projectLocation}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                Tanggal Audit: {dynamicMetadata.date}
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-right w-full md:w-auto">
            <span className="text-[10px] text-slate-350 font-mono font-bold uppercase block tracking-wider">TOTAL NILAI RAB RESMI</span>
            <span className="text-2xl md:text-3xl font-black font-mono text-orange-400 tracking-tight block mt-1">
              {formatIDR(dynamicMetadata.grandTotal)}
            </span>
            <div className="flex justify-end gap-1.5 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                dynamicMetadata.status.includes('Critical') 
                  ? 'bg-rose-500/20 text-rose-450 border-rose-500/30' 
                  : dynamicMetadata.status.includes('Warning') 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  dynamicMetadata.status.includes('Critical') 
                    ? 'bg-rose-400' 
                    : dynamicMetadata.status.includes('Warning') 
                      ? 'bg-amber-400' 
                      : 'bg-emerald-400'
                }`}></span>
                Evaluasi: {dynamicMetadata.status}
              </span>
            </div>
          </div>
        </div>
      </div>
              {/* INTERNAL NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 gap-4 mt-2 bg-slate-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveSubTab('spreadsheet')}
          className={`flex-1 sm:flex-initial py-3 px-6 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 outline-none ${
            activeSubTab === 'spreadsheet' 
              ? 'bg-white text-[#1E3A8A] shadow-sm border border-slate-200' 
              : 'text-slate-600 hover:text-slate-900 border border-transparent'
          }`}
        >
          <FileText className="w-4 h-4 text-orange-500" />
          <span>Lembar Kerja RAB Utama (Spreadsheet)</span>
        </button>
        <button
          onClick={() => setActiveSubTab('materials')}
          className={`flex-1 sm:flex-initial py-3 px-6 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 outline-none ${
            activeSubTab === 'materials' 
              ? 'bg-white text-[#1E3A8A] shadow-sm border border-slate-200' 
              : 'text-slate-600 hover:text-slate-900 border border-transparent'
          }`}
        >
          <Layers className="w-4 h-4 text-[#1E3A8A]" />
          <span className="flex items-center gap-1.5">
            Analisis Kebutuhan Material &amp; Vendor
            <span className="bg-orange-500 text-white px-1.5 py-0.5 text-[8px] rounded-md font-mono font-black uppercase tracking-wider animate-pulse">Update</span>
          </span>
        </button>
      </div>

      {activeSubTab === 'spreadsheet' ? (
        <>
          {/* COST ANALYSIS PILLARS */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {chapters.filter(c => c !== 'Semua').map((ch, idx) => {
              const chCost = pageStats.chapterDistribution[ch] || 0;
              const isSelected = selectedChapter === ch;
              const bgColors = [
                'from-blue-50 to-blue-100/30 hover:from-blue-50 hover:to-blue-100/60 border-blue-200 text-blue-900',
                'from-emerald-50 to-emerald-100/30 hover:from-emerald-50 hover:to-emerald-100/60 border-emerald-200 text-emerald-900',
                'from-purple-50 to-purple-100/30 hover:from-purple-50 hover:to-purple-100/60 border-purple-200 text-purple-900',
                'from-amber-50 to-amber-100/30 hover:from-amber-50 hover:to-amber-100/60 border-amber-200 text-amber-900',
                'from-rose-50 to-rose-100/30 hover:from-rose-50 hover:to-rose-100/60 border-rose-200 text-rose-900'
              ];
              const textColors = ['text-blue-600', 'text-emerald-600', 'text-purple-600', 'text-amber-600', 'text-rose-600'];
              const customIconColor = isSelected ? 'text-orange-400' : textColors[idx % textColors.length];
              
              return (
                <button
                  key={ch}
                  onClick={() => setSelectedChapter(isSelected ? 'Semua' : ch)}
                  className={`p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer group shadow-sm relative overflow-hidden select-none outline-none ${
                    isSelected 
                      ? 'bg-gradient-to-br from-[#1E3A8A] to-[#111827] text-white border-b-4 border-orange-500 ring-4 ring-[#1E3A8A]/10 scale-[1.03] -translate-y-0.5 shadow-md' 
                      : `bg-gradient-to-br ${bgColors[idx % bgColors.length]} border-slate-200`
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-[9px] font-mono uppercase tracking-wider font-extrabold block ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                      Kategori {idx + 1}
                    </span>
                    <Tag className={`w-3.5 h-3.5 ${customIconColor} opacity-90 group-hover:scale-110 transition-transform`} />
                  </div>
                  <h4 className="text-xs font-bold mt-2 truncate line-clamp-1 block tracking-tight">{ch}</h4>
                  <p className={`text-sm font-black font-mono mt-1.5 ${isSelected ? 'text-orange-400 font-extrabold' : ''}`}>
                    {formatIDR(chCost)}
                  </p>
                  <div className={`flex justify-between text-[9px] font-mono mt-2 pb-0.5 border-t pt-1.5 ${isSelected ? 'border-white/10 text-slate-305' : 'border-slate-200/55 text-slate-450'}`}>
                    <span>Porsi Anggaran:</span>
                    <span className="font-bold">{((chCost / dynamicMetadata.grandTotal) * 100).toFixed(1)}%</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* SELECTION INTERACTIVE FILTER ROW */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
              
              {/* Search bar inside container */}
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input 
                  type="text" 
                  placeholder="Cari kata kunci uraian pekerjaan (misal: 'Bored Pile', 'Lantai', 'MEP', atau '3.10')..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs text-slate-800 border border-slate-250 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Chapter Selection */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Sektor:</span>
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    className="bg-slate-50 hover:bg-slate-100/50 text-xs font-mono font-semibold text-slate-700 px-3 py-2 border border-slate-250 rounded-xl outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 cursor-pointer"
                  >
                    {chapters.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Page number cross reference */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Halaman PDF:</span>
                  <select
                    value={selectedPage}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedPage(val === 'Semua' ? 'Semua' : parseInt(val));
                    }}
                    className="bg-slate-50 hover:bg-slate-100/50 text-xs font-mono font-semibold text-slate-700 px-3 py-2 border border-slate-250 rounded-xl outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 cursor-pointer"
                  >
                    <option value="Semua">Semua (Halaman 1-5)</option>
                    <option value={1}>Halaman 1 (Persiapan &amp; Pondasi Substruktur)</option>
                    <option value={2}>Halaman 2 (Superstruktur &amp; Arsitektur)</option>
                    <option value={3}>Halaman 3 (Finishing Kamar Mandi &amp; Listrik)</option>
                    <option value={4}>Halaman 4 (Plumbing, Fire Fighting, HVAC &amp; Kolam Renang)</option>
                    <option value={5}>Halaman 5 (Pekerjaan Cafe, Luar, Testing &amp; Crane)</option>
                  </select>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2 pl-2 lg:border-l lg:border-slate-200">
                  <button
                    onClick={() => setShowAddModal(true)}
                    title="Tambah Item Pekerjaan Baru ke RAB"
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer font-bold duration-150"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    <span className="text-xs font-mono font-bold">Tambah Item</span>
                  </button>

                  <button
                    onClick={() => setShowPDFModal(true)}
                    title="Unduh Laporan PDF Resmi"
                    className="p-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#1E307A] text-white hover:brightness-110 shadow-md hover:shadow-lg rounded-xl transition flex items-center gap-1.5 cursor-pointer font-bold"
                  >
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-mono font-bold">Unduh PDF Resmi</span>
                  </button>

                  <button
                    onClick={exportCSV}
                    title="Ekspor CSV"
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-250 text-slate-600 hover:text-slate-900 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-orange-500" />
                    <span className="hidden sm:inline text-xs font-mono font-bold">CSV</span>
                  </button>
                  
                  <button
                    onClick={resetToDefault}
                    title="Reset RAB ke Data Bawaan Pabrik"
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-600 hover:text-rose-900 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 animate-spin-slow" />
                    <span className="hidden sm:inline text-xs font-mono font-bold font-semibold">Reset</span>
                  </button>

                  <button
                    onClick={printDocument}
                    title="Cetak RAB"
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-250 text-slate-600 hover:text-slate-900 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline text-xs font-mono font-bold">Cetak</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Selected aggregation summary */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 rounded-xl border border-slate-200 text-xs font-mono gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Info className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                  <span className="text-slate-700 font-medium">Kriteria Filter Terpilih:</span>
                  <strong className="text-slate-900 font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px]">{pageStats.countSelected} item pekerjaan</strong>
                  {selectedChapter !== 'Semua' && (
                    <span className="bg-[#1E3A8A]/10 text-[#1E3A8A] px-2 py-0.5 rounded text-[9px] font-bold border border-[#1E3A8A]/20">
                      {selectedChapter}
                    </span>
                  )}
                  {selectedPage !== 'Semua' && (
                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[9px] font-bold border border-orange-200">
                      Halaman {selectedPage}
                    </span>
                  )}
                  {(selectedChapter !== 'Semua' || selectedPage !== 'Semua' || searchTerm !== '') && (
                    <button
                      onClick={() => {
                        setSelectedChapter('Semua');
                        setSelectedPage('Semua');
                        setSearchTerm('');
                      }}
                      className="px-2 py-0.5 text-rose-600 bg-rose-50 border border-rose-250 rounded text-[9px] hover:bg-rose-100 font-bold transition cursor-pointer"
                    >
                      Lapang Filter
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans font-normal">
                  Rincian anggaran di bawah disaring secara real-time berdasarkan pencarian kata kunci dan parameter sektor/halaman proyek di atas.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shrink-0 w-full lg:w-auto">
                {/* budget portion progress bar */}
                <div className="space-y-1 sm:w-48 bg-white p-2 rounded-lg border border-slate-200/60 shadow-sm">
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                    <span>PORSI ANGGARAN:</span>
                    <span className="text-[#1E3A8A]">{((pageStats.totalSelectedCost / (dynamicMetadata.grandTotal || 1)) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-[#1E3A8A] h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, ((pageStats.totalSelectedCost / (dynamicMetadata.grandTotal || 1)) * 100))}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-[#1E3A8A]/5 border border-[#1E3A8A]/10 p-2 px-3.5 rounded-lg text-right flex flex-col justify-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Subtotal Kelompok</span>
                  <strong className="text-[#1E3A8A] text-sm sm:text-base font-black tracking-tight font-mono mt-0.5">
                    {formatIDR(pageStats.totalSelectedCost)}
                  </strong>
                </div>
              </div>
            </div>

          </div>

          {/* MASTER SPREADSHEET TABLE CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1E3A8A] text-white border-b-2 border-orange-500 font-mono text-[10px] tracking-wider uppercase">
                    <th className="py-3 px-4 text-center w-16">Kode</th>
                    <th className="py-3 px-6">Uraian Pekerjaan</th>
                    <th className="py-3 px-4 text-right w-24">Vol</th>
                    <th className="py-3 px-3 text-center w-20">Satuan</th>
                    <th className="py-3 px-6 text-right w-36">Harga Satuan (Rp)</th>
                    <th className="py-3 px-6 text-right w-44">Total Biaya (Rp)</th>
                    <th className="py-3 px-4 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-800">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400 font-semibold">
                        Tidak menemukan item RAB yang cocok dengan kriteria filter atau pencarian Anda.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, idx) => {
                      const isHighCost = item.totalCost >= 100000000; // Highlight items >= 100 Million
                      const isEditing = editingItemId === item.id;
                      return (
                        <tr 
                          key={item.id} 
                          className={`hover:bg-slate-50 transition ${idx % 2 === 1 ? 'bg-slate-50/20' : ''} ${isEditing ? 'bg-orange-50/20 border-l-4 border-orange-500' : ''}`}
                        >
                          <td className="py-3 px-4 text-center font-bold text-slate-500">
                            {item.code}
                          </td>
                          <td className="py-3 px-6 text-xs text-slate-900 leading-relaxed font-sans font-medium">
                            {isEditing ? (
                              <input 
                                type="text"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="w-full text-xs font-sans px-2.5 py-1.5 border border-slate-305 rounded-xl bg-white text-slate-800 outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                              />
                            ) : (
                              <div className="flex flex-col">
                                <span>{item.description}</span>
                                <span className="text-[10px] font-mono text-slate-400 block mt-0.5 font-light">Halaman {item.page} &bull; {item.chapter}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold">
                            {isEditing ? (
                              <input 
                                type="number"
                                step="any"
                                value={editVolume}
                                onChange={(e) => setEditVolume(parseFloat(e.target.value) || 0)}
                                className="w-20 text-right px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 font-mono text-xs outline-none"
                              />
                            ) : (
                              item.volume.toLocaleString('id-ID')
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {isEditing ? (
                              <input 
                                type="text"
                                value={editUnit}
                                onChange={(e) => setEditUnit(e.target.value)}
                                className="w-16 text-center px-1 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 font-mono text-xs outline-none"
                              />
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px]">
                                {item.unit}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-6 text-right font-medium text-slate-600">
                            {isEditing ? (
                              <input 
                                type="number"
                                value={editUnitPrice}
                                onChange={(e) => setEditUnitPrice(parseInt(e.target.value) || 0)}
                                className="w-28 text-right px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-orange-500 font-mono text-xs outline-none"
                              />
                            ) : (
                              item.unitPrice.toLocaleString('id-ID')
                            )}
                          </td>
                          <td className={`py-3 px-6 text-right font-bold ${isHighCost ? 'text-[#1E3A8A] bg-orange-50/15' : 'text-slate-900'}`}>
                            <div className="flex flex-col items-end">
                              <span>{isEditing ? (editVolume * editUnitPrice).toLocaleString('id-ID') : item.totalCost.toLocaleString('id-ID')}</span>
                              {isHighCost && (
                                <span className="text-[8px] tracking-wider font-extrabold uppercase text-[#EA580C] bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded mt-1.5 whitespace-nowrap scale-90 origin-right">
                                  Prioritas Tinggi
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleSaveEdit(item.id)}
                                  title="Simpan Perubahan"
                                  className="p-1 px-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded cursor-pointer transition shadow-sm"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingItemId(null)}
                                  title="Batal"
                                  className="p-1 px-1.5 bg-slate-300 hover:bg-slate-450 text-slate-700 rounded cursor-pointer transition shadow-sm"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => startEdit(item)}
                                  title="Edit Item"
                                  className="p-1 text-slate-500 hover:text-[#1E3A8A] hover:bg-slate-100 rounded transition cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id, item.code)}
                                  title="Hapus Item"
                                  className="p-1 text-slate-500 hover:text-rose-650 hover:bg-slate-100 rounded transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer representing physical PDF page end stats */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-500">
              <div>
                Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> dari <strong className="text-slate-800">{items.length} data baris</strong> item BQ rincian.
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1E3A8A]"></span> Multi-Zone</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Verified QR</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> On-Budget</span>
              </div>
            </div>

          </div>
        </>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          
          {/* MATERIAL WORKSPACE HEADER SUMMARY PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Baseline RAB Budget */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-extrabold block">ALOKASI ASLI RAB</span>
                <strong className="text-xl font-mono text-slate-850 block">
                  {formatIDR(materialsSummary.totalBaselineCost)}
                </strong>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">Total komulatif 8 material utama</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-150">
                <Briefcase className="w-5 h-5 text-slate-400" />
              </div>
            </div>

            {/* Card 2: Sourced Cost with Reactive Vendors */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between ring-2 ring-[#1E3A8A]/10">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#1E3A8A] uppercase tracking-widest font-extrabold block">BIAYA VENDOR TERPILIH</span>
                <strong className="text-xl font-mono text-[#1E3A8A] block">
                  {formatIDR(materialsSummary.totalSourcedCost)}
                </strong>
                <p className="text-[10px] text-slate-500 font-sans mt-0.5">Sesuai penandatanganan mitra terpilih</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-150">
                <Truck className="w-5 h-5 text-[#1E3A8A]" />
              </div>
            </div>

            {/* Card 3: Potential Material Savings Indicator */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-3xl shadow-md flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,#fff_0%,transparent_70%)] pointer-events-none"></div>
              <div className="space-y-1 relative z-10">
                <span className="text-[10px] font-mono text-emerald-100 uppercase tracking-widest font-extrabold block">POTENSI EFISIENSI BIAYA</span>
                <strong className="text-xl font-mono block">
                  {formatIDR(materialsSummary.totalSavings)}
                </strong>
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-105 mt-0.5 uppercase tracking-wider font-bold">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Suhu Penghematan: {materialsSummary.savingsPercent.toFixed(2)}%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center relative z-10">
                <Scale className="w-5 h-5 text-white" />
              </div>
            </div>

          </div>

          {/* SPLIT COLUMN INTERACTIVE WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: LIST OF MATERIALS */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">DAFTAR ESTIMASI KEBUTUHAN</span>
                <span className="text-[9px] font-mono font-bold bg-[#1E3A8A]/10 text-[#1E3A8A] px-2 py-0.5 rounded">8 Kategori Utama</span>
              </div>
              
              <div className="space-y-2.5">
                {materialsSummary.materials.map(material => {
                  const isSelected = selectedMaterialId === material.id;
                  const saving = material.baselineSubtotal - material.vendorSubtotal;
                  
                  return (
                    <button
                      key={material.id}
                      onClick={() => {
                        setSelectedMaterialId(material.id);
                        setCustomNegotiationDiscount(0); // Reset discount on transition
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-white border-orange-500 ring-2 ring-orange-500/15 shadow-md transform translate-x-1' 
                          : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/50 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 w-full">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider">
                            {material.category}
                          </span>
                          <strong className="text-xs font-bold text-slate-800 line-clamp-1 block mt-0.5">
                            {material.name}
                          </strong>
                        </div>
                        <span className="text-[10px] font-mono font-bold whitespace-nowrap bg-slate-100 text-slate-650 px-2.5 py-0.5 rounded border border-slate-150">
                          {material.qty.toLocaleString('id-ID')} {material.unit.split(' ')[0]}
                        </span>
                      </div>

                      {/* Formula display */}
                      <p className="text-[10px] text-slate-500 italic font-mono mt-2 leading-relaxed">
                        {material.formula}
                      </p>

                      <div className="flex justify-between items-center border-t border-slate-100 pt-2.5 mt-2.5 text-[11px] font-mono">
                        <div>
                          <span className="text-slate-400 text-[9px] block">Baseline RAB:</span>
                          <span className="text-slate-700 font-semibold">{formatIDR(material.baselineSubtotal)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 text-[9px] block">Mitra: {material.vendorInfo.name.split(' (')[0]}</span>
                          <strong className={`font-bold flex items-center justify-end gap-1 ${saving >= 0 ? 'text-emerald-600' : 'text-slate-705'}`}>
                            {saving >= 0 ? <TrendingDown className="w-3 h-3 text-emerald-500" /> : <TrendingUp className="w-3 h-3 text-slate-400" />}
                            {formatIDR(material.vendorSubtotal)}
                          </strong>
                        </div>
                      </div>

                      {/* Accent corner bar for active state */}
                      {isSelected && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-orange-500 rounded-r-md"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* SPLIT PROCUREMENT COMPLIANCE ADVICE CARD */}
              <div className="bg-blue-50 border border-blue-150 rounded-2xl p-4 mt-2 text-xs">
                <div className="flex gap-2 items-start text-[#1E3A8A]">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
                  <div className="space-y-1">
                    <strong className="font-bold block text-[#1E3A8A]">Strategi Split Procurement PT. FGI:</strong>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Sistem mendeteksi bahwa dengan membagi pengadaan berdasarkan vendor dengan penawaran terbaik per-material, Anda dapat memangkas anggaran pembelian dari total <strong>{formatIDR(materialsSummary.totalBaselineCost)}</strong> menjadi <strong>{formatIDR(materialsSummary.cheapestSplitCost)}</strong>.
                    </p>
                    <span className="inline-block text-[9px] font-mono font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full mt-1.5 uppercase leading-none">
                      Potensi Maksimal Hemat: {materialsSummary.maxSavingsPercent.toFixed(1)}% ({formatIDR(materialsSummary.maxSavings)})
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: VENDOR PRICE COMPARISONS */}
            <div className="lg:col-span-7 space-y-6">
              
              {(() => {
                const material = materialsSummary.materials.find(m => m.id === selectedMaterialId);
                if (!material) return null;

                // Find local best option based on lowest price
                const bestVendorKey = Object.keys(material.vendors).reduce((best, vKey) => {
                  return (material.vendors as any)[vKey].price < (material.vendors as any)[best].price ? vKey : best;
                }, 'sinar_jaya') as 'sinar_jaya' | 'central_beton' | 'maju_bersama';
                const cheapestVendor = (material.vendors as any)[bestVendorKey];

                const negotiatedSubtotal = material.vendorSubtotal * (1 - customNegotiationDiscount / 100);

                return (
                  <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-sm space-y-6">
                    
                    {/* Material Identity Header */}
                    <div className="border-b border-slate-100 pb-4.5">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-bold bg-[#1E3A8A] text-white px-2 py-0.5 rounded uppercase">
                            PEMILIHAN MITRA &amp; VERIFIKASI HARGA
                          </span>
                          <h3 className="text-base font-black font-sans text-slate-800 tracking-tight">
                            {material.name}
                          </h3>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-slate-400 text-[9px] font-mono block">VOLUME KEBUTUHAN AKTIF</span>
                          <strong className="text-sm font-mono font-black text-orange-600 block">
                            {material.qty.toLocaleString('id-ID')} {material.unit}
                          </strong>
                        </div>
                      </div>

                      {/* Benchmark Info block */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 font-mono text-[10px] text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                        <div>
                          <span className="text-slate-400 block text-[9px]">DISETUJUI RAB:</span>
                          <strong className="text-slate-700 block mt-0.5">{formatIDR(material.baselinePrice)} / {material.unit.split(' ')[0]}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px]">TOTAL ALOKASI:</span>
                          <strong className="text-slate-700 block mt-0.5">{formatIDR(material.baselineSubtotal)}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px]">DITEMUKAN LINKED ITEM BQ:</span>
                          <strong className="text-[#1E3A8A] font-bold block mt-0.5">{material.linkedCount} Baris Pekerjaan</strong>
                        </div>
                      </div>
                    </div>

                    {/* INTERACTIVE COMPARISON GRID */}
                    <div className="space-y-4">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                        DAFTAR HARGA KONTRAK MITRA DISTRIBUTOR RESMI
                      </span>

                      <div className="space-y-3">
                        {Object.entries(material.vendors).map(([vendorKey, vendor]) => {
                          const v = vendor as any;
                          const isCurrentlySourced = material.selectedVendorKey === vendorKey;
                          const sampleSubtotal = material.qty * v.price;
                          const deviationPercent = ((v.price - material.baselinePrice) / material.baselinePrice) * 100;
                          const isCheapestOption = (cheapestVendor as any).name === v.name;

                          return (
                            <div 
                              key={vendorKey}
                              className={`p-4 rounded-2.5xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                                isCurrentlySourced
                                  ? 'bg-[#1E3A8A]/5 border-[#1E3A8A]/40 ring-1 ring-[#1E3A8A]/10 shadow-sm'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex-1 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <strong className="text-xs font-bold text-slate-800">
                                    {v.name}
                                  </strong>
                                  <span className="text-[10px] font-mono text-amber-500 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-100">
                                    ★ {v.rating.toFixed(1)}
                                  </span>
                                  {isCheapestOption && (
                                    <span className="text-[8px] font-mono font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded shadow-sm tracking-wider">
                                      Paling Hemat
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-slate-400">
                                  <span>Waktu Kirim: <strong>{v.leadTime}</strong></span>
                                  <span>&bull;</span>
                                  <span>Min Order: <strong>{v.moq}</strong></span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                                <div className="text-right">
                                  <div className="flex items-center gap-1.5 justify-end">
                                    <strong className="text-xs font-mono text-slate-800">
                                      {formatIDR(v.price)}
                                    </strong>
                                    <span className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded ${deviationPercent < 0 ? 'bg-emerald-55 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-150'}`}>
                                      {deviationPercent >= 0 ? '+' : ''}{deviationPercent.toFixed(1)}%
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-mono text-slate-450 block">
                                    Subtotal: {formatIDR(sampleSubtotal)}
                                  </span>
                                </div>

                                <button
                                  onClick={() => {
                                    setVendorToggles(prev => ({
                                      ...prev,
                                      [material.id]: vendorKey as any
                                    }));
                                    showToast(`Mitra pengadaan ${material.name} diubah ke ${v.name}!`);
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold tracking-wide transition cursor-pointer ${
                                    isCurrentlySourced
                                      ? 'bg-orange-500 text-white shadow-sm font-black'
                                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}
                                >
                                  {isCurrentlySourced ? 'Terpilih' : 'Pilih'}
                                </button>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* DYNAMIC PRICE METER BAR */}
                    <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                        <span>PETA PERBANDINGAN HARGA VS BENCHMARK RAB</span>
                        <span>Selisih Satuan</span>
                      </div>
                      <div className="space-y-2">
                        {/* 1. RAB Baseline */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-600 font-bold">RAB Resmi Baseline</span>
                            <span className="text-slate-850">{formatIDR(material.baselinePrice)}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#1E3A8A] h-2 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>

                        {/* 2. Sinar Jaya */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-600">PT Sinar Jaya Utama</span>
                            <span className="text-slate-850 flex items-center gap-1">
                              {formatIDR(material.vendors.sinar_jaya.price)} 
                              <span className="text-[9px] text-emerald-600 font-bold">(-{(((material.baselinePrice - material.vendors.sinar_jaya.price)/material.baselinePrice)*100).toFixed(1)}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(material.vendors.sinar_jaya.price / material.baselinePrice) * 85}%` }}></div>
                          </div>
                        </div>

                        {/* 3. Central Beton */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-600">Central Beton Kertajati</span>
                            <span className="text-slate-850 flex items-center gap-1">
                              {formatIDR(material.vendors.central_beton.price)} 
                              <span className={material.vendors.central_beton.price > material.baselinePrice ? 'text-red-500 text-[9px] font-bold' : 'text-emerald-600 text-[9px] font-bold'}>
                                {material.vendors.central_beton.price > material.baselinePrice ? '+' : '-'}
                                {Math.abs(((material.baselinePrice - material.vendors.central_beton.price)/material.baselinePrice)*100).toFixed(1)}%
                              </span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(material.vendors.central_beton.price / material.baselinePrice) * 85}%` }}></div>
                          </div>
                        </div>

                        {/* 4. Maju Bersama */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-600">Maju Bersama Cirebon</span>
                            <span className="text-slate-850 flex items-center gap-1">
                              {formatIDR(material.vendors.maju_bersama.price)} 
                              <span className="text-[9px] text-emerald-600 font-bold">(-{(((material.baselinePrice - material.vendors.maju_bersama.price)/material.baselinePrice)*100).toFixed(1)}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(material.vendors.maju_bersama.price / material.baselinePrice) * 85}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* NEGOTIATION SIMULATOR SECTION */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Scale className="w-4 h-4 text-orange-500" />
                          <h4 className="text-xs font-black text-slate-800 font-sans tracking-tight">Simulasi Negosiasi &amp; Koreksi Diskon</h4>
                        </div>
                        <span className="text-xs font-mono font-bold bg-[#1E3A8A] text-white px-2 py-0.5 rounded leading-none">
                          {customNegotiationDiscount}% Diskon
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed font-sans mt-1">
                        Sesuaikan kisaran tingkat negosiasi tambahan (0% s/d 10%) dengan vendor terpilih untuk memproyeksikan peng hematan lebih lanjut pada verifikasi RAB ini.
                      </p>

                      <div className="space-y-2 mt-3">
                        <input 
                          type="range" 
                          min="0" 
                          max="10" 
                          step="1" 
                          value={customNegotiationDiscount}
                          onChange={(e) => setCustomNegotiationDiscount(parseInt(e.target.value))}
                          className="w-full accent-[#1E3A8A] cursor-pointer"
                        />
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                          <span>0% (Sesuai Kontrak)</span>
                          <span>5% (Nego Menengah)</span>
                          <span>10% (Target Diskon)</span>
                        </div>
                      </div>

                      {customNegotiationDiscount > 0 && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex justify-between items-center text-xs font-mono">
                          <div className="text-emerald-800">
                            <strong>Nilai Penghematan Tambahan:</strong>
                            <p className="text-[10px] text-slate-500 mt-0.5">Potongan dari negosiasi volume massal</p>
                          </div>
                          <strong className="text-emerald-600 text-sm font-black">
                            -{formatIDR(materialsSummary.negotiatedSavings)}
                          </strong>
                        </div>
                      )}
                    </div>

                    {/* FOOTER VERIFICATION RECOMMENDATION COMPLIANCE STATUS */}
                    <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200 flex items-start gap-3">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
                      <div className="text-[11px] font-sans leading-relaxed text-slate-650">
                        <strong className="text-slate-800">Rekomendasi Tim Audit Procurement:</strong>
                        <p className="mt-1">
                          Penawaran dari {cheapestVendor.name} terdeteksi sebagai yang paling kompetitif. Memilihnya akan mengoptimalkan verifikasi pembiayaan Anda.
                        </p>
                      </div>
                    </div>

                  </div>
                );
              })()}

            </div>

          </div>

        </div>
      )}

      {/* BOTTOM LEGAL SIGN OFF - DUPLICATING PAGE 5 OF ORIGINAL DOCUMENT */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-700 uppercase border-b border-slate-100 pb-3">
          LEMBAR PENGESAHAN DOKUMEN DIGITAL (PR-2026-FGI-004)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
          
          {/* Disiapkan Oleh */}
          <div className="flex flex-col items-center justify-between text-center p-6 bg-slate-50 rounded-xl border border-slate-150 space-y-4">
            <div>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">DIRESTRUKTURISASI &amp; DISIAPKAN OLEH</p>
              <p className="text-sm font-bold text-[#1E3A8A] mt-1">Tim Estimator Proyek PT FGI</p>
            </div>
            
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-inner flex flex-col items-center relative group">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/?verify=EST-RABID-WZWY2')}`} 
                alt="QR Estimator" 
                className="w-24 h-24 object-contain transition-transform group-hover:scale-105 duration-300"
                referrerPolicy="no-referrer"
              />
              <span className="text-[9px] font-mono font-bold text-slate-400 mt-2 tracking-wider">EST-RABID-WZWY2</span>
              <span className="text-[8px] font-mono text-emerald-600 font-black mt-1 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                VERIFIED QR
              </span>
            </div>

            <div className="space-y-1 font-mono text-[10px]">
              <p className="text-slate-600 font-bold border-b border-slate-200 pb-1 w-48 mx-auto">Tim Estimator Proyek</p>
              <p className="text-slate-400">Departemen QS, Enjiniring Sipil</p>
            </div>
          </div>

          {/* Disetujui Oleh */}
          <div className="flex flex-col items-center justify-between text-center p-6 bg-slate-50 rounded-xl border border-slate-150 space-y-4">
            <div>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">DITINJAU &amp; DISETUJUI OLEH</p>
              <p className="text-sm font-bold text-[#1E3A8A] mt-1">Project Manager (PM)</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-inner flex flex-col items-center relative group">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/?verify=PM-RABID-PN1CU')}`} 
                alt="QR PM" 
                className="w-24 h-24 object-contain transition-transform group-hover:scale-105 duration-300"
                referrerPolicy="no-referrer"
              />
              <span className="text-[9px] font-mono font-bold text-slate-400 mt-2 tracking-wider">PM-RABID-PN1CU</span>
              <span className="text-[8px] font-mono text-emerald-600 font-black mt-1 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                VERIFIED QR
              </span>
            </div>

            <div className="space-y-1 font-mono text-[10px]">
              <p className="text-slate-600 font-bold border-b border-slate-200 pb-1 w-48 mx-auto">Project Manager</p>
              <p className="text-slate-400">Head of Construction Management</p>
            </div>
          </div>

        </div>

        <p className="text-[10px] text-slate-400 font-mono leading-relaxed text-center max-w-xl mx-auto pt-4 border-t border-slate-100">
          * Seluruh QR-code di atas terintegrasi ke dalam sistem hash blockchain PT Foresyndo Global Indonesia untuk menjamin orisinalitas audit data dan mencegah manipulasi nominal rencana anggaran biaya (RAB).
        </p>

      </div>

      {/* MODAL CONFIGURATOR FOR HIGH-FIDELITY PDF DOWNLOADS */}
      {showPDFModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleIn">
            
            {/* Header */}
            <div className="bg-[#1E3A8A] text-white p-6 relative">
              <button 
                onClick={() => setShowPDFModal(false)}
                className="absolute right-4 top-4 p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-600 rounded-xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-sans tracking-tight">Opsi Unduhan Laporan PDF</h3>
                  <p className="text-blue-100 text-xs font-mono">PT Foresyndo Global Indonesia &bull; Digital TTD</p>
                </div>
              </div>
            </div>

            {/* Content Mode Selection */}
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block">PILIH FORMAT DOKUMEN</span>
                
                {/* Option 1: Seluruh RAB */}
                <label className={`block p-4 rounded-2xl border transition-all cursor-pointer ${downloadMode === 'seluruh' ? 'bg-orange-50/40 border-orange-500 ring-2 ring-orange-500/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/50'}`}>
                  <div className="flex items-start gap-3">
                    <input 
                      type="radio" 
                      name="downloadMode" 
                      checked={downloadMode === 'seluruh'}
                      onChange={() => setDownloadMode('seluruh')}
                      className="mt-1 text-orange-600 focus:ring-orange-500 accent-orange-600"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-sm font-bold text-slate-800">RAB Lengkap Buku Besar</strong>
                        <span className="text-[9px] font-mono font-bold bg-[#1E3A8A] text-white px-1.5 py-0.5 rounded leading-none">83 Item Pekerjaan</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Mengunduh cover sheet komprehensif, rincian sektoral, dan seluruh 83 baris lembar BQ beserta verifikasi tanda tangan QR Code lengkap.</p>
                    </div>
                  </div>
                </label>

                {/* Option 2: Terpilih saja */}
                <label className={`block p-4 rounded-2xl border transition-all cursor-pointer ${downloadMode === 'terpilih' ? 'bg-orange-50/40 border-orange-500 ring-2 ring-orange-500/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/50'}`}>
                  <div className="flex items-start gap-3">
                    <input 
                      type="radio" 
                      name="downloadMode" 
                      checked={downloadMode === 'terpilih'}
                      onChange={() => setDownloadMode('terpilih')}
                      className="mt-1 text-orange-600 focus:ring-orange-500 accent-orange-600"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-sm font-bold text-slate-800">RAB Kriteria Terpilih (Filter)</strong>
                        <span className="text-[9px] font-mono font-bold bg-orange-600 text-white px-1.5 py-0.5 rounded leading-none">{filteredItems.length} Item</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Hanya mengekspor item pekerjaan yang sedang aktif pada filter pencarian / halaman Anda saat ini beserta tanda tangan QR Code.</p>
                    </div>
                  </div>
                </label>

                {/* Option 3: Ringkasan Saja */}
                <label className={`block p-4 rounded-2xl border transition-all cursor-pointer ${downloadMode === 'ringkas' ? 'bg-orange-50/40 border-orange-500 ring-2 ring-orange-500/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/50'}`}>
                  <div className="flex items-start gap-3">
                    <input 
                      type="radio" 
                      name="downloadMode" 
                      checked={downloadMode === 'ringkas'}
                      onChange={() => setDownloadMode('ringkas')}
                      className="mt-1 text-orange-600 focus:ring-orange-500 accent-orange-600"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-sm font-bold text-slate-800">Laporan Ringkat Eksekutif</strong>
                        <span className="text-[9px] font-mono font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded leading-none">1 Halaman TTD</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Mengunduh Dokumen 1 halaman berisi cover formal, rekapitulasi nominal pajak s/d grand total, pembagian sektoral, dan tanda tangan QR Code.</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Safety badge indicator */}
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-800 leading-relaxed font-sans font-medium">
                  <strong>Digital Security Anchor Enabled:</strong> Kedua QR Code (Estimator & PM) akan ditanamkan ke dalam PDF dan dapat discan langsung untuk memverifikasi keaslian dokumen pada portal publik.
                </div>
              </div>
            </div>

            {/* Footer action buttons */}
            <div className="bg-slate-50 p-5 border-t border-slate-100 flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowPDFModal(false)}
                disabled={pdfProgress !== null}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                Batalkan
              </button>
              
              <button 
                onClick={() => generatePDFDefault(downloadMode)}
                disabled={pdfProgress !== null}
                className="px-5 py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#EA580C] text-white font-bold rounded-xl shadow hover:brightness-110 flex items-center gap-2 transition text-xs cursor-pointer disabled:opacity-50"
              >
                {pdfProgress ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Memproses Lembar...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-white" />
                    <span>Mulai Pembuatan PDF</span>
                  </>
                )}
              </button>
            </div>

            {/* Live progress indicator overlay */}
            {pdfProgress && (
              <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center p-6 animate-fadeIn">
                <Loader2 className="w-12 h-12 text-[#1E3A8A] animate-spin mb-4" />
                <p className="text-sm font-bold text-slate-800 text-center">{pdfProgress}</p>
                <p className="text-xs text-slate-400 mt-1 font-mono">Mohon tunggu, merender gambar & teks...</p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL CONFIGURATOR FOR ADDING NEW RAB JOB ITEM */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleIn">
            
            {/* Header */}
            <div className="bg-emerald-600 text-white p-6 relative">
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="absolute right-4 top-4 p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-700/80 rounded-xl">
                  <Plus className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-sans tracking-tight">Tambah Pekerjaan RAB Baru</h3>
                  <p className="text-emerald-100 text-xs font-mono">Masukkan rincian item penawaran harga bq</p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Kode Pekerjaan */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">KODE PEKERJAAN</label>
                  <input 
                    type="text"
                    required
                    placeholder="Contoh: 1.25 atau 4.12"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 hover:bg-slate-100/50 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs text-slate-800 font-mono outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                {/* Sektor Bagian */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">SEKTOR / CHAPTER</label>
                  <select
                    value={newChapter}
                    onChange={(e) => setNewChapter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 hover:bg-slate-100/50 focus:bg-white rounded-xl py-2.5 px-3 text-xs text-slate-800 font-mono outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Pekerjaan Persiapan">Pekerjaan Persiapan</option>
                    <option value="Pekerjaan Pondasi Substruktur">Pekerjaan Pondasi Substruktur</option>
                    <option value="Pekerjaan Struktur Utama (7 Lantai)">Pekerjaan Struktur Utama (7 Lantai)</option>
                    <option value="Pekerjaan Arsitektur &amp; Finishing">Pekerjaan Arsitektur &amp; Finishing</option>
                    <option value="Pekerjaan MEP">Pekerjaan MEP</option>
                    <option value="Pekerjaan Kolam Renang &amp; Sektor Cafe">Pekerjaan Kolam Renang &amp; Sektor Cafe</option>
                  </select>
                </div>
              </div>

              {/* Uraian Pekerjaan */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">URAIAN DESKRIPSI PEKERJAAN</label>
                <input 
                  type="text"
                  required
                  placeholder="Deskripsikan pekerjaan konstruksi yang akan ditambahkan..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 hover:bg-slate-100/50 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs text-slate-800 font-sans font-medium outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Volume */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">VOLUME</label>
                  <input 
                    type="number"
                    step="any"
                    required
                    min="0.001"
                    value={newVolume}
                    onChange={(e) => setNewVolume(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-250 hover:bg-slate-100/50 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs text-slate-800 font-mono outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                {/* Satuan */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">SATUAN</label>
                  <input 
                    type="text"
                    required
                    placeholder="m2, m3, ls, kg"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 hover:bg-slate-100/50 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs text-slate-800 font-mono outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                {/* Page Referer */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">HALAMAN PDF</label>
                  <select
                    value={newPage}
                    onChange={(e) => setNewPage(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-250 hover:bg-slate-100/50 focus:bg-white rounded-xl py-2.5 px-3 text-xs text-slate-800 font-mono outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value={1}>Halaman 1</option>
                    <option value={2}>Halaman 2</option>
                    <option value={3}>Halaman 3</option>
                    <option value={4}>Halaman 4</option>
                    <option value={5}>Halaman 5</option>
                  </select>
                </div>
              </div>

              {/* Harga Satuan */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">HARGA SATUAN (RP)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-mono font-bold text-slate-400">Rp</span>
                  <input 
                    type="number"
                    required
                    min="1"
                    placeholder="Masukkan nilai rupiah..."
                    value={newUnitPrice || ''}
                    onChange={(e) => setNewUnitPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-250 hover:bg-slate-100/50 focus:bg-white rounded-xl py-2.5 pl-9 pr-3.5 text-xs text-slate-800 font-mono outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Kalkulasi Total */}
              <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center text-xs font-mono border border-slate-150">
                <span className="text-slate-500 font-medium font-sans">Estimasi Subtotal Biaya:</span>
                <strong className="text-emerald-700 text-sm font-black">
                  {formatIDR(newVolume * newUnitPrice)}
                </strong>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>Tambahkan Item</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
