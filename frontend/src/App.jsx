import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import ProductDetail from "./pages/ProductDetail";
import AddProduct from "./pages/AddProduct";
import Scanner from "./pages/Scanner";
import History from "./pages/History";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Statistics from "./pages/Statistics"; // ⚠️ make sure this exists

function App() {
  return (
    <Router>
      <Routes>

        {/* NO NAV */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* WITH NAV */}
        <Route element={<AppLayout />}>

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/inventory" element={<Inventory />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/scan" element={<Scanner />} />
          <Route path="/history" element={<History />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/statistics" element={<Statistics />} />

        </Route>

      </Routes>
    </Router>
  );
}

export default App;