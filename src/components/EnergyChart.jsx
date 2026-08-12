import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { PieChart, TrendingDown } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

export default function EnergyChart({ metrics }) {
  // 1. Doughnut Subsystem Breakdown Data
  const doughnutData = {
    labels: ['MCU Controller', 'Wireless Radio', 'Sensors & Peripherals'],
    datasets: [
      {
        data: [
          parseFloat(metrics.shares.mcu.toFixed(1)),
          parseFloat(metrics.shares.wireless.toFixed(1)),
          parseFloat(metrics.shares.sensors.toFixed(1))
        ],
        backgroundColor: [
          '#3b82f6', // MCU Blue
          '#06b6d4', // Radio Cyan
          '#10b981', // Sensor Emerald
        ],
        borderColor: '#020617',
        borderWidth: 3,
        hoverOffset: 6
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { size: 11, family: 'sans-serif' },
          padding: 12,
          usePointStyle: true,
          pointStyleWidth: 8
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw}% energy share`
        }
      }
    },
    cutout: '70%'
  };

  // 2. Battery Discharge Curve over Time Simulation
  const totalDays = Math.max(1, Math.min(3650, metrics.lifeDays));
  const pointsCount = 10;
  const timeLabels = [];
  const capacityPoints = [];

  const startCapacity = metrics.C_eff_mAh;
  const dailyDrain = metrics.mAhPerDay + (metrics.I_selfDischarge_mA * 24);

  for (let i = 0; i <= pointsCount; i++) {
    const day = (totalDays / pointsCount) * i;
    const remainingCap = Math.max(0, startCapacity - (dailyDrain * day));
    
    if (totalDays > 365) {
      timeLabels.push(`Yr ${(day / 365.25).toFixed(1)}`);
    } else if (totalDays > 30) {
      timeLabels.push(`Mo ${(day / 30.4).toFixed(1)}`);
    } else {
      timeLabels.push(`Day ${Math.round(day)}`);
    }
    capacityPoints.push(Math.round(remainingCap));
  }

  const lineData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Remaining Capacity (mAh)',
        data: capacityPoints,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#f59e0b',
        pointRadius: 3
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` Capacity: ${context.raw} mAh`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { size: 10 } },
        grid: { color: '#1e293b' }
      },
      y: {
        ticks: { color: '#64748b', font: { size: 10 } },
        grid: { color: '#1e293b' },
        min: 0,
        max: Math.ceil(startCapacity * 1.05)
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Subsystem Energy Breakdown Card */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            Energy Share per Subsystem
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">100% Cycle Energy</span>
        </div>

        <div className="h-[200px] w-full relative flex items-center justify-center">
          <Doughnut data={doughnutData} options={doughnutOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-slate-400">Payload</span>
            <span className="text-sm font-extrabold text-cyan-400 font-mono">{metrics.Q_total_mAs.toFixed(2)} mAs</span>
          </div>
        </div>
      </div>

      {/* Battery Discharge Curve Preview Card */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-amber-400" />
            Projected Battery Discharge Trajectory
          </h4>
          <span className="text-[10px] text-amber-400 font-mono font-bold">{metrics.C_eff_mAh.toFixed(0)} mAh Cap</span>
        </div>

        <div className="h-[200px] w-full">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>
    </div>
  );
}
