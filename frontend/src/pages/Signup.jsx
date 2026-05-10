import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

export default function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password || !form.confirm) {
      toast.error("Please fill all fields");
      return;
    }

    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    if (!agree) {
      toast.error("You must agree to Terms");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
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

      toast.success("Signup successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 pt-16 px-6">
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

          <p className="text-sm text-gray-500">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-5 space-y-4 border">
          <div className="space-y-1">
            <Label>Full Name</Label>
            <Input
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="pr-10"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
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

          <div className="space-y-1">
            <Label>Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter password"
                className="pr-10"
                value={form.confirm}
                onChange={(e) =>
                  setForm({ ...form, confirm: e.target.value })
                }
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showConfirm ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
              className="mt-1 accent-blue-600"
            />
            <span className="text-gray-600 leading-tight">
              I agree to the <span className="underline">Terms</span> and{" "}
              <span className="underline">Privacy Policy</span>
            </span>
          </label>

          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-900 text-white rounded-xl"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-700 font-medium cursor-pointer"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}