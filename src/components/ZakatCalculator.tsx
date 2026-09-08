import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { BackButton } from './ui/BackButton';
import { useTranslation } from '../i18n';
import { useAppContext } from '../AppContext';
import { cn } from '../lib/utils';
import { Calculator, Coins,  Landmark,  Activity } from 'lucide-react';

export const ZakatCalculator: React.FC = () => {
  const { settings } = useAppContext();
  const { t, isRtl } = useTranslation(settings.appLanguage);

  // Inputs
  const [cash, setCash] = useState<string>('');
  const [goldWeight, setGoldWeight] = useState<string>('');
  const [silverWeight, setSilverWeight] = useState<string>('');
  const [businessInventory, setBusinessInventory] = useState<string>('');
  
  // Market Prices (mocked or user input)
  const [goldPrice, setGoldPrice] = useState<string>('65'); // e.g. 65 USD per gram
  const [silverPrice, setSilverPrice] = useState<string>('0.8'); // e.g. 0.8 USD per gram
  
  // Constants
  const NISAB_GOLD_GRAMS = 85;
  const NISAB_SILVER_GRAMS = 595;
  
  const nisabGoldValue = useMemo(() => NISAB_GOLD_GRAMS * (parseFloat(goldPrice) || 0), [goldPrice]);
  const nisabSilverValue = useMemo(() => NISAB_SILVER_GRAMS * (parseFloat(silverPrice) || 0), [silverPrice]);

  const totalWealth = useMemo(() => {
    const cashVal = parseFloat(cash) || 0;
    const inventoryVal = parseFloat(businessInventory) || 0;
    
    // Value of gold and silver owned
    const goldVal = (parseFloat(goldWeight) || 0) * (parseFloat(goldPrice) || 0);
    const silverVal = (parseFloat(silverWeight) || 0) * (parseFloat(silverPrice) || 0);
    
    return cashVal + inventoryVal + goldVal + silverVal;
  }, [cash, businessInventory, goldWeight, silverWeight, goldPrice, silverPrice]);

  const isEligibleForZakat = totalWealth >= nisabGoldValue || totalWealth >= nisabSilverValue;
  const zakatAmount = isEligibleForZakat ? totalWealth * 0.025 : 0;

  return (
    <div className={cn("min-h-screen pb-24 bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-500", isRtl ? "text-right" : "text-left")} dir={isRtl ? "rtl" : "ltr"}>
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50 transition-colors duration-500">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Calculator size={22} className="text-emerald-500" />
              {t('zakat_calculator_title')}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-200/20 dark:shadow-black/20 border border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Activity size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-200">
                {t('market_prices')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('update_prices_hint')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                {t('gold_price')}
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  value={goldPrice}
                  onChange={(e) => setGoldPrice(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                {t('silver_price')}
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  value={silverPrice}
                  onChange={(e) => setSilverPrice(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-200/20 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 space-y-4"
        >
          <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <Landmark size={18} className="text-emerald-500" />
            {t('assets_wealth')}
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              {t('cash_savings')}
            </label>
            <input 
              type="number" 
              placeholder="0.00"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                {t('saved_gold_grams')}
              </label>
              <input 
                type="number" 
                placeholder="0"
                value={goldWeight}
                onChange={(e) => setGoldWeight(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                {t('saved_silver_grams')}
              </label>
              <input 
                type="number" 
                placeholder="0"
                value={silverWeight}
                onChange={(e) => setSilverWeight(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              {t('business_inventory_val')}
            </label>
            <input 
              type="number" 
              placeholder="0.00"
              value={businessInventory}
              onChange={(e) => setBusinessInventory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-emerald-600 dark:bg-emerald-800 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <h2 className="font-bold text-emerald-100 flex items-center gap-2 mb-2">
              <Coins size={20} />
              {t('zakat_result')}
            </h2>

            <div className="flex justify-between items-end border-b border-emerald-500/30 pb-4">
              <div>
                <p className="text-xs text-emerald-200 mb-1 font-bold uppercase tracking-wider">
                  {t('total_wealth')}
                </p>
                <p className="text-2xl font-black font-mono">
                  {totalWealth.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-emerald-200 mb-1 font-bold uppercase tracking-wider">
                  {t('gold_nisab')}
                </p>
                <p className="text-sm font-bold font-mono text-emerald-100">
                  {nisabGoldValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm text-emerald-100 mb-2 font-bold uppercase tracking-wider text-center">
                {t('amount_to_pay')}
              </p>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl py-4 px-6 text-center shadow-inner border border-white/20">
                {isEligibleForZakat ? (
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-4xl font-black tracking-tight drop-shadow-md font-mono">
                      {zakatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-white drop-shadow-sm">
                    {t('nisab_not_reached')}
                  </p>
                )}
              </div>
              <p className="text-center text-[10px] text-emerald-200 mt-3">
                {t('zakat_rule_desc')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
