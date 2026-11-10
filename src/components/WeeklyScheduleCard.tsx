import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Users,
  Star,
  CheckCircle2,
  PlayCircle,
  Circle,
  Edit3,
  Trash2,
  Sparkles,
  X,
  Save,
  Filter,
  BellRing,
} from 'lucide-react';
import {
  WeeklySchedulePlan,
  WeeklyScheduleEvent,
  WeeklyEventCategory,
  Teacher,
} from '../types';
import { useAuthRole } from '../context/AuthRoleContext';
import { useToast } from '../context/ToastContext';

interface WeeklyScheduleCardProps {
  weeklySchedule: WeeklySchedulePlan;
  onUpdateWeeklySchedule: (updated: WeeklySchedulePlan) => void;
  teachers: Teacher[];
}

const DAYS_OF_WEEK: WeeklyScheduleEvent['dayOfWeek'][] = [
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
  'Chủ Nhật',
];

const EVENT_CATEGORIES: WeeklyEventCategory[] = [
  'Họp & SHCM',
  'Kiểm tra hồ sơ',
  'Dự giờ - Thao giảng',
  'Bồi dưỡng HSG & CLB',
  'Thi & Kiểm tra định kỳ',
  'Ngoại khóa & Công đoàn',
];

const QUICK_TEMPLATES: {
  label: string;
  dayOfWeek: WeeklyScheduleEvent['dayOfWeek'];
  timeSlot: string;
  title: string;
  category: WeeklyEventCategory;
  location: string;
  assignee: string;
  isImportant: boolean;
  notes: string;
}[] = [
  {
    label: 'Kiểm tra hồ sơ 2 cơ sở',
    dayOfWeek: 'Thứ Ba',
    timeSlot: '08:00 - 11:00',
    title: 'Kiểm tra hồ sơ sổ sách, Kế hoạch bài dạy (KHBĐ) tại Điểm chính & Phân hiệu',
    category: 'Kiểm tra hồ sơ',
    location: 'Điểm trường chính & Điểm Phân hiệu Nguyễn Du',
    assignee: 'Thầy Bùi Hưng Đức (05 GV trường chính) & Cô Phạm Thị Ngọc Loan (05 GV phân hiệu)',
    isImportant: true,
    notes: 'Kiểm tra định kỳ hồ sơ sổ sách và kế hoạch bài dạy của 10 GV tại cả 2 cơ sở.',
  },
  {
    label: 'Họp Nhóm trưởng 4 khối',
    dayOfWeek: 'Thứ Năm',
    timeSlot: '14:00 - 16:00',
    title: 'Họp Nhóm trưởng chuyên môn Khối 6, 7, 8, 9 thống nhất ma trận & thẩm định đề',
    category: 'Thi & Kiểm tra định kỳ',
    location: 'Văn phòng Tổ Tiếng Anh - Điểm trường chính',
    assignee: 'Cô Phương Hạnh (K9), Cô Hồng Nhung (K8), Cô Như An (K7), Cô Bích Trâm (K6)',
    isImportant: true,
    notes: 'Rà soát ngân hàng câu hỏi phân hóa và thẩm định chất lượng đề kiểm tra.',
  },
  {
    label: 'Sinh hoạt CLB Tiếng Anh',
    dayOfWeek: 'Thứ Hai',
    timeSlot: '07:00 - 07:45',
    title: 'Sinh hoạt CLB Tiếng Anh (English Club) & Phát thanh song ngữ dưới cờ',
    category: 'Bồi dưỡng HSG & CLB',
    location: 'Cả 2 cơ sở THCS Nguyễn Du',
    assignee: 'Cô Trịnh Thị Hiền (Chủ nhiệm CLB Tiếng Anh)',
    isImportant: false,
    notes: 'Tổ chức phát thanh tiếng Anh và giao lưu văn nghệ song ngữ cho học sinh 2 cơ sở.',
  },
  {
    label: 'Hậu cần English Festival',
    dayOfWeek: 'Thứ Sáu',
    timeSlot: '15:00 - 17:00',
    title: 'Họp Công đoàn bộ phận & Chuẩn bị hậu cần Ngày hội Tiếng Anh (English Festival)',
    category: 'Ngoại khóa & Công đoàn',
    location: 'Phòng Hội đồng Sư phạm',
    assignee: 'Cô Trần Thị Diệu Hiền & Cô Trần Thị Thu Hường (Đời sống - Nữ công)',
    isImportant: false,
    notes: 'Chuẩn bị khánh tiết, quà tặng, tiệc giao lưu và chăm lo đời sống công đoàn viên.',
  },
];

export const WeeklyScheduleCard: React.FC<WeeklyScheduleCardProps> = ({
  weeklySchedule,
  onUpdateWeeklySchedule,
  teachers,
}) => {
  const { isHead } = useAuthRole();
  const toast = useToast();

  const [dayFilter, setDayFilter] = useState<string>('ALL');
  const [onlyImportant, setOnlyImportant] = useState(false);

  // Week metadata editing state
  const [isEditingWeekMeta, setIsEditingWeekMeta] = useState(false);
  const [weekNumberInput, setWeekNumberInput] = useState(weeklySchedule.weekNumber);
  const [dateRangeInput, setDateRangeInput] = useState(weeklySchedule.dateRange);
  const [focusNoteInput, setFocusNoteInput] = useState(weeklySchedule.focusNote);

  // Add / Edit Milestone Modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState<WeeklyScheduleEvent['dayOfWeek']>('Thứ Hai');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('14:00 - 16:30');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WeeklyEventCategory>('Họp & SHCM');
  const [location, setLocation] = useState('Điểm trường chính Nguyễn Du');
  const [assignee, setAssignee] = useState('Toàn tổ (10 GV)');
  const [isImportant, setIsImportant] = useState(true);
  const [status, setStatus] = useState<WeeklyScheduleEvent['status']>('Sắp diễn ra');
  const [notes, setNotes] = useState('');

  const events = weeklySchedule.events || [];

  const filteredEvents = events.filter((ev) => {
    const matchesDay = dayFilter === 'ALL' || ev.dayOfWeek === dayFilter;
    const matchesImp = !onlyImportant || ev.isImportant;
    return matchesDay && matchesImp;
  });

  const importantCount = events.filter((e) => e.isImportant).length;
  const upcomingImportantEvents = events.filter(
    (e) => e.isImportant && e.status !== 'Đã hoàn thành'
  );
  const completedCount = events.filter((e) => e.status === 'Đã hoàn thành').length;
  const hasAutoRemindedRef = useRef(false);

  const triggerWeeklyReminderToasts = useCallback(
    (isAuto = false) => {
      const pendingImportant = (weeklySchedule.events || []).filter(
        (e) => e.isImportant && e.status !== 'Đã hoàn thành'
      );

      if (pendingImportant.length === 0) {
        if (!isAuto) {
          toast.success(
            `Tất cả các mốc quan trọng của Tuần ${weeklySchedule.weekNumber} đã hoàn thành!`,
            `🔔 Nhắc lịch Tuần ${weeklySchedule.weekNumber}`
          );
        }
        return;
      }

      if (isAuto) {
        const previewText = pendingImportant
          .slice(0, 2)
          .map((ev) => `• ${ev.dayOfWeek} (${ev.timeSlot}): ${ev.title}`)
          .join(' ');
        const moreText =
          pendingImportant.length > 2
            ? ` (+${pendingImportant.length - 2} mốc quan trọng khác)`
            : '';

        toast.showToast(
          `Tuần ${weeklySchedule.weekNumber} có ${pendingImportant.length} mốc công tác quan trọng sắp tới: ${previewText}${moreText}`,
          'warning',
          `🔔 Nhắc lịch công tác Tuần ${weeklySchedule.weekNumber}`,
          6500
        );
      } else {
        pendingImportant.slice(0, 4).forEach((ev, idx) => {
          setTimeout(() => {
            toast.showToast(
              `${ev.title} • Phụ trách: ${ev.assignee} • Địa điểm: ${ev.location}`,
              'warning',
              `🔔 [${ev.dayOfWeek} • ${ev.timeSlot}] Mốc quan trọng`,
              5500
            );
          }, idx * 250);
        });
      }
    },
    [weeklySchedule.events, weeklySchedule.weekNumber, toast]
  );

  // Tự động hiển thị thông báo (Toast) nhắc nhở các mốc quan trọng sắp tới khi vào Dashboard
  useEffect(() => {
    if (hasAutoRemindedRef.current) return;
    hasAutoRemindedRef.current = true;
    const timer = setTimeout(() => {
      triggerWeeklyReminderToasts(true);
    }, 600);
    return () => clearTimeout(timer);
  }, [triggerWeeklyReminderToasts]);

  const handleNotifySingleEvent = (ev: WeeklyScheduleEvent) => {
    toast.showToast(
      `${ev.title} • Phụ trách: ${ev.assignee} • Địa điểm: ${ev.location}`,
      ev.isImportant ? 'warning' : 'info',
      `🔔 Nhắc lịch: ${ev.dayOfWeek} (${ev.timeSlot})`,
      5000
    );
  };

  const getCategoryStyle = (cat: WeeklyEventCategory) => {
    switch (cat) {
      case 'Họp & SHCM':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Kiểm tra hồ sơ':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Dự giờ - Thao giảng':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Bồi dưỡng HSG & CLB':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Thi & Kiểm tra định kỳ':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Ngoại khóa & Công đoàn':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getDayBadgeColor = (day: WeeklyScheduleEvent['dayOfWeek']) => {
    switch (day) {
      case 'Thứ Hai':
        return 'bg-blue-600 text-white';
      case 'Thứ Ba':
        return 'bg-indigo-600 text-white';
      case 'Thứ Tư':
        return 'bg-emerald-600 text-white';
      case 'Thứ Năm':
        return 'bg-violet-600 text-white';
      case 'Thứ Sáu':
        return 'bg-amber-600 text-white';
      case 'Thứ Bảy':
        return 'bg-rose-600 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  const openAddModal = () => {
    setEditingEventId(null);
    setDayOfWeek('Thứ Năm');
    setDate(new Date().toLocaleDateString('vi-VN'));
    setTimeSlot('14:00 - 16:30');
    setTitle('');
    setCategory('Họp & SHCM');
    setLocation('Điểm trường chính Nguyễn Du');
    setAssignee('Thầy Bùi Hưng Đức (TT) & Toàn tổ');
    setIsImportant(true);
    setStatus('Sắp diễn ra');
    setNotes('');
    setIsEventModalOpen(true);
  };

  const openEditModal = (ev: WeeklyScheduleEvent) => {
    setEditingEventId(ev.id);
    setDayOfWeek(ev.dayOfWeek);
    setDate(ev.date);
    setTimeSlot(ev.timeSlot);
    setTitle(ev.title);
    setCategory(ev.category);
    setLocation(ev.location);
    setAssignee(ev.assignee);
    setIsImportant(ev.isImportant);
    setStatus(ev.status);
    setNotes(ev.notes || '');
    setIsEventModalOpen(true);
  };

  const handleSaveWeekMeta = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWeeklySchedule({
      ...weeklySchedule,
      weekNumber: Number(weekNumberInput) || 1,
      dateRange: dateRangeInput.trim() || weeklySchedule.dateRange,
      focusNote: focusNoteInput.trim(),
      updatedAt: new Date().toISOString(),
    });
    setIsEditingWeekMeta(false);
    toast.success(`Đã cập nhật thông tin Lịch công tác Tuần ${weekNumberInput}!`, 'Lịch công tác tuần');
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warning('Vui lòng nhập nội dung mốc thời gian công tác tuần.', 'Thiếu thông tin');
      return;
    }

    const payload: WeeklyScheduleEvent = {
      id: editingEventId || `wk-${Date.now()}`,
      dayOfWeek,
      date: date.trim() || dayOfWeek,
      timeSlot: timeSlot.trim() || 'Trong ngày',
      title: title.trim(),
      category,
      location: location.trim() || 'Trường THCS Nguyễn Du',
      assignee: assignee.trim() || 'Toàn tổ',
      isImportant,
      status,
      notes: notes.trim() || undefined,
    };

    const nextEvents = editingEventId
      ? events.map((item) => (item.id === editingEventId ? payload : item))
      : [...events, payload];

    // Sort by day of week order
    const sortedEvents = [...nextEvents].sort(
      (a, b) => DAYS_OF_WEEK.indexOf(a.dayOfWeek) - DAYS_OF_WEEK.indexOf(b.dayOfWeek)
    );

    onUpdateWeeklySchedule({
      ...weeklySchedule,
      events: sortedEvents,
      updatedAt: new Date().toISOString(),
    });

    setIsEventModalOpen(false);
    toast.success(
      editingEventId
        ? 'Đã cập nhật mốc công tác tuần!'
        : 'Đã thêm mốc thời gian mới vào Lịch công tác tuần!',
      'Lịch công tác tuần'
    );
  };

  const handleCycleStatus = (ev: WeeklyScheduleEvent) => {
    const order: WeeklyScheduleEvent['status'][] = [
      'Sắp diễn ra',
      'Đang thực hiện',
      'Đã hoàn thành',
    ];
    const nextStatus = order[(order.indexOf(ev.status) + 1) % order.length];
    const updatedEvents = events.map((item) =>
      item.id === ev.id ? { ...item, status: nextStatus } : item
    );
    onUpdateWeeklySchedule({
      ...weeklySchedule,
      events: updatedEvents,
      updatedAt: new Date().toISOString(),
    });
    toast.info(`Đã chuyển trạng thái "${ev.title}" → ${nextStatus}`, 'Tiến độ lịch tuần');
  };

  const handleToggleImportant = (ev: WeeklyScheduleEvent) => {
    const updatedEvents = events.map((item) =>
      item.id === ev.id ? { ...item, isImportant: !item.isImportant } : item
    );
    onUpdateWeeklySchedule({
      ...weeklySchedule,
      events: updatedEvents,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteEvent = (ev: WeeklyScheduleEvent) => {
    const updatedEvents = events.filter((item) => item.id !== ev.id);
    onUpdateWeeklySchedule({
      ...weeklySchedule,
      events: updatedEvents,
      updatedAt: new Date().toISOString(),
    });
    toast.info(`Đã xóa mốc công tác "${ev.title}"`, 'Xóa lịch công tác');
  };

  return (
    <div className="bg-white rounded-2xl border border-indigo-200/90 shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 px-5 py-4 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  Lịch Công Tác Tuần Tổ Chuyên Môn
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400 text-slate-950 shadow-2xs">
                  Tuần {weeklySchedule.weekNumber} ({weeklySchedule.dateRange})
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
                {weeklySchedule.focusNote}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => triggerWeeklyReminderToasts(false)}
              className="px-3 py-1.5 rounded-xl bg-rose-500/90 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 border border-rose-300/40 shadow-xs transition active:scale-95"
              title="Hiển thị thông báo (Toast) nhắc nhở các mốc công tác quan trọng sắp tới trong tuần"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
              <span>Báo Nhắc Lịch ({upcomingImportantEvents.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setWeekNumberInput(weeklySchedule.weekNumber);
                setDateRangeInput(weeklySchedule.dateRange);
                setFocusNoteInput(weeklySchedule.focusNote);
                setIsEditingWeekMeta(!isEditingWeekMeta);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/15 transition"
              title="Đổi số tuần, khoảng thời gian và ghi chú trọng tâm tuần"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span>Sửa Tuần</span>
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Mốc Thời Gian</span>
            </button>
          </div>
        </div>

        {/* Inline Edit Week Metadata Form */}
        {isEditingWeekMeta && (
          <form
            onSubmit={handleSaveWeekMeta}
            className="mt-4 pt-3 border-t border-white/15 grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs"
          >
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-indigo-200 mb-1">
                Tuần thứ
              </label>
              <input
                type="number"
                min={1}
                max={52}
                value={weekNumberInput}
                onChange={(e) => setWeekNumberInput(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white/95 text-slate-900 font-bold focus:outline-none"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-[10px] font-bold uppercase text-indigo-200 mb-1">
                Từ ngày - Đến ngày
              </label>
              <input
                type="text"
                value={dateRangeInput}
                onChange={(e) => setDateRangeInput(e.target.value)}
                placeholder="VD: 19/10/2026 - 25/10/2026"
                className="w-full px-2.5 py-1.5 rounded-lg bg-white/95 text-slate-900 font-semibold focus:outline-none"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-[10px] font-bold uppercase text-indigo-200 mb-1">
                Trọng tâm công tác tuần
              </label>
              <input
                type="text"
                value={focusNoteInput}
                onChange={(e) => setFocusNoteInput(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white/95 text-slate-900 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2 flex items-end gap-1.5">
              <button
                type="submit"
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold flex items-center justify-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditingWeekMeta(false)}
                className="py-1.5 px-2 rounded-lg bg-white/15 hover:bg-white/25 text-white"
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Filter & Summary Bar */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-0.5" />
          <button
            type="button"
            onClick={() => setDayFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
              dayFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Cả tuần ({events.length})
          </button>
          {DAYS_OF_WEEK.slice(0, 6).map((day) => {
            const count = events.filter((e) => e.dayOfWeek === day).length;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setDayFilter(day)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                  dayFilter === day
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {day} {count > 0 && <span className="opacity-75">({count})</span>}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setOnlyImportant(!onlyImportant)}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 border transition ${
              onlyImportant
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                onlyImportant ? 'text-amber-500 fill-amber-500' : 'text-amber-500'
              }`}
            />
            <span>Mốc quan trọng ({importantCount})</span>
          </button>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            Hoàn thành: {completedCount}/{events.length}
          </span>
        </div>
      </div>

      {/* Events Timeline List */}
      <div className="p-5 space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CalendarDays className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">
              Chưa có mốc công tác nào trong bộ lọc này.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-2.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm mốc thời gian ngay</span>
            </button>
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                ev.status === 'Đã hoàn thành'
                  ? 'bg-slate-50/70 border-slate-200/80 opacity-85'
                  : ev.isImportant
                  ? 'bg-gradient-to-r from-amber-50/50 via-white to-indigo-50/30 border-amber-300/90 shadow-2xs'
                  : 'bg-white border-slate-200/90 hover:border-indigo-200'
              }`}
            >
              {/* Left Day & Time Column */}
              <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:w-32 shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-2xs ${getDayBadgeColor(
                    ev.dayOfWeek
                  )}`}
                >
                  {ev.dayOfWeek}
                </span>
                <div className="text-[11px] text-slate-600 font-mono font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span>{ev.timeSlot}</span>
                </div>
                {ev.date && ev.date !== ev.dayOfWeek && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    Ngày: {ev.date}
                  </span>
                )}
              </div>

              {/* Center Content Column */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryStyle(
                      ev.category
                    )}`}
                  >
                    {ev.category}
                  </span>
                  {ev.isImportant && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      Mốc quan trọng
                    </span>
                  )}
                </div>

                <h4
                  className={`font-bold text-xs sm:text-sm leading-snug ${
                    ev.status === 'Đã hoàn thành'
                      ? 'line-through text-slate-500'
                      : 'text-slate-900'
                  }`}
                >
                  {ev.title}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate" title={ev.assignee}>
                      Phụ trách: <strong className="text-slate-800">{ev.assignee}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate" title={ev.location}>
                      Địa điểm: <strong className="text-slate-800">{ev.location}</strong>
                    </span>
                  </div>
                </div>

                {ev.notes && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 leading-relaxed">
                    {ev.notes}
                  </p>
                )}
              </div>

              {/* Right Actions & Status Column */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => handleCycleStatus(ev)}
                  title="Bấm để đổi trạng thái thực hiện"
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition ${
                    ev.status === 'Đã hoàn thành'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : ev.status === 'Đang thực hiện'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {ev.status === 'Đã hoàn thành' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : ev.status === 'Đang thực hiện' ? (
                    <PlayCircle className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{ev.status}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleNotifySingleEvent(ev)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition"
                    title="Hiển thị thông báo (Toast) nhắc nhở mốc thời gian này"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleImportant(ev)}
                    className={`p-1.5 rounded-lg border transition ${
                      ev.isImportant
                        ? 'bg-amber-50 border-amber-200 text-amber-600'
                        : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500'
                    }`}
                    title="Đánh dấu / Bỏ đánh dấu mốc quan trọng"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${ev.isImportant ? 'fill-amber-500' : ''}`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(ev)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                    title="Chỉnh sửa mốc thời gian"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {isHead && (
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(ev)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                      title="Xóa mốc thời gian"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add / Edit Weekly Milestone */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full text-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-indigo-900 to-blue-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-base">
                    {editingEventId
                      ? 'Chỉnh Sửa Mốc Lịch Công Tác Tuần'
                      : 'Thêm Mốc Thời Gian Quan Trọng Trong Tuần'}
                  </h3>
                  <p className="text-[11px] text-indigo-200">
                    Tuần {weeklySchedule.weekNumber} ({weeklySchedule.dateRange}) • Tổ Tiếng Anh
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 space-y-4 overflow-y-auto text-xs">
              {/* Quick Fill Templates */}
              {!editingEventId && (
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1.5">
                  <div className="font-bold text-indigo-950 flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Chọn nhanh mẫu mốc công tác của Tổ Tiếng Anh:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_TEMPLATES.map((tpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setDayOfWeek(tpl.dayOfWeek);
                          setTimeSlot(tpl.timeSlot);
                          setTitle(tpl.title);
                          setCategory(tpl.category);
                          setLocation(tpl.location);
                          setAssignee(tpl.assignee);
                          setIsImportant(tpl.isImportant);
                          setNotes(tpl.notes);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-600 hover:text-white text-indigo-800 border border-indigo-200 font-semibold text-[11px] transition shadow-2xs"
                      >
                        + {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thứ trong tuần *</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) =>
                      setDayOfWeek(e.target.value as WeeklyScheduleEvent['dayOfWeek'])
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày cụ thể</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="VD: 20/10/2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khung giờ *</label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    placeholder="VD: 14:00 - 16:30"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên mốc thời gian / Công việc trong tuần *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Kiểm tra hồ sơ sổ sách 05 GV tại điểm trường chính Nguyễn Du..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân loại công tác</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as WeeklyEventCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Địa điểm / Cơ sở</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="VD: Điểm trường chính / Điểm Phân hiệu"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Giáo viên / Nhóm chuyên môn phụ trách
                </label>
                <input
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="VD: Thầy Bùi Hưng Đức (TT), Cô Phạm Thị Ngọc Loan (TP)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {teachers.slice(0, 6).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setAssignee((prev) =>
                          prev && !prev.includes(t.fullName)
                            ? `${prev}, ${t.fullName}`
                            : t.fullName
                        )
                      }
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 text-[10px] font-medium"
                    >
                      + {t.fullName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as WeeklyScheduleEvent['status'])
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Sắp diễn ra">Sắp diễn ra</option>
                    <option value="Đang thực hiện">Đang thực hiện</option>
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer mt-4 sm:mt-5">
                  <input
                    type="checkbox"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span className="font-bold text-amber-950 text-xs flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Đánh dấu là mốc quan trọng
                  </span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ghi chú chi tiết / Yêu cầu chuẩn bị
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú nội dung cần chuẩn bị, hồ sơ mang theo..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                >
                  {editingEventId ? 'Lưu cập nhật' : 'Thêm vào lịch tuần'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
