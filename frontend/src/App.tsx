import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "layouts/admin";
import AuthLayout from "layouts/auth";
import PharmaLayout from "layouts/pharma";
import ProtectedRoute from "components/auth/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="auth/*" element={<AuthLayout />} />

      {/* Protected admin routes */}
      <Route
        path="admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      {/* Pharma public routes */}
      <Route path="pharma/*" element={<PharmaLayout />} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/admin/home" replace />} />
    </Routes>
  );
};

export default App;
