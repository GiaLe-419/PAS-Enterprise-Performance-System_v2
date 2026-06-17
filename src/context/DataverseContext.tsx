// src/context/DataverseContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { New_appraisalcycle1sService } from "@/src/generated/services/New_appraisalcycle1sService";
import { New_customauditlogsService } from "@/src/generated/services/New_customauditlogsService";
import { AuthService, AuthUser } from "@/src/generated/services/AuthService";

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

interface DataverseContextType {
  // Auth
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  enterSandbox: () => void;

  // Cycles
  cycles: Cycle[];
  loading: boolean;
  error: string | null;
  loadCycles: () => Promise<void>;
  createCycle: (data: Omit<Cycle, "id" | "status">) => Promise<Cycle>;
  updateCycleStatus: (id: string, status: "Active" | "Closed") => Promise<void>;
  updateCycle: (id: string, data: Partial<Cycle>) => Promise<void>;
  deleteCycle: (id: string) => Promise<void>;
}

// ============ CONTEXT ============
const DataverseContext = createContext<DataverseContextType | undefined>(
  undefined,
);

export const useDataverse = () => {
  const context = useContext(DataverseContext);
  if (!context) {
    throw new Error("useDataverse must be used within DataverseProvider");
  }
  return context;
};

// ============ PROVIDER ============
interface DataverseProviderProps {
  children: ReactNode;
}

export const DataverseProvider: React.FC<DataverseProviderProps> = ({
  children,
}) => {
  // ===== AUTH STATE =====
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ===== CYCLE STATE =====
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== INIT: Load user từ localStorage =====
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      // ✅ Load cycles ngay khi app khởi động (nếu có user)
      loadCycles();
    }
  }, []);

  // ===== HELPER FUNCTIONS =====
  const getUserId = useCallback((): string => {
    return currentUser?.id || "00000000-0000-0000-0000-000000000000";
  }, [currentUser]);

  const getUserEmail = useCallback((): string => {
    return currentUser?.email || "system@example.com";
  }, [currentUser]);

  const mapCycleFromDataverse = (c: any): Cycle => ({
    id: c.new_appraisalcycle1id,
    name: c.new_cyclename,
    type: c.new_cycletype === 100000000 ? "Mid-Year" : "End-Year",
    year: c.new_performanceyear || new Date().getFullYear(),
    startDate: c.new_startdate?.split("T")[0] || "",
    endDate: c.new_enddate?.split("T")[0] || "",
    status: mapStatus(c.new_status),
    goalWeighting: c.new_goalweighting || 70,
    peerFeedbackEnabled: c.new_peerfeedbackenabled || false,
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
          statecode: 0 as 0, // ✅ Cast thành literal type
        });
      } catch (error) {
        console.error("Error logging audit:", error);
      }
    },
    [getUserId, getUserEmail],
  );

  // ===== LOAD CYCLES =====
  const loadCycles = useCallback(async () => {
    console.log("🔍 ===== LOAD CYCLES START =====");
    setLoading(true);
    setError(null);

    try {
      console.log("📤 Calling New_appraisalcycle1sService.getAll()...");

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
          // ❌ ĐÃ XÓA new_peerfeedbackenabled
          "createdon",
        ],
        orderBy: ["createdon desc"],
      });

      console.log("📥 Raw result from Dataverse:", result);
      console.log("📥 Result.data:", result.data);
      console.log("📥 Result.data length:", result.data?.length);
      console.log("📥 Result.success:", result.success);
      console.log("📥 Result.error:", result.error);

      if (result.data) {
        console.log("✅ Data received, mapping cycles...");
        console.log("📊 Raw data sample:", result.data[0]);

        const mappedCycles = result.data.map(mapCycleFromDataverse);
        console.log("📊 Mapped cycles:", mappedCycles);
        console.log("📊 Mapped cycles count:", mappedCycles.length);

        setCycles(mappedCycles);
        console.log("✅ Cycles state updated successfully!");
      } else {
        console.warn("⚠️ No data returned from Dataverse");
      }
    } catch (err) {
      console.error("❌ ===== LOAD CYCLES ERROR =====");
      console.error("❌ Error object:", err);

      if (err instanceof Error) {
        console.error("❌ Error name:", err.name);
        console.error("❌ Error message:", err.message);
        console.error("❌ Error stack:", err.stack);
      }

      setError("Failed to load cycles");
    } finally {
      setLoading(false);
      console.log("🔍 ===== LOAD CYCLES END =====");
    }
  }, []);

  // ===== AUTH FUNCTIONS =====
  const login = useCallback(
    async (username: string, password: string) => {
      const result = await AuthService.login(username, password);
      if (result.success && result.user) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        await loadCycles(); // ✅ Load cycles sau login
      }
      return result;
    },
    [loadCycles],
  ); // ✅ Thêm dependency

  const logout = useCallback(() => {
    AuthService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCycles([]);
  }, []);

  const enterSandbox = useCallback(() => {
    const sandboxUser: AuthUser = {
      id: "sandbox-001",
      name: "Sandbox User",
      email: "sandbox@demo.com",
      role: "HR",
      department: "IT",
      managerId: undefined,
    };
    setCurrentUser(sandboxUser);
    setIsAuthenticated(true);
    localStorage.setItem("pas_user", JSON.stringify(sandboxUser));
    loadCycles();
  }, [loadCycles]); // ✅ Thêm dependency

  // ===== CYCLE FUNCTIONS =====
  // src/context/DataverseContext.tsx

  // src/context/DataverseContext.tsx

  const createCycle = useCallback(
    async (data: Omit<Cycle, "id" | "status">): Promise<Cycle> => {
      console.log("🔍 ===== DATAVERSE CONTEXT: createCycle START =====");
      console.log("🔍 Data received:", JSON.stringify(data, null, 2));

      setError(null);
      try {
        const userId = getUserId();
        console.log("👤 User ID:", userId);

        // ===== CÁCH 1: DÙNG createdby thay vì ownerid =====
        const record = {
          new_cycleid: crypto.randomUUID(),
          new_cyclename: data.name,
          new_cycletype: data.type === "Mid-Year" ? 100000000 : 100000001,
          new_performanceyear: data.year,
          new_startdate: data.startDate,
          new_enddate: data.endDate,
          new_goalweighting: data.goalWeighting,
          new_status: 100000002,
          // ✅ ĐƠN GIẢN: Chỉ cần createdby
          "createdby@odata.bind": `/systemusers(${userId})`,
        };

        // ===== CÁCH 2: KHÔNG DÙNG BẤT KỲ USER FIELD NÀO =====
        // const record = {
        //   new_cycleid: crypto.randomUUID(),
        //   new_cyclename: data.name,
        //   new_cycletype: data.type === "Mid-Year" ? 100000000 : 100000001,
        //   new_performanceyear: data.year,
        //   new_startdate: data.startDate,
        //   new_enddate: data.endDate,
        //   new_goalweighting: data.goalWeighting,
        //   new_status: 100000002,
        // };

        // ===== CÁCH 3: DÙNG _ownerid_value =====
        // const record = {
        //   new_cycleid: crypto.randomUUID(),
        //   new_cyclename: data.name,
        //   new_cycletype: data.type === "Mid-Year" ? 100000000 : 100000001,
        //   new_performanceyear: data.year,
        //   new_startdate: data.startDate,
        //   new_enddate: data.endDate,
        //   new_goalweighting: data.goalWeighting,
        //   new_status: 100000002,
        //   "_ownerid_value": userId,
        // };

        console.log("📤 RECORD TO CREATE:", JSON.stringify(record, null, 2));

        const result = await New_appraisalcycle1sService.create(record);
        console.log("📥 CREATE RESULT:", result);

        if (result && result.data) {
          console.log("✅ Cycle created successfully! Data:", result.data);
          await loadCycles();
          await logAudit("Cycle Created", `Created cycle: ${data.name}`);
          return mapCycleFromDataverse(result.data);
        }

        // Log chi tiết lỗi nếu có
        if (result && result.error) {
          console.error("❌ ERROR:", JSON.stringify(result.error, null, 2));
        }

        console.error("❌ No data returned from create operation");
        throw new Error("Failed to create cycle - no data returned");
      } catch (err) {
        console.error("❌ ===== CREATE CYCLE ERROR =====");
        console.error("❌ Error object:", err);

        if (err instanceof Error) {
          console.error("❌ Error name:", err.name);
          console.error("❌ Error message:", err.message);
          console.error("❌ Error stack:", err.stack);
        }

        if (err && typeof err === "object" && "response" in err) {
          console.error("❌ Response error:", (err as any).response);
          console.error("❌ Response data:", (err as any).response?.data);
        }

        setError(err instanceof Error ? err.message : "Failed to create cycle");
        throw err;
      }
    },
    [loadCycles, logAudit, getUserId, getUserEmail],
  );
  const updateCycleStatus = useCallback(
    async (id: string, status: "Active" | "Closed") => {
      setError(null);
      try {
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
        setError(
          err instanceof Error ? err.message : "Failed to update cycle status",
        );
        throw err;
      }
    },
    [cycles, loadCycles, logAudit],
  );

  const updateCycle = useCallback(
    async (id: string, data: Partial<Cycle>) => {
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
        if (data.peerFeedbackEnabled !== undefined) {
          updateData.new_peerfeedbackenabled = data.peerFeedbackEnabled;
        }

        if (Object.keys(updateData).length === 0) return;

        await New_appraisalcycle1sService.update(id, updateData);
        await loadCycles();
        await logAudit("Cycle Updated", `Cycle ${id} updated`);
      } catch (err) {
        setError("Failed to update cycle");
        throw err;
      }
    },
    [loadCycles, logAudit],
  );

  const deleteCycle = useCallback(
    async (id: string) => {
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
        setError(err instanceof Error ? err.message : "Failed to delete cycle");
        throw err;
      }
    },
    [cycles, loadCycles, logAudit],
  );

  // ===== VALUE =====
  const value: DataverseContextType = {
    currentUser,
    isAuthenticated,
    login,
    logout,
    enterSandbox,
    cycles,
    loading,
    error,
    loadCycles,
    createCycle,
    updateCycleStatus,
    updateCycle,
    deleteCycle,
  };

  return (
    <DataverseContext.Provider value={value}>
      {children}
    </DataverseContext.Provider>
  );
};
