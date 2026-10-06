/**
 * Converts various Google Drive link formats into a direct CDN image URL.
 */
export function getGoogleDriveDirectImageUrl(url: string): string {
  if (!url) return '';
  
  // Base64 or Blob URLs can be displayed directly
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // Extract Google Drive File ID
  let fileId = '';
  
  // Format 1: https://drive.google.com/file/d/FILE_ID/view...
  const matchD = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD && matchD[1]) {
    fileId = matchD[1];
  }

  // Format 2: https://drive.google.com/open?id=FILE_ID or uc?id=FILE_ID
  if (!fileId) {
    const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchId && matchId[1]) {
      fileId = matchId[1];
    }
  }

  if (fileId) {
    // lh3.googleusercontent.com/d/FILE_ID renders image cleanly in <img> tags
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return url;
}

/**
 * Formats a number to Indonesian Rupiah representation (e.g., Rp 250.000)
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parses user input currency string (e.g. "Rp 250.000" or "250000") to clean integer
 */
export function parseRupiahInput(value: string): number {
  const cleanNumber = value.replace(/[^0-9]/g, '');
  return cleanNumber ? parseInt(cleanNumber, 10) : 0;
}

/**
 * Formats number to display in input field with thousand separators
 */
export function formatNumberWithDots(amount: number): string {
  if (!amount) return '';
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Generates automated receipt filename following NO_NAMA_SEKOLAH_KATEGORI_TANGGAL.jpg format
 */
export function generateReceiptFileName(no: number | string, namaSekolah: string, kategori: string): string {
  const sanitize = (text: string) => text.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').trim();
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const cleanSchool = sanitize(namaSekolah || 'SEKOLAH');
  const cleanCategory = sanitize(kategori || 'BELANJA');
  
  return `${no}_${cleanSchool}_${cleanCategory}_${dateStr}.jpg`;
}
