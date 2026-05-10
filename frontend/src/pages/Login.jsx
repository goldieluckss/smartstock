import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        localStorage.setItem("user", "true");
      }

      if (remember) {
        localStorage.setItem("remember", "true");
      } else {
        localStorage.removeItem("remember");
      }

      navigate("/dashboard");
    } catch (error) {
      setError(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 pt-20 px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <img
            src="/logo1.png"
            className="w-20 h-20 mx-auto mb-3 drop-shadow-lg"
            alt="logo"
          />

          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-blue-900 text-transparent bg-clip-text">
            SmartStock
          </h1>

          <p className="text-sm text-gray-500">Login to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-5 space-y-4 border">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Password
            </label>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="accent-blue-600"
              />
              <span className="text-gray-600">Remember me</span>
            </label>

            <span className="text-blue-700 cursor-pointer text-xs">
              Forgot password?
            </span>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-900 text-white rounded-xl"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <p className="text-center text-sm text-gray-500">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-blue-700 font-medium cursor-pointer"
            >
              Sign up
            </span>
          </p>

          <p className="text-[11px] text-gray-400 text-center leading-tight">
            By continuing, you agree to our{" "}
            <span className="underline">Terms</span> and{" "}
            <span className="underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}