import React, { useState, useEffect } from "react";
import { fetchCategories } from "../categories/categoriesApi";

const buildInitialState = () => ({
  description: "",
  amount: "",
  type: "",
  date: new Date().toISOString().split("T")[0],
  category_id: "",
  payment_method: "Cartão de débito",
});

export default function TransactionForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState(() => buildInitialState());
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    }
    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (error) setError("");

    // If changing type, reset category_id
    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        category_id: "" // Reset category when type changes
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.category_id) {
      setError("Por favor, selecione uma categoria.");
      return;
    }

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      category_id: Number(formData.category_id),
    });
    setFormData(buildInitialState());
  };

  // Filter categories based on selected type
  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="description"
        type="text"
        placeholder="Descrição"
        value={formData.description}
        onChange={handleChange}
        required
        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
      />
      <input
        name="amount"
        type="number"
        step="0.01"
        placeholder="Valor (€)"
        value={formData.amount}
        onChange={handleChange}
        required
        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
      />
      <div className="grid grid-cols-2 gap-3">
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
        >
          <option value="" disabled>Selecione o Tipo</option>
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </select>

        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          disabled={!formData.type}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40 disabled:bg-gray-100 disabled:text-gray-400"
        >
          <option value="">{formData.type ? "Sem Categoria" : "Escolha o tipo primeiro"}</option>
          {filteredCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          name="date"
          type="date"
          max={new Date().toISOString().split("T")[0]}
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
        />

        <select
          name="payment_method"
          value={formData.payment_method}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC785C]/40"
        >
          <option value="Cartão de débito">Cartão de débito</option>
          <option value="Cartão de crédito">Cartão de crédito</option>
          <option value="Transferência bancária">Transferência bancária</option>
          <option value="Dinheiro">Dinheiro</option>
          <option value="Outro">Outro</option>
        </select>
      </div>

      {error && (
        <div className="text-red-500 text-sm font-medium px-1">
          ⚠️ {error}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-3">
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
          Guardar
        </button>
      </div>
    </form>
  );
}
