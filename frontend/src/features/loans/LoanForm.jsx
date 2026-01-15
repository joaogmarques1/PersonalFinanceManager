import React, { useState } from "react";

export default function LoanForm({ onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: "",
        principal: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        total_installments: "",
        interest_rate: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            principal: parseFloat(formData.principal) || 0,
            total_installments: formData.total_installments ? parseInt(formData.total_installments) : null,
            interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : null,
            end_date: formData.end_date || null,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Empréstimo</label>
                <input
                    name="name"
                    type="text"
                    placeholder="Ex: Crédito Habitação"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Principal (€)</label>
                <input
                    name="principal"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 150000.00"
                    value={formData.principal}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                    <input
                        name="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim (Opcional)</label>
                    <input
                        name="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prestações (Opcional)</label>
                    <input
                        name="total_installments"
                        type="number"
                        placeholder="Ex: 360"
                        value={formData.total_installments}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taxa Juro % (Opcional)</label>
                    <input
                        name="interest_rate"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 3.5"
                        value={formData.interest_rate}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#CC785C] text-white hover:bg-[#B76A51] transition"
                >
                    Criar Empréstimo
                </button>
            </div>
        </form>
    );
}
