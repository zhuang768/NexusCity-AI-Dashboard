import React, { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Brush
} from 'recharts';
import Papa from 'papaparse';
import trafficCsv from '../data/city_traffic_flow.csv?raw';
import crowdCsv from '../data/signaling_crowd_density.csv?raw';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(10, 15, 30, 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        color: '#fff'
      }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px', marginBottom: '8px', fontWeight: '600', color: '#a1a1aa' }}>
          時間: {label}
        </div>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }}></div>
              <span style={{ fontSize: '0.9rem' }}>{entry.name}</span>
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '1rem', color: entry.color }}>{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function TrafficChart() {
  const [chartData, setChartData] = useState([]);
  const [hiddenSeries, setHiddenSeries] = useState({ traffic: false, crowd: false });

  const toggleSeries = (dataKey) => {
    setHiddenSeries(prev => ({
      ...prev,
      [dataKey]: !prev[dataKey]
    }));
  };

  useEffect(() => {
    // Parse CSVs
    const trafficParsed = Papa.parse(trafficCsv, { header: true, skipEmptyLines: true }).data;
    const crowdParsed = Papa.parse(crowdCsv, { header: true, skipEmptyLines: true }).data;

    // Aggregate Traffic by Timestamp (sum Vehicle_Count)
    const trafficByTime = {};
    trafficParsed.forEach(row => {
      const time = row.Timestamp.split(' ')[1]; // Extract HH:mm
      if (!time) return;
      if (!trafficByTime[time]) trafficByTime[time] = 0;
      trafficByTime[time] += parseInt(row.Vehicle_Count || 0, 10);
    });

    // Aggregate Crowd by Timestamp (sum User_Count)
    const crowdByTime = {};
    crowdParsed.forEach(row => {
      const time = row.Timestamp.split(' ')[1]; // Extract HH:mm
      if (!time) return;
      if (!crowdByTime[time]) crowdByTime[time] = 0;
      crowdByTime[time] += parseInt(row.User_Count || 0, 10);
    });

    // Merge and sort
    const merged = Object.keys(trafficByTime).map(time => ({
      time,
      traffic: trafficByTime[time],
      crowd: crowdByTime[time] || 0
    })).sort((a, b) => a.time.localeCompare(b.time));

    setChartData(merged);
  }, []);

  const renderLegend = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', paddingTop: '10px' }}>
        <div 
          onClick={() => toggleSeries('traffic')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: hiddenSeries.traffic ? 0.4 : 1, transition: 'all 0.3s', padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.02)' }}
        >
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#3b82f6', boxShadow: '0 0 6px #3b82f6' }}></div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>車流量 (點擊切換)</span>
        </div>
        <div 
          onClick={() => toggleSeries('crowd')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: hiddenSeries.crowd ? 0.4 : 1, transition: 'all 0.3s', padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.02)' }}
        >
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#d97706', boxShadow: '0 0 6px #d97706' }}></div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>人潮數量 (點擊切換)</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height: 350, display: 'flex', flexDirection: 'column' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <defs>
            <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCrowd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="time" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} dy={10} />
          <YAxis yAxisId="left" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
          
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          
          {!hiddenSeries.traffic && (
            <Area 
              yAxisId="left" 
              type="monotone" 
              dataKey="traffic" 
              name="車流量 (輛)" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorTraffic)"
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#3b82f6', style: { filter: 'drop-shadow(0px 0px 5px rgba(59, 130, 246, 0.8))' } }}
              animationDuration={1500}
            />
          )}
          
          {!hiddenSeries.crowd && (
            <Area 
              yAxisId="right" 
              type="monotone" 
              dataKey="crowd" 
              name="人潮數量 (人)" 
              stroke="#d97706" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorCrowd)"
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#d97706', style: { filter: 'drop-shadow(0px 0px 5px rgba(217, 119, 6, 0.8))' } }}
              animationDuration={1500}
            />
          )}
          
          <Brush 
            dataKey="time" 
            height={20} 
            stroke="var(--accent-primary)" 
            fill="rgba(10, 15, 30, 0.8)"
            travellerWidth={12}
            tickFormatter={() => ''}
            style={{ cursor: 'ew-resize' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      {renderLegend()}
    </div>
  );
}
