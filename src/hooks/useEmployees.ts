// src/hooks/useEmployees.ts
import { useState, useCallback } from "react";
import { New_employeesprofilesService } from "@/src/generated/services/New_employeesprofilesService";

export function useEmployees() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEmployeesByManager = useCallback(async (managerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await New_employeesprofilesService.getAll({
        filter: `_new_manager_value eq '${managerId}' and statecode eq 0`,
        select: [
          "new_employeesprofileid",
          "new_username",
          "new_email",
          "new_department",
        ],
      });
      return result.data || [];
    } catch (err) {
      setError("Failed to load employees");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { getEmployeesByManager, loading, error };
}
