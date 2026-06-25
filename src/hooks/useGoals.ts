// src/hooks/useGoals.ts
// ============================================================
// HOOK QUẢN LÝ MỤC TIÊU (GOALS) - DÙNG APPRAISALDETAILSES
// ============================================================

import { useState, useCallback, useEffect, useRef } from "react";
import { New_appraisaldetailsesService } from "@/src/generated/services/New_appraisaldetailsesService";
import { New_performanceappraisalsService } from "@/src/generated/services/New_performanceappraisalsService";

// ============================================================
// ĐỊNH NGHĨA KIỂU DỮ LIỆU
// ============================================================
export interface Goal {
  id: string;
  employeeId: string;
  cycleId: string;
  appraisalId: string;
  title: string;
  weight: number;
  status:
    | "Draft"
    | "Pending Approval"
    | "Revision Required"
    | "Approved"
    | "Rejected";
  evidenceUrl?: string;
  selfRating?: number;
  managerRating?: number;
  evaluationType: string;
  createdAt?: string;
  lastUpdated?: string;
}

// ============================================================
// ĐỊNH NGHĨA HOOK
// ============================================================
export function useGoals(employeeId: string, cycleId: string) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appraisalId, setAppraisalId] = useState<string | null>(null);
  const [isAppraisalLoading, setIsAppraisalLoading] = useState(false);

  const hasInitialized = useRef(false);
  const isLoadingRef = useRef(false);

  // ============================================================
  // PHẦN 1: QUẢN LÝ APPRAISAL
  // ============================================================

  const createNewAppraisal = useCallback(
    async (empId: string, cycId: string): Promise<string | null> => {
      try {
        console.log("📤 Tao Appraisal moi:", empId, cycId);

        const checkResult = await New_performanceappraisalsService.getAll({
          filter: `_new_employee_value eq '${empId}' and _new_cycleid_value eq '${cycId}'`,
          select: ["new_performanceappraisalid", "statecode"],
        });

        if (checkResult.data && checkResult.data.length > 0) {
          const existing = checkResult.data[0];
          if (existing.statecode === 0) {
            return existing.new_performanceappraisalid;
          }
        }

        const newAppraisalData = {
          new_appraisalid: crypto.randomUUID(),
          new_appraisalname: `Appraisal_${empId}_${cycId}`,
          new_workflowstatus: 100000000,
          new_strengths: "",
          new_opportunities: "",
          new_blockers: "",
          statecode: 0 as 0,
          "new_Employee@odata.bind": `/new_employeesprofiles(${empId})`,
          "new_CycleID@odata.bind": `/new_appraisalcycle1s(${cycId})`,
        };

        const result =
          await New_performanceappraisalsService.create(newAppraisalData);

        if (result.data) {
          console.log(
            "✅ Tao Appraisal thanh cong:",
            result.data.new_performanceappraisalid,
          );
          return result.data.new_performanceappraisalid;
        }
        return null;
      } catch (error) {
        console.error("❌ Loi tao Appraisal:", error);
        return null;
      }
    },
    [],
  );

  const getOrCreateAppraisal = useCallback(
    async (empId: string, cycId: string): Promise<string | null> => {
      console.log("🔍 Tim Appraisal:", empId, cycId);
      setIsAppraisalLoading(true);

      try {
        const result = await New_performanceappraisalsService.getAll({
          filter: `_new_employee_value eq '${empId}' and _new_cycleid_value eq '${cycId}'`,
          select: ["new_performanceappraisalid", "statecode"],
        });

        if (result.data && result.data.length > 0) {
          const appraisal = result.data[0];
          if (appraisal.statecode === 0) {
            setAppraisalId(appraisal.new_performanceappraisalid);
            return appraisal.new_performanceappraisalid;
          }
        }

        const newId = await createNewAppraisal(empId, cycId);
        setAppraisalId(newId);
        return newId;
      } catch (error) {
        console.error("❌ Loi lay Appraisal:", error);
        setError("Khong the tim hoac tao Appraisal");
        return null;
      } finally {
        setIsAppraisalLoading(false);
      }
    },
    [createNewAppraisal],
  );

  // ============================================================
  // PHẦN 2: CHUYỂN ĐỔI DỮ LIỆU
  // ============================================================

  const mapGoalFromDataverse = (g: any): Goal => ({
    id: g.new_appraisaldetailsid,
    employeeId: employeeId,
    cycleId: cycleId,
    appraisalId: g._new_appraisalid_value || appraisalId || "",
    title: g.new_title || "",
    weight: g.new_weighting || 0,
    status: mapStatus(g.new_goalstatus),
    evidenceUrl: g.new_evidenceurl || "",
    selfRating: g.new_selfrating || 0,
    managerRating: g.new_managerrating || 0,
    evaluationType: g.new_evaluationtype || "Goal",
    createdAt: g.createdon,
    lastUpdated: g.modifiedon || g.createdon || new Date().toISOString(),
  });

  const mapStatus = (code?: string): Goal["status"] => {
    switch (code) {
      case "Pending Approval":
        return "Pending Approval";
      case "Approved":
        return "Approved";
      case "Revision Required":
        return "Revision Required";
      case "Rejected":
        return "Rejected";
      default:
        return "Draft";
    }
  };

  const getStatusCode = (status: Goal["status"]): string => {
    switch (status) {
      case "Pending Approval":
        return "Pending Approval";
      case "Approved":
        return "Approved";
      case "Revision Required":
        return "Revision Required";
      case "Rejected":
        return "Rejected";
      default:
        return "Draft";
    }
  };

  // ============================================================
  // PHẦN 3: CRUD OPERATIONS
  // ============================================================

  const loadGoals = useCallback(async () => {
    if (!employeeId || !cycleId) {
      setGoals([]);
      return;
    }

    if (isLoadingRef.current) return;

    let currentAppraisalId = appraisalId;
    if (!currentAppraisalId) {
      currentAppraisalId = await getOrCreateAppraisal(employeeId, cycleId);
      if (!currentAppraisalId) {
        setGoals([]);
        return;
      }
    }

    console.log("📥 Load goals cho appraisal:", currentAppraisalId);
    setLoading(true);
    setError(null);
    isLoadingRef.current = true;

    try {
      const result = await New_appraisaldetailsesService.getAll({
        select: [
          "new_appraisaldetailsid",
          "new_title",
          "new_weighting",
          "new_goalstatus",
          "new_evidenceurl",
          "new_selfrating",
          "new_managerrating",
          "new_evaluationtype",
          "_new_appraisalid_value",
          "createdon",
          "modifiedon",
        ],
        filter: `_new_appraisalid_value eq '${currentAppraisalId}'`,
        orderBy: ["createdon desc"],
      });

      if (result.data && result.data.length > 0) {
        const mappedGoals = result.data.map(mapGoalFromDataverse);
        setGoals(mappedGoals);
        console.log("✅ Da load", mappedGoals.length, "goals");
      } else {
        setGoals([]);
        console.log("ℹ️ Khong co goals");
      }
    } catch (err) {
      console.error("❌ Loi load goals:", err);
      setError("Khong the load danh sach goals");
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [employeeId, cycleId, appraisalId, getOrCreateAppraisal]);

  const createGoal = useCallback(
    async (
      data: Omit<
        Goal,
        | "id"
        | "status"
        | "lastUpdated"
        | "appraisalId"
        | "selfRating"
        | "managerRating"
      >,
    ) => {
      console.log("📤 Tao goal:", data);
      setError(null);

      try {
        if (!employeeId || !cycleId) {
          throw new Error("Thieu employeeId hoac cycleId");
        }

        let currentAppraisalId = appraisalId;
        if (!currentAppraisalId) {
          currentAppraisalId = await getOrCreateAppraisal(employeeId, cycleId);
          if (!currentAppraisalId) {
            throw new Error("Khong the lay Appraisal ID");
          }
        }

        const currentTotal = goals.reduce((sum, g) => sum + g.weight, 0);
        if (currentTotal + (data.weight || 0) > 100) {
          throw new Error(
            `Tong weight vuot qua 100% (Hien tai: ${currentTotal}%)`,
          );
        }

        const record = {
          new_title: data.title,
          new_weighting: data.weight || 0,
          new_goalstatus: "Draft",
          new_evidenceurl: data.evidenceUrl || "",
          new_evaluationtype: data.evaluationType || "Goal",
          statecode: 0 as 0,
          "new_AppraisalID@odata.bind": `/new_performanceappraisals(${currentAppraisalId})`,
        };

        const result = await New_appraisaldetailsesService.create(record);

        if (result.data) {
          await loadGoals();
          console.log("✅ Tao goal thanh cong");
          return mapGoalFromDataverse(result.data);
        }
        throw new Error("Khong the tao goal");
      } catch (err) {
        console.error("❌ Loi tao goal:", err);
        setError(err instanceof Error ? err.message : "Khong the tao goal");
        throw err;
      }
    },
    [employeeId, cycleId, appraisalId, goals, getOrCreateAppraisal, loadGoals],
  );

  // ============================================================
  // UPDATE GOAL - SỬA LỖI
  // ============================================================
  const updateGoal = useCallback(
    async (id: string, data: Partial<Goal>) => {
      console.log("📤 Cap nhat goal:", id, data);
      setError(null);

      try {
        const updateData: any = {};

        // ✅ Chỉ thêm field nếu có giá trị
        if (data.title !== undefined) updateData.new_title = data.title;
        if (data.weight !== undefined) updateData.new_weighting = data.weight;
        if (data.evidenceUrl !== undefined)
          updateData.new_evidenceurl = data.evidenceUrl;
        if (data.selfRating !== undefined)
          updateData.new_selfrating = data.selfRating;
        if (data.managerRating !== undefined)
          updateData.new_managerrating = data.managerRating;
        if (data.evaluationType !== undefined)
          updateData.new_evaluationtype = data.evaluationType;

        // ✅ QUAN TRỌNG: Chỉ update status nếu có
        if (data.status !== undefined) {
          updateData.new_goalstatus = getStatusCode(data.status);
        }

        // ✅ Nếu không có gì thay đổi thì bỏ qua
        if (Object.keys(updateData).length === 0) {
          console.log("ℹ️ Khong co thay doi");
          return;
        }

        console.log("📤 Update data:", JSON.stringify(updateData, null, 2));

        await New_appraisaldetailsesService.update(id, updateData);
        await loadGoals();
        console.log("✅ Cap nhat thanh cong");
      } catch (err) {
        console.error("❌ Loi cap nhat:", err);
        // ✅ Hiển thị lỗi chi tiết hơn
        const errorMessage =
          err instanceof Error ? err.message : "Khong the cap nhat goal";
        setError(errorMessage);
        throw err;
      }
    },
    [loadGoals],
  );

  // ============================================================
  // UPDATE GOAL STATUS - SỬA LỖI
  // ============================================================
  const updateGoalStatus = useCallback(
    async (id: string, status: Goal["status"], comment?: string) => {
      console.log("📤 Cap nhat status:", id, status);
      setError(null);

      try {
        const updateData: any = {
          new_goalstatus: getStatusCode(status),
        };

        // Nếu có comment thì lưu (nếu bảng có field này)
        // if (comment) updateData.new_managercomment = comment;

        await New_appraisaldetailsesService.update(id, updateData);
        await loadGoals();
        console.log("✅ Cap nhat status thanh cong");
      } catch (err) {
        console.error("❌ Loi cap nhat status:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Khong the cap nhat trang thai";
        setError(errorMessage);
        throw err;
      }
    },
    [loadGoals],
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      console.log("📤 Xoa goal:", id);
      setError(null);

      try {
        const goal = goals.find((g) => g.id === id);
        if (
          goal &&
          goal.status !== "Draft" &&
          goal.status !== "Revision Required"
        ) {
          throw new Error(
            "Chi xoa duoc goal o trang thai Draft hoac Revision Required",
          );
        }

        await New_appraisaldetailsesService.delete(id);
        await loadGoals();
        console.log("✅ Xoa thanh cong");
      } catch (err) {
        console.error("❌ Loi xoa:", err);
        setError(err instanceof Error ? err.message : "Khong the xoa goal");
        throw err;
      }
    },
    [goals, loadGoals],
  );

  const submitGoalsBatch = useCallback(async () => {
    console.log("📤 Submit goals batch");
    setError(null);

    try {
      const draftGoals = goals.filter(
        (g) => g.status === "Draft" || g.status === "Revision Required",
      );

      if (draftGoals.length === 0) {
        throw new Error("Khong co goal nao de submit");
      }

      if (draftGoals.length < 2) {
        throw new Error("Can it nhat 2 goals");
      }

      const totalWeight = draftGoals.reduce((sum, g) => sum + g.weight, 0);
      if (totalWeight !== 100) {
        throw new Error(
          `Tong weight phai bang 100%. Hien tai: ${totalWeight}%`,
        );
      }

      for (const goal of draftGoals) {
        await New_appraisaldetailsesService.update(goal.id, {
          new_goalstatus: "Pending Approval",
        });
      }

      await loadGoals();
      console.log("✅ Submit goals batch thanh cong");
    } catch (err) {
      console.error("❌ Loi submit:", err);
      setError(err instanceof Error ? err.message : "Khong the submit");
      throw err;
    }
  }, [goals, loadGoals]);

  // ============================================================
  // PHẦN 4: UTILITY
  // ============================================================

  const getTotalWeight = useCallback(() => {
    return goals.reduce((sum, g) => sum + g.weight, 0);
  }, [goals]);

  const getStatusCount = useCallback(
    (status: Goal["status"]) => {
      return goals.filter((g) => g.status === status).length;
    },
    [goals],
  );

  const getDraftGoals = useCallback(() => {
    return goals.filter(
      (g) => g.status === "Draft" || g.status === "Revision Required",
    );
  }, [goals]);

  const getPendingGoals = useCallback(() => {
    return goals.filter((g) => g.status === "Pending Approval");
  }, [goals]);

  const canSubmitBatch = useCallback(() => {
    const draftGoals = getDraftGoals();
    if (draftGoals.length < 2) return false;
    const totalWeight = draftGoals.reduce((sum, g) => sum + g.weight, 0);
    return totalWeight === 100;
  }, [getDraftGoals]);

  // ============================================================
  // PHẦN 5: KHỞI TẠO
  // ============================================================

  useEffect(() => {
    if (employeeId && cycleId && !hasInitialized.current) {
      hasInitialized.current = true;
      const initialize = async () => {
        const id = await getOrCreateAppraisal(employeeId, cycleId);
        if (id) {
          setAppraisalId(id);
          await loadGoals();
        }
      };
      initialize();
    }
  }, [employeeId, cycleId, getOrCreateAppraisal, loadGoals]);

  useEffect(() => {
    if (appraisalId && hasInitialized.current) {
      loadGoals();
    }
  }, [appraisalId]);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    goals,
    loading,
    error,
    appraisalId,
    isAppraisalLoading,
    loadGoals,
    createGoal,
    updateGoal,
    updateGoalStatus,
    deleteGoal,
    submitGoalsBatch,
    getTotalWeight,
    getStatusCount,
    getDraftGoals,
    getPendingGoals,
    canSubmitBatch,
    getOrCreateAppraisal,
  };
}
