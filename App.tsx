import React, { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { LayoutDashboard, Users, Settings, Loader2 } from 'lucide-react'; // ✅ أضفنا أيقونة Settings

// استيراد المكونات
import DashboardLite from './components/DashboardLite';
import StudentsManager from './components/StudentsManager';
import SettingsLite from './components/SettingsLite'; // ✅ استيراد الملف الجديد
import WelcomeScreen from './components/WelcomeScreen';

// Main App Container
const AppContent: React.FC = () => {
  const { 
      isDataLoaded, 
      teacherInfo, setTeacherInfo, 
      schedule, setSchedule, 
      periodTimes, setPeriodTimes, 
      currentSemester, setCurrentSemester
  } = useApp();
  
  // ✅ الحالة الآن تقبل 3 قيم
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'settings'>('dashboard');
  
  // حالة التنبيهات
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
      return localStorage.getItem('bell_enabled') === 'true';
  });

  const handleToggleNotifications = () => {
      setNotificationsEnabled(prev => {
          const newState = !prev;
          localStorage.setItem('bell_enabled', String(newState));
          return newState;
      });
  };

  // معالجة زر الرجوع في الأندرويد
  useEffect(() => {
    if (Capacitor.getPlatform() === 'android') {
      const backListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (activeTab !== 'dashboard') {
          setActiveTab('dashboard');
        } else {
          CapacitorApp.exitApp();
        }
      });
      return () => { backListener.then(listener => listener.remove()); };
    }
  }, [activeTab]);

  // شاشة الترحيب
  const [showWelcome, setShowWelcome] = useState<boolean>(() => !localStorage.getItem('rased_welcome_seen'));
  
  const handleFinishWelcome = () => {
      localStorage.setItem('rased_welcome_seen', 'true');
      setShowWelcome(false);
  };
  
  if (!isDataLoaded) {
      return (
          <div className="flex h-full w-full items-center justify-center bg-gray-50 fixed inset-0 z-[99999]">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
      );
  }

  if (showWelcome) return <WelcomeScreen onFinish={handleFinishWelcome} />;

  // ✅ دالة العرض المحدثة
  const renderContent = () => {
      switch (activeTab) {
          case 'dashboard':
              return (
                  <DashboardLite 
                      teacherInfo={teacherInfo}
                      onUpdateTeacherInfo={(i) => setTeacherInfo(prev => ({...prev, ...i}))}
                      schedule={schedule}
                      onUpdateSchedule={setSchedule}
                      periodTimes={periodTimes}
                      setPeriodTimes={setPeriodTimes}
                      notificationsEnabled={notificationsEnabled}
                      onToggleNotifications={handleToggleNotifications}
                      currentSemester={currentSemester}
                      onSemesterChange={setCurrentSemester}
                      onNavigateToStudents={() => setActiveTab('students')}
                  />
              );
          case 'students':
              return <StudentsManager />;
          case 'settings': // ✅ الصفحة الجديدة
              return <SettingsLite />;
          default:
              return null;
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#f3f4f6] font-sans overflow-hidden text-slate-900 relative">
        
        {/* منطقة المحتوى */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-24 px-4 pt-safe">
                <div className="max-w-md mx-auto w-full min-h-full">
                    {renderContent()}
                </div>
            </div>
        </main>

        {/* ✅ القائمة السفلية (3 أزرار الآن) */}
        <nav className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center h-16 px-4 pb-safe">
                
                <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${activeTab === 'dashboard' ? 'text-[#446A8D] -translate-y-1' : 'text-slate-400'}`}
                >
                    <div className={`p-2 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-[#446A8D]/10' : 'bg-transparent'}`}>
                        <LayoutDashboard size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-bold">الرئيسية</span>
                </button>

                <button 
                    onClick={() => setActiveTab('students')}
                    className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${activeTab === 'students' ? 'text-[#446A8D] -translate-y-1' : 'text-slate-400'}`}
                >
                    <div className={`p-2 rounded-2xl transition-all ${activeTab === 'students' ? 'bg-[#446A8D]/10' : 'bg-transparent'}`}>
                        <Users size={24} strokeWidth={activeTab === 'students' ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-bold">الطلاب</span>
                </button>

                <button 
                    onClick={() => setActiveTab('settings')}
                    className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${activeTab === 'settings' ? 'text-[#446A8D] -translate-y-1' : 'text-slate-400'}`}
                >
                    <div className={`p-2 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-[#446A8D]/10' : 'bg-transparent'}`}>
                        <Settings size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
                    </div>
                    <span className="text-[10px] font-bold">الإعدادات</span>
                </button>

            </div>
        </nav>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;