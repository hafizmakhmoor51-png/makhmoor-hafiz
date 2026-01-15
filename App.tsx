
import React, { useState, useEffect, useCallback } from 'react';
import { AppView } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MarzRohani from './components/MarzRohani';
import IsmEAzam from './components/IsmEAzam';
import Saat from './components/Saat';
import ShadiMuwafiqat from './components/ShadiMuwafiqat';
import KhairOShar from './components/KhairOShar';
import Khwabnama from './components/Khwabnama';
import RohaniIlaj from './components/RohaniIlaj';
import PremiumModal from './components/PremiumModal';

const App: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  // Shared state for diagnosis integration
  const [preSelectedSaat, setPreSelectedSaat] = useState<{planet: string, value: number} | null>(null);
  
  // Shared solar data for global consistency
  const [solarData, setSolarData] = useState<{ sunrise: string; sunset: string } | null>(null);

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
    // ILM_US_SAAT and ROHANI_ILAJ are FREE features.
    return view !== AppView.ILM_US_SAAT && view !== AppView.ROHANI_ILAJ && view !== AppView.DASHBOARD;
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
      case AppView.SHADI_MUWAFIQAT: return 'شادی کی موافقت';
      case AppView.KHAIR_O_SHAR: return 'خیر و شر کی پہچان';
      case AppView.KHWABNAMA: return 'اے آئی خوابنامہ';
      case AppView.ROHANI_ILAJ: return 'سلسلہ روحانی علاج و ہدایات';
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
        return <MarzRohani initialSaat={preSelectedSaat} solarData={solarData} />;
      case AppView.ISM_E_AZAM:
        return <IsmEAzam />;
      case AppView.ILM_US_SAAT:
        return <Saat onUseSaat={handleUseSaat} onSolarDataUpdate={setSolarData} />;
      case AppView.SHADI_MUWAFIQAT:
        return <ShadiMuwafiqat />;
      case AppView.KHAIR_O_SHAR:
        return <KhairOShar initialSaat={preSelectedSaat} solarData={solarData} />;
      case AppView.KHWABNAMA:
        return <Khwabnama />;
      case AppView.ROHANI_ILAJ:
        return <RohaniIlaj />;
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
