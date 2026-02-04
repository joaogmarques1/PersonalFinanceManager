import React, { useEffect, useState } from "react";
import { useBusiness } from "../../context/BusinessContext";
import BusinessTransactionForm from "../../features/business/BusinessTransactionForm";
import { fetchBusinessTransactions, deleteBusinessTransaction, createBusinessTransaction } from "../../features/business/api";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule, themeQuartz } from "ag-grid-community";
import { Building2, Plus, Calendar, CreditCard, Tag } from "lucide-react";

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
    columnBorder: { style: 'dashed', color: '#d9a553' },
});

const MobileBusinessTransactionCard = ({ transaction, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            onClick={() => setIsExpanded(!isExpanded)}
            className={`bg-white rounded-2xl shadow-sm border border-[#e0c9a6]/50 flex flex-col transition-all duration-200 cursor-pointer overflow-hidden shrink-0 ${isExpanded ? "p-5 gap-3" : "p-4"}`}
        >
            <div className="flex justify-between items-center gap-4">
                <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-gray-800 truncate">
                        {transaction.counterparty_name}
                    </span>
                    {!isExpanded && (
                        <span className="text-xs text-gray-400">
                            {transaction.date} • {transaction.category?.name || "No Category"}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={`font-bold whitespace-nowrap ${transaction.type === "income" ? "text-[#43A047]" : "text-[#E53935]"
                            } ${isExpanded ? "text-2xl" : "text-lg"}`}
                    >
                        {transaction.type === "income" ? "+" : "-"}
                        {Number(transaction.gross_amount).toFixed(2)} {transaction.currency}
                    </span>
                    <span className={`text-gray-400 text-xs transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                        ▼
                    </span>
                </div>
            </div>

            {isExpanded && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="h-px bg-gray-100 my-2" />
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-xs uppercase tracking-wide">Date</span>
                            <span className="text-gray-700 font-medium flex items-center gap-1"><Calendar size={12} /> {transaction.date}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-xs uppercase tracking-wide">Method</span>
                            <span className="text-gray-700 font-medium flex items-center gap-1"><CreditCard size={12} />{transaction.payment_method}</span>
                        </div>
                        <div className="col-span-2 flex flex-col">
                            <span className="text-gray-400 text-xs uppercase tracking-wide">Details</span>
                            <span className="text-gray-600 text-xs">
                                VAT: {Number(transaction.vat_amount).toFixed(2)} | Net: {Number(transaction.net_amount).toFixed(2)}
                            </span>
                            <span className="text-gray-600 text-xs">Tax ID: {transaction.counterparty_tax_id} ({transaction.counterparty_country})</span>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(transaction.id);
                            }}
                            className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-medium px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors w-full justify-center sm:w-auto"
                        >
                            ❌ Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function BusinessTransactionsPage() {
    const { activeBusiness } = useBusiness();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (activeBusiness?.id) {
                setLoading(true);
                try {
                    const data = await fetchBusinessTransactions(activeBusiness.id);
                    setTransactions(data);
                } catch (error) {
                    console.error("Error loading business transactions:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadData();
    }, [activeBusiness]);

    const handleCreateTransaction = async (data) => {
        try {
            const newTransaction = await createBusinessTransaction(activeBusiness.id, data);
            setTransactions(prev => [newTransaction, ...prev]);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to create transaction", error);
            alert("Failed to create transaction");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem a certeza que deseja eliminar esta transação?")) {
            try {
                await deleteBusinessTransaction(activeBusiness.id, id);
                setTransactions(prev => prev.filter(t => t.id !== id));
            } catch (error) {
                console.error("Error deleting transaction", error);
                alert("Failed to delete transaction");
            }
        }
    }

    if (!activeBusiness) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center h-[60vh]">
                <div className="bg-[#d9a553]/10 p-6 rounded-full mb-4">
                    <Building2 size={48} className="text-[#d9a553]" />
                </div>
                <h2 className="text-2xl font-bold text-[#141413] mb-2">No Business Selected</h2>
                <p className="text-[#666663] max-w-md">Please select a business from the navbar dropdown or create a new one to start managing your business finances.</p>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#d9a553] flex items-center gap-2">
                        <Building2 size={24} />
                        {activeBusiness.name} Transações
                    </h1>
                    <p className="hidden lg:block text-sm text-[#666663] mt-1">Gestão de transações da sua empresa</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#d9a553] text-white px-4 py-2 rounded-lg hover:bg-[#c49245] transition font-medium shadow-md flex items-center gap-2"
                >
                    <Plus size={18} />
                    <span>Nova Transação</span>
                </button>
            </div>

            {loading ? (
                <p className="text-center py-10">A carregar transações...</p>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block rounded-2xl shadow-md h-[600px] w-full">
                        <AgGridReact
                            theme={financeTheme}
                            rowData={transactions}
                            columnDefs={[
                                { headerName: "Data", field: "date", flex: 1, sortable: true },
                                { headerName: "Descrição", field: "description", flex: 2, sortable: false },
                                { headerName: "Contraparte", field: "counterparty_name", flex: 1.5, filter: true },
                                {
                                    headerName: "Valor Bruto",
                                    field: "gross_amount",
                                    flex: 1,
                                    sortable: true,
                                    cellRenderer: (params) => (
                                        <span className={params.data.type === 'income' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                            {params.data.type === 'income' ? '+' : '-'} {Number(params.value).toFixed(2)} {params.data.currency}
                                        </span>
                                    )
                                },
                                { headerName: "VAT", field: "vat_amount", flex: 1, cellRenderer: p => `${Number(p.value).toFixed(2)}` },
                                { headerName: "Valor Líquido", field: "net_amount", flex: 1, cellRenderer: p => `${Number(p.value).toFixed(2)}` },
                                { headerName: "Categoria", field: "category.name", flex: 1 },
                                {
                                    headerName: "Ações",
                                    field: "id",
                                    width: 100,
                                    cellRenderer: (params) => (
                                        <button onClick={() => handleDelete(params.value)} className="text-red-500 hover:text-red-700 font-semibold">Eliminar</button>
                                    )
                                }
                            ]}
                            pagination={true}
                            paginationPageSize={15}
                        />
                    </div>

                    {/* Mobile List */}
                    <div className="lg:hidden flex flex-col gap-3">
                        {transactions.map(t => (
                            <MobileBusinessTransactionCard key={t.id} transaction={t} onDelete={handleDelete} />
                        ))}
                    </div>
                </>
            )}

            {isModalOpen && (
                <BusinessTransactionForm
                    onSubmit={handleCreateTransaction}
                    onCancel={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}
