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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await fetchTransactions();
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
  }, []);

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
      setTransactions((prev) => [...prev, newTransaction]);
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao criar transação:", error);
    }
  };


  if (loading) return <p className="text-center text-gray-500">A carregar...</p>;

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-[#d9a553]">💰 Minhas Transações</h1>
        <button
          onClick={() => setShowModal(true)}
          disabled={!currentUser?.id}
          className="bg-[#d9a553] disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg hover:backdrop-blur-lg hover:bg-[#85BB65] transition font-medium shadow-md w-full md:w-auto rounded-full"
        >
          <span style={{ filter: "hue-rotate(180deg) brightness(1.5)" }}>➕</span> Nova Transação
        </button>
      </div>
      {!currentUser?.id && (
        <p className="text-sm text-red-500 mb-4">
          Inicie sessão para adicionar novas transações.
        </p>
      )}

      {/* TABELA AG GRID */}
      <div
        className="rounded-2xl shadow-md"
        style={{ height: 500, width: "100%", }}
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
