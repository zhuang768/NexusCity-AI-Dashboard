import React, { useState, Suspense, lazy, useEffect } from 'react';
import Layout from './components/Layout';
import IncidentManager from './components/IncidentManager';
import NotificationModal from './components/NotificationModal';
import { useCityData } from './hooks/useCityData';
import { useCountUp } from './hooks/useCountUp';
import CctvPanel from './components/CctvPanel';
import AiAlertLog from './components/AiAlertLog';
import TransitStatus from './components/TransitStatus';
import CellBroadcastSimulator from './components/CellBroadcastSimulator';

// 動態載入大型元件 (Code-Splitting) 以大幅提升首屏載入速度
const TrafficChart = lazy(() => import('./components/TrafficChart'));
const ChatAssistant = lazy(() => import('./components/ChatAssistant'));
const DecisionPanel = lazy(() => import('./components/DecisionPanel'));
const NetworkMap = lazy(() => import('./components/NetworkMap'));
import { Users, Car, AlertTriangle, ShieldCheck, MessageCircle, X } from 'lucide-react';
import './App.css';
import { useLanguage } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const [systemStatus, setSystemStatus] = useState({
    status: 'normal',
    incident: null,
    alternatives: []
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isNormal = systemStatus.status === 'normal';
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const cityData = useCityData();
  const animatedTraffic = useCountUp(cityData.totalTraffic || 0, 1200);
  const animatedCrowd = useCountUp(cityData.domeCrowd || 0, 1200);

  // 主動預警機制：進入系統後 3 秒，自動彈出 AI 聊天室
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChatOpen(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // 監聽突發事件：AI 主動強行介入
  useEffect(() => {
    if (systemStatus.status === 'alert') {
      setIsChatOpen(true);
    }
  }, [systemStatus.status]);

  const triggerInteractiveIncident = (roadId) => {
    // 找出幾條附近的替代道路 (用假資料模擬演算法結果)
    const mockAlternatives = ['RD_003', 'RD_008', 'RD_012', 'RD_004', 'RD_005'];
    setSystemStatus({
      status: 'alert',
      incident: {
        type: 'road_block',
        affected_segment: roadId,
        severity: 'critical'
      },
      alternatives: mockAlternatives.filter(id => id !== roadId)
    });
    // 延遲打開對話框，增加戲劇性
    setTimeout(() => {
      setIsChatOpen(true);
    }, 1500);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            {/* Top Stat Cards */}
            <div className="col-span-3 glass-panel stat-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="stat-icon"><Car size={24} /></div>
              <div className="stat-info">
                <h3>{t('stat_traffic_title')}</h3>
                <div className="value">
                  {cityData.isLoading ? '...' : animatedTraffic.toLocaleString()} 
                  <span style={{fontSize:'1rem', color:'var(--text-secondary)', marginLeft: '8px'}}>{t('stat_unit_vehicles')}</span>
                </div>
              </div>
            </div>
            
            <div className="col-span-3 glass-panel stat-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="stat-icon"><Users size={24} /></div>
              <div className="stat-info">
                <h3>{t('stat_crowd_title')}</h3>
                <div className="value">
                  {cityData.isLoading ? '...' : animatedCrowd.toLocaleString()}
                  <span style={{fontSize:'1rem', color:'var(--text-secondary)', marginLeft: '8px', fontWeight: 500}}>
                    {t('stat_roaming')} {cityData.isLoading ? '-' : cityData.roamingPct}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-span-3 glass-panel stat-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="stat-icon"><ShieldCheck size={24} /></div>
              <div className="stat-info">
                <h3>{t('stat_ai_level_title')}</h3>
                <div className="value">{t('stat_sop_monitoring')}</div>
              </div>
            </div>

            <div className="col-span-3 glass-panel stat-card animate-fade-in" style={{ animationDelay: '0.4s', borderColor: isNormal ? '' : 'var(--alert-red)' }}>
              <div className="stat-icon" style={{ color: isNormal ? 'var(--text-secondary)' : 'var(--alert-red)' }}>
                <AlertTriangle size={24} />
              </div>
              <div className="stat-info">
                <h3>{t('stat_alert_title')}</h3>
                <div className="value" style={{ color: isNormal ? 'var(--text-secondary)' : 'var(--alert-red)' }}>
                  {isNormal ? t('stat_alert_normal') : t('stat_alert_detected')}
                </div>
              </div>
            </div>

            {/* Chart Section (滿版) */}
            <div className="col-span-12 glass-panel animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="panel-header">
                <h2 className="panel-title">{t('dashboard_traffic')}</h2>
                <div className="status-badge"><span className="status-dot"></span>Live</div>
              </div>
              <div className="panel-content">
                <TrafficChart />
              </div>
            </div>

            {/* 新增的三大面板 */}
            <div className="col-span-4 animate-fade-in" style={{ animationDelay: '0.6s', height: '300px' }}>
              <CctvPanel />
            </div>
            <div className="col-span-4 animate-fade-in" style={{ animationDelay: '0.7s', height: '300px' }}>
              <AiAlertLog />
            </div>
            <div className="col-span-4 animate-fade-in" style={{ animationDelay: '0.8s', height: '300px' }}>
              <TransitStatus />
            </div>

          </>
        );

      case 'incident':
        return (
          <>
            <div className="col-span-4 glass-panel animate-fade-in">
              <div className="panel-header">
                <h2 className="panel-title">{t('panel_ai_decision')}</h2>
              </div>
              <div className="panel-content" style={{ height: '500px', overflowY: 'auto' }}>
                <DecisionPanel systemStatus={systemStatus} />
              </div>
            </div>
            <div className="col-span-8 glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="panel-header">
                <h2 className="panel-title">{t('panel_network_map')}</h2>
              </div>
              <div className="panel-content" style={{ height: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Suspense fallback={<div className="text-white opacity-50">載入地圖模組中...</div>}>
                  <NetworkMap systemStatus={systemStatus} onRoadClick={triggerInteractiveIncident} />
                </Suspense>
              </div>
            </div>
          </>
        );


      case 'settings':
        return (
          <div className="col-span-12 glass-panel animate-fade-in" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', color: 'var(--text-primary)' }}>{t('settings_title')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', border: '1px solid var(--panel-border)', borderRadius: '4px', background: 'var(--bg-color)' }}>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{t('setting_ai_sensitivity_title')}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('setting_ai_sensitivity_desc')}</div>
                </div>
                <div style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{t('setting_high')}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', border: '1px solid var(--panel-border)', borderRadius: '4px', background: 'var(--bg-color)' }}>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{t('setting_i18n_module_title')}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('setting_i18n_module_desc')}</div>
                </div>
                <div style={{ color: '#10b981', fontWeight: 600 }}>{t('setting_active')}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', border: '1px solid var(--panel-border)', borderRadius: '4px', background: 'var(--bg-color)' }}>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{t('setting_cht_api_title')}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('setting_cht_api_desc')}</div>
                </div>
                <div style={{ color: '#10b981', fontWeight: 600 }}>{t('setting_connected')}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', border: '1px solid var(--panel-border)', borderRadius: '4px', background: 'var(--bg-color)' }}>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>介面主題模式 (Theme Mode)</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>切換白天與黑夜模式以適應當前環境</div>
                </div>
                <div>
                  <button 
                    onClick={toggleTheme}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: 'var(--accent-primary)', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {theme === 'dark' ? '切換為白天模式 ☀️' : '切換為黑夜模式 🌙'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Layout 
      systemStatus={systemStatus}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      headerActions={
        <IncidentManager 
          systemStatus={systemStatus} 
          setSystemStatus={setSystemStatus} 
          onShowNotification={() => setIsModalOpen(true)}
        />
      }
    >
      <div className="dashboard-grid">
        <Suspense fallback={
          <div className="col-span-12" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ marginBottom: '1rem', opacity: 0.5 }}>模組載入中 (Loading Module...)</div>
          </div>
        }>
          {renderContent()}
        </Suspense>
      </div>

      <NotificationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} systemStatus={systemStatus} />
      
      {/* 細胞廣播模擬器 (WOW Factor) */}
      <CellBroadcastSimulator 
        systemStatus={systemStatus} 
        onClose={() => setSystemStatus({...systemStatus, status: 'normal', incident: null, alternatives: []})} 
      />

      {/* 浮動聊天機器人 Floating Chat Widget */}
      <div className="chat-fab" onClick={() => setIsChatOpen(!isChatOpen)}>
        {isChatOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </div>
      
      {isChatOpen && (
        <div className="chat-widget">
          <div className="panel-header">
            <h2 className="panel-title" style={{ fontSize: '1rem', background: 'linear-gradient(135deg, #38bdf8, #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              <MessageCircle size={18} color="#38bdf8" /> {t('chat_title')}
            </h2>
            <button onClick={() => setIsChatOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>載入中...</div>}>
              <ChatAssistant systemStatus={systemStatus} />
            </Suspense>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default App;
