import PageContainer from "@/components/ui/PageContainer";

const sections = [
  {
    title: "📊 Dashboard",
    desc: "Halaman utama yang menampilkan ringkasan cepat: jumlah teknisi, kehadiran hari ini, grafik traffic absensi, dan aktivitas terbaru seluruh tim.",
  },
  {
    title: "📋 Attendance (Absensi)",
    desc: "Melihat dan mengelola data kehadiran teknisi/sales. Bisa filter per tanggal, lihat siapa yang sudah clock-in/out, serta buat manual attendance jika ada yang lupa absen.",
  },
  {
    title: "🏖️ Leave (Cuti / Izin)",
    desc: "Mengajukan cuti atau izin, menyetujui atau menolak pengajuan dari teknisi. Semua status pengajuan (pending, disetujui, ditolak) terpantau di sini.",
  },
  {
    title: "⏰ Overtime (Lembur)",
    desc: "Mengajukan lembur, menyetujui atau menolak pengajuan lembur teknisi. Durasi dan alasan lembur tercatat untuk perhitungan payroll.",
  },
  {
    title: "📅 Calendar & Holidays (Kalender & Hari Libur)",
    children: [
      { label: "Kalender", desc: "Tampilan kalender penuh yang memperlihatkan jadwal teknisi, hari libur, dan event lainnya dalam sebulan." },
      { label: "Kelola Hari Libur", desc: "Menambah, mengubah, atau menghapus hari libur perusahaan (libur nasional, cuti bersama, dll)." },
    ],
  },
  {
    title: "📆 Schedule (Jadwal)",
    children: [
      { label: "Technician Schedule", desc: "Membuat dan mengatur jadwal kerja teknisi: tentukan lokasi, waktu mulai-selesai, dan teknisi yang bertugas." },
      { label: "My Schedule", desc: "Untuk teknisi/sales melihat jadwal kerja mereka sendiri." },
      { label: "Sales Schedule", desc: "Membuat dan mengatur jadwal kunjungan sales ke customer/lokasi." },
    ],
  },
  {
    title: "📈 Reports (Laporan)",
    desc: "Melihat laporan rekap absensi, lembur, cuti, dan data lainnya dalam bentuk tabel dan grafik yang bisa diexport.",
  },
  {
    title: "👥 User Management (Kelola Pengguna)",
    desc: "Menambah akun baru (teknisi, sales, admin), mengedit data pengguna, atau menonaktifkan akun. Hanya bisa diakses oleh Admin & HR.",
  },
];

export default function Help() {
  return (
    <PageContainer title="Panduan ERP">
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="text-sm text-slate-400">
          Berikut penjelasan singkat setiap menu di Waterpro HRIS — sistem untuk mengelola absensi, jadwal, cuti, dan lembur seluruh tim.
        </p>

        {sections.map((section) => (
          <div key={section.title} className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-4">
            <h2 className="text-base font-semibold text-white">{section.title}</h2>

            {section.desc && (
              <p className="mt-1 text-sm text-slate-300">{section.desc}</p>
            )}

            {section.children && (
              <div className="mt-3 space-y-2">
                {section.children.map((child) => (
                  <div key={child.label}>
                    <h3 className="text-sm font-medium text-indigo-300">{child.label}</h3>
                    <p className="text-sm text-slate-400">{child.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <p className="pt-4 text-center text-xs text-slate-500">
          Waterpro HRIS — Panel Admin
        </p>
      </div>
    </PageContainer>
  );
}
