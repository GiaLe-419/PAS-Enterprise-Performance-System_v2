// src/hooks/useCycles.ts
// ============================================================
// HOOK QUẢN LÝ CHU KỲ ĐÁNH GIÁ (CYCLE)
// ============================================================
// Mục đích: Cung cấp các chức năng CRUD cho Cycle
// - Load danh sách cycles từ Dataverse
// - Tạo cycle mới (KHÔNG gán ownerid - Dataverse tự động gán)
// - Cập nhật trạng thái (Active/Closed)
// - Cập nhật thông tin cycle
// - Xóa cycle
// ============================================================

import { useState, useCallback, useEffect } from "react";
import { New_appraisalcycle1sService } from "@/src/generated/services/New_appraisalcycle1sService";
import { New_customauditlogsService } from "@/src/generated/services/New_customauditlogsService";

// ============================================================
// ĐỊNH NGHĨA KIỂU DỮ LIỆU
// ============================================================
export interface Cycle {
  id: string; // ID của chu kỳ
  name: string; // Tên chu kỳ
  type: "Mid-Year" | "End-Year"; // Loại chu kỳ
  year: number; // Năm áp dụng
  startDate: string; // Ngày bắt đầu
  endDate: string; // Ngày kết thúc
  status: "Draft" | "Active" | "Closed"; // Trạng thái
  goalWeighting: number; // Trọng số cho Goals (phần trăm)
  peerFeedbackEnabled: boolean; // Có bật phản hồi đồng nghiệp không
  createdAt?: string; // Ngày tạo
}

// ============================================================
// ĐỊNH NGHĨA HOOK
// ============================================================
export function useCycles(userId?: string, userEmail?: string) {
  // State lưu danh sách cycles
  const [cycles, setCycles] = useState<Cycle[]>([]);

  // State trạng thái đang tải dữ liệu
  const [loading, setLoading] = useState(false);

  // State lưu thông báo lỗi
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // HÀM CHUYỂN ĐỔI DỮ LIỆU
  // ============================================================

  /**
   * Chuyển đổi dữ liệu từ Dataverse sang kiểu Cycle
   * - Đọc các field từ Dataverse và map sang định dạng UI
   */
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

  /**
   * Chuyển đổi mã trạng thái từ Dataverse sang chuỗi hiển thị
   */
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

  /**
   * Chuyển đổi chuỗi trạng thái sang mã số cho Dataverse
   */
  const getStatusCode = (status: string): number => {
    switch (status) {
      case "Active":
        return 100000000;
      case "Closed":
        return 100000001;
      default:
        return 100000002; // Draft
    }
  };

  /**
   * Lấy email người dùng
   * - Dùng để ghi audit log
   */
  const getUserEmail = useCallback((): string => {
    return userEmail || "system@example.com";
  }, [userEmail]);

  // ============================================================
  // AUDIT LOG - GHI LOG HÀNH ĐỘNG
  // ============================================================

  /**
   * Ghi log hành động vào bảng custom audit logs
   * - Dùng để theo dõi các thao tác quan trọng của HR
   * - KHÔNG gán ownerid - Dataverse tự động gán
   */
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
          statecode: 0 as 0,
        });
        console.log("Da ghi audit log:", action);
      } catch (error) {
        console.error("Loi ghi audit log:", error);
      }
    },
    [getUserEmail],
  );

  // ============================================================
  // HÀM LOAD DANH SÁCH CYCLES
  // ============================================================

  /**
   * Load tất cả cycles từ Dataverse
   * - Sắp xếp theo thời gian tạo giảm dần (mới nhất lên đầu)
   */
  const loadCycles = useCallback(async () => {
    console.log("Dang load danh sach cycles tu Dataverse...");
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

      console.log("Ket qua tu Dataverse:", result);

      if (result.data) {
        const mappedCycles = result.data.map(mapCycleFromDataverse);
        setCycles(mappedCycles);
        console.log("Da load", mappedCycles.length, "cycles thanh cong");
      } else {
        setCycles([]);
        console.log("Khong co cycles nao trong Dataverse");
      }
    } catch (err) {
      console.error("Loi load cycles:", err);
      setError("Cannot load the list of cycles. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // HÀM TẠO CYCLE MỚI
  // ============================================================

  /**
   * Tạo một chu kỳ đánh giá mới
   * - KHÔNG gán ownerid - Dataverse tự động gán
   * - KHÔNG gán createdby - Dataverse tự động gán
   * - Mặc định status = Draft
   */
  const createCycle = useCallback(
    async (data: Omit<Cycle, "id" | "status">): Promise<Cycle> => {
      console.log("Bat dau tao cycle moi:", data);
      setError(null);

      try {
        // ✅ CHỈ GỬI CÁC FIELD DỮ LIỆU, KHÔNG GÁN OWNERID
        const record = {
          new_cycleid: crypto.randomUUID(),
          new_cyclename: data.name,
          new_cycletype: data.type === "Mid-Year" ? 100000000 : 100000001,
          new_performanceyear: data.year,
          new_startdate: data.startDate,
          new_enddate: data.endDate,
          new_goalweighting: data.goalWeighting,
          new_status: 100000002, // Draft
          statecode: 0 as 0,
          // ❌ KHÔNG GÁN ownerid, createdby, modifiedby
        };

        console.log("Record gui len Dataverse:", record);

        const result = await New_appraisalcycle1sService.create(record);
        console.log("Ket qua tao cycle:", result);

        if (result && result.data) {
          await loadCycles();
          await logAudit("Cycle Created", "Tao cycle moi: " + data.name);
          console.log("Tao cycle thanh cong");
          return mapCycleFromDataverse(result.data);
        }

        if (result && result.error) {
          console.error(
            "Loi tu Dataverse:",
            JSON.stringify(result.error, null, 2),
          );
          throw new Error(result.error.message || "Khong the tao cycle");
        }

        throw new Error("Khong the tao cycle - khong co du lieu tra ve");
      } catch (err) {
        console.error("Loi tao cycle:", err);
        const message =
          err instanceof Error ? err.message : "Khong the tao cycle";
        setError(message);
        throw err;
      }
    },
    [loadCycles, logAudit],
  );

  // ============================================================
  // HÀM CẬP NHẬT TRẠNG THÁI CYCLE
  // ============================================================

  /**
   * Cập nhật trạng thái của cycle (Active hoặc Closed)
   * - Chỉ cho phép 1 cycle Active tại 1 thời điểm
   */
  const updateCycleStatus = useCallback(
    async (id: string, status: "Active" | "Closed") => {
      console.log("Dang cap nhat status cycle", id, "thanh", status);
      setError(null);

      try {
        // Kiểm tra nếu muốn Active, kiểm tra đã có cycle Active nào khác chưa
        if (status === "Active") {
          const activeExists = cycles.some(
            (c) => c.status === "Active" && c.id !== id,
          );
          if (activeExists) {
            throw new Error(
              "There is already an active cycle. Please close that cycle first.",
            );
          }
        }

        await New_appraisalcycle1sService.update(id, {
          new_status: getStatusCode(status),
        });

        await loadCycles();
        await logAudit(
          "Cycle Status Changed",
          "Cycle " + id + " changed to status " + status,
        );

        console.log("Successfully updated cycle status to", status);
      } catch (err) {
        console.error("Error updating status:", err);
        const message =
          err instanceof Error ? err.message : "Cannot update cycle status";
        setError(message);
        throw err;
      }
    },
    [cycles, loadCycles, logAudit],
  );

  // ============================================================
  // HÀM CẬP NHẬT THÔNG TIN CYCLE
  // ============================================================

  /**
   * Cập nhật thông tin của cycle (tên, ngày tháng, ...)
   */
  const updateCycle = useCallback(
    async (id: string, data: Partial<Cycle>) => {
      console.log("Dang cap nhat cycle", id, ":", data);
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

        if (Object.keys(updateData).length === 0) {
          console.log("No changes detected");
          return;
        }

        await New_appraisalcycle1sService.update(id, updateData);
        await loadCycles();
        await logAudit("Cycle Updated", "Updated cycle " + id);

        console.log("Successfully updated cycle");
      } catch (err) {
        console.error("Error updating cycle:", err);
        setError("Cannot update cycle");
        throw err;
      }
    },
    [loadCycles, logAudit],
  );

  // ============================================================
  // HÀM XÓA CYCLE
  // ============================================================

  /**
   * Xóa cycle (chỉ khi status không phải Active)
   */
  const deleteCycle = useCallback(
    async (id: string) => {
      console.log("Dang xoa cycle", id);
      setError(null);

      try {
        const cycle = cycles.find((c) => c.id === id);
        if (cycle?.status === "Active") {
          throw new Error(
            "Cannot delete an active cycle. Please close the cycle first.",
          );
        }

        await New_appraisalcycle1sService.delete(id);
        await loadCycles();
        await logAudit("Cycle Deleted", "Xoa cycle " + id);

        console.log("Da xoa cycle thanh cong");
      } catch (err) {
        console.error("Loi xoa cycle:", err);
        const message =
          err instanceof Error ? err.message : "Khong the xoa cycle";
        setError(message);
        throw err;
      }
    },
    [cycles, loadCycles, logAudit],
  );

  // ============================================================
  // HÀM LẤY CYCLE ĐANG ACTIVE
  // ============================================================

  /**
   * Lấy cycle đang ở trạng thái Active
   * - Dùng để xác định cycle hiện tại cho các chức năng khác
   */
  const getActiveCycle = useCallback(() => {
    return cycles.find((c) => c.status === "Active");
  }, [cycles]);

  // ============================================================
  // TỰ ĐỘNG LOAD DỮ LIỆU KHI HOOK ĐƯỢC SỬ DỤNG
  // ============================================================
  useEffect(() => {
    loadCycles();
  }, []);

  // ============================================================
  // TRẢ VỀ CÁC HÀM VÀ DỮ LIỆU
  // ============================================================
  return {
    cycles, // Danh sách cycles
    loading, // Trạng thái đang load
    error, // Lỗi (nếu có)
    loadCycles, // Hàm load danh sách
    createCycle, // Hàm tạo cycle mới
    updateCycleStatus, // Hàm cập nhật status
    updateCycle, // Hàm cập nhật thông tin
    deleteCycle, // Hàm xóa cycle
    getActiveCycle, // Hàm lấy cycle đang Active
  };
}
