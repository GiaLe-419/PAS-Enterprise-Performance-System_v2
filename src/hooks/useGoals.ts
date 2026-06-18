// src/hooks/useGoals.ts
import { useState, useCallback, useEffect } from "react";
import { New_kpisService } from "@/src/generated/services/New_kpisService";
import { New_performanceappraisalsService } from "@/src/generated/services/New_performanceappraisalsService";

// ============ TYPES ============
export interface Goal {
  id: string;
  employeeId: string;
  cycleId: string;
  title: string;
  description: string;
  weight: number;
  category: "Technical" | "Business" | "Development" | "People";
  target: string;
  targetValue: number;
  actualValue: number;
  progress: number;
  status:
    | "Draft"
    | "Pending Approval"
    | "Revision Required"
    | "Approved"
    | "Rejected";
  evidence: string;
  evidenceUrl?: string;
  evidenceName?: string;
  managerComment?: string;
  approvedBy?: string;
  approvedDate?: string;
  submittedDate?: string;
  lastUpdated: string;
}

interface UseGoalsProps {
  employeeId: string;
  cycleId: string;
}

// ============ HOOK ============
export function useGoals({ employeeId, cycleId }: UseGoalsProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appraisalId, setAppraisalId] = useState<string | null>(null);

  // ===== HELPERS =====
  const mapGoalFromDataverse = (g: any): Goal => ({
    id: g.new_kpiid,
    employeeId: employeeId,
    cycleId: cycleId,
    title: g.new_goaltitle || "",
    description: "",
    weight: g.new_weighting || 0,
    category: "Business",
    target: "",
    targetValue: 0,
    actualValue: 0,
    progress: 0,
    status: mapStatus(g.new_goalstatus),
    evidence: "",
    evidenceUrl: g.new_evidenceurl || "",
    evidenceName: "",
    managerComment: g.new_managercomment || "",
    approvedBy: g.new_approvedby || "",
    approvedDate: g.new_approveddate || "",
    submittedDate: g.new_submitteddate || "",
    lastUpdated: g.modifiedon || g.createdon || new Date().toISOString(),
  });

  const mapStatus = (code?: number): Goal["status"] => {
    switch (code) {
      case 100000001:
        return "Pending Approval";
      case 100000002:
        return "Approved";
      case 100000003:
        return "Revision Required";
      case 100000004:
        return "Rejected";
      default:
        return "Draft";
    }
  };

  const getStatusCode = (status: Goal["status"]): number => {
    switch (status) {
      case "Pending Approval":
        return 100000001;
      case "Approved":
        return 100000002;
      case "Revision Required":
        return 100000003;
      case "Rejected":
        return 100000004;
      default:
        return 100000000;
    }
  };

  // ===== TÌM HOẶC TẠO APPRAISAL =====
  const getOrCreateAppraisal = useCallback(async (): Promise<string | null> => {
    if (!employeeId || !cycleId) return null;

    try {
      // 1. Tìm Appraisal đã tồn tại
      const result = await New_performanceappraisalsService.getAll({
        filter: `new_appraisalname eq 'Appraisal_${employeeId}_${cycleId}'`,
        select: ["new_performanceappraisalid"],
      });

      if (result.data && result.data.length > 0) {
        const foundId = result.data[0].new_performanceappraisalid;
        console.log("🔍 Found existing appraisal:", foundId);
        return foundId;
      }

      // 2. Tạo mới - KHÔNG gán ownerid
      console.log("🔍 No appraisal found, creating new...");

      const newAppraisal = await New_performanceappraisalsService.create({
        new_appraisalname: `Appraisal_${employeeId}_${cycleId}`,
        new_workflowstatus: 100000000, // Draft
        new_strengths: "",
        new_opportunities: "",
        new_blockers: "",
        statecode: 0 as 0,
      });

      if (newAppraisal.data) {
        console.log(
          "✅ Created new appraisal:",
          newAppraisal.data.new_performanceappraisalid,
        );
        return newAppraisal.data.new_performanceappraisalid;
      }

      if (newAppraisal.error) {
        console.error(
          "❌ Error creating appraisal:",
          JSON.stringify(newAppraisal.error, null, 2),
        );
      }

      return null;
    } catch (err) {
      console.error("❌ Error getting/creating appraisal:", err);
      return null;
    }
  }, [employeeId, cycleId]);

  // ===== LOAD GOALS =====
  const loadGoals = useCallback(async () => {
    if (!employeeId || !cycleId) {
      setGoals([]);
      return;
    }

    console.log("🔍 useGoals: Loading goals...");
    setLoading(true);
    setError(null);

    try {
      const appraisal = await getOrCreateAppraisal();
      if (!appraisal) {
        setError("Cannot find or create appraisal");
        setLoading(false);
        return;
      }
      setAppraisalId(appraisal);

      const result = await New_kpisService.getAll({
        filter: `_new_appraisal_value eq ${appraisal}`,
        select: [
          "new_kpiid",
          "new_goaltitle",
          "new_goalstatus",
          "new_weighting",
          "new_evidenceurl",
          "createdon",
          "modifiedon",
        ],
        orderBy: ["createdon desc"],
      });

      console.log("📥 useGoals: Result:", result);

      if (result.data) {
        const mappedGoals = result.data.map(mapGoalFromDataverse);
        setGoals(mappedGoals);
        console.log("✅ useGoals: Loaded", mappedGoals.length, "goals");
      } else {
        setGoals([]);
      }
    } catch (err) {
      console.error("❌ useGoals: Error loading goals:", err);
      setError("Failed to load goals");
    } finally {
      setLoading(false);
    }
  }, [employeeId, cycleId, getOrCreateAppraisal]);

  // ===== CREATE GOAL =====
  const createGoal = useCallback(
    async (data: Omit<Goal, "id" | "status" | "progress" | "lastUpdated">) => {
      console.log("🔍 useGoals: Creating goal:", data);
      setError(null);

      try {
        let appraisal = appraisalId;
        if (!appraisal) {
          appraisal = await getOrCreateAppraisal();
          if (!appraisal) {
            throw new Error("Cannot find or create appraisal");
          }
          setAppraisalId(appraisal);
        }

        const record = {
          new_goaltitle: data.title,
          new_goalstatus: 100000000, // Draft
          new_weighting: data.weight,
          new_evidenceurl: data.evidenceUrl || "",
          statecode: 0 as 0,
          "new_Appraisal@odata.bind": `/new_performanceappraisals(${appraisal})`,
        };

        console.log("📤 Record to create:", JSON.stringify(record, null, 2));

        const result = await New_kpisService.create(record);
        console.log("📥 Create result:", result);

        if (result && result.data) {
          console.log("✅ Goal created successfully!");
          await loadGoals();
          return mapGoalFromDataverse(result.data);
        }

        if (result && result.error) {
          console.error(
            "❌ Error details:",
            JSON.stringify(result.error, null, 2),
          );
        }

        throw new Error("Failed to create goal");
      } catch (err) {
        console.error("❌ useGoals: Create goal error:", err);
        setError(err instanceof Error ? err.message : "Failed to create goal");
        throw err;
      }
    },
    [appraisalId, getOrCreateAppraisal, loadGoals],
  );

  // ===== UPDATE GOAL =====
  const updateGoal = useCallback(
    async (id: string, data: Partial<Goal>) => {
      console.log("🔍 useGoals: Updating goal:", id, data);
      setError(null);

      try {
        const updateData: any = {};

        if (data.title !== undefined) updateData.new_goaltitle = data.title;
        if (data.weight !== undefined) updateData.new_weighting = data.weight;
        if (data.evidenceUrl !== undefined)
          updateData.new_evidenceurl = data.evidenceUrl;
        if (data.status !== undefined)
          updateData.new_goalstatus = getStatusCode(data.status);

        if (Object.keys(updateData).length === 0) return;

        await New_kpisService.update(id, updateData);
        await loadGoals();
      } catch (err) {
        console.error("❌ useGoals: Update goal error:", err);
        setError("Failed to update goal");
        throw err;
      }
    },
    [loadGoals],
  );

  // ===== UPDATE GOAL STATUS =====
  const updateGoalStatus = useCallback(
    async (id: string, status: Goal["status"], comment?: string) => {
      console.log("🔍 useGoals: Updating goal status:", id, status);
      setError(null);

      try {
        const updateData: any = {
          new_goalstatus: getStatusCode(status),
        };

        if (comment) {
          updateData.new_managercomment = comment;
        }

        await New_kpisService.update(id, updateData);
        await loadGoals();
      } catch (err) {
        console.error("❌ useGoals: Update goal status error:", err);
        setError("Failed to update goal status");
        throw err;
      }
    },
    [loadGoals],
  );

  // ===== DELETE GOAL =====
  const deleteGoal = useCallback(
    async (id: string) => {
      console.log("🔍 useGoals: Deleting goal:", id);
      setError(null);

      try {
        await New_kpisService.delete(id);
        await loadGoals();
      } catch (err) {
        console.error("❌ useGoals: Delete goal error:", err);
        setError(err instanceof Error ? err.message : "Failed to delete goal");
        throw err;
      }
    },
    [loadGoals],
  );

  // ===== SUBMIT GOALS BATCH =====
  const submitGoalsBatch = useCallback(async () => {
    console.log("🔍 useGoals: Submitting goals batch");
    setError(null);

    try {
      const draftGoals = goals.filter(
        (g) => g.status === "Draft" || g.status === "Revision Required",
      );

      if (draftGoals.length === 0) {
        throw new Error("No goals to submit");
      }

      const totalWeight = draftGoals.reduce((sum, g) => sum + g.weight, 0);
      if (totalWeight !== 100) {
        throw new Error(`Total weight must be 100%. Current: ${totalWeight}%`);
      }

      if (draftGoals.length < 2) {
        throw new Error("Minimum 2 goals required");
      }

      for (const goal of draftGoals) {
        await New_kpisService.update(goal.id, {
          new_goalstatus: 100000001, // Pending Approval
        });
      }

      await loadGoals();
    } catch (err) {
      console.error("❌ useGoals: Submit batch error:", err);
      setError(err instanceof Error ? err.message : "Failed to submit goals");
      throw err;
    }
  }, [goals, loadGoals]);

  // ===== STATS =====
  const getTotalWeight = useCallback(() => {
    return goals.reduce((sum, g) => sum + g.weight, 0);
  }, [goals]);

  const getStatusCount = useCallback(
    (status: Goal["status"]) => {
      return goals.filter((g) => g.status === status).length;
    },
    [goals],
  );

  // ===== AUTO LOAD =====
  useEffect(() => {
    if (employeeId && cycleId) {
      loadGoals();
    }
  }, [employeeId, cycleId]);

  return {
    goals,
    loading,
    error,
    loadGoals,
    createGoal,
    updateGoal,
    updateGoalStatus,
    deleteGoal,
    submitGoalsBatch,
    getTotalWeight,
    getStatusCount,
  };
}
