
import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MarzRohani from './components/MarzRohani';
import IsmEAzam from './components/IsmEAzam';
import Saat from './components/Saat';
import ShadiMuwafiqat from './components/ShadiMuwafiqat';
import IstikharaAI from './components/IstikharaAI';
import PremiumModal from './components/PremiumModal';
import { calculateAbjad } from './utils/abjad';

const App: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  // Shared state for diagnosis integration
  const [preSelectedSaat, setPreSelectedSaat] = useState<{planet: string, value: number} | null>(null);

  // State for simple Abjad calculator view
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState(0);

  useEffect(() => {
    const unlocked = localStorage.getItem('spiritual_app_unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  const handleUnlock = () => {
    localStorage.setItem('spiritual_app_unlocked', 'true');
    setIsUnlocked(true);
    setShowPremiumModal(false);
  };

  const isFeaturePremium = (view: AppView) => {
    // Only 'علم الساعات' (ILM_US_SAAT) is FREE.
    return view !== AppView.ILM_US_SAAT && view !== AppView.DASHBOARD;
  };

  const handleViewSelect = (view: AppView) => {
    if (!isUnlocked && isFeaturePremium(view)) {
      setShowPremiumModal(true);
    } else {
      setCurrentView(view);
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case AppView.DASHBOARD: return 'روحانی حساب کتاب و استخارہ';
      case AppView.MARZ_ROHANI: return 'تشخیصِ امراض';
      case AppView.ISM_E_AZAM: return 'انتخابِ اسمِ اعظم';
      case AppView.ILM_US_SAAT: return 'علم الساعات';
      case AppView.ABJAD_CALC: return 'ابجد کیلکولیٹر';
      case AppView.SHADI_MUWAFIQAT: return 'شادی کی موافقت';
      case AppView.ISTIKHARA_AI: return 'روحانی استخارہ';
      default: return 'ایپلی کیشن';
    }
  };

  const handleUseSaat = (planet: string, value: number) => {
    setPreSelectedSaat({ planet, value });
    setCurrentView(AppView.MARZ_ROHANI);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onSelect={handleViewSelect} isUnlocked={isUnlocked} />;
      case AppView.MARZ_ROHANI:
        return <MarzRohani initialSaat={preSelectedSaat} />;
      case AppView.ISM_E_AZAM:
        return <IsmEAzam />;
      case AppView.ILM_US_SAAT:
        return <Saat onUseSaat={handleUseSaat} />;
      case AppView.ABJAD_CALC:
        return (
          <div className="max-w-xl mx-auto card-gradient border border-emerald-800 p-8 rounded-2xl animate-fadeIn premium-shadow">
            <h2 className="text-2xl urdu-text gold-text text-center mb-6">اعداد معلوم کریں</h2>
            <textarea
              className="w-full bg-emerald-950/50 border border-emerald-800 rounded-xl p-4 text-right urdu-text text-2xl focus:border-amber-500 focus:outline-none min-h-[150px] resize-none text-emerald-50"
              placeholder="یہاں عبارت لکھیں..."
              value={calcInput}
              onChange={(e) => {
                setCalcInput(e.target.value);
                setCalcResult(calculateAbjad(e.target.value));
              }}
            />
            <div className="mt-8 text-center bg-emerald-950/80 p-6 rounded-2xl border border-emerald-800">
              <span className="text-emerald-400/60 urdu-text block mb-2">کل اعداد</span>
              <span className="text-6xl font-bold text-amber-500">{calcResult}</span>
            </div>
          </div>
        );
      case AppView.SHADI_MUWAFIQAT:
        return <ShadiMuwafiqat />;
      case AppView.ISTIKHARA_AI:
        return <IstikharaAI />;
      default:
        return <Dashboard onSelect={handleViewSelect} isUnlocked={isUnlocked} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onBack={() => {
        setPreSelectedSaat(null);
        setCurrentView(AppView.DASHBOARD);
      }}
      title={getTitle()}
      onInstall={showInstallBtn ? handleInstall : undefined}
    >
      {renderView()}
      {showPremiumModal && (
        <PremiumModal 
          onClose={() => setShowPremiumModal(false)} 
          onUnlock={handleUnlock}
        />
      )}
    </Layout>
  );
};

export default App;
