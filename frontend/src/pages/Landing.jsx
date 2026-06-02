import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import smartstockLogo from "../../assets/logo.jpg";

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="relative flex flex-col items-center animate-fadeIn">
        {/* GLOW */}
        <div className="absolute -z-10 h-40 w-40 animate-pulse rounded-full bg-blue-400/20 blur-3xl" />

        {/* LOGO */}
        <img
          src={smartstockLogo}
          alt="SmartStock Logo"
          className="h-40 w-40 animate-bounce object-contain drop-shadow-2xl"
        />

        {/* APP NAME */}
        <h1 className="mt-6 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-900 bg-clip-text text-4xl font-extrabold text-transparent">
          SmartStock
        </h1>

        {/* SUBTITLE */}
        <p className="mt-2 text-sm text-gray-600">
          Scan. Track. Manage — Smarter.
        </p>

        {/* LOADING DOTS */}
        <div className="mt-6 flex gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 delay-150" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 delay-300" />
        </div>
      </div>
    </div>
  );
}