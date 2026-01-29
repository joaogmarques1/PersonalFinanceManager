import React, { useState, useEffect } from "react";
import { fetchBusinessCategories } from "./api"; // Ensure this matches your structure
import { useBusiness } from "../../context/BusinessContext";
import { ChevronDown, ChevronUp } from "lucide-react";

const buildInitialState = () => ({
    date: new Date().toISOString().split("T")[0],
    counterparty_name: "",
    counterparty_tax_id: "",
    counterparty_country: "Portugal",
    description: "",
    type: "expense",
    category_id: "",

    // Amounts
    net_amount: "", // Primary Input
    vat_amount: "", // Secondary Input
    gross_amount: 0, // Calculated
    vat_rate: 0, // Calculated
    vat_exemption: false,
    withholding_tax_amount: "",

    payment_method: "Cartão de débito",
    invoice_number: ""
});

export default function BusinessTransactionForm({ onSubmit, onCancel }) {
    const [formData, setFormData] = useState(buildInitialState());
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState("");
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const { activeBusiness } = useBusiness();

    // Load Categories
    useEffect(() => {
        async function loadCategories() {
            if (activeBusiness?.id) {
                try {
                    const data = await fetchBusinessCategories(activeBusiness.id);
                    setCategories(data);
                } catch (error) {
                    console.error("Failed to load business categories", error);
                }
            }
        }
        loadCategories();
    }, [activeBusiness]);

    // Calculations Effect
    useEffect(() => {
        const net = parseFloat(formData.net_amount) || 0;
        const vatAmount = parseFloat(formData.VAT_amount) || 0;

        if (formData.VAT_exemption && formData.type === 'income') {
            // Exemption: VAT is 0, Gross = Net
            setFormData(prev => {
                if (prev.gross_amount === net && prev.VAT_amount === 0 && prev.VAT_rate === 0) return prev;
                return {
                    ...prev,
                    VAT_amount: 0,
                    gross_amount: net,
                    VAT_rate: 0
                }
            });
        } else {
            // Standard: Gross = Net + VAT
            const gross = net + vatAmount;

            // Rate = (VAT / Net) * 100
            let rate = 0;
            if (net > 0 && vatAmount > 0) {
                rate = Math.round((vatAmount / net) * 100);
            }

            setFormData(prev => {
                if (prev.gross_amount === gross && prev.VAT_rate === rate) return prev;
                return {
                    ...prev,
                    gross_amount: parseFloat(gross.toFixed(2)),
                    VAT_rate: rate
                };
            });
        }

    }, [formData.net_amount, formData.VAT_amount, formData.VAT_exemption, formData.type]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (error) setError("");

        const val = type === "checkbox" ? checked : value;

        setFormData((prev) => ({ ...prev, [name]: val }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.counterparty_name) {
            setError("Nome da contraparte é obrigatório.");
            return;
        }
        if (!formData.net_amount || parseFloat(formData.net_amount) <= 0) {
            setError("Valor líquido deve ser maior que 0.");
            return;
        }

        const payload = {
            ...formData,
            // Ensure numeric types
            // Gross is calculated, but just to be safe we use the state value
            gross_amount: parseFloat(formData.gross_amount),
            net_amount: parseFloat(formData.net_amount),
            VAT_amount: parseFloat(formData.VAT_amount) || 0,
            VAT_rate: parseFloat(formData.VAT_rate),
            withholding_tax_amount: parseFloat(formData.withholding_tax_amount) || 0,
            category_id: formData.category_id ? Number(formData.category_id) : null,
            currency: "EUR"
        };

        onSubmit(payload);
    };

    const filteredCategories = categories.filter(c => c.type === formData.type);

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-[#D4A27F]/50 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold text-[#CC785C] mb-6 flex items-center gap-2">
                    {formData.type === 'income' ? '💰' : '💸'} Nova {formData.type === 'income' ? "Receita" : "Despesa"} de Negócio
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Top Row: Type and Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Tipo de Transação</label>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => handleChange({ target: { name: 'type', value: 'expense' } })}
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition ${formData.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Despesa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleChange({ target: { name: 'type', value: 'income' } })}
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition ${formData.type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Receita
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Data</label>
                            <input
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                            />
                        </div>
                    </div>

                    {/* Counterparty Section */}
                    <div className="bg-[#f0eee6]/50 p-4 rounded-xl border border-[#e0c9a6]/30 space-y-4">
                        <h3 className="text-sm font-semibold text-[#8f7e6d] uppercase tracking-wider">Entidade (Contraparte)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <input
                                    name="counterparty_name"
                                    placeholder="Nome da Entidade (Ex: Staples, Cliente X)"
                                    value={formData.counterparty_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                                />
                            </div>
                            <div>
                                <input
                                    name="counterparty_tax_id"
                                    placeholder="NIF / Tax ID"
                                    value={formData.counterparty_tax_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                                />
                            </div>
                            <div>
                                <select
                                    name="counterparty_country"
                                    value={formData.counterparty_country}
                                    onChange={handleChange}
                                    required
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40 bg-white"
                                >
                                    <option value="Portugal">Portugal</option>
                                    <option value="Espanha">Espanha</option>
                                    <option value="França">França</option>
                                    <option value="Reino Unido">Reino Unido</option>
                                    <option value="EUA">EUA</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Financials Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Valor Líquido</label>
                            <div className="relative">
                                <input
                                    name="net_amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.net_amount}
                                    onChange={handleChange}
                                    required
                                    className="w-full border-2 border-[#d9a553]/50 rounded-lg px-3 py-2 text-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                                />
                                <span className="absolute right-3 top-2.5 text-gray-400 font-medium">€</span>
                            </div>
                        </div>

                        <div className="md:col-span-2 flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Valor IVA</label>
                                <div className="relative">
                                    <input
                                        name="VAT_amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.VAT_amount}
                                        onChange={handleChange}
                                        disabled={formData.VAT_exemption && formData.type === 'income'}
                                        required={!(formData.VAT_exemption && formData.type === 'income')}
                                        className="w-full border-2 border-[#d9a553]/50 rounded-lg px-3 py-2 text-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
                                    />
                                    <span className="absolute right-3 top-2.5 text-gray-400 font-medium text-sm">€</span>
                                </div>
                            </div>

                            {/* VAT Exemption - Only for Income */}
                            {formData.type === 'income' && (
                                <div className="flex items-center h-10 pb-2">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                                        <input
                                            type="checkbox"
                                            name="VAT_exemption"
                                            checked={formData.VAT_exemption}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-[#CC785C] rounded border-gray-300 focus:ring-[#CC785C]"
                                        />
                                        Isento
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Read Only Calcs - CHANGED: Show Gross and Rate */}
                    <div className="flex gap-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300">
                        <div className="flex-1">
                            <span>Valor Total (Bruto):</span> <span className="font-medium text-gray-700">{Number(formData.gross_amount).toFixed(2)} €</span>
                        </div>
                        <div className="flex-1 border-l border-gray-200 pl-4">
                            <span>Taxa IVA (Calc):</span> <span className="font-medium text-gray-700">{formData.VAT_rate}%</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Categoria</label>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                            >
                                <option value="">Sem Categoria</option>
                                {filteredCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Método de Pagamento</label>
                            <select
                                name="payment_method"
                                value={formData.payment_method}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                            >
                                <option value="Cartão de débito">Cartão de débito</option>
                                <option value="Cartão de crédito">Cartão de crédito</option>
                                <option value="Transferência bancária">Transferência bancária</option>
                                <option value="Dinheiro">Dinheiro</option>
                            </select>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Descrição / Notas</label>
                        <textarea
                            name="description"
                            placeholder="Detalhes adicionais..."
                            rows="1"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40 resize-none"
                        />
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                            className="flex items-center gap-2 text-sm text-[#CC785C] font-medium hover:text-[#B76A51] transition"
                        >
                            {isAdvancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            {isAdvancedOpen ? "Ocultar Opções Avançadas" : "Mostrar Opções Avançadas"}
                        </button>

                        {isAdvancedOpen && (
                            <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Número da Fatura</label>
                                        <input
                                            name="invoice_number"
                                            placeholder="Ex: FT 2024/001"
                                            value={formData.invoice_number}
                                            onChange={handleChange}
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Retenção na Fonte</label>
                                        <div className="relative">
                                            <input
                                                name="withholding_tax_amount"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData.withholding_tax_amount}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                                            />
                                            <span className="absolute right-3 top-2.5 text-gray-400 font-medium text-sm">€</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm font-medium px-2 py-1 bg-red-50 rounded border border-red-100">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-[#CC785C] text-white hover:bg-[#B76A51] transition font-medium shadow-md flex items-center gap-2"
                        >
                            <span>💾</span> Registar Transação
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
