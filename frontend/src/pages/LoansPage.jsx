import React, { useEffect, useState } from "react";
import {
  fetchLoans,
  createLoan,
  deleteLoan,
  linkCardToLoan,
  repayLoan,
  correctLoanBalance
} from "../features/loans/loansApi";
import { fetchCreditCards, fetchCreditCardBalances } from "../features/creditCards/creditCardsApi";
import LoanForm from "../features/loans/LoanForm";

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

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [cardBalances, setCardBalances] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [LinkCardModal, setLinkCardModal] = useState({ show: false, loan: null });
  const [RepayModal, setRepayModal] = useState({ show: false, loan: null });
  const [CorrectModal, setCorrectModal] = useState({ show: false, loan: null });

  // Form States
  const [linkCardId, setLinkCardId] = useState("");
  const [repayData, setRepayData] = useState({ amount: "", date: new Date().toISOString().split("T")[0], description: "" });
  const [correctData, setCorrectData] = useState({ new_balance: "", reason: "" });
  const [linkError, setLinkError] = useState("");


  const loadData = async () => {
    try {
      const [loansData, cardsData, balancesData] = await Promise.all([
        fetchLoans(),
        fetchCreditCards(),
        fetchCreditCardBalances()
      ]);
      setLoans(loansData);
      setCreditCards(cardsData);
      setCardBalances(balancesData.resume || {});
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (data) => {
    try {
      await createLoan(data);
      await loadData();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Erro ao criar empréstimo:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem a certeza que deseja eliminar este empréstimo?")) {
      try {
        await deleteLoan(id);
        await loadData();
      } catch (error) {
        console.error("Erro ao eliminar empréstimo:", error);
      }
    }
  };

  // --- Handlers for Modals ---
  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!LinkCardModal.loan) return;

    if (!linkCardId) {
      setLinkError("Por favor, selecione um cartão.");
      return;
    }

    // Validate if the chosen card has enough limit
    const selectedCard = creditCards.find(c => c.id === parseInt(linkCardId));
    if (selectedCard) {

      const limit = selectedCard.credit_card_limit || 0;

      // Fetch balance from the separately loaded state
      const currentBalance = cardBalances[selectedCard.id] || 0;
      const availableLimit = limit - currentBalance;
      if (parseFloat(LinkCardModal.loan.principal) > availableLimit) {
        alert(`Operação cancelada: O cartão selecionado não tem plafond suficiente.\nValor da despesa: ${LinkCardModal.loan.principal}€\nPlafond disponível: ${availableLimit.toFixed(2)}€`);
        return;
      }
    }

    try {
      await linkCardToLoan(LinkCardModal.loan.id, parseInt(linkCardId));
      await loadData();
      setLinkCardModal({ show: false, loan: null });
      setLinkCardId("");
    } catch (error) {
      console.error("Erro ao associar cartão:", error);
    }
  };

  const handleRepaySubmit = async (e) => {
    e.preventDefault();
    if (!RepayModal.loan) return;
    try {
      await repayLoan(RepayModal.loan.id, {
        amount: parseFloat(repayData.amount),
        date: repayData.date,
        description: repayData.description
      });
      await loadData();
      setRepayModal({ show: false, loan: null });
    } catch (error) {
      console.error("Erro ao abater empréstimo:", error);
    }
  };

  const handleCorrectSubmit = async (e) => {
    e.preventDefault();
    if (!CorrectModal.loan) return;
    try {
      await correctLoanBalance(CorrectModal.loan.id, {
        new_balance: parseFloat(correctData.new_balance),
        reason: correctData.reason
      });
      await loadData();
      setCorrectModal({ show: false, loan: null });
    } catch (error) {
      console.error("Erro ao corrigir saldo:", error);
    }
  };


  if (loading) return <p className="text-center text-gray-500">A carregar...</p>;

  // Helper to find card name
  const getCardName = (id) => creditCards.find(c => c.id === id)?.name || "Desconhecido";

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-[#d9a553]">🏦 Meus Empréstimos & Dívidas</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#d9a553] text-white px-4 py-2 rounded-lg hover:backdrop-blur-lg hover:bg-[#85BB65] transition font-medium shadow-md w-full md:w-auto rounded-full"
        >
          <span style={{ filter: "hue-rotate(180deg) brightness(1.5)" }}>➕</span> Novo Empréstimo
        </button>
      </div>

      <div
        className="rounded-2xl shadow-md"
        style={{ height: 500, width: "100%", }}
      >
        <AgGridReact
          theme={financeTheme}
          rowData={loans.filter(loan => parseFloat(loan.principal) > 0)}
          columnDefs={[
            { headerName: "Nome", field: "name", flex: 2 },
            {
              headerName: "Valor em Divida",
              field: "principal",
              flex: 1,
              cellRenderer: (params) => (
                <span className="font-bold text-red-600">
                  {parseFloat(params.value).toFixed(2)} €
                </span>
              )
            },
            { headerName: "Início", field: "start_date", flex: 1 },
            {
              headerName: "Cartão Associado",
              field: "used_credit_card",
              flex: 1.5,
              cellRenderer: (params) => {
                if (params.value) {
                  return <span className="text-blue-600 font-medium">💳 {getCardName(params.value)}</span>;
                }
                if (params.data.name.includes("Despesa CC")) { // Heuristic for unlinked CC loans
                  return (
                    <button
                      onClick={() => setLinkCardModal({ show: true, loan: params.data })}
                      className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold hover:bg-yellow-200"
                    >
                      ⚠️ Associar Cartão
                    </button>
                  )
                }
                return "N/A";
              }
            },
            {
              headerName: "Ações",
              field: "id",
              flex: 2,
              cellRenderer: (params) => {
                const isCreditCardExpense = params.data.name.includes("Despesa CC");

                if (isCreditCardExpense) {
                  return <span className="text-gray-400 text-xs italic">Gerido via Crédito</span>;
                }

                return (
                  <div className="flex space-x-2" >
                    <button
                      onClick={() => setRepayModal({ show: true, loan: params.data })}
                      className="text-green-600 hover:text-green-800 font-medium text-sm"
                    >
                      Abater
                    </button>
                    <button
                      onClick={() => setCorrectModal({ show: true, loan: params.data })}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Corrigir
                    </button>
                    <button
                      onClick={() => handleDelete(params.value)}
                      className="text-red-500 hover:text-red-700 font-semibold"
                    >
                      Eliminar
                    </button>
                  </div>
                );
              },
            },
          ]}
          pagination={true}
          paginationPageSize={10}
          animateRows={true}
        />
      </div>

      {/* CREATE MODAL */}
      {
        showCreateModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-[#D4A27F]/50">
              <h2 className="text-xl font-semibold text-[#CC785C] mb-4">Novo Empréstimo</h2>
              <LoanForm
                onSubmit={handleCreate}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        )
      }

      {/* LINK CARD MODAL */}
      {
        LinkCardModal.show && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm border border-[#D4A27F]/50">
              <h2 className="text-xl font-semibold text-[#CC785C] mb-4">Associar Cartão</h2>
              <p className="text-sm text-gray-600 mb-4">Selecione o cartão de crédito que originou esta despesa.</p>
              <form onSubmit={handleLinkSubmit}>
                <select
                  value={linkCardId}
                  onChange={(e) => {
                    setLinkCardId(e.target.value);
                    if (linkError) setLinkError("");
                  }}
                  required
                  className="w-full border rounded-lg px-3 py-2 mb-4"
                >
                  <option value="">Selecione um cartão</option>
                  {creditCards.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {linkError && (
                  <div className="text-red-500 text-sm font-medium px-1 mb-2">
                    ⚠️ {linkError}
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setLinkCardModal({ show: false, loan: null })} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition">Cancelar</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-[#CC785C] text-white hover:bg-[#B76A51] transition">Associar</button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* REPAY MODAL */}
      {
        RepayModal.show && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm border border-[#D4A27F]/50">
              <h2 className="text-xl font-semibold text-[#CC785C] mb-4">Abater Empréstimo</h2>
              <p className="text-sm text-gray-600 mb-2 font-bold">{RepayModal.loan?.name}</p>
              <p className="text-xs text-gray-500 mb-4">Isto criará uma transação de despesa e reduzirá a dívida.</p>
              <form onSubmit={handleRepaySubmit} className="space-y-3">
                <input type="number" step="0.01" placeholder="Valor (€)" value={repayData.amount} onChange={e => setRepayData({ ...repayData, amount: e.target.value })} required className="w-full border rounded p-2" />
                <input type="date" value={repayData.date} onChange={e => setRepayData({ ...repayData, date: e.target.value })} required className="w-full border rounded p-2" />
                <input type="text" placeholder="Descrição" value={repayData.description} onChange={e => setRepayData({ ...repayData, description: e.target.value })} className="w-full border rounded p-2" />

                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => setRepayModal({ show: false, loan: null })} className="px-3 py-1 text-gray-600">Cancelar</button>
                  <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">Confirmar Pagamento</button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* CORRECT MODAL */}
      {
        CorrectModal.show && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm border border-[#D4A27F]/50">
              <h2 className="text-xl font-semibold text-[#CC785C] mb-4">Corrigir Saldo Manualmente</h2>
              <p className="text-sm text-gray-600 mb-4">Defina o novo valor total da dívida.</p>
              <form onSubmit={handleCorrectSubmit} className="space-y-3">
                <input type="number" step="0.01" placeholder="Novo Saldo (€)" value={correctData.new_balance} onChange={e => setCorrectData({ ...correctData, new_balance: e.target.value })} required className="w-full border rounded p-2" />
                <input type="text" placeholder="Motivo (Opcional)" value={correctData.reason} onChange={e => setCorrectData({ ...correctData, reason: e.target.value })} className="w-full border rounded p-2" />

                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => setCorrectModal({ show: false, loan: null })} className="px-3 py-1 text-gray-600">Cancelar</button>
                  <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Corrigir</button>
                </div>
              </form>
            </div>
          </div>
        )
      }

    </div >
  );
}