export const APPS_SCRIPT_CODE = `/**
 * Google Apps Script untuk Aplikasi REKAP BELANJA CV
 * Folder Drive FOTO NOTA: 1PHHbtTBTKMgiX7KD89ypIqY0QDErjrOu
 * Sheet REKAP-BELANJA (gid: 0)
 * Sheet DATA-SEKOLAH (gid: 1268372226)
 */

const DRIVE_FOLDER_ID = "1PHHbtTBTKMgiX7KD89ypIqY0QDErjrOu";

// Helper Cerdas untuk mencari / membuat Sheet REKAP-BELANJA
function getRekapSheet(ss) {
  let sheet = ss.getSheetByName("REKAP-BELANJA");
  if (sheet) return sheet;

  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    const name = sheets[i].getName().trim().toUpperCase();
    if (name === "REKAP-BELANJA" || name === "REKAP BELANJA" || name === "REKAP_BELANJA" || (name.includes("REKAP") && name.includes("BELANJA"))) {
      return sheets[i];
    }
  }

  sheet = ss.insertSheet("REKAP-BELANJA");
  sheet.appendRow(["NO", "NAMA SEKOLAH", "KATEGORI BELANJA", "JUMLAH", "FOTO NOTA ATAU LINK"]);
  return sheet;
}

// Helper Cerdas untuk mencari Sheet DATA-SEKOLAH
function getSekolahSheet(ss) {
  let sheet = ss.getSheetByName("DATA-SEKOLAH");
  if (sheet) return sheet;

  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    const name = sheets[i].getName().trim().toUpperCase();
    if (name === "DATA-SEKOLAH" || name === "DATA SEKOLAH" || name === "DATA_SEKOLAH" || name.includes("SEKOLAH")) {
      return sheets[i];
    }
  }
  return null;
}

/**
 * ⚠️ PENTING: JALANKAN FUNGSI INI SEKALI DI EDITOR APPS SCRIPT!
 * Pilih "testAuthorization" di dropdown atas, lalu klik "Jalankan (Run)", 
 * pilih "Tinjau Izin (Review Permissions)", dan izinkan akses Drive.
 */
function testAuthorization() {
  Logger.log("Menguji otorisasi DriveApp...");
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    Logger.log("Folder ditemukan: " + folder.getName());
  } catch (e) {
    Logger.log("Folder default tidak dapat diakses, mencoba root folder...");
    const rootFolder = DriveApp.getRootFolder();
    Logger.log("Folder Root: " + rootFolder.getName());
  }
}

function doGet(e) {
  const action = (e && e.parameter) ? e.parameter.action : "";
  let result = {};
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === "getDataSekolah") {
      let sheet = getSekolahSheet(ss);
      let data = [];
      if (sheet) {
        let values = sheet.getDataRange().getValues();
        for (let i = 0; i < values.length; i++) {
          let row = values[i];
          let val = (row[0] || row[1] || "").toString().trim();
          if (val && val.toUpperCase() !== "NAMA SEKOLAH" && val.toUpperCase() !== "NO") {
            data.push(val);
          }
        }
      }
      result = { success: true, data: [...new Set(data)] };
    } 
    else if (action === "getRekapBelanja") {
      let sheet = getRekapSheet(ss);
      let transactions = [];
      if (sheet) {
        let values = sheet.getDataRange().getValues();
        for (let i = 1; i < values.length; i++) {
          let row = values[i];
          if (row[0] !== "" || row[1] !== "") {
            transactions.push({
              no: row[0],
              namaSekolah: String(row[1] || ""),
              kategori: String(row[2] || ""),
              jumlah: Number(row[3]) || 0,
              fotoNota: String(row[4] || "")
            });
          }
        }
      }
      result = { success: true, data: transactions };
    } else {
      result = { success: true, message: "Apps Script Siap Digunakan. Silakan panggil dari aplikasi PWA." };
    }
  } catch (err) {
    result = { success: false, message: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Fungsi doPost harus dipanggil via HTTP POST request dari aplikasi."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getRekapSheet(ss);

    // ==========================================
    // 1. FITUR EDIT TRANSAKSI (MENGUBAH DI BARIS YANG SAMA, BUKAN APPEND)
    // ==========================================
    if (data.action === "editBelanja") {
      const values = sheet.getDataRange().getValues();
      let targetRowIndex = -1;
      let oldFotoUrl = "";

      for (let i = 1; i < values.length; i++) {
        const cellVal = values[i][0];
        if (cellVal !== "" && cellVal !== null && cellVal !== undefined) {
          if (String(cellVal).trim() === String(data.no).trim() || Number(cellVal) === Number(data.no)) {
            targetRowIndex = i + 1; // 1-based index di Google Sheet
            oldFotoUrl = String(values[i][4] || "");
            break;
          }
        }
      }

      if (targetRowIndex === -1) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: "Gagal Edit: Transaksi #" + data.no + " tidak ditemukan di Google Sheets."
        })).setMimeType(ContentService.MimeType.JSON);
      }

      // Jika ada foto baru diupload, hapus foto lama dari Drive dan upload foto baru
      let fileUrl = oldFotoUrl || data.existingFotoUrl || "";
      if (data.fotoBase64) {
        // Hapus foto lama di Drive jika ada
        if (fileUrl) {
          deleteDriveFileByUrl(fileUrl);
        }
        fileUrl = uploadPhotoToDrive(data);
      }

      // UBAH BARIS YANG SAMA (Col B: Sekolah, Col C: Kategori, Col D: Jumlah, Col E: Foto)
      sheet.getRange(targetRowIndex, 2).setValue(String(data.namaSekolah).trim());
      sheet.getRange(targetRowIndex, 3).setValue(String(data.kategori).trim());
      sheet.getRange(targetRowIndex, 4).setValue(Number(data.jumlah) || 0);
      sheet.getRange(targetRowIndex, 5).setValue(fileUrl);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Transaksi #" + data.no + " berhasil diperbarui di baris ke-" + targetRowIndex,
        data: {
          no: Number(data.no),
          namaSekolah: data.namaSekolah,
          kategori: data.kategori,
          jumlah: Number(data.jumlah) || 0,
          fotoNota: fileUrl
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ==========================================
    // 2. FITUR HAPUS TRANSAKSI + MENGHAPUS FOTO NOTA DI GOOGLE DRIVE
    // ==========================================
    if (data.action === "hapusBelanja") {
      const values = sheet.getDataRange().getValues();
      let targetRowIndex = -1;
      let fotoUrl = "";

      for (let i = 1; i < values.length; i++) {
        const cellVal = values[i][0];
        if (cellVal !== "" && cellVal !== null && cellVal !== undefined) {
          if (String(cellVal).trim() === String(data.no).trim() || Number(cellVal) === Number(data.no)) {
            targetRowIndex = i + 1;
            fotoUrl = String(values[i][4] || "");
            break;
          }
        }
      }

      if (targetRowIndex === -1) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: "Gagal Hapus: Transaksi #" + data.no + " tidak ditemukan di Google Sheets."
        })).setMimeType(ContentService.MimeType.JSON);
      }

      // a. Hapus File Foto Nota dari Google Drive jika ada
      if (fotoUrl) {
        deleteDriveFileByUrl(fotoUrl);
      }

      // b. Hapus Baris Transaksi dari Google Sheet
      sheet.deleteRow(targetRowIndex);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Transaksi #" + data.no + " dan foto nota di Google Drive berhasil dihapus."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ==========================================
    // 3. FITUR TAMBAH BELANJA (HANYA DITAMBAH SAAT ACTION = tambahBelanja ATAU BARU)
    // ==========================================
    let fileUrl = "";
    if (data.fotoBase64) {
      fileUrl = uploadPhotoToDrive(data);
    }
    
    // Determine Next Incremental NO
    const values = sheet.getDataRange().getValues();
    let maxNo = 0;
    for (let i = 1; i < values.length; i++) {
      let currentNo = parseInt(values[i][0], 10);
      if (!isNaN(currentNo) && currentNo > maxNo) {
        maxNo = currentNo;
      }
    }
    const newNo = maxNo + 1;
    
    // Append Row: Col A: NO | Col B: NAMA SEKOLAH | Col C: KATEGORI BELANJA | Col D: JUMLAH | Col E: FOTO NOTA ATAU LINK
    sheet.appendRow([
      newNo,
      data.namaSekolah,
      data.kategori,
      Number(data.jumlah) || 0,
      fileUrl
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Belanja berhasil disimpan ke " + sheet.getName(),
      data: {
        no: newNo,
        namaSekolah: data.namaSekolah,
        kategori: data.kategori,
        jumlah: Number(data.jumlah) || 0,
        fotoNota: fileUrl
      }
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Gagal memproses transaksi: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper Upload Foto ke Google Drive
function uploadPhotoToDrive(data) {
  let targetFolder;
  try {
    targetFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  } catch (fErr) {
    const folders = DriveApp.getFoldersByName("FOTO_NOTA_REKAP");
    if (folders.hasNext()) {
      targetFolder = folders.next();
    } else {
      targetFolder = DriveApp.createFolder("FOTO_NOTA_REKAP");
    }
  }

  const contentType = data.mimeType || "image/jpeg";
  const base64Data = data.fotoBase64.replace(/^data:image\\/\\w+;base64,/, "");
  const decodedBytes = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(decodedBytes, contentType, data.fileName || "NOTA.jpg");
  
  const file = targetFolder.createFile(blob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (sErr) {}
  
  return "https://drive.google.com/uc?export=view&id=" + file.getId();
}

// Helper Hapus File Foto dari Google Drive berdasarkan URL
function deleteDriveFileByUrl(url) {
  if (!url) return;
  try {
    const match = url.match(/[-\w]{25,}/);
    if (match && match[0]) {
      const fileId = match[0];
      const file = DriveApp.getFileById(fileId);
      file.setTrashed(true); // Pindahkan file ke Sampah Google Drive
    }
  } catch (err) {
    Logger.log("Peringatan: Gagal menghapus file foto dari Drive: " + err.toString());
  }
}
`;
