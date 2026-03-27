/**
 * Attendance Excel Export Utility
 * 
 * Handles downloading Excel files from backend API endpoints.
 * Supports 3 export types: Monthly Report, History, and All Records.
 * 
 * @module utils/attendanceExcelExport
 */

import * as XLSX from 'xlsx';

/**
 * Extract filename from Content-Disposition header
 */
function extractFilename(contentDisposition: string | null): string {
  if (!contentDisposition) {
    return `Attendance_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
  }

  const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
  return filenameMatch ? filenameMatch[1] : `Attendance_Export_${Date.now()}.xlsx`;
}

/**
 * Generate timestamp for filename
 */
function generateTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').split('.')[0];
}

/**
 * Download Excel file from blob response
 */
function downloadExcelFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Handle Excel file download from API response
 */
export function handleExcelDownload(
  blob: Blob,
  contentDisposition: string | null,
  defaultFilename: string
): void {
  const filename = extractFilename(contentDisposition) || defaultFilename;
  downloadExcelFile(blob, filename);
}

/**
 * Parse Excel file to JSON (for preview or processing)
 */
export function parseExcelFile(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Get default filename for monthly report
 */
export function getMonthlyReportFilename(year?: number, month?: number): string {
  const now = new Date();
  const exportYear = year || now.getFullYear();
  const exportMonth = month || now.getMonth() + 1;
  const monthStr = exportMonth.toString().padStart(2, '0');
  const timestamp = generateTimestamp();
  
  return `Laporan_Bulanan_${exportYear}-${monthStr}_${timestamp}.xlsx`;
}

/**
 * Get default filename for history export
 */
export function getHistoryFilename(startDate?: string, endDate?: string): string {
  const dateStr = startDate || endDate || new Date().toISOString().split('T')[0];
  const timestamp = generateTimestamp();
  
  return `Riwayat_Attendance_${dateStr}_${timestamp}.xlsx`;
}

/**
 * Get default filename for all records export
 */
export function getAllRecordsFilename(startDate?: string, endDate?: string): string {
  const dateStr = startDate || endDate || new Date().toISOString().split('T')[0];
  const timestamp = generateTimestamp();
  
  return `Semua_Data_Attendance_${dateStr}_${timestamp}.xlsx`;
}

/**
 * Format currency to Indonesian Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to Indonesian locale
 */
export function formatDateIndonesian(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Map attendance status to Indonesian label
 */
export function mapAttendanceStatus(status: string): string {
  const statusMap: Record<string, string> = {
    HADIR: 'Hadir',
    present: 'Hadir',
    TERLAMBAT: 'Terlambat',
    late: 'Terlambat',
    ALPA: 'Alpa',
    absent: 'Alpa',
    IZIN: 'Izin',
    leave: 'Izin',
    SAKIT: 'Sakit',
    TECHNICIAN_CHECKED_IN: 'Teknisi Check-In',
    TECHNICIAN_AT_JOB_SITE: 'Teknisi di Lokasi',
  };
  
  return statusMap[status] || status;
}

/**
 * Map clock out status to Indonesian label
 */
export function mapClockOutStatus(status: string): string {
  const statusMap: Record<string, string> = {
    completed: 'Tepat Waktu',
    pending: 'Belum Check-Out',
    ON_TIME: 'Tepat Waktu',
    LATE: 'Terlambat',
    EARLY: 'Pulang Cepat',
    NORMAL: 'Normal',
  };
  
  return statusMap[status] || status;
}
