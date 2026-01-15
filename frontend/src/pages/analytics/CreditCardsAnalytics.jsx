import React, { useState, useEffect } from "react";
import {
    LineChart,
    Line,
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
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from "recharts";
import axiosClient from "../../api/axiosClient";

const COLORS_PIE = ["#E53935", "#4CAF50"]; // Used (Red), Available (Green)
const COLORS_RADIAL = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c", "#d0ed57", "#ffc658"];

export default function CreditCardsAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await axiosClient.get("/credit-cards/analytics");
                setData(response.data);
            } catch (error) {
                console.error("Error fetching credit card analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
    };

    if (loading) return <div className="p-8 text-center" text-gray-500>A carregar analítica...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Erro ao carregar dados.</div>;

    // Prepare Pie Data
    const pieData = [
        { name: "Utilizado (Dívida)", value: data.utilization.used },
        { name: "Disponível", value: data.utilization.available }
    ];

    // Prepare Radial Data
    // Recharts RadialBar expects "fill" property for colors
    const radialData = data.interest_rates_utilization.map((item, index) => ({
        name: `${item.interest_rate}% Taxa`,
        uv: item.percentage, // Using 'uv' as the data key for standard
        fill: COLORS_RADIAL[index % COLORS_RADIAL.length],
        ...item
    }));

    return (
        <div className="flex-1 overflow-y-auto bg-[#f0eee6] p-6">
            <h1 className="text-2xl font-semibold text-[#d9a553] mb-6">📊 Analytics - Cartões de Crédito</h1>



            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. PIE CHART - Utilization */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e0c9a6]/50 min-h-[400px] flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Utilização de Crédito</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_PIE[index]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend verticalAlign="bottom" height={36} iconSize={10} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* KPI Mini Cards */}
                    <div className="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-[#e0c9a6]">
                        <div className="text-center">
                            <span className="text-gray-400 text-xs uppercase tracking-wide">Dívida Total</span>
                            <div className="text-xl font-bold text-[#E53935] mt-1">
                                {formatCurrency(data.total_debt)}
                            </div>
                        </div>
                        <div className="text-center">
                            <span className="text-gray-400 text-xs uppercase tracking-wide">Limite Atual</span>
                            <div className="text-xl font-bold text-[#40403e] mt-1">
                                {formatCurrency(data.utilization.total_limit)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. RADAR CHART - Interest Rates */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e0c9a6]/50 min-h-[400px]">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Utilização por Taxa de Juro (%)</h3>
                    <div className="h-80 w-full flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            {radialData.length <= 2 ? (
                                <BarChart
                                    data={radialData}
                                    layout="vertical"
                                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis
                                        dataKey="interest_rate"
                                        type="category"
                                        tickFormatter={(val) => `${val}%`}
                                        width={50}
                                        tick={{ fill: '#666', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "#fff7e7" }}
                                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                        formatter={(value, name, props) => [`${value}%`, `Utilização`]}
                                        labelFormatter={(label) => `Taxa de Juro: ${label}%`}
                                    />
                                    <Bar dataKey="uv" fill="#d9a553" radius={[0, 4, 4, 0]} barSize={40}>
                                        {
                                            radialData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS_RADIAL[index % COLORS_RADIAL.length]} />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            ) : (
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radialData}>
                                    <PolarGrid stroke="#e0c9a6" />
                                    <PolarAngleAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#999', fontSize: 10 }} />
                                    <Radar
                                        name="Utilização"
                                        dataKey="uv"
                                        stroke="#d9a553"
                                        fill="#d9a553"
                                        fillOpacity={0.5}
                                    />
                                    <Legend />
                                    <Tooltip
                                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                        formatter={(value, name, props) => [`${value}%`, `${props.payload.interest_rate}% Taxa de juro`]}
                                    />
                                </RadarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. LINE CHART - Evolution (Full Width) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e0c9a6]/50 lg:col-span-2 min-h-[500px]">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Fluxo Quinzenal: Compras com cartão vs Pagamentos de dívida do cartão (12 Meses)</h3>
                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={data.evolution}
                                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis
                                    dataKey="period_label"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    interval={1} // Show every 2nd label to avoid clutter if needed, or 0 for all
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis tickFormatter={(val) => `€${val}`} width={80} />
                                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                                <Legend verticalAlign="top" />
                                <Line
                                    type="monotone"
                                    dataKey="spending"
                                    name="Compras com cartão"
                                    stroke="#E53935"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 8 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="repayment"
                                    name="Pagamentos de dívida do cartão"
                                    stroke="#4CAF50"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
