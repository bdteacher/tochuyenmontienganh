import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { Flag, Users, UserCheck, ArrowRight } from 'lucide-react';
import { Teacher } from '../types';

interface PartyStructureBarChartProps {
  teachers: Teacher[];
  onNavigateTeachers?: () => void;
}

interface PartyBarItem {
  category: string;
  shortLabel: string;
  count: number;
  percentage: number;
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  teacherList: {
    id: string;
    fullName: string;
    role: string;
    campusOrGroup?: string;
  }[];
}

export const PartyStructureBarChart: React.FC<PartyStructureBarChartProps> = ({
  teachers,
  onNavigateTeachers,
}) => {
  const barData: PartyBarItem[] = useMemo(() => {
    const total = teachers.length || 1;
    const partyMembers = teachers.filter((t) => t.isPartyMember !== false);
    const nonPartyMembers = teachers.filter((t) => t.isPartyMember === false);

    return [
      {
        category: 'Đảng viên ĐCSVN',
        shortLabel: '🚩 Đảng viên',
        count: partyMembers.length,
        percentage: Math.round((partyMembers.length / total) * 100),
        color: '#e11d48', // rose-600
        badgeBg: 'bg-rose-50 border-rose-200',
        badgeText: 'text-rose-700',
        description: 'Đội ngũ nòng cốt chính trị tại cả 2 cơ sở',
        teacherList: partyMembers.map((t) => ({
          id: t.id,
          fullName: t.fullName,
          role: t.role,
          campusOrGroup: t.campusOrGroup,
        })),
      },
      {
        category: 'Chưa là Đảng viên',
        shortLabel: '👤 Chưa là Đảng viên',
        count: nonPartyMembers.length,
        percentage: Math.round((nonPartyMembers.length / total) * 100),
        color: '#64748b', // slate-500
        badgeBg: 'bg-slate-50 border-slate-200',
        badgeText: 'text-slate-700',
        description: 'Quần chúng ưu tú đang công tác tại tổ',
        teacherList: nonPartyMembers.map((t) => ({
          id: t.id,
          fullName: t.fullName,
          role: t.role,
          campusOrGroup: t.campusOrGroup,
        })),
      },
    ];
  }, [teachers]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data: PartyBarItem = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs max-w-xs z-50">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-700">
            <span className="font-bold text-amber-300">{data.category}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/15 font-extrabold text-[11px]">
              {data.count}/{teachers.length} GV ({data.percentage}%)
            </span>
          </div>
          <div className="mt-2 space-y-1 text-[11px] text-slate-200">
            <div className="text-slate-400 font-semibold mb-1">Danh sách giáo viên:</div>
            {data.teacherList.map((t, idx) => (
              <div key={t.id} className="flex items-center justify-between gap-2">
                <span className="font-medium">
                  {idx + 1}. {t.fullName}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">({t.role})</span>
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
            <Flag className="w-5 h-5 text-rose-600" />
            Biểu Đồ Cột Cơ Cấu Đảng Viên &amp; Giáo Viên Chưa Là Đảng Viên
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng số <strong>{teachers.length} giáo viên</strong> trong tổ: <strong>08 Đảng viên (80%)</strong> và <strong>02 GV chưa là Đảng viên (20%)</strong>
          </p>
        </div>

        {onNavigateTeachers && (
          <button
            type="button"
            onClick={onNavigateTeachers}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Lọc danh sách Đảng viên</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Content: Bar Chart + Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: Recharts Bar Chart */}
        <div className="md:col-span-5 h-64 w-full bg-slate-50/60 rounded-xl border border-slate-100 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
            <span>Số lượng giáo viên (Người)</span>
            <span className="text-rose-600 font-bold">Tỷ lệ Đảng viên: 80%</span>
          </div>
          <div className="flex-1 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 22, right: 16, left: -16, bottom: 4 }}
                barSize={54}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#334155' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, 10]}
                  ticks={[0, 2, 4, 6, 8, 10]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }} />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="top"
                    formatter={(val: any) => `${val ?? 0} GV`}
                    style={{ fontSize: '12px', fontWeight: 800, fill: '#0f172a' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Detailed Breakdown of 8 Party Members & 2 Non-Party Members */}
        <div className="md:col-span-7 space-y-3">
          {barData.map((group) => (
            <div
              key={group.category}
              onClick={onNavigateTeachers}
              className={`p-3.5 rounded-xl border ${group.badgeBg} transition cursor-pointer hover:shadow-xs`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-md shrink-0 shadow-2xs"
                    style={{ backgroundColor: group.color }}
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <span>{group.category}</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">{group.description}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-white border border-slate-200 text-slate-900 shadow-2xs shrink-0">
                  {group.count} GV ({group.percentage}%)
                </span>
              </div>

              {/* Teacher Pills */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {group.teacherList.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200/90 text-[11px] font-semibold text-slate-800 shadow-2xs"
                  >
                    {group.category === 'Đảng viên ĐCSVN' ? (
                      <Flag className="w-3 h-3 text-rose-600 shrink-0" />
                    ) : (
                      <Users className="w-3 h-3 text-slate-500 shrink-0" />
                    )}
                    <span>{t.fullName}</span>
                    {t.role !== 'Tổ viên' && (
                      <span className="text-[10px] font-bold text-indigo-600">({t.role})</span>
                    )}
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
