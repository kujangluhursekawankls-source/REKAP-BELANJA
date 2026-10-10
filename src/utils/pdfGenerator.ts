import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '../types';
import { formatRupiah } from './googleDrive';

export interface PDFGenerationResult {
  success: boolean;
  fileName: string;
  blobUrl: string;
  blob: Blob;
  totalBelanja: number;
  totalTransaksi: number;
  totalSekolah: number;
}

// Resilient autoTable runner to handle any CJS/ESM bundling variants
function safeAutoTable(doc: any, options: any) {
  if (typeof (doc as any).autoTable === 'function') {
    (doc as any).autoTable(options);
  } else if (typeof autoTable === 'function') {
    autoTable(doc, options);
  } else if (typeof (autoTable as any)?.default === 'function') {
    (autoTable as any).default(doc, options);
  } else if (typeof (autoTable as any)?.autoTable === 'function') {
    (autoTable as any).autoTable(doc, options);
  } else {
    console.error('autoTable is not available on doc or import', autoTable);
    throw new Error('Gagal memuat plugin tabel PDF');
  }
}

export function generateRekapPDF(transactions: Transaction[]): PDFGenerationResult {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate accurate totals with normalized school names
  const totalBelanja = transactions.reduce((sum, t) => sum + (Number(t.jumlah) || 0), 0);
  const totalTransaksi = transactions.length;
  const uniqueSchools = new Set(
    transactions
      .map((t) => t.namaSekolah?.trim().replace(/\s+/g, ' ').toLowerCase())
      .filter(Boolean)
  );
  const totalSekolah = uniqueSchools.size;

  // Header Background Accent Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(14, 12, 182, 24, 'F');

  // Red/Rose accent line on top
  doc.setFillColor(190, 18, 60); // rose-700
  doc.rect(14, 12, 182, 2, 'F');

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CV ARZLAN ADYATAMA', 20, 22);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('SISTEM REKAPITULASI BELANJA SEKOLAH & PENGADAAN BARANG', 20, 29);

  // Report Title & Meta Information Box
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('LAPORAN REKAPITULASI BELANJA', 14, 44);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Dicetak pada: ${dateFormatted}, ${timeFormatted} WIB`, 14, 49);

  // Summary Metrics Badges
  const boxY = 53;
  const boxWidth = 58;
  const boxHeight = 16;

  // Card 1: Total Belanja
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, boxY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL PENGELUARAN', 18, boxY + 5);
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(formatRupiah(totalBelanja), 18, boxY + 12);

  // Card 2: Jumlah Transaksi
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14 + boxWidth + 4, boxY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('JUMLAH TRANSAKSI', 18 + boxWidth + 4, boxY + 5);
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`${totalTransaksi} Transaksi`, 18 + boxWidth + 4, boxY + 12);

  // Card 3: Jumlah Sekolah
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14 + (boxWidth + 4) * 2, boxY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL SEKOLAH', 18 + (boxWidth + 4) * 2, boxY + 5);
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`${totalSekolah} Sekolah`, 18 + (boxWidth + 4) * 2, boxY + 12);

  // Sort transactions by No ascending
  const sortedTransactions = [...transactions].sort((a, b) => Number(a.no) - Number(b.no));

  // Table Data
  const tableData = sortedTransactions.map((t, index) => [
    (index + 1).toString(),
    `#${t.no}`,
    t.namaSekolah ? `${t.namaSekolah}${t.tanggal ? `\n(${t.tanggal})` : ''}` : '-',
    t.kategori || '-',
    formatRupiah(t.jumlah),
    t.fotoNota ? 'Ada Nota' : 'Tanpa Nota',
  ]);

  // Execute AutoTable with safe wrapper
  safeAutoTable(doc, {
    startY: 74,
    head: [['NO', 'ID', 'NAMA SEKOLAH', 'KATEGORI', 'JUMLAH (RP)', 'FOTO NOTA']],
    body: tableData,
    foot: [
      [
        '',
        '',
        'TOTAL KESELURUHAN',
        `${totalTransaksi} Transaksi`,
        formatRupiah(totalBelanja),
        '',
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'center', cellWidth: 14 },
      2: { cellWidth: 60, fontStyle: 'bold' },
      3: { cellWidth: 36 },
      4: { halign: 'right', cellWidth: 36, fontStyle: 'bold' },
      5: { halign: 'center', cellWidth: 24 },
    },
    styles: {
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      cellPadding: 2.8,
    },
    didDrawPage: (data: any) => {
      // Footer page numbering on each page
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `CV ARZLAN ADYATAMA — Halaman ${data.pageNumber} dari ${pageCount}`,
        14,
        290
      );
    },
  });

  // Signature Block after table if space permits, or bottom
  const finalY = (doc as any).lastAutoTable?.finalY || 200;
  let signY = finalY + 12;

  // If table ends near bottom of page, add new page for signature
  if (signY > 240) {
    doc.addPage();
    signY = 25;
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`${dateFormatted}`, 145, signY);
  doc.text('Mengetahui / Penanggung Jawab,', 145, signY + 5);
  doc.setFont('helvetica', 'bold');
  doc.text('CV ARZLAN ADYATAMA', 145, signY + 24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('( Bagian Keuangan & Pengadaan )', 145, signY + 28);

  // File Name
  const cleanDate = now.toISOString().slice(0, 10).replace(/-/g, '');
  const fileName = `Rekap_Belanja_CV_ARZLAN_ADYATAMA_${cleanDate}.pdf`;

  // Generate Blob and Object URL
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  // 1. Langsung View (Buka pratinjau dokumen PDF di tab baru browser)
  try {
    window.open(blobUrl, '_blank');
  } catch (openErr) {
    console.warn('Direct view open failed:', openErr);
  }

  // 2. Langsung Download file PDF ke perangkat
  try {
    doc.save(fileName);
  } catch (saveErr) {
    console.warn('doc.save failed, falling back to direct anchor download:', saveErr);
    try {
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = blobUrl;
      downloadAnchor.download = fileName;
      downloadAnchor.style.display = 'none';
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      setTimeout(() => {
        try {
          document.body.removeChild(downloadAnchor);
        } catch (_) {}
      }, 1000);
    } catch (linkErr) {
      console.warn('Anchor download fallback failed:', linkErr);
    }
  }

  return {
    success: true,
    fileName,
    blobUrl,
    blob,
    totalBelanja,
    totalTransaksi,
    totalSekolah,
  };
}

// Android / Mobile Web Share helper
export async function shareOrSavePDF(pdfResult: PDFGenerationResult): Promise<boolean> {
  if (typeof navigator !== 'undefined' && (navigator as any).share && (navigator as any).canShare) {
    try {
      const file = new File([pdfResult.blob], pdfResult.fileName, { type: 'application/pdf' });
      if ((navigator as any).canShare({ files: [file] })) {
        await (navigator as any).share({
          files: [file],
          title: 'Rekap Belanja CV ARZLAN ADYATAMA',
          text: `Rekapitulasi Belanja Sekolah - ${pdfResult.fileName}`,
        });
        return true;
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Web Share failed, fallback to direct download:', err);
      }
    }
  }
  return false;
}
