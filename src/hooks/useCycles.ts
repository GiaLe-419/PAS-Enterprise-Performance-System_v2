// src/hooks/useCycles.ts
import { useState, useCallback, useEffect } from "react";
import { New_appraisalcycle1sService } from "@/src/generated/services/New_appraisalcycle1sService";
import { New_customauditlogsService } from "@/src/generated/services/New_customauditlogsService";

// ============ TYPES ============
export interface Cycle {
  id: string;
  name: string;
  type: "Mid-Year" | "End-Year";
  year: number;
  startDate: string;
  endDate: string;
  status: "Draft" | "Active" | "Closed";
  goalWeighting: number;
  peerFeedbackEnabled: boolean;
  createdAt?: string;
}

// ============ HOOK ============
export function useCycles(userId?: string, userEmail?: string) {
  // ===== STATE =====
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== HELPERS =====
  const getUserId = useCallback((): string => {
    return userId || "00000000-0000-0000-0000-000000000000";
  }, [userId]);

  const getUserEmail = useCallback((): string => {
    return userEmail || "system@example.com";
  }, [userEmail]);

  const mapCycleFromDataverse = (c: any): Cycle => ({
    id: c.new_appraisalcycle1id,
    name: c.new_cyclename,
    type: c.new_cycletype === 100000000 ? "Mid-Year" : "End-Year",
    year: c.new_performanceyear || new Date().getFullYear(),
    startDate: c.new_startdate?.split("T")[0] || "",
    endDate: c.new_enddate?.split("T")[0] || "",
    status: mapStatus(c.new_status),
    goalWeighting: c.new_goalweighting || 70,
    peerFeedbackEnabled: false,
    createdAt: c.createdon,
  });

  const mapStatus = (code?: number): "Draft" | "Active" | "Closed" => {
    switch (code) {
      case 100000000:
        return "Active";
      case 100000001:
        return "Closed";
      default:
        return "Draft";
    }
  };

  const getStatusCode = (status: string): number => {
    switch (status) {
      case "Active":
        return 100000000;
      case "Closed":
        return 100000001;
      default:
        return 100000002;
    }
  };

  // ===== AUDIT LOG =====
  const logAudit = useCallback(
    async (action: string, description: string) => {
      try {
        await New_customauditlogsService.create({
          new_logname: action,
          new_actiontype: 100000000,
          new_changedbyemail: getUserEmail(),
          new_changereason: description,
          new_changetimestamp: new Date().toISOString(),
          new_fieldchanged: "cycle_management",
          new_previousvalue: "",
          new_newvalue: description,
          ownerid: getUserId(),
          owneridtype: "systemuser",
          statecode: 0 as 0,
        });
      } catch (error) {
        console.error("Error logging audit:", error);
      }
    },
    [getUserId, getUserEmail],
  );

  // ===== LOAD CYCLES =====
  const loadCycles = useCallback(async () => {
    console.log("🔍 useCycles: Loading cycles...");
    setLoading(true);
    setError(null);

    try {
      const result = await New_appraisalcycle1sService.getAll({
        select: [
          "new_appraisalcycle1id",
          "new_cyclename",
          "new_cycletype",
          "new_status",
          "new_startdate",
          "new_enddate",
          "new_performanceyear",
          "new_goalweighting",
          "createdon",
        ],
        orderBy: ["createdon desc"],
      });

      console.log("📥 useCycles: Result:", result);

      if (result.data) {
        const mappedCycles = result.data.map(mapCycleFromDataverse);
        setCycles(mappedCycles);
        console.log("✅ useCycles: Loaded", mappedCycles.length, "cycles");
      } else {
        setCycles([]);
      }
    } catch (err) {
      console.error("❌ useCycles: Error loading cycles:", err);
      setError("Failed to load cycles");
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== CREATE CYCLE =====
  const createCycle = useCallback(
    async (data: Omit<Cycle, "id" | "status">): Promise<Cycle> => {
      console.log("🔍 useCycles: Creating cycle:", data);
      setError(null);

      try {
        const userId = getUserId();
        console.log("👤 User ID:", userId);

        const record = {
          new_cycleid: crypto.randomUUID(),
          new_cyclename: data.name,
          new_cycletype: data.type === "Mid-Year" ? 100000000 : 100000001,
          new_performanceyear: data.year,
          new_startdate: data.startDate,
          new_enddate: data.endDate,
          new_goalweighting: data.goalWeighting,
          new_status: 100000002,
          "createdby@odata.bind": `/systemusers(${userId})`,
        };

        console.log("📤 Record to create:", record);

        const result = await New_appraisalcycle1sService.create(record);
        console.log("📥 Create result:", result);

        if (result && result.data) {
          await loadCycles();
          await logAudit("Cycle Created", `Created cycle: ${data.name}`);
          return mapCycleFromDataverse(result.data);
        }

        throw new Error("Failed to create cycle - no data returned");
      } catch (err) {
        console.error("❌ useCycles: Create cycle error:", err);
        setError(err instanceof Error ? err.message : "Failed to create cycle");
        throw err;
      }
    },
    [loadCycles, logAudit, getUserId],
  );

  // ===== UPDATE STATUS =====
  const updateCycleStatus = useCallback(
    async (id: string, status: "Active" | "Closed") => {
      console.log("🔍 useCycles: Updating status:", id, "→", status);
      setError(null);

      try {
        // Check: Only one active cycle
        if (status === "Active") {
          const activeExists = cycles.some(
            (c) => c.status === "Active" && c.id !== id,
          );
          if (activeExists) {
            throw new Error(
              "Another cycle is already active. Please close it first.",
            );
          }
        }

        await New_appraisalcycle1sService.update(id, {
          new_status: getStatusCode(status),
        });

        await loadCycles();
        await logAudit(
          "Cycle Status Changed",
          `Cycle ${id} changed to ${status}`,
        );
      } catch (err) {
        console.error("❌ useCycles: Update status error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update cycle status",
        );
        throw err;
      }
    },
    [cycles, loadCycles, logAudit],
  );

  // ===== UPDATE CYCLE =====
  const updateCycle = useCallback(
    async (id: string, data: Partial<Cycle>) => {
      console.log("🔍 useCycles: Updating cycle:", id, data);
      setError(null);

      try {
        const updateData: any = {};
        if (data.name !== undefined) updateData.new_cyclename = data.name;
        if (data.type !== undefined) {
          updateData.new_cycletype =
            data.type === "Mid-Year" ? 100000000 : 100000001;
        }
        if (data.year !== undefined) updateData.new_performanceyear = data.year;
        if (data.startDate !== undefined)
          updateData.new_startdate = data.startDate;
        if (data.endDate !== undefined) updateData.new_enddate = data.endDate;
        if (data.goalWeighting !== undefined)
          updateData.new_goalweighting = data.goalWeighting;

        if (Object.keys(updateData).length === 0) return;

        await New_appraisalcycle1sService.update(id, updateData);
        await loadCycles();
        await logAudit("Cycle Updated", `Cycle ${id} updated`);
      } catch (err) {
        console.error("❌ useCycles: Update cycle error:", err);
        setError("Failed to update cycle");
        throw err;
      }
    },
    [loadCycles, logAudit],
  );

  // ===== DELETE CYCLE =====
  const deleteCycle = useCallback(
    async (id: string) => {
      console.log("🔍 useCycles: Deleting cycle:", id);
      setError(null);

      try {
        const cycle = cycles.find((c) => c.id === id);
        if (cycle?.status === "Active") {
          throw new Error(
            "Cannot delete an active cycle. Please close it first.",
          );
        }

        await New_appraisalcycle1sService.delete(id);
        await loadCycles();
        await logAudit("Cycle Deleted", `Cycle ${id} deleted`);
      } catch (err) {
        console.error("❌ useCycles: Delete cycle error:", err);
        setError(err instanceof Error ? err.message : "Failed to delete cycle");
        throw err;
      }
    },
    [cycles, loadCycles, logAudit],
  );

  // ===== GET ACTIVE CYCLE =====
  const getActiveCycle = useCallback(() => {
    return cycles.find((c) => c.status === "Active");
  }, [cycles]);

  // ===== AUTO LOAD =====
  useEffect(() => {
    loadCycles();
  }, []);

  // ===== RETURN =====
  return {
    cycles,
    loading,
    error,
    loadCycles,
    createCycle,
    updateCycleStatus,
    updateCycle,
    deleteCycle,
    getActiveCycle,
  };
}
