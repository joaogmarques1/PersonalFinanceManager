import React, { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import analyticsApi from "../../api/analytics";
import { fetchCategories } from "../../features/categories/categoriesApi"; // Assuming this exists or similar
import { format, subMonths, startOfYear } from 'date-fns';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"];

export default function TransactionsAnalytics() {
    const [period, setPeriod] = useState("6m"); // 3m, 6m, year, custom
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [summaryData, setSummaryData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [totalSpent, setTotalSpent] = useState(0);

    // Filters
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [excludeCreditCard, setExcludeCreditCard] = useState(false);
    const [excludeCardRepayment, setExcludeCardRepayment] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data);
            } catch (error) {
                console.error("Error loading categories:", error);
            }
        };
        loadCategories();
    }, []);

    // Calculate dates when period changes
    useEffect(() => {
        const now = new Date();
        let start, end;

        // Default end date is today
        end = now;

        if (period === "3m") {
            start = subMonths(now, 3);
        } else if (period === "6m") {
            start = subMonths(now, 6);
        } else if (period === "year") {
            start = startOfYear(now);
        } else if (period === "custom") {
            // Do not update automatically if custom
            return;
        }

        // Set dates as YYYY-MM-DD
        if (start && end) {
            setStartDate(format(start, 'yyyy-MM-dd'));
            setEndDate(format(end, 'yyyy-MM-dd'));
        }
    }, [period]);

    useEffect(() => {
        if (startDate && endDate) {
            fetchData();
        }
    }, [startDate, endDate, selectedCategory, excludeCreditCard, excludeCardRepayment]);

    const fetchData = async () => {
        try {
            const categoryId = selectedCategory ? parseInt(selectedCategory) : null;
            const summaryResponse = await analyticsApi.getMonthlySummary(startDate, endDate, categoryId, excludeCreditCard, excludeCardRepayment);
            const categoriesResponse = await analyticsApi.getSpendingByCategory(startDate, endDate, categoryId, excludeCreditCard, excludeCardRepayment);

            // Transform summary data for chart
            const chartData = summaryResponse.data.map(item => ({
                name: `${item.month}/${item.year}`,
                Receita: parseFloat(item.total_income),
                Despesa: parseFloat(item.total_expense)
            }));

            // Transform categories data for chart (ensure numbers)
            const chartCategories = categoriesResponse.categories.map(cat => ({
                ...cat,
                total_amount: parseFloat(cat.total_amount),
                percentage: parseFloat(cat.percentage)
            }));

            setSummaryData(chartData);
            setCategoryData(chartCategories);
            setTotalSpent(categoriesResponse.total_spent);
        } catch (error) {
            console.error("Error fetching analytics data:", error);
        }
    };

    const handlePeriodChange = (e) => setPeriod(e.target.value);

    // Formatter for currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
    };

    return (
        <div className="flex-1 overflow-y-auto bg-[#f0eee6]">
            <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h1 className="text-2xl font-semibold text-[#d9a553]">📊 Analytics - Transações</h1>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">


                        {/* Filters Group */}
                        <div className="flex flex-wrap gap-4 items-center bg-white p-2 rounded-xl shadow-sm border border-[#e0c9a6]/50">
                            <div className="flex flex-col gap-2">
                                {/* Option 1: View Expenses (Exclude Repayments) */}
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                                    <input
                                        type="radio"
                                        name="ccFilter"
                                        checked={excludeCardRepayment}
                                        onChange={() => {
                                            setExcludeCardRepayment(true);
                                            setExcludeCreditCard(false);
                                        }}
                                        className="appearance-none w-4 h-4 rounded-full border border-gray-300 checked:bg-[#d9a553] checked:border-4 checked:border-white checked:ring-1 checked:ring-[#d9a553] focus:outline-none focus:ring-2 focus:ring-[#d9a553]/50 focus:ring-offset-1 cursor-pointer"
                                    />
                                    Excluir reembolsos de CC
                                </label>

                                {/* Option 2: View Repayments (Exclude Transactions) */}
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                                    <input
                                        type="radio"
                                        name="ccFilter"
                                        checked={excludeCreditCard}
                                        onChange={() => {
                                            setExcludeCardRepayment(false);
                                            setExcludeCreditCard(true);
                                        }}
                                        className="appearance-none w-4 h-4 rounded-full border border-gray-300 checked:bg-[#d9a553] checked:border-4 checked:border-white checked:ring-1 checked:ring-[#d9a553] focus:outline-none focus:ring-2 focus:ring-[#d9a553]/50 focus:ring-offset-1 cursor-pointer"
                                    />
                                    Excluir transações com CC
                                </label>
                            </div>
                            <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>

                            {/* Category Selector */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="p-2 rounded-lg border border-[#e0c9a6] bg-white outline-none focus:ring-2 focus:ring-[#d9a553]/50 text-gray-700 text-sm"
                            >
                                <option value="">Todas as Categorias</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>

                            {/* Period Selector */}
                            <select
                                value={period}
                                onChange={handlePeriodChange}
                                className="p-2 rounded-lg border border-[#e0c9a6] bg-white outline-none focus:ring-2 focus:ring-[#d9a553]/50 text-gray-700 text-sm"
                            >
                                <option value="3m">Últimos 3 Meses</option>
                                <option value="6m">Últimos 6 Meses</option>
                                <option value="year">Este Ano</option>
                                <option value="custom">Personalizado</option>
                            </select>

                            {period === "custom" && (
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="p-2 rounded-lg border border-[#e0c9a6] outline-none text-sm"
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="p-2 rounded-lg border border-[#e0c9a6] outline-none text-sm"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`grid grid-cols-1 ${!selectedCategory ? 'lg:grid-cols-2' : ''} gap-6 mb-6`}>
                    {/* EVOLUÇÃO (Receitas vs Despesas) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e0c9a6]/50">
                        <h3 className="text-lg font-medium text-gray-700 mb-4">Evolução Mensal</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={summaryData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: "#fff7e7" }}
                                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                    <Legend />
                                    <Bar dataKey="Receita" fill="#43A047" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Despesa" fill="#E53935" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* SPENDING BY CATEGORY */}
                    {!selectedCategory && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e0c9a6]/50">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Despesas por Categoria (Período)</h3>
                            <div className="h-72 w-full flex items-center justify-center">
                                {categoryData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="total_amount"
                                                nameKey="category_name"
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => formatCurrency(value)}
                                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-gray-500">Sem despesas no período selecionado.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* TOTALS SECTION */}
                {(() => {
                    const totalIncome = summaryData.reduce((acc, curr) => acc + curr.Receita, 0);
                    const totalExpense = summaryData.reduce((acc, curr) => acc + curr.Despesa, 0);
                    const balance = totalIncome - totalExpense;

                    if (selectedCategory) {
                        // Show single card based on what exists
                        const isIncome = totalIncome > 0;
                        const isExpense = totalExpense > 0;

                        // If mixed or neither (shouldn't really happen for single category usually, but safety check)
                        let label = "Total";
                        let value = 0;
                        let colorClass = "text-gray-700";

                        if (isIncome && !isExpense) {
                            label = "Total Receitas";
                            value = totalIncome;
                            colorClass = "text-[#85BB65]";
                        } else if (isExpense && !isIncome) {
                            label = "Total Despesas";
                            value = totalExpense;
                            colorClass = "text-[#E53935]";
                        } else {
                            // Both or none
                            label = "Total";
                            value = isIncome ? totalIncome : totalExpense; // Default to showing one
                            //From the category definition each one is either income or expense, so we need only one card of total
                            value = totalIncome > 0 ? totalIncome : totalExpense;
                            colorClass = "text-[#d9a553]";
                        }

                        return (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e0c9a6]/50 flex flex-col items-center justify-center">
                                    <span className="text-gray-500 text-sm uppercase tracking-wide mb-1">{label}</span>
                                    <span className={`text-3xl font-bold ${colorClass}`}>
                                        {formatCurrency(value)}
                                    </span>
                                </div>
                            </div>
                        );
                    } else {
                        // Show all 3 cards
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Total Income */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e0c9a6]/50 flex flex-col items-center">
                                    <span className="text-gray-500 text-sm uppercase tracking-wide mb-1">Total Receitas</span>
                                    <span className="text-3xl font-bold text-[#43A047]">
                                        {formatCurrency(totalIncome)}
                                    </span>
                                </div>

                                {/* Total Expense */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e0c9a6]/50 flex flex-col items-center">
                                    <span className="text-gray-500 text-sm uppercase tracking-wide mb-1">Total Despesas</span>
                                    <span className="text-3xl font-bold text-[#E53935]">
                                        {formatCurrency(totalExpense)}
                                    </span>
                                </div>

                                {/* Balance */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e0c9a6]/50 flex flex-col items-center">
                                    <span className="text-gray-500 text-sm uppercase tracking-wide mb-1">Saldo</span>
                                    <span className={`text-3xl font-bold ${balance >= 0 ? 'text-[#43A047]' : 'text-[#E53935]'}`}>
                                        {formatCurrency(balance)}
                                    </span>
                                </div>
                            </div>
                        );
                    }
                })()}
            </div>
        </div>
    );
}
