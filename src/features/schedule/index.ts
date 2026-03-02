// Schedule Feature Index

// Pages
export { SchedulePage, LocationManagementPage } from './pages';

// Components
export {
  ScheduleForm,
  ScheduleDetails,
  ScheduleModal,
  ScheduleTable,
  ScheduleFilters,
  LocationForm,
} from './components';

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
