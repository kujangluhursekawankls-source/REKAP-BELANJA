import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzGqnjLhv1uCzI1vkT7Nvw1RWl1riVY-pf06Q9Psa8rrYypMJE2dvwFUjYWicPRGFxj8g/exec';

// Helper to sanitize and validate Google Apps Script URL
function getAppsScriptUrl(reqUrl?: string): string {
  if (reqUrl && typeof reqUrl === 'string') {
    const trimmed = reqUrl.trim();
    if (trimmed.startsWith('https://script.google.com/macros/s/')) {
      return trimmed;
    }
  }
  return process.env.VITE_APPS_SCRIPT_URL || process.env.APPS_SCRIPT_URL || DEFAULT_APPS_SCRIPT_URL;
}

// Safe helper to call Google Apps Script Web App without JSON parse crashes
async function fetchAppsScript(scriptUrl: string, method: 'GET' | 'POST' = 'GET', body?: any) {
  const options: RequestInit = {
    method,
    redirect: 'follow',
    headers: {
      'Accept': 'application/json',
    },
  };

  if (body && method === 'POST') {
    options.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    options.body = JSON.stringify(body);
  }

  const response = await fetch(scriptUrl, options);
  const rawText = await response.text();

  try {
    return JSON.parse(rawText);
  } catch (parseError) {
    if (rawText.includes('<!DOCTYPE') || rawText.includes('<html') || rawText.includes('accounts.google.com')) {
      throw new Error(
        'Akses Google Apps Script Ditolak. Pastikan pengaturan "Yang memiliki akses (Who has access)" di-set ke "Siapa saja (Anyone)" saat Terapkan / Deploy Web App Anda.'
      );
    }
    throw new Error('Respon dari Google Apps Script bukan JSON valid: ' + rawText.substring(0, 120));
  }
}

// API Route: GET Data Sekolah
app.get('/api/data-sekolah', async (req, res) => {
  const scriptUrl = getAppsScriptUrl(req.query.scriptUrl as string);
  
  if (!scriptUrl) {
    return res.json({ success: true, data: [] });
  }

  try {
    const targetUrl = new URL(scriptUrl);
    targetUrl.searchParams.set('action', 'getDataSekolah');
    
    const data = await fetchAppsScript(targetUrl.toString(), 'GET');
    return res.json(data);
  } catch (error: any) {
    console.error('Error fetching Data Sekolah:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil Data Sekolah dari Google Sheets'
    });
  }
});

// API Route: GET Rekap Belanja
app.get('/api/rekap-belanja', async (req, res) => {
  const scriptUrl = getAppsScriptUrl(req.query.scriptUrl as string);
  
  if (!scriptUrl) {
    return res.json({ success: true, data: [] });
  }

  try {
    const targetUrl = new URL(scriptUrl);
    targetUrl.searchParams.set('action', 'getRekapBelanja');
    
    const data = await fetchAppsScript(targetUrl.toString(), 'GET');
    return res.json(data);
  } catch (error: any) {
    console.error('Error fetching Rekap Belanja:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengambil Rekap Belanja dari Google Sheets'
    });
  }
});

// API Route: POST Tambah Belanja
app.post('/api/tambah-belanja', async (req, res) => {
  const { namaSekolah, kategori, jumlah, fotoBase64, fileName, mimeType, tanggal, scriptUrl: bodyScriptUrl } = req.body;
  const scriptUrl = getAppsScriptUrl(bodyScriptUrl);

  if (!namaSekolah || !kategori || !jumlah || !fotoBase64) {
    return res.status(400).json({
      success: false,
      message: 'Semua field (Nama Sekolah, Kategori, Jumlah, Foto Nota) wajib diisi.'
    });
  }

  if (!scriptUrl) {
    return res.status(400).json({
      success: false,
      message: 'URL Google Apps Script belum dikonfigurasi. Sila buka Pengaturan Integrasi.'
    });
  }

  try {
    const payload = {
      namaSekolah: String(namaSekolah).trim(),
      kategori: String(kategori).trim(),
      jumlah: Number(jumlah) || 0,
      fotoBase64,
      fileName: fileName || `NOTA_${Date.now()}.jpg`,
      mimeType: mimeType || 'image/jpeg',
      tanggal: tanggal || new Date().toISOString().split('T')[0]
    };

    const result = await fetchAppsScript(scriptUrl, 'POST', payload);
    return res.json(result);
  } catch (error: any) {
    console.error('Error saving transaction:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Gagal menyimpan transaksi ke Google Sheets'
    });
  }
});

// API Route: POST Edit Belanja
app.post('/api/edit-belanja', async (req, res) => {
  const { no, namaSekolah, kategori, jumlah, tanggal, fotoBase64, fileName, mimeType, existingFotoUrl, scriptUrl: bodyScriptUrl } = req.body;
  const scriptUrl = getAppsScriptUrl(bodyScriptUrl);

  if (!no || !namaSekolah || !kategori || !jumlah) {
    return res.status(400).json({
      success: false,
      message: 'Field No, Nama Sekolah, Kategori, dan Jumlah wajib diisi.'
    });
  }

  if (!scriptUrl) {
    return res.status(400).json({
      success: false,
      message: 'URL Google Apps Script belum dikonfigurasi.'
    });
  }

  try {
    const payload = {
      action: 'editBelanja',
      no: Number(no),
      namaSekolah: String(namaSekolah).trim(),
      kategori: String(kategori).trim(),
      jumlah: Number(jumlah) || 0,
      tanggal: tanggal || undefined,
      fotoBase64: fotoBase64 || undefined,
      fileName: fileName || `NOTA_${no}_EDIT.jpg`,
      mimeType: mimeType || 'image/jpeg',
      existingFotoUrl: existingFotoUrl || ''
    };

    const result = await fetchAppsScript(scriptUrl, 'POST', payload);
    return res.json(result);
  } catch (error: any) {
    console.error('Error editing transaction:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Gagal memperbarui transaksi di Google Sheets'
    });
  }
});

// API Route: POST Hapus Belanja
app.post('/api/hapus-belanja', async (req, res) => {
  const { no, scriptUrl: bodyScriptUrl } = req.body;
  const scriptUrl = getAppsScriptUrl(bodyScriptUrl);

  if (!no) {
    return res.status(400).json({
      success: false,
      message: 'Nomor transaksi (No) wajib dispesifikasikan.'
    });
  }

  if (!scriptUrl) {
    return res.status(400).json({
      success: false,
      message: 'URL Google Apps Script belum dikonfigurasi.'
    });
  }

  try {
    const payload = {
      action: 'hapusBelanja',
      no: Number(no)
    };

    const result = await fetchAppsScript(scriptUrl, 'POST', payload);
    return res.json(result);
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Gagal menghapus transaksi dari Google Sheets'
    });
  }
});

// Explicit API Catch-All Route (Prevents 404 HTML fallthrough)
app.all('/api/*', (req, res) => {
  return res.status(200).json({
    success: false,
    message: `API Route ${req.originalUrl} tidak ditemukan di Express server.`
  });
});

async function start() {
  const PORT = Number(process.env.PORT) || 3000;

  // Serve static assets from public folder
  app.use(express.static(path.resolve(__dirname, 'public')));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }

      // Only serve index.html for navigation HTML requests
      const acceptHeader = req.headers.accept || '';
      if (!acceptHeader.includes('text/html') && req.originalUrl !== '/') {
        return next();
      }

      try {
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
