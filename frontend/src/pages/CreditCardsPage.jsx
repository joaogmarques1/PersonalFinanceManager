import React, { useEffect, useState } from "react";
import {
    fetchCreditCards,
    createCreditCard,
    deleteCreditCard,
    fetchCreditCardBalances,
    correctCardBalance,
    repayCreditCard,
} from "../features/creditCards/creditCardsApi";
import CreditCardForm from "../features/creditCards/CreditCardForm";

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

export default function CreditCardsPage() {
    const [cards, setCards] = useState([]);
    const [balances, setBalances] = useState({});
    const [loading, setLoading] = useState(true);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCorrectModal, setShowCorrectModal] = useState(false);
    const [selectedCardForCorrection, setSelectedCardForCorrection] = useState(null);

    // Correction Form State
    const [correctionData, setCorrectionData] = useState({
        card_id: "",
        balance: "",
        date: new Date().toISOString().split("T")[0],
        description: ""
    });

    // Repayment Form State
    const [showRepayModal, setShowRepayModal] = useState(false);


    const [repaymentData, setRepaymentData] = useState({
        card_id: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: ""
    });

    // Error States
    const [correctError, setCorrectError] = useState("");
    const [repayError, setRepayError] = useState("");

    const loadData = async () => {
        try {
            const [cardsData, balancesData] = await Promise.all([
                fetchCreditCards(),
                fetchCreditCardBalances()
            ]);
            setCards(cardsData);
            setBalances(balancesData.resume || {});
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
            await createCreditCard(data);
            await loadData();
            setShowCreateModal(false);
        } catch (error) {
            console.error("Erro ao criar cartão:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem a certeza que deseja eliminar este cartão?")) {
            try {
                await deleteCreditCard(id);
                await loadData();
            } catch (error) {
                console.error("Erro ao eliminar cartão:", error);
            }
        }
    };

    const openCorrectModal = (card = null) => {
        setSelectedCardForCorrection(card);
        setCorrectionData({
            card_id: card ? card.id : "",
            balance: card ? (balances[card.id] || 0) : "",
            date: new Date().toISOString().split("T")[0],
            description: ""
        });
        setShowCorrectModal(true);
    };

    const handleCorrectionSubmit = async (e) => {
        e.preventDefault();

        if (!correctionData.card_id) {
            setCorrectError("Por favor, selecione um cartão.");
            return;
        }

        try {
            await correctCardBalance(correctionData.card_id, {
                balance: parseFloat(correctionData.balance),
                date: correctionData.date,
                description: correctionData.description
            });
            await loadData();
            setShowCorrectModal(false);
            setCorrectionData({
                card_id: "",
                balance: "",
                date: new Date().toISOString().split("T")[0],
                description: ""
            });
        } catch (error) {
            console.error("Erro ao corrigir saldo:", error);
        }
    };

    const handleRepaySubmit = async (e) => {
        e.preventDefault();

        if (!repaymentData.card_id) {
            setRepayError("Por favor, selecione um cartão.");
            return;
        }

        try {
            await repayCreditCard(repaymentData.card_id, {
                amount: parseFloat(repaymentData.amount),
                date: repaymentData.date,
                description: repaymentData.description
            });
            await loadData();
            setShowRepayModal(false);
            setRepaymentData({
                card_id: "",
                amount: "",
                date: new Date().toISOString().split("T")[0],
                description: ""
            });
        } catch (error) {
            console.error("Erro ao pagar cartão:", error);
        }
    };


    if (loading) return <p className="text-center text-gray-500">A carregar...</p>;

    // Merge cards with balances for Grid
    const rowData = cards.map(card => ({
        ...card,
        current_balance: balances[card.id] || 0
    }));

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-semibold text-[#d9a553]">💳 Meus Cartões de Crédito</h1>
                <div className="flex gap-3 w-full md:w-auto">
                    {cards.length > 0 && (
                        <button
                            onClick={() => setShowRepayModal(true)}
                            className="bg-[#d9a553] text-white px-4 py-2 rounded-lg hover:backdrop-blur-lg hover:bg-[#85BB65] transition font-medium shadow-md w-full md:w-auto rounded-full"
                        >
                            💸 Pagar Cartão
                        </button>
                    )}
                    {cards.length > 0 && (
                        <button
                            onClick={() => openCorrectModal()}
                            className="bg-[#d9a553] text-white px-4 py-2 rounded-lg hover:backdrop-blur-lg hover:bg-[#85BB65] transition font-medium shadow-md w-full md:w-auto rounded-full"
                        >
                            ⚖️ Acertar Saldo
                        </button>
                    )}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-[#d9a553] text-white px-4 py-2 rounded-lg hover:backdrop-blur-lg hover:bg-[#85BB65] transition font-medium shadow-md w-full md:w-auto rounded-full"
                    >
                        <span style={{ filter: "hue-rotate(180deg) brightness(1.5)" }}>➕</span> Novo Cartão
                    </button>
                </div>
            </div>

            <div
                className="rounded-2xl shadow-md"
                style={{ height: 500, width: "100%", }}
            >
                <AgGridReact
                    theme={financeTheme}
                    rowData={rowData}
                    columnDefs={[
                        { headerName: "Nome", field: "name", flex: 2 },
                        {
                            headerName: "Limite",
                            field: "credit_card_limit",
                            flex: 1,
                            cellRenderer: (params) => `${parseFloat(params.value).toFixed(2)} €`
                        },
                        {
                            headerName: "Saldo Atual (Dívida)",
                            field: "current_balance",
                            flex: 1,
                            cellRenderer: (params) => (
                                <span className="font-bold text-red-600">
                                    {parseFloat(params.value).toFixed(2)} €
                                </span>
                            )
                        },
                        {
                            headerName: "Taxa Juro (%)",
                            field: "interest_rate",
                            flex: 1,
                            cellRenderer: (params) => params.value ? `${params.value}%` : "-"
                        },
                        {
                            headerName: "Ações",
                            field: "id",
                            flex: 1.5,
                            cellRenderer: (params) => (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleDelete(params.value)}
                                        className="text-red-500 hover:text-red-700 font-semibold"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                    pagination={true}
                    paginationPageSize={10}
                    animateRows={true}
                />
            </div>

            {/* CREATE MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-[#D4A27F]/50">
                        <h2 className="text-xl font-semibold text-[#CC785C] mb-4">Novo Cartão</h2>
                        <CreditCardForm
                            onSubmit={handleCreate}
                            onCancel={() => setShowCreateModal(false)}
                        />
                    </div>
                </div>
            )}

            {/* CORRECTION MODAL */}
            {showCorrectModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-[#D4A27F]/50">
                        <h2 className="text-xl font-semibold text-[#CC785C] mb-4">Acertar Saldo</h2>

                        <form onSubmit={handleCorrectionSubmit} className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Defina o valor real da dívida atual. Vamos criar um registo de acerto automaticamente.
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cartão</label>
                                <select
                                    value={correctionData.card_id}
                                    onChange={(e) => {
                                        const cardId = e.target.value;
                                        setCorrectionData({
                                            ...correctionData,
                                            card_id: cardId,
                                            balance: balances[cardId] || 0
                                        });
                                        if (correctError) setCorrectError("");
                                    }}
                                    required
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                                >
                                    <option value="" disabled>Selecione um cartão</option>
                                    {cards.map(card => (
                                        <option key={card.id} value={card.id}>{card.name}</option>
                                    ))}
                                </select>
                                {correctError && (
                                    <div className="text-red-500 text-sm font-medium px-1 mt-1">
                                        ⚠️ {correctError}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Novo Saldo (Dívida Total)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={correctionData.balance}
                                    onChange={(e) => setCorrectionData({ ...correctionData, balance: e.target.value })}
                                    required
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data do Acerto</label>
                                <input
                                    type="date"
                                    value={correctionData.date}
                                    onChange={(e) => setCorrectionData({ ...correctionData, date: e.target.value })}
                                    required
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (Opcional)</label>
                                <input
                                    type="text"
                                    value={correctionData.description}
                                    onChange={(e) => setCorrectionData({ ...correctionData, description: e.target.value })}
                                    placeholder="Ex: Ajuste mensal"
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCorrectModal(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    onClick={handleCorrectionSubmit}
                                    className="px-4 py-2 rounded-lg bg-[#CC785C] text-white hover:bg-[#B76A51] transition"
                                >
                                    Confirmar Acerto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* REPAYMENT MODAL */}
            {showRepayModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-[#D4A27F]/50">
                        <h2 className="text-xl font-semibold text-[#CC785C] mb-4">Pagar Cartão</h2>

                        <form onSubmit={handleRepaySubmit} className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Registar um pagamento feito ao cartão de crédito.
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cartão</label>
                                <select
                                    value={repaymentData.card_id}
                                    onChange={(e) => {
                                        setRepaymentData({ ...repaymentData, card_id: e.target.value });
                                        if (repayError) setRepayError("");
                                    }}
                                    required
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                                >
                                    <option value="" disabled>Selecione um cartão</option>
                                    {cards.map(card => (
                                        <option key={card.id} value={card.id}>{card.name}</option>
                                    ))}
                                </select>
                                {repayError && (
                                    <div className="text-red-500 text-sm font-medium px-1 mt-1">
                                        ⚠️ {repayError}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Pagamento</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={repaymentData.amount}
                                    onChange={(e) => setRepaymentData({ ...repaymentData, amount: e.target.value })}
                                    required
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data do Pagamento</label>
                                <input
                                    type="date"
                                    value={repaymentData.date}
                                    onChange={(e) => setRepaymentData({ ...repaymentData, date: e.target.value })}
                                    required
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (Opcional)</label>
                                <input
                                    type="text"
                                    value={repaymentData.description}
                                    onChange={(e) => setRepaymentData({ ...repaymentData, description: e.target.value })}
                                    placeholder="Ex: Pagamento da fatura de Janeiro"
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowRepayModal(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    onClick={handleRepaySubmit}
                                    className="px-4 py-2 rounded-lg bg-[#CC785C] text-white hover:bg-[#B76A51] transition"
                                >
                                    Confirmar Pagamento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
