import React, { useState, useEffect } from "react";
import { useBusiness } from "../../context/BusinessContext";
import {
    fetchBusinessCategories,
    createBusinessCategory,
    deleteBusinessCategory,
    updateBusinessCategory
} from "../../features/business/api";
import { Trash2, Edit2, Plus, Save, X, Settings } from "lucide-react";

export default function BusinessSettingsPage() {
    const { activeBusiness } = useBusiness();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    // Create Form State
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryType, setNewCategoryType] = useState("expense");
    const [isCreating, setIsCreating] = useState(false);

    // Edit State
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editType, setEditType] = useState("");

    // Load Data
    useEffect(() => {
        if (activeBusiness?.id) {
            loadCategories();
        }
    }, [activeBusiness]);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await fetchBusinessCategories(activeBusiness.id);
            setCategories(data);
        } catch (error) {
            console.error("Failed to load categories", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        setIsCreating(true);
        try {
            await createBusinessCategory(activeBusiness.id, {
                name: newCategoryName,
                type: newCategoryType
            });
            setNewCategoryName("");
            loadCategories();
        } catch (error) {
            console.error("Failed to create category", error);
            alert("Erro ao criar categoria");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Tem a certeza que deseja eliminar esta categoria?")) return;
        try {
            await deleteBusinessCategory(activeBusiness.id, id);
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Failed to delete category", error);
            alert("Erro ao eliminar categoria");
        }
    };

    const startEditing = (category) => {
        setEditingId(category.id);
        setEditName(category.name);
        setEditType(category.type);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName("");
        setEditType("");
    };

    const handleUpdate = async () => {
        try {
            await updateBusinessCategory(activeBusiness.id, editingId, {
                name: editName,
                type: editType
            });
            loadCategories();
            cancelEditing();
        } catch (error) {
            console.error("Failed to update category", error);
            alert("Erro ao atualizar categoria");
        }
    };

    if (!activeBusiness) return <div className="p-8 text-center text-gray-500">Selecione uma empresa primeiro.</div>;

    return (
        <div className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-[#d9a553] flex items-center gap-2">
                        <Settings size={24} />
                        Configurações: {activeBusiness.name}
                    </h1>
                    <p className="text-sm text-[#666663] mt-1">Gerir configurações da empresa</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CREATE FORM */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e0c9a6]/50 h-220px flex flex-col justify-center">
                    <h2 className="text-lg font-semibold text-[#141413] mb-6 flex items-center gap-2">
                        Nova Categoria
                    </h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Nome</label>
                            <input
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Ex: Material de Escritório"
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d9a553]/40"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Tipo</label>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setNewCategoryType("expense")}
                                    className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${newCategoryType === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
                                >
                                    Despesa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewCategoryType("income")}
                                    className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${newCategoryType === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
                                >
                                    Receita
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="bg-[#d9a553] disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg hover:backdrop-blur-lg hover:bg-[#85BB65] transition font-medium w-full rounded-full flex-1 md:flex-none justify-center flex items-center gap-2"
                        >
                            {isCreating ? "A criar..." : "Criar Categoria"}
                        </button>
                    </form>
                </div>

                {/* CATEGORIES TABLE */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-[#e0c9a6] overflow-hidden">
                    <div className="p-6 border-b border-[#e0c9a6]/30">
                        <h2 className="text-lg font-semibold text-[#141413]">Categorias Existentes</h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-400">A carregar...</div>
                    ) : (
                        <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
                            <table className="w-full text-sm text-left relative">
                                <thead className="bg-[#f0eee6] text-[#666663] font-medium uppercase text-xs sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-3">Nome</th>
                                        <th className="px-6 py-3">Tipo</th>
                                        <th className="px-6 py-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-[#fffaf2] transition-colors group">
                                            {editingId === cat.id ? (
                                                <>
                                                    <td className="px-6 py-3">
                                                        <input
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            className="border rounded px-2 py-1 w-full focus:outline-[#d9a553]"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <select
                                                            value={editType}
                                                            onChange={(e) => setEditType(e.target.value)}
                                                            className="border rounded px-2 py-1 focus:outline-[#d9a553]"
                                                        >
                                                            <option value="expense">Despesa</option>
                                                            <option value="income">Receita</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={handleUpdate}
                                                                className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100"
                                                                title="Guardar"
                                                            >
                                                                <Save size={16} />
                                                            </button>
                                                            <button
                                                                onClick={cancelEditing}
                                                                className="p-1.5 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                                                                title="Cancelar"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-3 font-medium text-gray-800">{cat.name}</td>
                                                    <td className="px-6 py-3">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cat.type === 'income'
                                                            ? 'bg-green-50 text-green-700'
                                                            : 'bg-red-50 text-red-700'
                                                            }`}>
                                                            {cat.type === 'income' ? 'Receita' : 'Despesa'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => startEditing(cat)}
                                                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                                                title="Editar"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(cat.id)}
                                                                className="p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                    {categories.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-8 text-center text-gray-400 italic">
                                                Nenhuma categoria encontrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
