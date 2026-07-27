import React from 'react';
import { BookOpen, Clock, Activity, Target } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function DecisionPanel({ systemStatus }) {
  const { t } = useLanguage();

  if (systemStatus.status !== 'alert' || !systemStatus.incident) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', gap: '1rem', minHeight: '300px' }}>
        <Activity size={48} opacity={0.2} />
        <p>{t('no_incidents_monitoring')}</p>
      </div>
    );
  }

  const { incident, alternatives } = systemStatus;
  
  // 根據不同事件類型動態引用 SOP 與計算
  let sopTitle = '';
  let sopContent = null;
  let baseClearance = 40;
  let penalty = 30;

  if (incident.type === 'Road_Collapse_Accident') {
    sopTitle = t('sop_title_road_accident');
    baseClearance = 60;
    penalty = 45;
    sopContent = (
      <>
        <span style={{color: 'var(--text-secondary)'}}>{t('sop_desc_road_accident_1')}</span> <b style={{color: 'var(--text-primary)'}}>{alternatives.length > 0 ? alternatives.join(', ') : t('nearby_roads')}</b>。<br/>
        <span style={{color: 'var(--text-secondary)'}}>{t('cms_suggestion')}：</span><span style={{color: 'var(--text-primary)'}}>"{incident.location}{t('road_closed_delay', { time: baseClearance + penalty })}"</span>
      </>
    );
  } else if (incident.type === 'Crowd_Surge_Injury') {
    sopTitle = t('sop_title_crowd_surge');
    baseClearance = 30;
    penalty = 15;
    sopContent = (
      <>
        <span style={{color: 'var(--text-secondary)'}}>{t('sop_desc_crowd_surge_1')}</span><br/>
        <span style={{color: 'var(--text-secondary)'}}>{t('disposal_suggestion')}：</span><span style={{color: 'var(--text-primary)'}}>"{t('crowd_action_advice')}"</span>
      </>
    );
  } else {
    sopTitle = t('sop_title_signal_error');
    baseClearance = 20;
    penalty = 10;
    sopContent = (
      <>
        <span style={{color: 'var(--text-secondary)'}}>{t('sop_desc_signal_error_1')}</span><br/>
        <span style={{color: 'var(--text-secondary)'}}>{t('disposal_suggestion')}：</span><span style={{color: 'var(--text-primary)'}}>"{t('signal_action_advice')}"</span>
      </>
    );
  }

  const ete = baseClearance + penalty;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', minHeight: '300px' }}>
      <div style={{ background: 'var(--bg-color)', border: '1px solid var(--alert-red)', padding: '1rem', borderRadius: '4px' }}>
        <h3 style={{ color: 'var(--alert-red)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={16} />
            {t('ai_verdict')}: {incident.severity === 'Critical' ? t('severity_a') : incident.severity === 'High' ? t('severity_b') : t('severity_c')}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            {t('ai_confidence')}: 98.5%
          </span>
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
          {t('detected_event', { location: incident.location, type: incident.type })}。<br/>
          {t('description')}: {incident.description}
        </p>
      </div>

      <div>
        <h4 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <BookOpen size={14} />
          {t('triggered_sop')}
        </h4>
        <div style={{ background: 'var(--bg-color)', border: '1px solid var(--panel-border)', padding: '0.75rem 1rem', borderRadius: '4px', fontSize: '0.85rem', borderLeft: '3px solid var(--accent-primary)' }}>
          <strong style={{color: 'var(--text-primary)'}}>{sopTitle}：</strong><br/>
          {sopContent}
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Clock size={14} />
          {t('ete_recovery_time')}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-color)', border: '1px solid var(--panel-border)', padding: '1rem', borderRadius: '4px' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ete} <span style={{fontSize:'0.875rem', color:'var(--text-secondary)'}}>{t('minutes')}</span></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('includes_compensation')}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {t('calculated_by_formula')}:<br/>
            ({t('base')} {baseClearance}m + {t('penalty')} {penalty}m)
          </div>
        </div>
      </div>
    </div>
  );
}
