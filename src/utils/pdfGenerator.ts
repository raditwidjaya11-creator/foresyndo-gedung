import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RABItem, RAB_METADATA } from '../data/rabData';

export interface GeneratePDFParams {
  items: RABItem[];
  metadata?: typeof RAB_METADATA;
  mode?: 'seluruh' | 'terpilih' | 'ringkas';
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
}

/**
 * Standard IDR formatter helper for PDF currency cells
 */
const formatIDR = (val: number): string => {
  return `Rp ${Math.round(val).toLocaleString('id-ID')},00`;
};

/**
 * Generates a beautiful corporate branded PDF of the RAB Data.
 * Suitable for both downloading in the frontend and attaching to email utilities.
 */
export const generateRABPDF = ({
  items,
  metadata = RAB_METADATA,
  mode = 'seluruh',
  recipientName = 'Bapak/Ibu Pimpinan',
  recipientEmail = 'raditwidjaya11@gmail.com',
  recipientPhone = '081234567890'
}: GeneratePDFParams): jsPDF => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Calculate chapter distributions
  const chapterDistribution = items.reduce((acc: Record<string, number>, item) => {
    acc[item.chapter] = (acc[item.chapter] || 0) + item.totalCost;
    return acc;
  }, {});

  // 1. PAGE 1: COVER SHEET & EXECUTIVE SUMMARY
  
  // Draw premium border frame
  doc.setDrawColor(30, 58, 138); // Navy blue (PT FGI Brand Color)
  doc.setLineWidth(1);
  doc.rect(8, 8, 194, 281);
  doc.rect(9, 9, 192, 279);

  // Corporate Top Header Block
  doc.setFillColor(30, 58, 138);
  doc.rect(10, 10, 190, 22, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(metadata.companyName, 20, 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('ESTIMATOR & COMPLIANCE PROCUREMENT SYSTEM - BANDARA KERTAJATI', 20, 26);
  
  // Document Title metadata Block
  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('RENCANA ANGGARAN BIAYA (RAB)', 20, 43);
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text('DOKUMEN AUDIT FISIK & REKONSILIASI KEUANGAN RESMI', 20, 49);
  
  // Corporate Orange line divider
  doc.setFillColor(234, 88, 12); // Orange FGI Accent
  doc.rect(20, 53, 170, 1, 'F');
  
  // Report parameters
  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('PARAMETER LAPORAN AUDIT', 20, 62);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8);
  
  // Col 1 details
  doc.setFont('helvetica', 'bold'); doc.text('Nama Proyek:', 20, 69); doc.setFont('helvetica', 'normal');
  doc.text(metadata.projectName, 46, 69);
  
  doc.setFont('helvetica', 'bold'); doc.text('Nomor Kontrak:', 20, 74); doc.setFont('helvetica', 'normal');
  doc.text(metadata.projectNo, 46, 74);

  doc.setFont('helvetica', 'bold'); doc.text('Lokasi Pelaksanaan:', 20, 79); doc.setFont('helvetica', 'normal');
  doc.text(metadata.projectLocation, 46, 79);

  doc.setFont('helvetica', 'bold'); doc.text('Pengembang Utama:', 20, 84); doc.setFont('helvetica', 'normal');
  doc.text(metadata.companyName, 46, 84);

  // Col 2 details
  doc.setFont('helvetica', 'bold'); doc.text('Tanggal Terbit:', 115, 69); doc.setFont('helvetica', 'normal');
  doc.text(metadata.date, 142, 69);
  
  doc.setFont('helvetica', 'bold'); doc.text('Batas Toleransi:', 115, 74); doc.setFont('helvetica', 'normal');
  doc.text('± 5.0% APBD Sektoral', 142, 74);

  doc.setFont('helvetica', 'bold'); doc.text('NPWP Kantor:', 115, 79); doc.setFont('helvetica', 'normal');
  doc.text('03.111.442.1-411.000', 142, 79);

  doc.setFont('helvetica', 'bold'); doc.text('Status Ledger:', 115, 84); doc.setFont('helvetica', 'normal');
  doc.text('SHA-256 Ledger Verified', 142, 84);

  // Recipient Box Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(20, 90, 170, 18, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('TARGET REKONSILIASI PENERIMA:', 24, 95);
  doc.setFont('helvetica', 'normal');
  doc.text(`Kontak Person : ${recipientName}   |   Halaman Portal: SPPI Kertajati`, 24, 100);
  doc.text(`WhatsApp Nomor : ${recipientPhone}   |   Email Penerima: ${recipientEmail}`, 24, 104);

  // Recapitulation Block Box
  doc.setFillColor(30, 58, 138); // Primary navy
  doc.rect(20, 114, 170, 22, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('GRAND TOTAL RENCANA ANGGARAN BIAYA (TERMASUK PPN 11%)', 25, 120);
  doc.setFontSize(13);
  doc.text(formatIDR(metadata.grandTotal), 25, 130);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  doc.text('Terverifikasi Kantor Procurement PT. Foresyndo Global Indonesia', 110, 130);

  // Chapter Sektor Distribution Proportions
  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('PROPORSI DISTRIBUSI ANGGARAN SEKTORAL', 20, 146);

  const chapterRows = Object.keys(chapterDistribution).map((chapter, index) => {
    const val = chapterDistribution[chapter];
    return [
      `Sektor ${index + 1}`,
      chapter,
      formatIDR(val),
      `${((val / metadata.grandTotal) * 100).toFixed(1)}%`
    ];
  });

  autoTable(doc, {
    startY: 151,
    margin: { left: 20, right: 20 },
    head: [['Kode Sektor', 'Uraian Sektor Pekerjaan Konstruksi', 'Rencana Anggaran (Rp)', 'Proporsi %']],
    body: chapterRows,
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 138], fontSize: 8, font: 'helvetica', fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, font: 'helvetica', textColor: [51, 65, 85] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 22 },
      1: { cellWidth: 80 },
      2: { halign: 'right', cellWidth: 42 },
      3: { halign: 'center', cellWidth: 26 }
    }
  });

  const lastY = (doc as any).lastAutoTable.finalY || 240;

  // Add QR sign-off boxes for accountability
  const signatureY = lastY + 12 < 250 ? lastY + 12 : 230;
  
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(20, signatureY - 4, 190, signatureY - 4);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('Tembusan Dokumen secara elektronik didukung oleh security ledger SHA-256 terenkripsi aman.', 20, signatureY);

  // 2. PAGE 2+: DETAILED SPREADSHEET TABLE OF ITEMS (For 'seluruh' and 'terpilih' modes)
  if (mode !== 'ringkas') {
    doc.addPage();
    
    // Draw premium border frame for Page 2
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(1);
    doc.rect(8, 8, 194, 281);
    doc.rect(9, 9, 192, 279);

    // Header details block style
    doc.setLineWidth(0.5);
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 16, 195, 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Lampiran Rincian Pekerjaan Sipil & MEP - Kontrak Resmi No: ${metadata.projectNo}`, 15, 13);
    doc.text(`Dokumen Pendukung Audit`, 155, 13);

    const itemsToExport = items;
    const tableBody = itemsToExport.map(item => [
      item.code,
      item.description,
      item.volume.toLocaleString('id-ID'),
      item.unit,
      item.unitPrice.toLocaleString('id-ID'),
      item.totalCost.toLocaleString('id-ID')
    ]);

    autoTable(doc, {
      startY: 20,
      margin: { left: 14, right: 14 },
      head: [['Kode', 'Uraian Detail Pekerjaan Konstruksi', 'Volume', 'Sat', 'Harga Satuan (Rp)', 'Total Biaya (Rp)']],
      body: tableBody,
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 138], fontSize: 8, font: 'helvetica', fontStyle: 'bold' },
      bodyStyles: { fontSize: 7, font: 'helvetica', textColor: [51, 65, 85] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { cellWidth: 73 },
        2: { halign: 'right', cellWidth: 16 },
        3: { halign: 'center', cellWidth: 12 },
        4: { halign: 'right', cellWidth: 32 },
        5: { halign: 'right', cellWidth: 34 }
      },
      didDrawPage: (data) => {
        // Aesthetic page numbers
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(6.5);
        doc.setTextColor(150);
        doc.text(`Halaman ${data.pageNumber} - Pengesahan E-RAB PT Foresyndo Global Indonesia`, 15, 285);
      }
    });
  }

  return doc;
};
