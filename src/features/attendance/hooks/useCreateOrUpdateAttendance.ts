import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "@/services/attendanceApi";

export function useCreateOrUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userId: string;
      date: string;
      attendanceData: {
        status?: string;
        clockIn?: string;
        clockOut?: string;
        editReason: string;
      };
    }) => {
      const response = await attendanceApi.createOrUpdate(
        data.attendanceData,
        data.userId,
        data.date
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}
