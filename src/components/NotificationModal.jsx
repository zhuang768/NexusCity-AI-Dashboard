import React, { useState } from 'react';
import { X, Globe, Smartphone, CheckCircle2, Languages } from 'lucide-react';

export default function NotificationModal({ isOpen, onClose, systemStatus }) {
  const [activeLang, setActiveLang] = useState('zh');

  if (!isOpen) return null;

  const incident = systemStatus?.incident;
  const baseClearance = incident?.severity === 'Critical' ? 60 : 40;
  const penalty = 30; 
  const ete = baseClearance + penalty;
  
  const location = incident?.location || '未知路段';
  const alternativeStr = systemStatus?.alternatives?.join(' 或 ') || '替代道路';

  const langs = [
    { id: 'zh', name: '中文' },
    { id: 'en', name: 'English' },
    { id: 'ja', name: '日本語' },
    { id: 'ko', name: '한국어' },
  ];

  const contentMap = {
    zh: `【國家級警報】${location}發生${incident?.type === 'Road_Collapse_Accident' ? '路面塌陷重大事故' : incident?.type === 'Crowd_Surge_Injury' ? '人群推擠' : '號誌中斷'}。該路段周邊已實施交通管制。請改道${alternativeStr}，預計延誤 ${ete} 分鐘。請遵循現場員警指揮。`,
    en: `[Emergency Alert] Critical incident at ${location}. Traffic control in effect. Please detour to ${alternativeStr}. Est. delay ${ete} mins. Follow police instructions.`,
    ja: `【緊急速報】${location}で重大な事態が発生しました。交通規制が行われています。${alternativeStr}へ迂回してください。約${ete}分の遅れが見込まれます。`,
    ko: `【긴급 경보】 ${location}에서 심각한 상황이 발생하여 교통이 통제되고 있습니다. ${alternativeStr}(으)로 우회해 주십시오. 약 ${ete}분 지연이 예상됩니다.`
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(5, 10, 21, 0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <div style={{
        background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
        borderRadius: '12px', width: '90%', maxWidth: '550px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--panel-border)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Smartphone size={18} color="var(--text-primary)" />
            細胞廣播 / CMS 電子看板多語通報
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <Globe size={16} />
            系統偵測該區外籍漫遊比例達 32%，將自動派發多國語言版本：
          </div>

          <div style={{ border: '1px solid var(--panel-border)', borderRadius: '8px', overflow: 'hidden' }}>
            {/* 語系切換 Tabs */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--panel-border)' }}>
              {langs.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setActiveLang(lang.id)}
                  style={{
                    flex: 1, padding: '0.75rem', background: 'transparent',
                    border: 'none', borderBottom: activeLang === lang.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    color: activeLang === lang.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: activeLang === lang.id ? 600 : 400,
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                  }}
                >
                  <Languages size={14} opacity={activeLang === lang.id ? 1 : 0.5} />
                  {lang.name}
                </button>
              ))}
            </div>
            
            {/* 訊息內容 */}
            <div style={{ padding: '1.5rem', background: 'var(--bg-color)', minHeight: '120px', display: 'flex', alignItems: 'center' }}>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary)', margin: 0 }}>
                {contentMap[activeLang]}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1.25rem 1.5rem', background: 'var(--panel-bg)', borderTop: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={() => { alert('已透過 API 派發多通路推播！'); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.5rem', background: 'var(--text-primary)', border: 'none', borderRadius: '4px', color: 'var(--bg-color)', fontWeight: 600, cursor: 'pointer' }}>
            <CheckCircle2 size={16} />
            一鍵發布 (全語言派送)
          </button>
        </div>
      </div>
    </div>
  );
}
