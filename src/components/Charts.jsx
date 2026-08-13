import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';

// Custom Tooltip component for cybertheme
const CyberTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-slate-800 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        {label && <p className="text-xs font-cyber text-cyber-blue mb-1">{label}</p>}
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
            <span className="text-slate-400">{item.name}:</span>
            <span className="font-semibold text-slate-100">
              {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// 1. Threat Category Pie Chart
export function ThreatCategoryPie({ data }) {
  const safeData = Array.isArray(data) ? data : [];
  const threatOnlyData = safeData.filter(d => d && d.name !== 'Benign');

  if (threatOnlyData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center border border-slate-900 bg-slate-950/40 rounded-xl text-xs font-cyber text-slate-500">
        NO CATEGORY DATA AVAILABLE
      </div>
    );
  }

  return (
    <div className="w-full h-80 flex flex-col justify-between">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={threatOnlyData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {threatOnlyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
              ))}
            </Pie>
            <Tooltip content={<CyberTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Custom grid legend for layout control */}
      <div className="grid grid-cols-2 gap-2 mt-2 px-2 text-xs">
        {threatOnlyData.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color || '#3b82f6' }} />
            <span className="truncate">{entry.name}</span>
            <span className="ml-auto font-cyber font-semibold text-slate-400">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. Threat Trend Line Chart
export function ThreatTrendLine({ data }) {
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center border border-slate-900 bg-slate-950/40 rounded-xl text-xs font-cyber text-slate-500">
        NO TREND DATA AVAILABLE
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={safeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis 
            dataKey="date" 
            stroke="rgba(255,255,255,0.4)" 
            fontSize={11} 
            fontFamily="Share Tech Mono" 
          />
          <YAxis 
            stroke="rgba(255,255,255,0.4)" 
            fontSize={11} 
            fontFamily="Share Tech Mono" 
          />
          <Tooltip content={<CyberTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} 
          />
          <Line 
            type="monotone" 
            dataKey="Phishing" 
            stroke="var(--color-cyber-yellow)" 
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Line 
            type="monotone" 
            dataKey="Malware" 
            stroke="var(--color-cyber-orange)" 
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Line 
            type="monotone" 
            dataKey="C2" 
            stroke="var(--color-cyber-red)" 
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Line 
            type="monotone" 
            dataKey="Exfiltration" 
            stroke="#a855f7" 
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// 3. Top Malicious Domains Bar Chart
export function TopDomainsBar({ data }) {
  const safeData = Array.isArray(data) ? data : [];
  const chartData = safeData.map(d => ({
    name: (d.domain && d.domain.length > 20) ? d.domain.substring(0, 18) + '...' : (d.domain || 'unknown'),
    requests: d.requests || 0,
    category: d.category || 'Threat',
    color: d.category === 'Command & Control' ? 'var(--color-cyber-red)' :
           d.category === 'Data Exfiltration' ? '#a855f7' :
           d.category === 'Phishing' ? 'var(--color-cyber-yellow)' : 'var(--color-cyber-orange)'
  }));

  if (chartData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center border border-slate-900 bg-slate-950/40 rounded-xl text-xs font-cyber text-slate-500">
        NO DOMAIN DATA AVAILABLE
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
          <XAxis 
            type="number" 
            stroke="rgba(255,255,255,0.4)" 
            fontSize={10} 
            fontFamily="Share Tech Mono" 
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            stroke="rgba(255,255,255,0.5)" 
            fontSize={11} 
            width={100}
          />
          <Tooltip content={<CyberTooltip />} />
          <Bar dataKey="requests" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 4. Severity Distribution Chart
export function SeverityBar({ data }) {
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center border border-slate-900 bg-slate-950/40 rounded-xl text-xs font-cyber text-slate-500">
        NO SEVERITY DATA AVAILABLE
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={safeData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="rgba(255,255,255,0.4)" 
            fontSize={11} 
            fontFamily="Share Tech Mono" 
          />
          <YAxis 
            stroke="rgba(255,255,255,0.4)" 
            fontSize={11} 
            fontFamily="Share Tech Mono" 
          />
          <Tooltip content={<CyberTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {safeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
