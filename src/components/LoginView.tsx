import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { Shield, Lock, User, Info, ArrowRight, Play, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, enterSandbox } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Simulate thin progress delay for realistic premium visual weight
    setTimeout(() => {
      const res = login(username, password);
      setIsSubmitting(false);
      if (!res.success) {
        setError(res.error || 'Đăng nhập không thành công.');
      }
    }, 600);
  };

  const handleAutofill = (userValue: string, passValue: string) => {
    setUsername(userValue);
    setPassword(passValue);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-4xl z-10"
      >
        {/* Header Branding Panel */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Shield size={14} className="animate-pulse" />
            Performance Appraisal System
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
            PAS Enterprise
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            Hệ thống đánh giá hiệu suất, xây dựng mục tiêu và hiệu chuẩn nhân sự tiêu chuẩn doanh nghiệp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Option A: Secure Formal Authentication */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-705 p-6 sm:p-8 flex flex-col justify-between shadow-xl"
            id="login-option-a"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-xs text-white rounded-full font-black">A</span>
                  ĐĂNG NHẬP HỆ THỐNG
                </h2>
                <span className="text-[10px] text-slate-400 font-bold bg-slate-700/50 px-2 py-0.5 rounded uppercase tracking-wider">
                  Chính thức
                </span>
              </div>

              {error && (
                <div className="mb-4 bg-red-950/40 border border-red-500/30 rounded-lg p-3 text-xs text-red-300 flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
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
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-xs font-bold text-white py-3 rounded-lg transition-all shadow-md active:scale-[0.985] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Truy cập tài khoản <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Helper / Demo Credentials Autofill */}
            <div className="mt-6 pt-5 border-t border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-2.5">
                <Info size={12} className="text-blue-400" /> Tài khoản thử nghiệm nhanh (Click để điền):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleAutofill('employee', 'employee123')}
                  className="text-left bg-slate-900/40 hover:bg-slate-700/50 border border-slate-705 px-2.5 py-1.5 rounded text-[11px] text-slate-300 transition-colors flex flex-col gap-0.5 cursor-pointer"
                >
                  <span className="font-bold text-blue-450 text-[11px]">Employee</span>
                  <span className="text-[10px] text-slate-500 font-mono">employee / employee123</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill('manager', 'manager123')}
                  className="text-left bg-slate-900/40 hover:bg-slate-700/50 border border-slate-705 px-2.5 py-1.5 rounded text-[11px] text-slate-300 transition-colors flex flex-col gap-0.5 cursor-pointer"
                >
                  <span className="font-bold text-indigo-400 text-[11px]">Manager</span>
                  <span className="text-[10px] text-slate-500 font-mono">manager / manager123</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill('hr', 'hr123')}
                  className="text-left bg-slate-900/40 hover:bg-slate-700/50 border border-slate-705 px-2.5 py-1.5 rounded text-[11px] text-slate-300 transition-colors flex flex-col gap-0.5 cursor-pointer"
                >
                  <span className="font-bold text-emerald-400 text-[11px]">HR Admin</span>
                  <span className="text-[10px] text-slate-500 font-mono">hr / hr123</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill('leader', 'leader123')}
                  className="text-left bg-slate-900/40 hover:bg-slate-700/50 border border-slate-705 px-2.5 py-1.5 rounded text-[11px] text-slate-300 transition-colors flex flex-col gap-0.5 cursor-pointer"
                >
                  <span className="font-bold text-pink-400 text-[11px]">Senior Leader</span>
                  <span className="text-[10px] text-slate-500 font-mono">leader / leader123</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Option B: Open Interactive Sandbox Playground */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden"
            id="login-option-b"
          >
            {/* Subtle glow border */}
            <div className="absolute inset-0 border border-blue-500/20 pointer-events-none rounded-2xl" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center bg-amber-500 text-xs text-slate-950 rounded-full font-black">B</span>
                  ENTER SANDBOX MODE
                </h2>
                <span className="text-[10px] text-amber-300 font-bold bg-amber-950/50 px-2 py-0.5 rounded uppercase tracking-wider border border-amber-500/20">
                  Demo & Test
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mt-4 mb-4">
                Sandbox Mode là chế độ thử nghiệm tương tác cao được thiết kế riêng để trình diễn và kiểm tra toàn bộ tính năng của nền tảng <strong>PAS Enterprise</strong>.
              </p>

              <div className="space-y-3 mt-4 text-slate-400 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 select-none font-bold">✓</span>
                  <span><strong>Bỏ qua đăng nhập:</strong> Truy cập hệ thống ngay lập tức với dữ liệu giả lập doanh nghiệp đầy đủ.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 select-none font-bold">✓</span>
                  <span><strong>Sandbox Widget:</strong> Cho phép đổi vai diễn (Act-As) linh hoạt trực tiếp trên thanh công cụ Header để xem quy trình dưới góc nhìn của cả Employee, Manager, HR và Senior Leader.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 select-none font-bold">✓</span>
                  <span><strong>Đầy đủ phân hệ:</strong> Trải nghiệm thông suốt từ thiết lập Mục tiêu, Tự đánh giá, Đánh giá đồng nghiệp, Đánh giá của Quản lý, Hiệu chuẩn (Calibration) đến Ký nhận (Sign-Off).</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={enterSandbox}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold py-3.5 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-150 active:scale-[0.985] flex items-center justify-center gap-2 cursor-pointer border border-amber-400/40"
              >
                <Play size={14} fill="currentColor" /> Vào chế độ Sandbox (Trải nghiệm nhanh)
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-3 font-semibold leading-relaxed">
                Được đề xuất cho hoạt động Đánh giá, Giám sát, Khảo sát tính năng & Phê duyệt demo.
              </p>
            </div>
          </motion.div>

        </div>

        {/* Footer info note */}
        <div className="mt-10 text-center text-[11px] text-slate-500 font-medium">
          Dữ liệu được lưu trữ tự động trong trình duyệt qua LocalStorage • Phiên bản PAS v2.4.0
        </div>
      </motion.div>
    </div>
  );
};
