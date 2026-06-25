// src/hooks/useGoals.ts
// ============================================================
// HOOK QUẢN LÝ MỤC TIÊU (GOALS/KPIS) - FIXED VERSION
// ============================================================
// Mục đích: Cho phép Employee quản lý KPI/Goals trong chu kỳ đánh giá
// - Tạo, sửa, xóa goals
// - Submit batch lên manager
// - Quản lý workflow status
// ============================================================

import { useState, useCallback, useEffect, useRef } from "react";
import { New_kpisService } from "@/src/generated/services/New_kpisService";
import { New_performanceappraisalsService } from "@/src/generated/services/New_performanceappraisalsService";
import { New_customauditlogsService } from "@/src/generated/services/New_customauditlogsService";

// ============================================================
// ĐỊNH NGHĨA KIỂU DỮ LIỆU
// ============================================================
export interface Goal {
  id: string;
  employeeId: string;
  cycleId: string;
  appraisalId: string; // ✅ Thêm appraisalId để dễ dàng filter
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
  selfRating?: number; // ✅ Thêm self rating
  managerRating?: number; // ✅ Thêm manager rating
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

  // Ref để tránh gọi nhiều lần
  const hasInitialized = useRef(false);

  // ============================================================
  // PHẦN 1: QUẢN LÝ APPRAISAL
  // ============================================================

  /**
   * Tạo Appraisal mới với đầy đủ liên kết
   * - Liên kết với Employee và Cycle
   * - Status = Draft (100000000)
   */
  const createNewAppraisal = useCallback(
    async (empId: string, cycId: string): Promise<string | null> => {
      try {
        console.log(
          "📤 Tao Appraisal moi cho employee:",
          empId,
          "cycle:",
          cycId,
        );

        // Kiểm tra lại xem có Appraisal nào vừa được tạo không (tránh duplicate)
        const checkResult = await New_performanceappraisalsService.getAll({
          filter: `_new_employee_value eq '${empId}' and _new_cycle_value eq '${cycId}'`,
          select: ["new_performanceappraisalid", "statecode"],
        });

        if (checkResult.data && checkResult.data.length > 0) {
          const existing = checkResult.data[0];
          if (existing.statecode === 0) {
            console.log(
              "✅ Appraisal da ton tai (Active):",
              existing.new_performanceappraisalid,
            );
            return existing.new_performanceappraisalid;
          }
        }

        // Tạo mới với đầy đủ liên kết
        const newAppraisalData = {
          new_appraisalid: crypto.randomUUID(),
          new_appraisalname: `Appraisal_${empId}_${cycId}`,
          new_workflowstatus: 100000000, // Draft
          new_strengths: "",
          new_opportunities: "",
          new_blockers: "",
          statecode: 0 as 0,
          // ✅ LIÊN KẾT EMPLOYEE VÀ CYCLE
          "new_Employee@odata.bind": `/new_employeesprofiles(${empId})`,
          "new_Cycle@odata.bind": `/new_appraisalcycle1s(${cycId})`,
        };

        console.log(
          "📤 Data tao Appraisal:",
          JSON.stringify(newAppraisalData, null, 2),
        );

        const result =
          await New_performanceappraisalsService.create(newAppraisalData);

        if (result.data) {
          console.log(
            "✅ Tao Appraisal thanh cong:",
            result.data.new_performanceappraisalid,
          );
          return result.data.new_performanceappraisalid;
        }

        if (result.error) {
          console.error("❌ Loi tao Appraisal:", result.error);
          throw new Error(result.error.message || "Khong the tao Appraisal");
        }

        return null;
      } catch (error) {
        console.error("❌ Loi tao Appraisal:", error);
        return null;
      }
    },
    [],
  );

  /**
   * Lấy hoặc tạo Appraisal cho Employee trong Cycle hiện tại
   * - Tìm theo employee và cycle
   * - Nếu không có thì tạo mới
   */
  const getOrCreateAppraisal = useCallback(
    async (empId: string, cycId: string): Promise<string | null> => {
      console.log("🔍 Tim Appraisal cho employee:", empId, "cycle:", cycId);
      setIsAppraisalLoading(true);

      try {
        // ✅ Tìm bằng lookup fields
        const result = await New_performanceappraisalsService.getAll({
          filter: `_new_employee_value eq '${empId}' and _new_cycle_value eq '${cycId}'`,
          select: [
            "new_performanceappraisalid",
            "new_workflowstatus",
            "statecode",
            "new_appraisalname",
          ],
        });

        console.log("📥 Ket qua tim Appraisal:", result);

        if (result.data && result.data.length > 0) {
          const appraisal = result.data[0];

          // Kiểm tra Appraisal có active không
          if (appraisal.statecode === 0) {
            console.log(
              "✅ Tim thay Appraisal Active:",
              appraisal.new_performanceappraisalid,
            );
            setAppraisalId(appraisal.new_performanceappraisalid);
            return appraisal.new_performanceappraisalid;
          } else {
            console.log("⚠️ Appraisal dang Inactive, tao moi...");
            const newId = await createNewAppraisal(empId, cycId);
            setAppraisalId(newId);
            return newId;
          }
        }

        console.log("⚠️ Khong tim thay Appraisal, tao moi...");
        const newId = await createNewAppraisal(empId, cycId);
        setAppraisalId(newId);
        return newId;
      } catch (error) {
        console.error("❌ Loi lay Appraisal ID:", error);
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

  const mapGoalFromDataverse = useCallback(
    (g: any, appraisalId: string): Goal => {
      let category: Goal["category"] = "Business";
      if (g.new_category === 100000001) category = "Technical";
      else if (g.new_category === 100000003) category = "Development";
      else if (g.new_category === 100000004) category = "People";

      return {
        id: g.new_kpiid,
        employeeId: employeeId,
        cycleId: cycleId,
        appraisalId: appraisalId,
        title: g.new_goaltitle || "",
        description: g.new_description || "",
        weight: g.new_weighting || 0,
        category: category,
        target: g.new_target || "",
        targetValue: g.new_targetvalue || 0,
        actualValue: g.new_actualvalue || 0,
        progress: g.new_progress || 0,
        status: mapStatus(g.new_goalstatus),
        evidence: g.new_evidence || "",
        evidenceUrl: g.new_evidenceurl || "",
        evidenceName: g.new_evidencename || "",
        managerComment: g.new_managercomment || "",
        approvedBy: g.new_approvedby || "",
        approvedDate: g.new_approveddate || "",
        submittedDate: g.new_submitteddate || "",
        lastUpdated: g.modifiedon || g.createdon || new Date().toISOString(),
        selfRating: g.new_selfrating || 0,
        managerRating: g.new_managerrating || 0,
      };
    },
    [employeeId, cycleId],
  );

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

  // ============================================================
  // PHẦN 3: CRUD OPERATIONS
  // ============================================================

  /**
   * Load danh sách goals của employee trong cycle
   * - Dùng appraisalId để filter
   */
  const loadGoals = useCallback(async () => {
    if (!employeeId || !cycleId) {
      console.log("⚠️ Khong co employeeId hoac cycleId, skip load goals");
      setGoals([]);
      return;
    }

    // Đảm bảo có appraisalId
    let currentAppraisalId = appraisalId;
    if (!currentAppraisalId) {
      currentAppraisalId = await getOrCreateAppraisal(employeeId, cycleId);
      if (!currentAppraisalId) {
        console.log("⚠️ Khong the lay Appraisal ID");
        setGoals([]);
        return;
      }
    }

    console.log("📥 Dang load goals cho appraisal:", currentAppraisalId);
    setLoading(true);
    setError(null);

    try {
      // ✅ Filter theo appraisal
      const result = await New_kpisService.getAll({
        select: [
          "new_kpiid",
          "new_goaltitle",
          "new_description",
          "new_weighting",
          "new_goalstatus",
          "new_evidenceurl",
          "new_evidencename",
          "new_managercomment",
          "new_selfrating",
          "new_managerrating",
          "new_target",
          "new_targetvalue",
          "new_actualvalue",
          "new_progress",
          "new_approvedby",
          "new_approveddate",
          "new_submitteddate",
          "new_category",
          "new_evidence",
          "_new_appraisal_value",
          "createdon",
          "modifiedon",
        ],
        filter: `_new_appraisal_value eq '${currentAppraisalId}'`,
        orderBy: ["createdon desc"],
      });

      console.log("📥 Ket qua load goals:", result);

      if (result.data && result.data.length > 0) {
        const mappedGoals = result.data.map((g: any) =>
          mapGoalFromDataverse(g, currentAppraisalId!),
        );
        setGoals(mappedGoals);
        console.log("✅ Da load", mappedGoals.length, "goals thanh cong");
      } else {
        setGoals([]);
        console.log("ℹ️ Khong co goals nao");
      }
    } catch (err) {
      console.error("❌ Loi load goals:", err);
      setError("Khong the load danh sach goals. Vui long kiem tra ket noi.");
    } finally {
      setLoading(false);
    }
  }, [
    employeeId,
    cycleId,
    appraisalId,
    getOrCreateAppraisal,
    mapGoalFromDataverse,
  ]);

  /**
   * Tạo goal mới
   * - Kiểm tra weight không vượt quá 100%
   * - Gán vào appraisal hiện tại
   */
  const createGoal = useCallback(
    async (
      data: Omit<
        Goal,
        "id" | "status" | "progress" | "lastUpdated" | "appraisalId"
      >,
    ) => {
      console.log("📤 Bat dau tao goal moi:", data);
      setError(null);

      try {
        if (!employeeId || !cycleId) {
          throw new Error("Thieu employeeId hoac cycleId");
        }

        // Đảm bảo có appraisalId
        let currentAppraisalId = appraisalId;
        if (!currentAppraisalId) {
          currentAppraisalId = await getOrCreateAppraisal(employeeId, cycleId);
          if (!currentAppraisalId) {
            throw new Error("Khong the lay Appraisal ID");
          }
        }

        // Kiểm tra tổng weight
        const currentTotal = goals.reduce((sum, g) => sum + g.weight, 0);
        if (currentTotal + (data.weight || 0) > 100) {
          throw new Error(
            `Tong weight se vuot qua 100% (Hien tai: ${currentTotal}%, Them: ${data.weight}%)`,
          );
        }

        // Map category
        const categoryMap = {
          Technical: 100000001,
          Business: 100000000,
          Development: 100000003,
          People: 100000004,
        };

        const record = {
          new_goaltitle: data.title,
          new_description: data.description || "",
          new_goalstatus: 100000000, // Draft
          new_weighting: data.weight || 0,
          new_evidenceurl: data.evidenceUrl || "",
          new_evidencename: data.evidenceName || "",
          new_target: data.target || "",
          new_targetvalue: data.targetValue || 0,
          new_actualvalue: 0,
          new_progress: 0,
          new_category: categoryMap[data.category] || 100000000,
          new_evidence: data.evidence || "",
          statecode: 0 as 0,
          "new_Appraisal@odata.bind": `/new_performanceappraisals(${currentAppraisalId})`,
        };

        console.log(
          "📤 Record gui len Dataverse:",
          JSON.stringify(record, null, 2),
        );

        const result = await New_kpisService.create(record);

        if (result.data) {
          await loadGoals();
          console.log("✅ Tao goal thanh cong");
          return mapGoalFromDataverse(result.data, currentAppraisalId);
        }

        if (result.error) {
          console.error("❌ Loi tu Dataverse:", result.error);
          throw new Error(result.error.message || "Khong the tao goal");
        }

        throw new Error("Khong the tao goal - khong co du lieu tra ve");
      } catch (err) {
        console.error("❌ Loi tao goal:", err);
        const message =
          err instanceof Error ? err.message : "Khong the tao goal";
        setError(message);
        throw err;
      }
    },
    [
      employeeId,
      cycleId,
      appraisalId,
      goals,
      getOrCreateAppraisal,
      loadGoals,
      mapGoalFromDataverse,
    ],
  );

  /**
   * Cập nhật goal
   */
  const updateGoal = useCallback(
    async (id: string, data: Partial<Goal>) => {
      console.log("📤 Dang cap nhat goal", id, ":", data);
      setError(null);

      try {
        const updateData: any = {};

        if (data.title !== undefined) updateData.new_goaltitle = data.title;
        if (data.description !== undefined)
          updateData.new_description = data.description;
        if (data.weight !== undefined) updateData.new_weighting = data.weight;
        if (data.evidenceUrl !== undefined)
          updateData.new_evidenceurl = data.evidenceUrl;
        if (data.evidenceName !== undefined)
          updateData.new_evidencename = data.evidenceName;
        if (data.target !== undefined) updateData.new_target = data.target;
        if (data.targetValue !== undefined)
          updateData.new_targetvalue = data.targetValue;
        if (data.actualValue !== undefined)
          updateData.new_actualvalue = data.actualValue;
        if (data.progress !== undefined)
          updateData.new_progress = data.progress;
        if (data.category !== undefined) {
          const categoryMap = {
            Technical: 100000001,
            Business: 100000000,
            Development: 100000003,
            People: 100000004,
          };
          updateData.new_category = categoryMap[data.category] || 100000000;
        }
        if (data.evidence !== undefined)
          updateData.new_evidence = data.evidence;
        if (data.status !== undefined)
          updateData.new_goalstatus = getStatusCode(data.status);

        if (Object.keys(updateData).length === 0) {
          console.log("ℹ️ Khong co thay doi nao");
          return;
        }

        await New_kpisService.update(id, updateData);
        await loadGoals();

        console.log("✅ Da cap nhat goal thanh cong");
      } catch (err) {
        console.error("❌ Loi cap nhat goal:", err);
        setError("Khong the cap nhat goal");
        throw err;
      }
    },
    [loadGoals],
  );

  /**
   * Cập nhật status của goal (cho manager)
   */
  const updateGoalStatus = useCallback(
    async (id: string, status: Goal["status"], comment?: string) => {
      console.log("📤 Dang cap nhat status goal", id, "thanh", status);
      setError(null);

      try {
        const updateData: any = {
          new_goalstatus: getStatusCode(status),
        };

        if (comment) {
          updateData.new_managercomment = comment;
        }

        // Nếu approved, lưu thời gian và người duyệt
        if (status === "Approved") {
          updateData.new_approveddate = new Date().toISOString();
          // Lấy user hiện tại từ localStorage
          const userStr = localStorage.getItem("pas_user");
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              updateData.new_approvedby = user.name || "Manager";
            } catch (e) {
              updateData.new_approvedby = "Manager";
            }
          }
        }

        await New_kpisService.update(id, updateData);
        await loadGoals();

        console.log("✅ Da cap nhat status goal thanh", status);
      } catch (err) {
        console.error("❌ Loi cap nhat status goal:", err);
        setError("Khong the cap nhat trang thai goal");
        throw err;
      }
    },
    [loadGoals],
  );

  /**
   * Xóa goal (chỉ khi Draft hoặc Revision Required)
   */
  const deleteGoal = useCallback(
    async (id: string) => {
      console.log("📤 Dang xoa goal", id);
      setError(null);

      try {
        const goal = goals.find((g) => g.id === id);
        if (
          goal &&
          goal.status !== "Draft" &&
          goal.status !== "Revision Required"
        ) {
          throw new Error(
            "Chi co the xoa goal o trang thai Draft hoac Revision Required",
          );
        }

        await New_kpisService.delete(id);
        await loadGoals();

        console.log("✅ Da xoa goal thanh cong");
      } catch (err) {
        console.error("❌ Loi xoa goal:", err);
        const message =
          err instanceof Error ? err.message : "Khong the xoa goal";
        setError(message);
        throw err;
      }
    },
    [goals, loadGoals],
  );

  /**
   * Submit batch goals lên manager
   * - Yêu cầu tối thiểu 2 goals
   * - Tổng weight = 100%
   */
  const submitGoalsBatch = useCallback(async () => {
    console.log("📤 Dang submit goals batch");
    setError(null);

    try {
      const draftGoals = goals.filter(
        (g) => g.status === "Draft" || g.status === "Revision Required",
      );

      if (draftGoals.length === 0) {
        throw new Error("Khong co goal nao de submit");
      }

      if (draftGoals.length < 2) {
        throw new Error("Can it nhat 2 goals de submit");
      }

      const totalWeight = draftGoals.reduce((sum, g) => sum + g.weight, 0);
      if (totalWeight !== 100) {
        throw new Error(
          `Tong weight phai bang 100%. Hien tai: ${totalWeight}%`,
        );
      }

      // Update từng goal lên Pending Approval
      for (const goal of draftGoals) {
        await New_kpisService.update(goal.id, {
          new_goalstatus: 100000001, // Pending Approval
          new_submitteddate: new Date().toISOString(),
        });
      }

      await loadGoals();
      console.log("✅ Submit goals batch thanh cong");
    } catch (err) {
      console.error("❌ Loi submit goals batch:", err);
      const message =
        err instanceof Error ? err.message : "Khong the submit goals";
      setError(message);
      throw err;
    }
  }, [goals, loadGoals]);

  // ============================================================
  // PHẦN 4: UTILITY FUNCTIONS
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

  const getGoalsByStatus = useCallback(
    (status: Goal["status"]) => {
      return goals.filter((g) => g.status === status);
    },
    [goals],
  );

  const getPendingGoals = useCallback(() => {
    return goals.filter((g) => g.status === "Pending Approval");
  }, [goals]);

  const getDraftGoals = useCallback(() => {
    return goals.filter(
      (g) => g.status === "Draft" || g.status === "Revision Required",
    );
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

  // Tự động lấy Appraisal và load goals khi component mount
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

  // Tự động reload goals khi appraisalId thay đổi
  useEffect(() => {
    if (appraisalId) {
      loadGoals();
    }
  }, [appraisalId]);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // State
    goals,
    loading,
    error,
    appraisalId,
    isAppraisalLoading,

    // CRUD Operations
    loadGoals,
    createGoal,
    updateGoal,
    updateGoalStatus,
    deleteGoal,
    submitGoalsBatch,

    // Utility
    getTotalWeight,
    getStatusCount,
    getGoalsByStatus,
    getPendingGoals,
    getDraftGoals,
    canSubmitBatch,

    // Appraisal management
    getOrCreateAppraisal,
  };
}
