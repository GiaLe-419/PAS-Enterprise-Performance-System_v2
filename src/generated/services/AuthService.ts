// src/services/AuthService.ts
// ============================================================
// DỊCH VỤ XÁC THỰC - PHIÊN BẢN ĐƠN GIẢN (KHÔNG MÃ HÓA)
// ============================================================
// LƯU Ý: Đây là phiên bản dành cho giai đoạn phát triển
// Sau này sẽ nâng cấp lên bcrypt
// ============================================================

import { New_employeesprofilesService } from "@/src/generated/services/New_employeesprofilesService";

// ============================================================
// ĐỊNH NGHĨA KIỂU DỮ LIỆU
// ============================================================
export interface AuthUser {
  id: string;
  name: string;
  appUsername: string;
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

// ============================================================
// LỚP DỊCH VỤ XÁC THỰC
// ============================================================
export class AuthService {
  private static currentUser: AuthUser | null = null;

  // ============================================================
  // HÀM ĐĂNG NHẬP (SO SÁNH PLAIN TEXT)
  // ============================================================
  static async login(
    appUsername: string,
    password: string,
  ): Promise<LoginResult> {
    console.log("Dang nhap voi username:", appUsername);

    try {
      // Tìm user theo appUsername
      const result = await New_employeesprofilesService.getAll({
        filter: `new_appusername eq '${appUsername.trim()}'`,
        select: [
          "new_employeesprofileid",
          "new_username",
          "new_appusername",
          "new_email",
          "new_department",
          "new_role",
          "_new_manager_value",
          "new_apppassword",
          "statecode",
        ],
      });

      if (!result.data || result.data.length === 0) {
        return {
          success: false,
          error: "Tai khoan khong ton tai.",
        };
      }

      const userData = result.data[0];

      // Kiểm tra tài khoản bị khóa
      if (userData.statecode === 1) {
        return {
          success: false,
          error: "Tai khoan da bi khoa. Vui long lien he HR.",
        };
      }

      // // SO SÁNH MẬT KHẨU PLAIN TEXT (TẠM THỜI)
      // // Sau này sẽ thay bằng bcrypt.compare()
      if (userData.new_apppassword !== password) {
        console.log("Mat khau khong dung");
        return {
          success: false,
          error: "Mat khau khong dung. Vui long thu lai.",
        };
      }

      // Tạo AuthUser
      const authUser: AuthUser = {
        id: userData.new_employeesprofileid,
        name: userData.new_username,
        appUsername: userData.new_appusername || userData.new_username,
        email: userData.new_email || "",
        role: this.mapRole(userData.new_role),
        department: userData.new_department || "",
        managerId: userData._new_manager_value || undefined,
      };

      // Lưu session
      AuthService.currentUser = authUser;
      localStorage.setItem("pas_user", JSON.stringify(authUser));

      console.log("Dang nhap thanh cong cho user:", authUser.name);

      return {
        success: true,
        user: authUser,
      };
    } catch (error) {
      console.error("Loi dang nhap:", error);
      return {
        success: false,
        error: "Loi ket noi den he thong.",
      };
    }
  }

  // ============================================================
  // HÀM CHUYỂN ĐỔI VAI TRÒ
  // ============================================================
  private static mapRole(code?: number): AuthUser["role"] {
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

  // ============================================================
  // HÀM LẤY USER HIỆN TẠI
  // ============================================================
  static getCurrentUser(): AuthUser | null {
    if (AuthService.currentUser) {
      return AuthService.currentUser;
    }

    try {
      const stored = localStorage.getItem("pas_user");
      if (stored) {
        AuthService.currentUser = JSON.parse(stored);
        return AuthService.currentUser;
      }
    } catch (error) {
      console.error("Loi load user tu localStorage:", error);
    }

    return null;
  }

  // ============================================================
  // HÀM ĐĂNG XUẤT
  // ============================================================
  static logout(): void {
    AuthService.currentUser = null;
    localStorage.removeItem("pas_user");
    console.log("Da dang xuat");
  }

  // ============================================================
  // HÀM KIỂM TRA ĐÃ ĐĂNG NHẬP
  // ============================================================
  static isAuthenticated(): boolean {
    return AuthService.getCurrentUser() !== null;
  }
}
