import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem("token");

      if (token) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="relative flex flex-col items-center animate-fadeIn">
        {/* GLOW */}
        <div className="absolute w-40 h-40 rounded-full bg-blue-400/20 blur-3xl -z-10 animate-pulse" />

        {/* LOGO */}
        <img
          src="/smartstock-logo.png"
          alt="SmartStock Logo"
          className="w-40 h-40 drop-shadow-2xl animate-bounce"
        />

        {/* APP NAME */}
        <h1 className="mt-6 text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-blue-600 to-blue-900 text-transparent bg-clip-text">
          SmartStock
        </h1>

        {/* SUBTITLE */}
        <p className="text-sm text-gray-600 mt-2">
          Scan. Track. Manage — Smarter.
        </p>

        {/* LOADING DOTS */}
        <div className="flex gap-1 mt-6">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150" />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-300" />
        </div>
      </div>
    </div>
  );
}