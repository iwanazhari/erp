import { privateApi } from './authApi';
import type {
  DeferredPaymentData,
  DeferredPaymentFilters,
  DeferredPaymentSummary,
  ApiResponse,
} from '@/shared/types/attendance';

/**
 * Payment API Service
 *
 * Handles deferred payment report API calls.
 */
export const paymentApi = {
  /**
   * Get deferred payments report with filters
   * Endpoint: GET /api/payments/deferred
   *
   * Filters:
   * - status: DEFERRED | OVERDUE | COMPLETED
   * - overdue: true (filter overdue only)
   * - fromDate, toDate: date range filter
   * - technicianId: filter by technician
   * - companyId: filter by company
   * - page, pageSize: pagination
   *
   * @param filters - Query parameters
   * @returns ApiResponse<DeferredPaymentData>
   */
  getDeferredPayments: async (filters?: DeferredPaymentFilters): Promise<ApiResponse<DeferredPaymentData>> => {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.overdue !== undefined) params.append('overdue', String(filters.overdue));
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.technicianId) params.append('technicianId', filters.technicianId);
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));

    const response = await privateApi.get<ApiResponse<DeferredPaymentData>>(
      `/payments/deferred?${params}`
    );
    return response.data;
  },

  /**
   * Get deferred payment dashboard summary
   * Endpoint: GET /api/payments/deferred/summary
   *
   * @param companyId - Optional company filter
   * @returns ApiResponse<DeferredPaymentSummary>
   */
  getDeferredSummary: async (companyId?: string): Promise<ApiResponse<DeferredPaymentSummary>> => {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);

    const response = await privateApi.get<ApiResponse<DeferredPaymentSummary>>(
      `/payments/deferred/summary?${params}`
    );
    return response.data;
  },

  /**
   * Process payment for a deferred transaction
   * Endpoint: POST /api/payments/deferred/:transactionId/pay
   *
   * @param transactionId - The deferred payment transaction ID
   * @param amount - Payment amount
   * @param paymentMethod - Payment method (default: CASH)
   * @param notes - Optional payment notes
   * @returns ApiResponse
   */
  processPayment: async (
    transactionId: string,
    amount: number,
    paymentMethod = 'CASH',
    notes?: string
  ): Promise<ApiResponse<any>> => {
    const response = await privateApi.post<ApiResponse<any>>(
      `/payments/deferred/${transactionId}/pay`,
      { amount, paymentMethod, notes }
    );
    return response.data;
  },

  /**
   * Send reminder for deferred payment
   * Endpoint: POST /api/payments/deferred/:transactionId/remind
   *
   * @param transactionId - The deferred payment transaction ID
   * @param method - Reminder method (default: WHATSAPP)
   * @param message - Optional custom message
   * @returns ApiResponse
   */
  sendReminder: async (
    transactionId: string,
    method = 'WHATSAPP',
    message?: string
  ): Promise<ApiResponse<any>> => {
    const response = await privateApi.post<ApiResponse<any>>(
      `/payments/deferred/${transactionId}/remind`,
      { method, message }
    );
    return response.data;
  },

  /**
   * Escalate deferred payment to manager
   * Endpoint: POST /api/payments/deferred/:transactionId/escalate
   *
   * @param transactionId - The deferred payment transaction ID
   * @param escalatedTo - Manager ID to escalate to
   * @param reason - Reason for escalation
   * @returns ApiResponse
   */
  escalatePayment: async (
    transactionId: string,
    escalatedTo: string,
    reason: string
  ): Promise<ApiResponse<any>> => {
    const response = await privateApi.post<ApiResponse<any>>(
      `/payments/deferred/${transactionId}/escalate`,
      { escalatedTo, reason }
    );
    return response.data;
  },
};

export default paymentApi;
