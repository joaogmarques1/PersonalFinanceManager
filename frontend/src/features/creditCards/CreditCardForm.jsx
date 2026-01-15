import React, { useState } from "react";

export default function CreditCardForm({ onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: "",
        credit_card_limit: "",
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
            credit_card_limit: parseFloat(formData.credit_card_limit) || 0,
            interest_rate: parseFloat(formData.interest_rate) || 0,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cartão</label>
                <input
                    name="name"
                    type="text"
                    placeholder="Ex: Cartão Wizink"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Limite (€)</label>
                    <input
                        name="credit_card_limit"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 500.00"
                        value={formData.credit_card_limit}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taxa de Juro (%)</label>
                    <input
                        name="interest_rate"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 15.5"
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
                    Criar Cartão
                </button>
            </div>
        </form>
    );
}
