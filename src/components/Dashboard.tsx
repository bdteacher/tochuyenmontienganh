import React, { useState } from 'react';
import {
  Users,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  FileText,
  UserCheck,
  HardDrive,
  Camera,
  FileUp,
} from 'lucide-react';
import { Teacher, MeetingMinute, LessonObservation, SubstituteTeaching, LessonPlanReview, DepartmentSetting, MonthlyPlan, TeacherReport, WeeklySchedulePlan } from '../types';
import { initialMonthlyPlan, initialWeeklySchedule } from '../data/initialData';
import { TabType } from './NavigationTabs';
import { TeacherScheduleCard } from './TeacherScheduleCard';
import { AvatarUploadModal } from './AvatarUploadModal';
import { MonthlyTaskCard } from './MonthlyTaskCard';
import { MonthlyProgressTracker } from './MonthlyProgressTracker';
import { TeacherQualificationChart } from './TeacherQualificationChart';
import { PartyStructureBarChart } from './PartyStructureBarChart';
import { WeeklyScheduleCard } from './WeeklyScheduleCard';

interface DashboardProps {
  settings: DepartmentSetting;
  teachers: Teacher[];
  meetings: MeetingMinute[];
  observations: LessonObservation[];
  substitutes: SubstituteTeaching[];
  lessonPlans: LessonPlanReview[];
  reports?: TeacherReport[];
  monthlyPlan?: MonthlyPlan;
  onUpdateMonthlyPlan?: (updated: MonthlyPlan) => void;
  weeklySchedule?: WeeklySchedulePlan;
  onUpdateWeeklySchedule?: (updated: WeeklySchedulePlan) => void;
  onNavigate: (tab: TabType) => void;
  onOpenNewMeeting: () => void;
  onOpenNewObservation: () => void;
  onOpenNewSubstitute: () => void;
  onUpdateTeacher?: (updated: Teacher) => void;
  onOpenRequestModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  settings,
  teachers,
  meetings,
  observations,
  substitutes,
  lessonPlans,
  reports = [],
  monthlyPlan,
  onUpdateMonthlyPlan,
  weeklySchedule,
  onUpdateWeeklySchedule,
  onNavigate,
  onOpenNewMeeting,
  onOpenNewObservation,
  onOpenNewSubstitute,
  onUpdateTeacher,
  onOpenRequestModal,
}) => {
  const [avatarModalTeacher, setAvatarModalTeacher] = useState<Teacher | null>(null);

  const headTeacher = teachers.find((t) => t.role === 'Tổ trưởng') || teachers[0];
  const deputyHeadTeacher = teachers.find((t) => t.role === 'Tổ phó') || teachers[1];
  const memberTeachers = teachers.filter((t) => t.role === 'Tổ viên');

  const handleSaveAvatar = (teacherId: string, avatarUrl: string | undefined) => {
    const t = teachers.find((item) => item.id === teacherId);
    if (t && onUpdateTeacher) {
      onUpdateTeacher({ ...t, avatarUrl });
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    return parts[parts.length - 1]?.slice(0, 1) || 'GV';
  };

  const totalPeriodsPerWeek = teachers.reduce((sum, t) => sum + t.teachingPeriodsPerWeek, 0);
  const totalStandardQuota = teachers.reduce((sum, t) => sum + t.standardQuota, 0);
  const reviewedPlansCount = lessonPlans.filter((lp) => lp.status === 'Đã ký duyệt').length;
  const reviewedPercentage = Math.round((reviewedPlansCount / (lessonPlans.length || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-blue-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Sparkles className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-amber-300 text-xs font-semibold backdrop-blur-xs mb-3 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5" />
            Hệ thống Quản lý Chuyên môn Trường THCS Nguyễn Du (Điểm chính &amp; Phân hiệu)
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Chào mừng đến với {settings.departmentName}
          </h2>
          <p className="mt-2 text-indigo-100 text-sm leading-relaxed">
            Năm học {settings.schoolYear} • Quản lý toàn diện nhân sự 10 giáo viên tại cả 2 cơ sở, lịch công tác tuần, phân công chuyên môn 4 khối lớp (6, 7, 8, 9), hồ sơ kế hoạch bài dạy và dự giờ thao giảng.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={onOpenNewObservation}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Phiếu Dự Giờ</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <FileUp className="w-4 h-4" />
              <span>Nộp Báo Cáo GV</span>
            </button>
            <button
              onClick={onOpenNewSubstitute}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition"
            >
              <PlusCircle className="w-4 h-4 text-sky-200" />
              <span>Đăng Ký Dạy Thay</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Teachers */}
        <div
          onClick={() => onNavigate('teachers')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Quy mô nhân sự &amp; Đảng viên</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{teachers.length}</span>
            <span className="text-xs font-medium text-emerald-600">GV (9 ĐH • 1 ThS)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="font-bold text-rose-600">
              🚩 {teachers.filter((t) => t.isPartyMember !== false).length} Đảng viên •{' '}
              {teachers.filter((t) => t.isPartyMember === false).length} Quần chúng
            </span>
            <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition">
              Chi tiết →
            </span>
          </div>
        </div>

        {/* Card 2: Teaching Periods */}
        <div
          onClick={() => onNavigate('assignments')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng tiết giảng dạy/tuần</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalPeriodsPerWeek}</span>
            <span className="text-xs font-medium text-slate-500">/ {totalStandardQuota} tiết định mức</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-emerald-600 font-medium">Bình quân {(totalPeriodsPerWeek / (teachers.length || 1)).toFixed(1)} tiết/GV</span>
            <span className="text-sky-600 font-semibold group-hover:translate-x-0.5 transition">
              Chi tiết →
            </span>
          </div>
        </div>

        {/* Card 3: Observations */}
        <div
          onClick={() => onNavigate('observations')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Dự giờ &amp; Thao giảng</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{observations.length}</span>
            <span className="text-xs font-medium text-amber-600">tiết đã đánh giá</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Chuẩn CV 5555/BGDĐT</span>
            <span className="text-amber-600 font-semibold group-hover:translate-x-0.5 transition">
              Xem sổ →
            </span>
          </div>
        </div>

        {/* Card 4: Lesson Plan Audit */}
        <div
          onClick={() => onNavigate('lessonPlans')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Duyệt giáo án (KHBĐ)</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{reviewedPercentage}%</span>
            <span className="text-xs font-medium text-purple-600">({reviewedPlansCount}/{lessonPlans.length} GV)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Kiểm tra 2 cơ sở</span>
            <span className="text-purple-600 font-semibold group-hover:translate-x-0.5 transition">
              Kiểm tra →
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Structure of 10 Teachers & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Structure of 10 Teachers & Key Tasks (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Lịch Công Tác Tuần Tổ Chuyên Môn */}
          <WeeklyScheduleCard
            weeklySchedule={weeklySchedule || initialWeeklySchedule}
            onUpdateWeeklySchedule={onUpdateWeeklySchedule || (() => {})}
            teachers={teachers}
          />

          {/* Bảng Theo Dõi Tiến Độ Công Việc Hàng Tháng (Monthly Progress Tracker) */}
          <MonthlyProgressTracker
            monthlyPlan={monthlyPlan || initialMonthlyPlan}
            onUpdateMonthlyPlan={onUpdateMonthlyPlan || (() => {})}
            teachers={teachers}
            onOpenRequestModal={onOpenRequestModal}
          />

          {/* Nhiệm Vụ Trọng Tâm Tháng */}
          <MonthlyTaskCard
            monthlyPlan={monthlyPlan || initialMonthlyPlan}
            onUpdateMonthlyPlan={onUpdateMonthlyPlan || (() => {})}
            teachers={teachers}
            onOpenRequestModal={onOpenRequestModal}
          />

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  Cơ Cấu Ban Lãnh Đạo &amp; 8 Tổ Viên ({settings.departmentName})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phân công nhiệm vụ 10 thành viên tại Điểm trường chính &amp; Điểm Phân hiệu • Nhấp ảnh để đổi avatar
                </p>
              </div>
              <button
                onClick={() => onNavigate('teachers')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                Tất cả 10 giáo viên <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Leadership Duo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {/* Tổ Trưởng */}
              {headTeacher && (
                <div
                  onClick={() => onNavigate('teachers')}
                  className="p-4 rounded-xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/50 to-orange-50/30 hover:border-amber-400 transition cursor-pointer relative"
                >
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                    1. Tổ Trưởng
                  </span>
                  <div className="flex items-center gap-3">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setAvatarModalTeacher(headTeacher);
                      }}
                      className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-400 bg-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-sm relative group/av shrink-0 cursor-pointer hover:ring-2 hover:ring-amber-400 transition"
                      title="Bấm để chèn / đổi ảnh đại diện (avatar)"
                    >
                      {headTeacher.avatarUrl ? (
                        <img
                          src={headTeacher.avatarUrl}
                          alt={headTeacher.fullName}
                          className="w-full h-full object-cover group-hover/av:scale-105 transition"
                        />
                      ) : (
                        getInitials(headTeacher.fullName)
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/av:opacity-100 flex flex-col items-center justify-center text-white text-[8px] font-bold transition">
                        <Camera className="w-3.5 h-3.5 mb-0.5" />
                        <span>Chèn ảnh</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 flex-wrap">
                        <span>{headTeacher.fullName}</span>
                        {headTeacher.isPartyMember !== false ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-bold">
                            🚩 Đảng viên
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                            Quần chúng
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-amber-900 font-semibold">
                        Trình độ: {headTeacher.degree}
                      </p>
                      {headTeacher.campusOrGroup && (
                        <p className="text-[11px] text-amber-800 font-medium">
                          ({headTeacher.campusOrGroup})
                        </p>
                      )}
                    </div>
                  </div>
                  <ul className="mt-3 text-[11px] text-slate-700 space-y-1 leading-relaxed">
                    {headTeacher.additionalTasks.map((task, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tổ Phó */}
              {deputyHeadTeacher && (
                <div
                  onClick={() => onNavigate('teachers')}
                  className="p-4 rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/40 to-sky-50/30 hover:border-indigo-300 transition cursor-pointer relative"
                >
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                    2. Tổ Phó
                  </span>
                  <div className="flex items-center gap-3">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setAvatarModalTeacher(deputyHeadTeacher);
                      }}
                      className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-indigo-400 bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm relative group/av shrink-0 cursor-pointer hover:ring-2 hover:ring-indigo-400 transition"
                      title="Bấm để chèn / đổi ảnh đại diện (avatar)"
                    >
                      {deputyHeadTeacher.avatarUrl ? (
                        <img
                          src={deputyHeadTeacher.avatarUrl}
                          alt={deputyHeadTeacher.fullName}
                          className="w-full h-full object-cover group-hover/av:scale-105 transition"
                        />
                      ) : (
                        getInitials(deputyHeadTeacher.fullName)
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/av:opacity-100 flex flex-col items-center justify-center text-white text-[8px] font-bold transition">
                        <Camera className="w-3.5 h-3.5 mb-0.5" />
                        <span>Chèn ảnh</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 flex-wrap">
                        <span>{deputyHeadTeacher.fullName}</span>
                        {deputyHeadTeacher.isPartyMember !== false ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-bold">
                            🚩 Đảng viên
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                            Chưa vào Đảng
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-indigo-900 font-semibold">
                        Trình độ: {deputyHeadTeacher.degree}
                      </p>
                      {deputyHeadTeacher.campusOrGroup && (
                        <p className="text-[11px] text-indigo-700 font-medium">
                          ({deputyHeadTeacher.campusOrGroup})
                        </p>
                      )}
                    </div>
                  </div>
                  <ul className="mt-3 text-[11px] text-slate-700 space-y-1 leading-relaxed">
                    {deputyHeadTeacher.additionalTasks.map((task, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 8 Members Preview */}
            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>8 Giáo Viên Tổ Viên (8/10 GV toàn tổ là Đảng viên)</span>
                <span className="text-[11px] text-slate-500 font-normal">Bấm vào thẻ giáo viên để xem chi tiết • Bấm avatar để đổi ảnh</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {memberTeachers.map((t, index) => (
                  <div
                    key={t.id}
                    onClick={() => onNavigate('teachers')}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-200 transition cursor-pointer text-left flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setAvatarModalTeacher(t);
                            }}
                            className="w-9 h-9 rounded-xl overflow-hidden border border-slate-300 bg-slate-200 text-slate-700 font-semibold flex items-center justify-center text-xs shrink-0 relative group/mav cursor-pointer hover:ring-2 hover:ring-indigo-400 transition"
                            title="Bấm để chèn / đổi avatar"
                          >
                            {t.avatarUrl ? (
                              <img
                                src={t.avatarUrl}
                                alt={t.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              getInitials(t.fullName)
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/mav:opacity-100 flex items-center justify-center text-white transition">
                              <Camera className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                              <span>
                                {index + 3}. {t.fullName}
                              </span>
                              {t.isPartyMember !== false ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-bold">
                                  🚩 Đảng viên
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 border border-slate-300 font-semibold">
                                  Chưa vào Đảng
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-600 font-medium">
                              Trình độ: <strong>{t.degree}</strong> • {t.role}
                            </div>
                          </div>
                        </div>
                      </div>

                      {t.campusOrGroup && (
                        <div className="mt-1.5 inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-100 text-[10px] font-bold">
                          {t.campusOrGroup}
                        </div>
                      )}

                      <ul className="mt-2 space-y-1 text-[11px] text-slate-600 leading-snug">
                        {t.additionalTasks.map((task, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-1">
                            <span className="text-indigo-500 font-bold">•</span>
                            <span className="line-clamp-2">{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Biểu Đồ Cột (Recharts Bar Chart) Số Lượng Đảng Viên & GV Chưa Là Đảng Viên */}
          <PartyStructureBarChart
            teachers={teachers}
            onNavigateTeachers={() => onNavigate('teachers')}
          />

          {/* Biểu Đồ Tròn (Recharts Pie Chart) Phân Bổ Trình Độ Chuyên Môn 10 Giáo Viên */}
          <TeacherQualificationChart
            teachers={teachers}
            onNavigateTeachers={() => onNavigate('teachers')}
          />

          {/* Teaching Load Distribution vs Standard Quota */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-sky-600" />
                  Định Mức Giảng Dạy Của 10 Giáo Viên (Thông tư 28/2009/TT-BGDĐT)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Định mức cơ bản 19 tiết (TT giảm 3, TP giảm 1, GVCN giảm 4, Quản trị mạng giảm 3)
                </p>
              </div>
              <button
                onClick={() => onNavigate('assignments')}
                className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
              >
                Chi tiết bảng phân công <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {teachers.map((teacher) => {
                const percentage = Math.min(100, Math.round((teacher.teachingPeriodsPerWeek / teacher.standardQuota) * 100));
                const diff = teacher.teachingPeriodsPerWeek - teacher.standardQuota;
                return (
                  <div key={teacher.id} className="text-xs flex items-center gap-3">
                    <div className="w-36 font-medium text-slate-800 truncate">
                      {teacher.fullName}
                      {teacher.role === 'Tổ trưởng' && ' (TT)'}
                      {teacher.role === 'Tổ phó' && ' (TP)'}
                    </div>
                    <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          diff === 0
                            ? 'bg-emerald-500'
                            : diff > 0
                            ? 'bg-amber-500'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-24 text-right font-medium text-slate-700">
                      {teacher.teachingPeriodsPerWeek} / {teacher.standardQuota} tiết
                      {diff > 0 && <span className="text-amber-600 text-[10px] ml-1">(+{diff})</span>}
                      {diff < 0 && <span className="text-blue-600 text-[10px] ml-1">({diff})</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Teacher Reports, Substitutions, Drive & Schedule */}
        <div className="space-y-4">
          {/* Mục Nộp Báo Cáo Của Giáo Viên */}
          <div className="bg-white rounded-2xl border border-emerald-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <FileUp className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Nộp Báo Cáo Của Giáo Viên
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Đã nộp {reports.length} báo cáo chuyên môn
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('reports')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs"
              >
                <span>Mở &amp; Nộp</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {reports.slice(0, 3).map((rep) => {
                const repTeacher = teachers.find((t) => t.id === rep.teacherId);
                return (
                  <div
                    key={rep.id}
                    onClick={() => onNavigate('reports')}
                    className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-emerald-50/50 hover:border-emerald-200 transition cursor-pointer text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                      <span className="font-bold text-indigo-700">{repTeacher?.fullName}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          rep.status === 'Đã duyệt'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {rep.status}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 line-clamp-1">{rep.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between">
                      <span>{rep.category}</span>
                      <span>{rep.submissionDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Substitutions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                Lịch Dạy Thay Sắp Tới
              </h3>
              <button
                onClick={() => onNavigate('substitutes')}
                className="text-xs text-amber-600 hover:text-amber-800 font-semibold"
              >
                Quản lý ({substitutes.length})
              </button>
            </div>

            <div className="space-y-2">
              {substitutes.slice(0, 3).map((sub) => {
                const absentTeacher = teachers.find((t) => t.id === sub.absentTeacherId);
                const subTeacher = teachers.find((t) => t.id === sub.substituteTeacherId);
                return (
                  <div key={sub.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex justify-between items-center text-slate-500 text-[11px] mb-1">
                      <span>{sub.date} • Tiết {sub.period} ({sub.className})</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 font-medium">
                        {sub.status}
                      </span>
                    </div>
                    <div className="font-medium text-slate-800">
                      <span className="text-red-700">{absentTeacher?.fullName}</span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span className="text-emerald-700 font-bold">{subTeacher?.fullName} (dạy thay)</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-1 truncate">
                      Lý do: {sub.reason}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Google Drive Integration Quick Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 shadow-xs text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs transition-all duration-300 ease-in-out px-2 py-0.5 -mx-2 -my-0.5 rounded-md hover:bg-blue-100/70 hover:shadow-xs hover:text-blue-900 cursor-pointer inline-block">
                    Kho Google Drive Tổ
                  </h4>
                  <p className="text-[11px] text-slate-500">Đồng bộ đám mây an toàn</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('drive')}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] flex items-center gap-1 transition shadow-xs hover:shadow-sm"
              >
                <span>Mở Drive</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Lưu trữ kế hoạch bài dạy (KHBĐ), biên bản sinh hoạt tổ và sao lưu toàn bộ dữ liệu 10 giáo viên lên Google Drive.
            </p>
          </div>

          {/* Teacher Schedule (Thời khóa biểu giáo viên) */}
          <TeacherScheduleCard settings={settings} />
        </div>
      </div>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={Boolean(avatarModalTeacher)}
        onClose={() => setAvatarModalTeacher(null)}
        teacher={avatarModalTeacher}
        onSaveAvatar={handleSaveAvatar}
      />
    </div>
  );
};
