
import React, { useState, useEffect } from 'react';
import { fetchLiveOTCRates } from './services/geminiService';

const App: React.FC = () => {
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [amount, setAmount] = useState<number>(10000);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy'); // 'buy' means customer pays HKD for USDT

  const refreshRates = async () => {
    setLoading(true);
    const data = await fetchLiveOTCRates();
    setMarketData(data);
    setLastRefresh(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    refreshRates();
    const interval = setInterval(refreshRates, 60000); // Auto refresh every minute
    return () => clearInterval(interval);
  }, []);

  const slabRate = marketData?.slab_rate || 7.82;
  const grpRate = marketData?.grp_rate || 7.79;

  // Pricing Logic (Internal):
  // Buying USDT from us (Client pays HKD): Market Slab + 0.03
  // Selling USDT to us (Client gets HKD): Market Grp - 0.02
  const ourBuyPrice = (slabRate + 0.03).toFixed(3);
  const ourSellPrice = (grpRate - 0.02).toFixed(3);

  const calculateResult = () => {
    if (mode === 'buy') {
      return (amount / parseFloat(ourBuyPrice)).toFixed(2);
    } else {
      return (amount * parseFloat(ourSellPrice)).toFixed(2);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] font-sans p-4 md:p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="bg-yellow-500 text-black px-2 py-0.5 rounded text-sm">USDT</span>
              實時報價系統
            </h1>
            <p className="text-slate-400 mt-1 text-[10px] uppercase tracking-widest font-bold">
              OTC Real-time Dashboard
            </p>
          </div>
          <button 
            onClick={refreshRates}
            disabled={loading}
            className="px-4 py-2 bg-[#1e2329] border border-slate-700 rounded-lg hover:bg-[#2b3139] transition-all flex items-center gap-2 disabled:opacity-50 text-xs"
          >
            {loading ? <span className="animate-spin text-xs">🔄</span> : '🔄'}
            <span className="font-bold">{loading ? '更新中...' : '手動更新'}</span>
          </button>
        </header>

        {/* Live Prices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#1e2329] p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-5 text-6xl">📥</div>
            <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] mb-2">我要買 USDT (客戶支付 HKD)</p>
            <div className="flex items-baseline gap-1.5">
              <h2 className="text-3xl font-mono font-black text-white">
                {ourBuyPrice}
              </h2>
              <span className="text-slate-500 font-bold text-xs uppercase">HKD</span>
            </div>
          </div>

          <div className="bg-[#1e2329] p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-5 text-6xl">📤</div>
            <p className="text-rose-400 font-bold uppercase tracking-widest text-[10px] mb-2">我要賣 USDT (客戶獲得 HKD)</p>
            <div className="flex items-baseline gap-1.5">
              <h2 className="text-3xl font-mono font-black text-white">
                {ourSellPrice}
              </h2>
              <span className="text-slate-500 font-bold text-xs uppercase">HKD</span>
            </div>
          </div>
        </div>

        {/* Calculator Section */}
        <div className="bg-[#1e2329] p-5 rounded-2xl border border-slate-800 shadow-xl mb-6">
          <div className="flex justify-center mb-6 bg-[#0b0e11] p-1 rounded-xl inline-flex w-full md:w-auto">
            <button 
              onClick={() => setMode('buy')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${mode === 'buy' ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/10' : 'text-slate-500 hover:text-white'}`}
            >
              入金 (Buy)
            </button>
            <button 
              onClick={() => setMode('sell')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${mode === 'sell' ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/10' : 'text-slate-500 hover:text-white'}`}
            >
              出金 (Sell)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                {mode === 'buy' ? '輸入 HKD 金額' : '輸入 USDT 數量'}
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-[#0b0e11] border border-slate-800 rounded-xl p-4 text-xl font-bold outline-none focus:border-yellow-500/50 transition-all text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 uppercase">
                  {mode === 'buy' ? 'HKD' : 'USDT'}
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                預計獲得
              </label>
              <div className="w-full bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4">
                <p className="text-2xl font-mono font-black text-yellow-500">
                  {calculateResult()}
                  <span className="ml-2 text-sm font-bold opacity-60 uppercase">{mode === 'buy' ? 'USDT' : 'HKD'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with minimal info */}
        <footer className="flex flex-col items-center opacity-40 mt-4">
          <div className="bg-[#1e2329]/30 px-4 py-2 rounded-full border border-slate-800/50 flex items-center gap-3 text-[10px] font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              實時連線
            </div>
            <div className="w-px h-2.5 bg-slate-700"></div>
            <div>更新: {lastRefresh || '---'}</div>
          </div>
          <p className="mt-3 text-[9px] text-slate-600 uppercase tracking-widest font-bold">
            Secure OTC Pricing Interface
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
