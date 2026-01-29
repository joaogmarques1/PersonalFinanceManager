import React, { useState } from "react";
import { createBusiness } from "./api"; // Ensure this matches user's file structure
import { useBusiness } from "../../context/BusinessContext";

const buildInitialState = () => ({
    name: "",
    tax_id: "",
    country: "Portugal", // Default
});

export default function BusinessCreateModal({ onClose }) {
    const [formData, setFormData] = useState(buildInitialState());
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { fetchUserBusinesses, switchEnvironment, setActiveBusiness } = useBusiness();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (error) setError("");
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const newBusiness = await createBusiness(formData);
            await fetchUserBusinesses(); // Refresh list

            // Auto-switch to new business
            switchEnvironment('business');
            setActiveBusiness({ ...newBusiness, role: 'owner' }); // Optimistic update of role/active

            onClose();
        } catch (err) {
            console.error("Failed to create business", err);
            setError("Falha ao criar empresa. Verifique os dados.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[60]">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-[#D4A27F]/50 animate-in fade-in zoom-in-95 duration-200">
                <h2 className="text-xl font-semibold text-[#CC785C] mb-4 flex items-center gap-2">
                    <span>🏢</span> Nova Empresa
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                        <input
                            name="name"
                            type="text"
                            placeholder="Ex: Minha Startup Lda."
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NIF / Tax ID</label>
                        <input
                            name="tax_id"
                            type="text"
                            placeholder="Ex: 501234567"
                            value={formData.tax_id}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                        <select
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
                        >
                            <option value="Portugal">Portugal</option>
                            <option value="Espanha">Espanha</option>
                            <option value="França">França</option>
                            <option value="Reino Unido">Reino Unido</option>
                            <option value="EUA">EUA</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm font-medium px-1 bg-red-50 p-2 rounded-lg border border-red-100">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg bg-[#CC785C] text-white hover:bg-[#B76A51] transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading ? 'A criar...' : 'Criar Empresa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
