import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { MenuPage } from "./pages/MenuPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RegisterPage } from "./pages/RegisterPage";
import { PublicRoute } from "./components/PublicRoute";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"  element={<Navigate to="/menu" replace />} />
          <Route path="/login" element={<PublicRoute> <LoginPage /> </PublicRoute>} />
          <Route path="/register" element={<PublicRoute> <RegisterPage /> </PublicRoute>} />
          <Route
            path="/menu"
            element={
              <ProtectedRoute>
                <MenuPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
