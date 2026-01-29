import React, { useEffect, useState } from "react";
import {
  fetchTransactions,
  deleteTransaction,
  createTransaction,
} from "../features/transactions/transactionsApi";
import TransactionForm from "../features/transactions/TransactionForm";

import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule, themeQuartz } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const financeTheme = themeQuartz.withParams({
  accentColor: "#d9a553",
  backgroundColor: "#ffffff",
  chromeBackgroundColor: "#f0eee6",
  foregroundColor: "#40403e",
  borderColor: "#e0c9a6",
  headerBackgroundColor: "#f0eee6",
  headerTextColor: "#40403e",
  headerHeight: "45px",
  oddRowBackgroundColor: "#fffaf2",
  rowHoverColor: "#fff7e7",
  fontFamily: "'Inter', 'Segoe UI', sans-serif",
  cellFontFamily: "'Inter', 'Segoe UI', sans-serif",
  headerFontFamily: "'Inter', 'Segoe UI', sans-serif",
  columnBorder: { style: 'dashed', color: '#d9a553' },
});


const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Falha ao ler o utilizador armazenado:", error);
    return null;
  }
};

const MobileTransactionCard = ({ transaction, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`bg-white rounded-2xl shadow-sm border border-[#e0c9a6]/50 flex flex-col transition-all duration-200 cursor-pointer overflow-hidden shrink-0 ${isExpanded ? "p-5 gap-3" : "p-4"
        }`}
    >
      {/* Top Row: Always visible (Description + Amount) */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-semibold text-gray-800 truncate">
            {transaction.description}
          </span>
          {/* Show simplified subtitle when collapsed */}
          {!isExpanded && (
            <span className="text-xs text-gray-400">
              {transaction.date} • {transaction.category?.name || "Sem Categoria"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`font-bold whitespace-nowrap ${transaction.type === "income" ? "text-[#43A047]" : "text-[#E53935]"
              } ${isExpanded ? "text-2xl" : "text-lg"}`}
          >
            {transaction.type === "income" ? "+" : "-"}
            {Number(transaction.amount).toFixed(2)} €
          </span>
          {/* Chevron Icon indicating state */}
          <span className={`text-gray-400 text-xs transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
            ▼
          </span>
        </div>
      </div>

      {/* Expanded Details: Only visible when isExpanded is true */}
      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="h-px bg-gray-100 my-2" />

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs uppercase tracking-wide">Data</span>
              <span className="text-gray-700 font-medium">{transaction.date}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs uppercase tracking-wide">Método</span>
              <span className="text-gray-700 font-medium">{transaction.payment_method}</span>
            </div>
            <div className="flex flex-col col-span-2">
              <span className="text-gray-400 text-xs uppercase tracking-wide">Categoria</span>
              <span className="text-gray-700 font-medium flex items-center gap-2 mt-1">
                <span className="bg-[#f0eee6] px-2 py-1 rounded-md border border-[#e0c9a6]/30 text-gray-600">
                  {transaction.category?.name || "Sem Categoria"}
                </span>
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card toggle when clicking delete
                onDelete(transaction.id);
              }}
              className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-medium px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors w-full justify-center sm:w-auto"
            >
              ❌ Eliminar Transação
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await fetchTransactions(sortBy);
        setTransactions(data);
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
    if (typeof window === "undefined") {
      return;
    }
    const syncUser = () => setCurrentUser(getStoredUser());
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, [sortBy]);

  const handleDelete = async (id) => {
    if (window.confirm("Tem a certeza que deseja eliminar esta transação?")) {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };


  const handleCreate = async (data) => {
    if (!currentUser?.id) {
      console.warn("Tentativa de criar transação sem sessão ativa.");
      return;
    }

    const payload = {
      ...data,
      user_id: currentUser.id,
      category_id: data.category_id ? Number(data.category_id) : null,
    };

    try {
      const newTransaction = await createTransaction(payload);
      setTransactions((prev) => [newTransaction, ...prev]);
      setShowModal(false);
      // Optional: Refresh list to ensure correct order if needed, but prepending is usually fine for "newest"
    } catch (error) {
      console.error("Erro ao criar transação:", error);
    }
  };


  if (loading) return <p className="text-center text-gray-500">A carregar...</p>;

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-[#d9a553]">💰 Minhas Transações</h1>

        <div className="flex flex-col gap-2 w-full lg:w-auto items-end">
          <button
            onClick={() => setShowModal(true)}
            disabled={!currentUser?.id}
            className="bg-[#d9a553] disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg hover:backdrop-blur-lg hover:bg-[#85BB65] transition font-medium shadow-md w-full lg:w-auto rounded-full flex-1 lg:flex-none justify-center flex items-center gap-2"
          >
            <span style={{ filter: "hue-rotate(180deg) brightness(1.5)" }}>➕</span>
            <span className="whitespace-nowrap">Nova Transação</span>
          </button>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-[#e0c9a6] text-gray-700 text-sm rounded-lg focus:ring-[#d9a553] focus:border-[#d9a553] block p-1.5 outline-none w-full lg:w-auto text-center lg:hidden"
          >
            <option value="date">📅 Data da Transação</option>
            <option value="created_at">🕒 Data de Registo</option>
          </select>
        </div>
      </div>
      {!currentUser?.id && (
        <p className="text-sm text-red-500 mb-4">
          Inicie sessão para adicionar novas transações.
        </p>
      )}

      {/* RESPONSIVE LAYOUT: Desktop Table (lg+), Mobile/Tablet Cards */}

      {/* 1. DESKTOP VIEW (AgGrid) - Hidden on mobile/tablet */}
      <div
        className="hidden lg:block rounded-2xl shadow-md"
        style={{ height: 500, width: "100%" }}
      >
        <AgGridReact
          theme={financeTheme}
          rowData={transactions}
          columnDefs={[
            { headerName: "Descrição", field: "description", flex: 2 },
            {
              headerName: "Categoria",
              field: "category.name",
              flex: 1,
              cellRenderer: (params) => (
                <span className="px-2 py-1 bg-gray-100 rounded-lg text-sm">
                  {params.value || "Sem Categoria"}
                </span>
              ),
            },
            {
              headerName: "Valor (€)",
              field: "amount",
              flex: 1,
              sortable: true,
              cellRenderer: (params) => `${(params.value ?? 0).toFixed(2)} €`,
            },
            {
              headerName: "Método Pagamento",
              field: "payment_method",
              flex: 1,
              sortable: true,
            },
            {
              headerName: "Tipo",
              field: "type",
              flex: 1,
              cellRenderer: (params) =>
                params.value === "income" ? (
                  <span className="text-green-600">Receita</span>
                ) : (
                  <span className="text-red-600">Despesa</span>
                ),
            },
            { headerName: "Data", field: "date", flex: 1, sortable: true },
            {
              headerName: "Ações",
              field: "id",
              flex: 1,
              cellRenderer: (params) => (
                <button
                  onClick={() => handleDelete(params.value)}
                  className="text-red-500 hover:text-red-700 font-semibold"
                >
                  Eliminar
                </button>
              ),
            },
          ]}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50]}
          animateRows={true}
        />
      </div>

      {/* 2. MOBILE/TABLET VIEW (Expandable Card List) - Hidden on desktop */}
      <div className="lg:hidden flex flex-col gap-3 h-[600px] overflow-y-auto pr-2">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Sem transações para mostrar.</p>
        ) : (
          transactions.map((t) => (
            <MobileTransactionCard
              key={t.id}
              transaction={t}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-[#D4A27F]/50">
            <h2 className="text-xl font-semibold text-[#CC785C] mb-4">
              <span style={{ filter: "hue-rotate(180deg) brightness(1.5)" }}>➕</span> Nova Transação
            </h2>
            <TransactionForm
              onSubmit={handleCreate}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
