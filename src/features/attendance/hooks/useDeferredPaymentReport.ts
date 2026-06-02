import { useQuery } from '@tanstack/react-query';
import { paymentApi } from '@/services/paymentApi';
import type { DeferredPaymentFilters, DeferredPaymentData } from '@/shared/types/attendance';

/**
 * Deferred Payment Query Keys Factory
 */
export const deferredPaymentKeys = {
  all: ['deferred-payments'] as const,
  list: (filters: DeferredPaymentFilters) => [...deferredPaymentKeys.all, 'list', filters] as const,
  summary: (companyId?: string) => [...deferredPaymentKeys.all, 'summary', companyId] as const,
};

/**
 * Hook to fetch deferred payments report with filters
 *
 * Uses GET /api/payments/deferred
 *
 * Filters:
 * - status: DEFERRED | OVERDUE | COMPLETED
 * - overdue: true (filter overdue only)
 * - fromDate, toDate: date range filter per tanggal
 * - technicianId: filter by technician per user
 * - companyId: filter by company
 * - page, pageSize: pagination
 *
 * @param filters - Query parameters
 * @returns Query result with deferred payment data
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useDeferredPaymentReport({
 *   status: 'DEFERRED',
 *   fromDate: '2026-03-01',
 *   toDate: '2026-03-31',
 *   technicianId: 'uuid-here',
 *   page: 1,
 * });
 * ```
 */
export function useDeferredPaymentReport(filters: DeferredPaymentFilters = {}) {
  return useQuery({
    queryKey: deferredPaymentKeys.list(filters),
    queryFn: async () => {
      const response = await paymentApi.getDeferredPayments(filters);
      return response.data;
    },
    select: (data) => {
      if (data && 'items' in data && 'pagination' in data === false) {
        return data as DeferredPaymentData;
      }
      if (data && (data as any).data) {
        return (data as any).data as DeferredPaymentData;
      }
      return data as DeferredPaymentData;
    },
  });
}

/**
 * Hook to fetch deferred payment dashboard summary
 *
 * Uses GET /api/payments/deferred/summary
 *
 * @param companyId - Optional company filter
 * @returns Query result with summary data
 */
export function useDeferredPaymentSummary(companyId?: string) {
  return useQuery({
    queryKey: deferredPaymentKeys.summary(companyId),
    queryFn: () => paymentApi.getDeferredSummary(companyId),
    select: (data) => data.data,
  });
}

export default useDeferredPaymentReport;
