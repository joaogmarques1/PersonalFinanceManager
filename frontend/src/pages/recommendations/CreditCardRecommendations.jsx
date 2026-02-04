import React, { useState } from 'react';
import axiosClient from "../../api/axiosClient";
import { ArrowRight, CreditCard, TrendingDown, ShoppingBag } from 'lucide-react';

export default function CreditCardRecommendations() {
    // Repayment State
    const [repaymentAmount, setRepaymentAmount] = useState('');
    const [repaymentResult, setRepaymentResult] = useState(null);
    const [repaymentLoading, setRepaymentLoading] = useState(false);

    // Purchase State
    const [purchaseAmount, setPurchaseAmount] = useState('');
    const [purchaseResult, setPurchaseResult] = useState(null);
    const [purchaseLoading, setPurchaseLoading] = useState(false);

    const formatCurrency = (val) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val);

    const handleRepaymentCalculate = async () => {
        if (!repaymentAmount || repaymentAmount <= 0) return;
        setRepaymentLoading(true);
        try {
            const response = await axiosClient.get(`/credit-cards/recommendations/repayment?amount=${repaymentAmount}`);
            setRepaymentResult(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setRepaymentLoading(false);
        }
    };

    const handlePurchaseCalculate = async () => {
        if (!purchaseAmount || purchaseAmount <= 0) return;
        setPurchaseLoading(true);
        try {
            const response = await axiosClient.get(`/credit-cards/recommendations/purchase?amount=${purchaseAmount}`);
            setPurchaseResult(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setPurchaseLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-[#f0eee6] p-6">
            <h1 className="text-2xl font-semibold text-[#d9a553] mb-6">💡 Dicas de Uso Inteligente</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. REPAYMENT SECTION (Avalanche) */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e0c9a6]/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-red-100 text-red-600 rounded-full">
                            <TrendingDown size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Abater Dívida</h2>
                    </div>

                    <p className="text-gray-500 mb-6 text-sm">
                        Estratégia <strong>Avalanche</strong>: Priorizar o pagamento dos cartões com as taxas de juro mais altas para minimizar custos a longo prazo.
                    </p>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quanto quer abater?</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="number"
                                value={repaymentAmount}
                                onChange={(e) => setRepaymentAmount(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d9a553] focus:border-[#d9a553] outline-none"
                                placeholder="Ex: 500"
                            />
                            <button
                                onClick={handleRepaymentCalculate}
                                disabled={repaymentLoading}
                                className="w-full sm:w-auto px-6 py-2 bg-[#d9a553] text-white rounded-lg hover:bg-[#c49245] transition-colors disabled:opacity-50 font-medium"
                            >
                                {repaymentLoading ? '...' : 'Calcular'}
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    {repaymentResult && (
                        <div className="mt-6 animate-fadeIn">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recomendação de Pagamento</h4>
                            <div className="space-y-3">
                                {repaymentResult.recommendations.filter(c => c.recommended_payment > 0).map(card => (
                                    <div key={card.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                        <div>
                                            <div className="font-semibold text-gray-800">{card.name}</div>
                                            <div className="text-xs text-red-500 font-medium">{card.interest_rate}% Taxa de Juro</div>
                                        </div>
                                        <div className="font-bold text-red-700 text-lg">
                                            {formatCurrency(card.recommended_payment)}
                                        </div>
                                    </div>
                                ))}
                                {repaymentResult.recommendations.every(c => c.recommended_payment === 0) && (
                                    <div className="text-gray-500 text-center py-4">Não há valores a recomendar ou dívida inexistente.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. PURCHASE SECTION (Cheapest Credit) */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e0c9a6]/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full">
                            <ShoppingBag size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Fazer Compra</h2>
                    </div>

                    <p className="text-gray-500 mb-6 text-sm">
                        Estratégia <strong>Juro Mínimo</strong>: Priorizar o uso de cartões com a menor taxa de juro possível, respeitando os limites disponíveis.
                    </p>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Valor da compra?</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="number"
                                value={purchaseAmount}
                                onChange={(e) => setPurchaseAmount(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d9a553] focus:border-[#d9a553] outline-none"
                                placeholder="Ex: 500"
                            />
                            <button
                                onClick={handlePurchaseCalculate}
                                disabled={purchaseLoading}
                                className="w-full sm:w-auto px-6 py-2 bg-[#d9a553] text-white rounded-lg hover:bg-[#c49245] transition-colors disabled:opacity-50 font-medium"
                            >
                                {purchaseLoading ? '...' : 'Calcular'}
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    {purchaseResult && (
                        <div className="mt-6 animate-fadeIn">
                            {!purchaseResult.possible ? (
                                <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg text-sm border border-yellow-100 mb-4">
                                    ⚠️ Atenção: O montante excede o limite total disponível ({formatCurrency(purchaseResult.total_available)}).
                                </div>
                            ) : null}

                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recomendação de Cartão</h4>
                            <div className="space-y-3">
                                {purchaseResult.recommendations.filter(c => c.recommended_usage > 0).map(card => (
                                    <div key={card.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                                        <div>
                                            <div className="font-semibold text-gray-800">{card.name}</div>
                                            <div className="text-xs text-green-600 font-medium">{card.interest_rate}% Taxa de Juro</div>
                                        </div>
                                        <div className="font-bold text-green-700 text-lg">
                                            {formatCurrency(card.recommended_usage)}
                                        </div>
                                    </div>
                                ))}
                                {purchaseResult.recommendations.every(c => c.recommended_usage === 0) && (
                                    <div className="text-gray-500 text-center py-4">Não há recomendação disponível.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
