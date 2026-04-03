// Schedule Feature Index

// Pages
export { SchedulePage, LocationManagementPage } from './pages';

// Components
export {
  ScheduleForm,
  TechnicianScheduleForm,
  SalesScheduleForm,
  ScheduleDetails,
  ScheduleModal,
  ScheduleTable,
  ScheduleFilters,
  LocationForm,
} from './components';
export type { SalesScheduleFormData } from './components';

// Hooks
export {
  useSchedules,
  useSchedule,
  useCreateSchedule,
  useUpdateSchedule,
  useCancelSchedule,
  useDeleteSchedule,
  useBulkCreateSchedules,
  useTechnicianAvailability,
  useTechnicianSchedules,
  useLocationSchedules,
  useLocations,
  useLocation,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
  useTechnicians,
  useScheduleTechnicians,
  useSales,
  useScheduleSalesUsers,
  scheduleKeys,
  locationKeys,
} from './hooks/useSchedules';

// Utils
export {
  handleScheduleError,
  getStatusColor,
  getStatusBadgeClasses,
  formatScheduleTime,
  formatScheduleDate,
  calculateDuration,
} from './utils/scheduleHelpers';
