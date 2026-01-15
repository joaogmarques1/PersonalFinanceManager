import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, TableProperties, CreditCard, Banknote, X } from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  let navItems = [];

  if (location.pathname.startsWith("/transactions")) {
    navItems = [
      {
        name: "Tabela de Transações",
        path: "/transactions/table",
        icon: <TableProperties className="w-5 h-5" />,
      },
      {
        name: "Analytics",
        path: "/transactions/analytics",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
    ];
  } else if (location.pathname.startsWith("/loans")) {
    navItems = [
      {
        name: "Tabela de Empréstimos",
        path: "/loans/table",
        icon: <TableProperties className="w-5 h-5" />,
      },
    ];
  } else if (location.pathname.startsWith("/credit-cards")) {
    navItems = [
      {
        name: "Tabela de Cartões",
        path: "/credit-cards/table",
        icon: <TableProperties className="w-5 h-5" />,
      },
      {
        name: "Analytics",
        path: "/credit-cards/analytics",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        name: "Dicas de Uso",
        path: "/credit-cards/recommendations",
        icon: <Banknote className="w-5 h-5" />,
      },
    ];
  }

  return (
    <>
      <div
        className={`
          fixed md:relative z-40 inset-y-0 left-0
          w-64 bg-[#F0EEE6] border-r md:border border-[#e0c9a6] 
          md:h-[calc(100%-2rem)] h-full flex flex-col 
          md:rounded-xl md:mt-12 md:ml-8 shadow-sm transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-6 border-b border-[#e0c9a6]/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#d9a553]">Personal Finance Manager</h2>
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-[#d9a553]">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose} // Close sidebar on link click (mobile)
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive
                  ? "bg-[#fff7e7] text-[#d9a553]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#d9a553]"
                  }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
