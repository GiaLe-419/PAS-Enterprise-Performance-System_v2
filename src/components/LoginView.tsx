// src/components/LoginView.tsx
import React, { useState } from "react";
import { useDataverse } from "@/src/context/DataverseContext";
import { motion } from "motion/react";
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

export const LoginView: React.FC = () => {
  const { login } = useDataverse();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await login(username.trim(), password);
      if (!result.success) {
        setError(result.error || "Đăng nhập không thành công.");
      }
    } catch (err) {
      setError("Lỗi kết nối đến hệ thống. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Decorative background glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Shield size={14} className="animate-pulse" />
            Performance Appraisal System
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
            PAS Enterprise
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            Hệ thống đánh giá hiệu suất, xây dựng mục tiêu và hiệu chuẩn nhân sự
            tiêu chuẩn doanh nghiệp.
          </p>
        </div>

        {/* Login Form - Giữa màn hình */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700 p-6 sm:p-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-xs text-white rounded-full font-black">
                A
              </span>
              ĐĂNG NHẬP HỆ THỐNG
            </h2>
            <span className="text-[10px] text-slate-400 font-bold bg-slate-700/50 px-2 py-0.5 rounded uppercase tracking-wider">
              Chính thức
            </span>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-950/40 border border-red-500/30 rounded-lg p-3 text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  className="w-full bg-slate-900/60 border border-slate-700/80 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  placeholder="Nhập tên đăng nhập..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-slate-900/60 border border-slate-700/80 rounded-lg py-2.5 pl-10 pr-10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-xs font-bold text-white py-3 rounded-lg transition-all shadow-md active:scale-[0.985] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Đăng nhập <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
            <p className="text-[10px] text-slate-500 font-medium">
              Hệ thống yêu cầu tài khoản hợp lệ. Liên hệ HR nếu chưa có tài
              khoản.
            </p>
          </div>
        </motion.div>

        {/* Footer info */}
        <div className="mt-8 text-center text-[11px] text-slate-500 font-medium">
          PAS Enterprise v2.4.0 • Hệ thống đánh giá hiệu suất
        </div>
      </motion.div>
    </div>
  );
};
