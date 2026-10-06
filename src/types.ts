export interface Transaction {
  no: number;
  namaSekolah: string;
  kategori: string;
  jumlah: number;
  fotoNota: string;
}

export interface School {
  nama: string;
}

export interface AddTransactionPayload {
  namaSekolah: string;
  kategori: string;
  jumlah: number;
  fotoBase64: string;
  fileName: string;
  mimeType: string;
  scriptUrl?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
