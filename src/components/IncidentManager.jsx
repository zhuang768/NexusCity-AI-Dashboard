import React, { useState, useRef, useEffect } from 'react';
import { Zap, Send, ChevronDown } from 'lucide-react';
import incidentData from '../data/live_incidents.json';
import roadData from '../data/road_network_geometry.json';

export default function IncidentManager({ systemStatus, setSystemStatus, onShowNotification }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const injectEvent = (index) => {
    const incident = incidentData[index];
    const affectedRoadId = incident.affected_segment || incident.affected_road;
    const affectedRoadInfo = roadData.find(r => r.segment_id === affectedRoadId);
    let smartAlternatives = [];
    if (affectedRoadInfo && affectedRoadInfo.alternatives) {
      smartAlternatives = affectedRoadInfo.alternatives.filter(altId => {
        const altRoad = roadData.find(r => r.segment_id === altId);
        return altRoad && altRoad.capacity_vph >= 1200;
      });
    }
    
    setSystemStatus({
      status: 'alert',
      incident: incident,
      alternatives: smartAlternatives
    });
    setIsOpen(false);
  };

  const resetEvent = () => {
    setSystemStatus({ status: 'normal', incident: null, alternatives: [] });
    setIsOpen(false);
  };

  // 點擊外部關閉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAlert = systemStatus.status === 'alert';

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {!isAlert ? (
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', 
            border: '1px solid var(--panel-border)', 
            padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer',
            fontWeight: 500, fontSize: '0.875rem'
          }}
        >
          <Zap size={16} color="var(--warn-yellow)" /> 事件注入演練 <ChevronDown size={16} />
        </button>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={resetEvent}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'transparent', color: 'var(--text-secondary)', 
              border: '1px solid var(--panel-border)', 
              padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer',
              fontWeight: 500, fontSize: '0.875rem'
            }}
          >
            恢復正常
          </button>
          <button 
            onClick={onShowNotification}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'var(--accent-primary)', color: '#000', 
              border: 'none', 
              padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.875rem'
            }}
          >
            <Send size={16} /> 發送通報
          </button>
        </div>
      )}

      {/* 下拉選單內容 */}
      {isOpen && !isAlert && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 0.5rem)',
          right: 0,
          background: 'var(--panel-bg)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--panel-border)',
          borderRadius: '8px',
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          minWidth: '280px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          zIndex: 100
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.25rem 0.5rem', marginBottom: '0.25rem' }}>選擇情境：</div>
          
          <button onClick={() => injectEvent(0)} style={dropdownButtonStyle('rgba(239, 68, 68, 0.1)', 'var(--alert-red)')}>
            <Zap size={14} /> 情境一：光復南路車禍 (Critical)
          </button>
          <button onClick={() => injectEvent(1)} style={dropdownButtonStyle('rgba(245, 158, 11, 0.1)', '#f59e0b')}>
            <Zap size={14} /> 情境二：大巨蛋推擠 (High)
          </button>
          <button onClick={() => injectEvent(2)} style={dropdownButtonStyle('rgba(56, 189, 248, 0.1)', '#38bdf8')}>
            <Zap size={14} /> 情境三：信義區號誌異常 (Medium)
          </button>
        </div>
      )}
    </div>
  );
}

// 提取共用樣式以保持程式碼整潔
function dropdownButtonStyle(bg, color) {
  return {
    display: 'flex', alignItems: 'center', gap: '0.5rem', 
    background: 'transparent', color: color, 
    border: 'none', textAlign: 'left',
    padding: '0.5rem', borderRadius: '4px', cursor: 'pointer',
    fontWeight: 500, fontSize: '0.875rem',
    transition: 'background 0.2s',
  };
}
