import type { Schedule } from '@/shared/types/schedule';

export function exportSchedulesToCSV(schedules: Schedule[], filename = 'schedules') {
  // Define CSV headers
  const headers = [
    'ID',
    'Technician Name',
    'Technician Email',
    'Location Name',
    'Location Address',
    'Date',
    'Start Time',
    'End Time',
    'Duration (minutes)',
    'Status',
    'Description',
    'Notes',
    'Created At',
  ];

  // Convert schedules to CSV rows
  const rows = schedules.map((schedule) => {
    const duration = Math.floor(
      (new Date(schedule.endTime).getTime() - new Date(schedule.startTime).getTime()) /
        (1000 * 60)
    );

    return [
      schedule.id,
      `"${schedule.technician.name}"`,
      `"${schedule.technician.email}"`,
      `"${schedule.location.name}"`,
      `"${schedule.location.address}"`,
      new Date(schedule.date).toLocaleDateString('id-ID'),
      new Date(schedule.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      new Date(schedule.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      duration,
      schedule.status,
      `"${schedule.description || ''}"`,
      `"${schedule.notes || ''}"`,
      new Date(schedule.createdAt).toLocaleString('id-ID'),
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportLocationsToCSV(
  locations: Array<{
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius?: number;
    description?: string;
    isActive: boolean;
    createdAt: string;
  }>,
  filename = 'locations'
) {
  const headers = [
    'ID',
    'Name',
    'Address',
    'Latitude',
    'Longitude',
    'Radius (m)',
    'Description',
    'Status',
    'Created At',
  ];

  const rows = locations.map((loc) => [
    loc.id,
    `"${loc.name}"`,
    `"${loc.address}"`,
    loc.latitude,
    loc.longitude,
    loc.radius || 50,
    `"${loc.description || ''}"`,
    loc.isActive ? 'Active' : 'Inactive',
    new Date(loc.createdAt).toLocaleString('id-ID'),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
