import React, { useEffect, useState } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import "./index.css";

//Importar imagens
import logo from "./assets/images/logo.png";
import bgImage from "./assets/images/NavBar2.png";


// Importa páginas
import TransactionsPage from "./pages/TransactionsPage";
import TransactionsAnalytics from "./pages/analytics/TransactionsAnalytics";

import CreditCardsAnalytics from "./pages/analytics/CreditCardsAnalytics";
import CreditCardRecommendations from "./pages/recommendations/CreditCardRecommendations";
import LoansPage from "./pages/LoansPage";
import CreditCardsPage from "./pages/CreditCardsPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import BusinessTransactionsPage from "./pages/business/BusinessTransactionsPage";
import BusinessSettingsPage from "./pages/business/BusinessSettingsPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import { BusinessProvider } from "./context/BusinessContext";

export default function App() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  // ❌ Esconde navbar e footer se estivermos na página /auth
  const hideLayout = location.pathname === "/auth";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // transforma o JSON em objeto
    }
  }, [])


  return (


    <BusinessProvider>
      <div className="min-h-screen bg-[#f0eee6] text-[#262625] font-sans flex flex-col">
        {/* NAVBAR */}
        {!hideLayout && <Navbar user={user} bgImage={bgImage} logo={logo} />}


        {/* CONTEÚDO */}
        <main
          className={`flex-grow ${hideLayout ? "p-4 md:p-10 flex justify-center items-center" : "w-full"
            }`}
        >
          <Routes>
            {/* 🔹 Redireciona automaticamente para /auth */}
            <Route path="/" element={<Navigate to="/auth" />} />

            {/* 🔹 Página de login / registo */}
            <Route path="/auth" element={<AuthPage />} />

            {/* 🔹 Transactions Section */}
            <Route path="/transactions/*" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="table" replace />} />
                    <Route path="table" element={<TransactionsPage />} />
                    <Route path="analytics" element={<TransactionsAnalytics />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* 🔹 Loans Section */}
            <Route path="/loans/*" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="table" replace />} />
                    <Route path="table" element={<LoansPage />} />

                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* 🔹 Credit Cards Section */}
            <Route path="/credit-cards/*" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="table" replace />} />
                    <Route path="table" element={<CreditCardsPage />} />
                    <Route path="analytics" element={<CreditCardsAnalytics />} />
                    <Route path="recommendations" element={<CreditCardRecommendations />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* 🔹 Outras Páginas (Sem Sidebar por enquanto) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div className="max-w-6xl mx-auto p-4 md:p-10">
                    <ProfilePage />
                  </div>
                </ProtectedRoute>
              }
            />

            {/* 🔹 Business Section */}
            <Route path="/business/transactions" element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto w-full">
                  <BusinessTransactionsPage />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/business/settings" element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto w-full">
                  <BusinessSettingsPage />
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </main>

        {/* FOOTER */}
        {!hideLayout && (
          <footer className="bg-[#F0EEE6] border-t border-[#D4A27F] text-center py-4 text-sm text-[#666663]">
            © {new Date().getFullYear()} Finance Manager. Todos os direitos reservados.
          </footer>
        )}
      </div>
    </BusinessProvider>
  );
}
