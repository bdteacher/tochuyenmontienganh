import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { GraduationCap, CheckCircle2, Flag } from 'lucide-react';
import { Teacher } from '../types';

interface TeacherQualificationChartProps {
  teachers: Teacher[];
  onNavigateTeachers?: () => void;
}

interface ChartDataItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
  teacherNames: string[];
}

const DEGREE_COLORS: Record<string, string> = {
  'Tiến sĩ': '#7c3aed', // violet-600
  'Thạc sĩ': '#4f46e5', // indigo-600
  'Đại học': '#0284c7', // sky-600
  'Cử nhân Sư phạm': '#0ea5e9', // sky-500
  'Cao đẳng Sư phạm': '#f59e0b', // amber-500
};

const PARTY_COLORS: Record<string, string> = {
  'Đảng viên': '#e11d48', // rose-600
  'Chưa vào Đảng (Quần chúng)': '#64748b', // slate-500
};

const FALLBACK_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];

export const TeacherQualificationChart: React.FC<TeacherQualificationChartProps> = ({
  teachers,
  onNavigateTeachers,
}) => {
  const [chartMode, setChartMode] = useState<'degree' | 'party'>('degree');

  const chartData: ChartDataItem[] = useMemo(() => {
    const total = teachers.length || 1;
    const groups: Record<string, string[]> = {};

    teachers.forEach((t) => {
      const key =
        chartMode === 'degree'
          ? t.degree
          : t.isPartyMember !== false
          ? 'Đảng viên'
          : 'Chưa vào Đảng (Quần chúng)';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(t.fullName);
    });

    const colorMap = chartMode === 'degree' ? DEGREE_COLORS : PARTY_COLORS;

    return Object.entries(groups).map(([name, names], idx) => ({
      name,
      value: names.length,
      percentage: Math.round((names.length / total) * 100),
      color: colorMap[name] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length],
      teacherNames: names,
    }));
  }, [teachers, chartMode]);

  const aboveStandardCount = useMemo(() => {
    return teachers.filter((t) => t.degree === 'Thạc sĩ' || t.degree === 'Tiến sĩ').length;
  }, [teachers]);

  const partyMemberCount = useMemo(() => {
    return teachers.filter((t) => t.isPartyMember !== false).length;
  }, [teachers]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data: ChartDataItem = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs max-w-xs z-50">
          <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-slate-700">
            <span className="font-bold text-amber-300">{data.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/15 font-extrabold text-[11px]">
              {data.value} GV ({data.percentage}%)
            </span>
          </div>
          <div className="mt-2 space-y-0.5 text-[11px] text-slate-200">
            <div className="text-slate-400 font-semibold mb-1">Danh sách giáo viên:</div>
            {data.teacherNames.map((n, i) => (
              <div key={i} className="truncate">
                • {n}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            Biểu Đồ Tròn Phân Bổ Trình Độ Chuyên Môn ({teachers.length} Giáo Viên)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            9 Đại học (90%) • {aboveStandardCount} Thạc sĩ (10% - GV Trịnh Thị Hiền)
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl text-xs self-start sm:self-auto gap-0.5">
          <button
            type="button"
            onClick={() => setChartMode('degree')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
              chartMode === 'degree'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Trình độ</span>
          </button>
          <button
            type="button"
            onClick={() => setChartMode('party')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
              chartMode === 'party'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Đảng viên ({partyMemberCount})</span>
          </button>
        </div>
      </div>

      {/* Chart + Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Recharts PieChart */}
        <div className="md:col-span-5 h-60 w-full flex flex-col items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={84}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
                stroke="#ffffff"
                strokeWidth={2}
                label={({ percent }) => `${Math.round((percent || 0) * 100)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={28}
                iconType="circle"
                formatter={(value: string) => (
                  <span className="text-xs font-semibold text-slate-700">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Summary Badge inside Donut */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-6">
            <span className="text-2xl font-black text-slate-900 leading-none">
              {teachers.length}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              Giáo viên
            </span>
          </div>
        </div>

        {/* Detailed Breakdown List */}
        <div className="md:col-span-7 space-y-2.5">
          {chartData.map((item) => (
            <div
              key={item.name}
              onClick={onNavigateTeachers}
              className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-indigo-50/40 hover:border-indigo-200 transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-white border border-slate-200 text-slate-800 shadow-2xs">
                    {item.value} giáo viên ({item.percentage}%)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>

              {/* Teacher badges */}
              <div className="flex flex-wrap gap-1">
                {item.teacherNames.map((tName) => (
                  <span
                    key={tName}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200/80 text-[11px] font-medium text-slate-700"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-indigo-500" />
                    {tName}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
