// src/services/AuthService.ts
import { New_employeesprofilesService } from "@/src/generated/services/New_employeesprofilesService";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "Employee" | "Manager" | "HR" | "SeniorManager";
  department: string;
  managerId?: string;
}

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export class AuthService {
  private static currentUser: AuthUser | null = null;

  static async login(username: string, password: string): Promise<LoginResult> {
    try {
      // 1. Tìm user trong Dataverse
      const result = await New_employeesprofilesService.getAll({
        filter: `new_username eq '${username.trim()}'`,
        select: [
          "new_employeesprofileid",
          "new_username",
          "new_email",
          "new_department",
          "new_role",
          "_new_manager_value",
          "new_apppassword",
        ],
      });

      if (!result.data || result.data.length === 0) {
        return { success: false, error: "Tài khoản không tồn tại." };
      }

      const userData = result.data[0];

      // 2. Kiểm tra password (tạm thời so sánh plain text)
      // Sau này sẽ dùng bcrypt.compare()
      if (userData.new_apppassword !== password) {
        return { success: false, error: "Mật khẩu không đúng." };
      }

      // 3. Map user
      const authUser: AuthUser = {
        id: userData.new_employeesprofileid,
        name: userData.new_username,
        email: userData.new_email || "",
        role: mapRole(userData.new_role),
        department: userData.new_department || "",
        managerId: userData._new_manager_value || undefined,
      };

      // 4. Lưu user
      AuthService.currentUser = authUser;

      // 5. Lưu vào localStorage để giữ session
      localStorage.setItem("pas_user", JSON.stringify(authUser));

      return { success: true, user: authUser };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Lỗi kết nối đến hệ thống." };
    }
  }

  static logout(): void {
    AuthService.currentUser = null;
    localStorage.removeItem("pas_user");
  }

  static getCurrentUser(): AuthUser | null {
    if (AuthService.currentUser) return AuthService.currentUser;

    // Thử load từ localStorage
    const stored = localStorage.getItem("pas_user");
    if (stored) {
      try {
        AuthService.currentUser = JSON.parse(stored);
        return AuthService.currentUser;
      } catch {
        return null;
      }
    }
    return null;
  }

  static isAuthenticated(): boolean {
    return AuthService.getCurrentUser() !== null;
  }
}

function mapRole(code?: number): AuthUser["role"] {
  switch (code) {
    case 100000001:
      return "Manager";
    case 100000002:
      return "HR";
    case 100000003:
      return "SeniorManager";
    default:
      return "Employee";
  }
}
