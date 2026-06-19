// src/context/DataverseContext.tsx
// ============================================================
// CONTEXT QUẢN LÝ DỮ LIỆU - SỬ DỤNG TOKEN
// ============================================================

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { AuthService, AuthUser } from "@/src/generated/services/AuthService";

// ============================================================
// ĐỊNH NGHĨA KIỂU DỮ LIỆU
// ============================================================
interface DataverseContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    appUsername: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// ============================================================
// TẠO CONTEXT
// ============================================================
const DataverseContext = createContext<DataverseContextType | undefined>(
  undefined,
);

export const useDataverse = () => {
  const context = useContext(DataverseContext);
  if (!context) {
    throw new Error(
      "useDataverse phai duoc su dung ben trong DataverseProvider",
    );
  }
  return context;
};

// ============================================================
// PROVIDER
// ============================================================
interface DataverseProviderProps {
  children: ReactNode;
}

export const DataverseProvider: React.FC<DataverseProviderProps> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Thêm trạng thái loading

  // ============================================================
  // KHỞI TẠO: PHỤC HỒI SESSION TỪ TOKEN
  // ============================================================
  useEffect(() => {
    console.log("Khoi tao DataverseContext - kiem tra token...");

    // Kiểm tra token trong localStorage
    const user = AuthService.getCurrentUser();

    if (user) {
      console.log("Phuc hoi session thanh cong cho user:", user.name);
      setCurrentUser(user);
      setIsAuthenticated(true);
    } else {
      console.log("Khong tim thay session hop le.");
    }

    setIsLoading(false);
  }, []);

  // ============================================================
  // HÀM ĐĂNG NHẬP
  // ============================================================
  const login = useCallback(async (appUsername: string, password: string) => {
    console.log("DataverseContext: Dang xu ly dang nhap cho:", appUsername);

    const result = await AuthService.login(appUsername, password);

    if (result.success && result.user) {
      console.log(
        "DataverseContext: Dang nhap thanh cong cho:",
        result.user.name,
      );
      setCurrentUser(result.user);
      setIsAuthenticated(true);
    } else {
      console.log("DataverseContext: Dang nhap that bai:", result.error);
    }

    return result;
  }, []);

  // ============================================================
  // HÀM ĐĂNG XUẤT
  // ============================================================
  const logout = useCallback(() => {
    console.log("DataverseContext: Dang xuat nguoi dung");
    AuthService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);

  // ============================================================
  // GIÁ TRỊ CONTEXT
  // ============================================================
  const value: DataverseContextType = {
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <DataverseContext.Provider value={value}>
      {children}
    </DataverseContext.Provider>
  );
};
