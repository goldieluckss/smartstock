import { useEffect, useState } from "react";
import { logout } from "../lib/auth";
import { useNavigate, Link } from "react-router-dom";
import {
  Shield,
  Settings,
  BarChart3,
  LogOut,
  Save,
  History,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/auth/me");
        const currentUser = data.user;

        setUser(currentUser);
        setFullName(currentUser?.name || "");

        localStorage.setItem("user", JSON.stringify(currentUser));
      } catch (error) {
        console.error("Failed to load profile:", error);
        setError(error.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = await apiRequest("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: fullName,
        }),
      });

      const updatedUser = data.user;

      setUser(updatedUser);
      setFullName(updatedUser?.name || "");
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Profile updated!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError(error.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 space-y-5 text-gray-800">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-sm text-gray-500">Manage your account details</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">
          {error}
        </div>
      )}

      {/* PROFILE CARD */}
      <div className="bg-white border rounded-2xl shadow-sm p-5 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold">
          {initials}
        </div>

        <p className="mt-3 font-semibold text-lg">{user?.name || "User"}</p>

        <p className="text-sm text-gray-500">{user?.email}</p>

        <span className="mt-2 inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
          <Shield className="h-3 w-3" />
          User Account
        </span>
      </div>

      {/* EDIT PROFILE */}
      <div className="bg-white border rounded-2xl shadow-sm p-5 space-y-4">
        <p className="font-semibold text-sm">Edit Profile</p>

        <div>
          <p className="text-sm text-gray-600 mb-1">Full Name</p>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Email</p>
          <input
            value={user?.email || ""}
            disabled
            className="w-full p-3 border rounded-xl bg-gray-100 text-gray-500"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 text-white p-3 rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <Link
          to="/settings"
          className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b"
        >
          <Settings className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium">Settings</span>
        </Link>

        <Link
          to="/statistics"
          className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b"
        >
          <BarChart3 className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium">Statistics</span>
        </Link>

        <Link
          to="/history"
          className="flex items-center gap-3 p-4 hover:bg-gray-50"
        >
          <History className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium">History</span>
        </Link>
      </div>

      {/* LOGOUT */}
      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="w-full bg-red-500 text-white p-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-600"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  );
}