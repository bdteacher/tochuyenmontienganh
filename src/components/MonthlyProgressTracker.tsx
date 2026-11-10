import React, { useState, useMemo } from 'react';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Bell,
  Search,
  Check,
  ChevronDown,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  UserCheck,
  X,
  Save,
  Tag,
  Flame,
  FileCheck2,
} from 'lucide-react';
import { MonthlyPlan, MonthlyTaskItem, Teacher } from '../types';
import { useAuthRole } from '../context/AuthRoleContext';
import { useToast } from '../context/ToastContext';
import { MONTHLY_TEMPLATES } from './MonthlyTaskCard';

interface MonthlyProgressTrackerProps {
  monthlyPlan: MonthlyPlan;
  onUpdateMonthlyPlan: (updated: MonthlyPlan) => void;
  teachers: Teacher[];
  onOpenRequestModal?: () => void;
}

const CATEGORY_COLORS: Record<MonthlyTaskItem['category'], { bg: string; text: string; border: string }> = {
  'Hồ sơ 5512': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Dự giờ NCBH': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Kiểm tra KSCL': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Bồi dưỡng HSG': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Chuyển đổi số': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Chuyên môn': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
};

export const MonthlyProgressTracker: React.FC<MonthlyProgressTrackerProps> = ({
  monthlyPlan,
  onUpdateMonthlyPlan,
  teachers,
}) => {
  const { isHead } = useAuthRole();
  const toast = useToast();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'urgent' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<MonthlyTaskItem | null>(null);

  // New task form state
  const [newTaskForm, setNewTaskForm] = useState<Omit<MonthlyTaskItem, 'id'>>({
    title: '',
    category: 'Chuyên môn',
    deadline: 'Cuối tháng',
    assignee: 'Bùi Hưng Đức (TT) & Toàn tổ',
    status: 'Đang thực hiện',
    details: '',
  });

  // Calculate Stats
  const tasks = monthlyPlan.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Hoàn thành').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'Đang thực hiện').length;
  const notStartedTasks = tasks.filter((t) => t.status === 'Chưa bắt đầu').length;
  const pendingTasks = inProgressTasks + notStartedTasks; // Các việc còn tồn đọng
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (activeFilter === 'pending' && task.status === 'Hoàn thành') return false;
      if (activeFilter === 'completed' && task.status !== 'Hoàn thành') return false;
      if (activeFilter === 'urgent') {
        const isUrgent =
          task.status !== 'Hoàn thành' &&
          (task.deadline.toLowerCase().includes('tuần') ||
            task.deadline.toLowerCase().includes('thứ') ||
            task.deadline.includes('/') ||
            task.category === 'Hồ sơ 5512' ||
            task.category === 'Kiểm tra KSCL');
        if (!isUrgent) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchAssignee = task.assignee.toLowerCase().includes(q);
        const matchDetails = (task.details || '').toLowerCase().includes(q);
        const matchCategory = task.category.toLowerCase().includes(q);
        if (!matchTitle && !matchAssignee && !matchDetails && !matchCategory) return false;
      }

      return true;
    });
  }, [tasks, activeFilter, selectedCategory, searchQuery]);

  // One-click cycle task status for Tổ trưởng
  const handleCycleStatus = (taskId: string, currentStatus: MonthlyTaskItem['status']) => {
    const nextStatusMap: Record<MonthlyTaskItem['status'], MonthlyTaskItem['status']> = {
      'Chưa bắt đầu': 'Đang thực hiện',
      'Đang thực hiện': 'Hoàn thành',
      'Hoàn thành': 'Chưa bắt đầu',
    };
    const nextStatus = nextStatusMap[currentStatus];

    const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t));
    onUpdateMonthlyPlan({ ...monthlyPlan, tasks: updatedTasks, updatedAt: new Date().toISOString() });

    toast.success(
      `Đã chuyển trạng thái sang "${nextStatus}"`,
      nextStatus === 'Hoàn thành' ? 'Hoàn thành nhiệm vụ' : 'Cập nhật tiến độ'
    );
  };

  // Quick reminder button for Tổ trưởng
  const handleSendReminder = (task: MonthlyTaskItem) => {
    toast.info(
      `Đã gửi thông báo nhắc nhở tiến độ tới "${task.assignee}" cho đầu việc: "${task.title}". Hạn chót: ${task.deadline}.`,
      'Đôn đốc tiến độ công việc'
    );
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    if (!window.confirm('Thầy/Cô có chắc chắn muốn xóa đầu việc này khỏi bảng theo dõi?')) return;
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    onUpdateMonthlyPlan({ ...monthlyPlan, tasks: updatedTasks, updatedAt: new Date().toISOString() });
    toast.success('Đã xóa đầu việc khỏi bảng theo dõi tiến độ.', 'Thành công');
  };

  // Add new task
  const handleSaveNewTask = () => {
    if (!newTaskForm.title.trim()) {
      toast.warning('Vui lòng nhập tên đầu việc cần theo dõi.', 'Thiếu thông tin');
      return;
    }

    const newTask: MonthlyTaskItem = {
      id: `task-${Date.now()}`,
      ...newTaskForm,
    };

    const updatedTasks = [...tasks, newTask];
    onUpdateMonthlyPlan({ ...monthlyPlan, tasks: updatedTasks, updatedAt: new Date().toISOString() });
    setIsAddModalOpen(false);
    setNewTaskForm({
      title: '',
      category: 'Chuyên môn',
      deadline: 'Cuối tháng',
      assignee: 'Bùi Hưng Đức (TT) & Toàn tổ',
      status: 'Đang thực hiện',
      details: '',
    });
    toast.success('Đã thêm đầu việc mới vào bảng theo dõi tiến độ tháng.', 'Thành công');
  };

  // Save edit task
  const handleSaveEditTask = () => {
    if (!editingTask || !editingTask.title.trim()) return;

    const updatedTasks = tasks.map((t) => (t.id === editingTask.id ? editingTask : t));
    onUpdateMonthlyPlan({ ...monthlyPlan, tasks: updatedTasks, updatedAt: new Date().toISOString() });
    setEditingTask(null);
    toast.success('Đã lưu các thay đổi cho đầu việc.', 'Cập nhật thành công');
  };

  // Quick switch month
  const handleSwitchMonth = (m: number) => {
    const tpl = MONTHLY_TEMPLATES[m];
    if (!tpl) return;

    if (
      window.confirm(
        `Chuyển sang theo dõi tiến độ ${tpl.label}? Hệ thống sẽ nạp các đầu việc trọng tâm của tháng ${m}.`
      )
    ) {
      const generatedTasks: MonthlyTaskItem[] = tpl.tasks.map((t, idx) => ({
        id: `task-${m}-${Date.now()}-${idx}`,
        ...t,
      }));
      onUpdateMonthlyPlan({
        ...monthlyPlan,
        month: m,
        generalGoal: tpl.goal,
        tasks: generatedTasks,
        updatedAt: new Date().toISOString(),
      });
      toast.success(`Đã chuyển sang bảng theo dõi tiến độ Tháng ${m}.`, 'Thành công');
    }
  };

  // Print progress report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5 print:p-0 print:border-none print:shadow-none">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-xs">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                  Bảng Theo Dõi Tiến Độ Công Việc Hàng Tháng
                </h3>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Monthly Progress Tracker
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Công cụ dành riêng cho Tổ trưởng: Kiểm soát tiến độ, phát hiện việc tồn đọng và đôn đốc các giáo viên
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {/* Quick Month Switcher */}
          <div className="relative group">
            <button className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tháng {monthlyPlan.month} / {monthlyPlan.year}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 hidden group-hover:block z-30">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">Chọn tháng theo dõi</div>
              {[9, 10, 11, 12, 1, 2, 3, 4, 5].map((m) => (
                <button
                  key={m}
                  onClick={() => handleSwitchMonth(m)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                    monthlyPlan.month === m
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>Tháng {m}</span>
                  {monthlyPlan.month === m && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Add task button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Đầu Việc</span>
          </button>

          {/* Print button */}
          <button
            onClick={handlePrint}
            title="In báo cáo tiến độ công việc tháng"
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Total */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng đầu việc</span>
            <span className="w-7 h-7 rounded-lg bg-slate-200/80 text-slate-700 flex items-center justify-center text-xs font-bold">
              {totalTasks}
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalTasks} <span className="text-xs font-medium text-slate-500">việc</span></div>
          <div className="mt-1 text-[11px] text-slate-500">Kế hoạch Tháng {monthlyPlan.month}</div>
        </div>

        {/* Card 2: Completed */}
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Đã hoàn thành</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-200/70 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-800">
            {completedTasks} <span className="text-xs font-semibold text-emerald-600">({completionPercentage}%)</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-700">Đạt yêu cầu hồ sơ</div>
        </div>

        {/* Card 3: In Progress */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700">Đang thực hiện</span>
            <span className="w-7 h-7 rounded-lg bg-blue-200/70 text-blue-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-800">
            {inProgressTasks} <span className="text-xs font-semibold text-blue-600">việc</span>
          </div>
          <div className="mt-1 text-[11px] text-blue-700">Theo đúng tiến độ</div>
        </div>

        {/* Card 4: Pending / Overdue (Alert for Head of Dept) */}
        <div
          onClick={() => setActiveFilter(pendingTasks > 0 ? 'pending' : 'all')}
          className={`p-3.5 rounded-xl border transition cursor-pointer ${
            pendingTasks > 0
              ? 'bg-amber-50/90 border-amber-300 hover:border-amber-400 hover:bg-amber-100/60'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Việc còn tồn đọng
            </span>
            <span className="w-7 h-7 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center text-xs font-bold">
              {pendingTasks}
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-900">
            {pendingTasks} <span className="text-xs font-bold text-amber-700">cần xử lý</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-800 font-semibold flex items-center justify-between">
            <span>{notStartedTasks > 0 ? `${notStartedTasks} chưa bắt đầu` : 'Đang xử lý'}</span>
            <span className="text-amber-700 underline text-[10px]">Lọc ngay →</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Tiến độ hoàn thành nhiệm vụ Tháng {monthlyPlan.month}
          </span>
          <span className="font-extrabold text-indigo-700">
            {completedTasks}/{totalTasks} việc ({completionPercentage}%)
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              completionPercentage === 100
                ? 'bg-emerald-500'
                : completionPercentage >= 60
                ? 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                : 'bg-gradient-to-r from-amber-500 to-indigo-600'
            }`}
            style={{ width: `${Math.max(5, completionPercentage)}%` }}
          />
        </div>
      </div>

      {/* Alert Banner for Department Head if pending items exist */}
      {pendingTasks > 0 && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-amber-900 font-bold block sm:inline mr-1">
                Lưu ý dành cho Tổ trưởng:
              </strong>
              <span className="text-amber-800">
                Tổ Tiếng Anh hiện có <strong>{pendingTasks} đầu việc</strong> đang thực hiện hoặc tồn đọng trong Tháng {monthlyPlan.month}. Hãy đôn đốc giáo viên phụ trách để hoàn tất đúng quy chế.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveFilter('pending')}
              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition"
            >
              Xem {pendingTasks} việc tồn đọng
            </button>
            <button
              onClick={() => {
                toast.info(
                  `Đã gửi thông báo nhắc nhở nộp hồ sơ & thực hiện đúng hạn ${pendingTasks} việc tới toàn thể giáo viên Tổ Tiếng Anh.`,
                  'Đã phát thông báo đôn đốc'
                );
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-semibold text-xs transition"
            >
              Đôn đốc toàn tổ
            </button>
          </div>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 print:hidden">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({totalTasks})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
              activeFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-700 hover:bg-amber-100/60'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Tồn đọng ({pendingTasks})
          </button>
          <button
            onClick={() => setActiveFilter('urgent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
              activeFilter === 'urgent'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3 h-3 text-rose-500" />
            Gấp / Hạn tuần
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
              activeFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Đã xong ({completedTasks})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">Tất cả mảng chuyên môn</option>
            <option value="Hồ sơ 5512">Hồ sơ 5512 (KHBĐ)</option>
            <option value="Dự giờ NCBH">Dự giờ NCBH (CV 5555)</option>
            <option value="Kiểm tra KSCL">Kiểm tra KSCL & Đề thi</option>
            <option value="Bồi dưỡng HSG">Bồi dưỡng HSG</option>
            <option value="Chuyển đổi số">Chuyển đổi số & Drive</option>
            <option value="Chuyên môn">Chuyên môn chung</option>
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm đầu việc, GV..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* Main Monthly Progress Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
              <th className="py-3 px-3 w-10 text-center">STT</th>
              <th className="py-3 px-3 min-w-[260px]">Nhiệm Vụ & Yêu Cầu Cụ Thể</th>
              <th className="py-3 px-3 w-36">Mảng Nghiệp Vụ</th>
              <th className="py-3 px-3 w-48">Phụ Trách (Assignee)</th>
              <th className="py-3 px-3 w-32">Thời Hạn</th>
              <th className="py-3 px-3 w-36 text-center">Trạng Thái (Click đổi)</th>
              <th className="py-3 px-3 w-28 text-center print:hidden">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-8 h-8 text-slate-300" />
                    <p className="font-semibold text-sm">Không có đầu việc nào phù hợp bộ lọc.</p>
                    <p className="text-xs text-slate-400">
                      Thử chuyển bộ lọc về "Tất cả" hoặc thêm đầu việc mới vào bảng.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTasks.map((task, index) => {
                const categoryStyle = CATEGORY_COLORS[task.category] || {
                  bg: 'bg-slate-50',
                  text: 'text-slate-700',
                  border: 'border-slate-200',
                };

                const isCompleted = task.status === 'Hoàn thành';
                const isPending = task.status !== 'Hoàn thành';

                return (
                  <tr
                    key={task.id}
                    className={`transition hover:bg-indigo-50/40 ${
                      isCompleted ? 'bg-slate-50/50' : isPending ? 'bg-white' : ''
                    }`}
                  >
                    {/* STT */}
                    <td className="py-3 px-3 text-center font-bold text-slate-500">
                      {index + 1}
                    </td>

                    {/* Task Title & Details */}
                    <td className="py-3 px-3">
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => handleCycleStatus(task.id, task.status)}
                          title="Bấm để chuyển trạng thái nhanh"
                          className="mt-0.5 shrink-0 text-slate-400 hover:text-indigo-600 transition"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-300 hover:border-indigo-500" />
                          )}
                        </button>
                        <div>
                          <div
                            className={`font-bold text-slate-900 leading-snug ${
                              isCompleted ? 'line-through text-slate-500' : ''
                            }`}
                          >
                            {task.title}
                          </div>
                          {task.details && (
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                              {task.details}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
                      >
                        <Tag className="w-3 h-3" />
                        {task.category}
                      </span>
                    </td>

                    {/* Assignee */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                          <UserCheck className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-800 text-xs">
                          {task.assignee}
                        </span>
                      </div>
                    </td>

                    {/* Deadline */}
                    <td className="py-3 px-3">
                      <div className="inline-flex items-center gap-1 font-semibold text-slate-700 text-xs">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{task.deadline}</span>
                      </div>
                    </td>

                    {/* Status with 1-click toggle */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleCycleStatus(task.id, task.status)}
                        title="Bấm để chuyển trạng thái nhanh (Chưa bắt đầu → Đang thực hiện → Hoàn thành)"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition shadow-2xs active:scale-95 ${
                          task.status === 'Hoàn thành'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : task.status === 'Đang thực hiện'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {task.status === 'Hoàn thành' && <Check className="w-3 h-3" />}
                        {task.status === 'Đang thực hiện' && <Clock className="w-3 h-3" />}
                        {task.status === 'Chưa bắt đầu' && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                        <span>{task.status}</span>
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-3 text-center print:hidden">
                      <div className="flex items-center justify-center gap-1">
                        {/* Send reminder */}
                        {isPending && (
                          <button
                            onClick={() => handleSendReminder(task)}
                            title="Gửi thông báo nhắc nhở giáo viên phụ trách"
                            className="p-1 rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Edit task */}
                        <button
                          onClick={() => setEditingTask(task)}
                          title="Chỉnh sửa đầu việc"
                          className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete task */}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          title="Xóa đầu việc"
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Notes & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <FileCheck2 className="w-4 h-4 text-indigo-600" />
          <span>
            Bảng theo dõi cập nhật lần cuối lúc:{' '}
            <strong>
              {monthlyPlan.updatedAt
                ? new Date(monthlyPlan.updatedAt).toLocaleDateString('vi-VN') +
                  ' ' +
                  new Date(monthlyPlan.updatedAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '15/10/2026'}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-medium">
            Tổ trưởng: <strong>Bùi Hưng Đức</strong> • Tổ phó: <strong>Phạm Thị Ngọc Loan</strong>
          </span>
        </div>
      </div>

      {/* MODAL: Thêm đầu việc mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Thêm Đầu Việc Cần Theo Dõi (Tháng {monthlyPlan.month})
              </h4>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên đầu việc *</label>
                <input
                  type="text"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  placeholder="VD: Kiểm tra chuyên đề Speaking khối 8..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mảng nghiệp vụ</label>
                  <select
                    value={newTaskForm.category}
                    onChange={(e) =>
                      setNewTaskForm({
                        ...newTaskForm,
                        category: e.target.value as MonthlyTaskItem['category'],
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  >
                    <option value="Hồ sơ 5512">Hồ sơ 5512</option>
                    <option value="Dự giờ NCBH">Dự giờ NCBH</option>
                    <option value="Kiểm tra KSCL">Kiểm tra KSCL</option>
                    <option value="Bồi dưỡng HSG">Bồi dưỡng HSG</option>
                    <option value="Chuyển đổi số">Chuyển đổi số</option>
                    <option value="Chuyên môn">Chuyên môn</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thời hạn</label>
                  <input
                    type="text"
                    value={newTaskForm.deadline}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, deadline: e.target.value })}
                    placeholder="VD: 25/10/2026 hoặc Thứ Sáu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Người phụ trách (Assignee)</label>
                <input
                  type="text"
                  value={newTaskForm.assignee}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, assignee: e.target.value })}
                  placeholder="VD: Thầy Bùi Hưng Đức & Cô Diệu Hiền..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
                <div className="mt-1 flex flex-wrap gap-1">
                  {['Toàn tổ', 'Bùi Hưng Đức (TT)', 'Phạm Thị Ngọc Loan (TP)', 'Trần Thị Diệu Hiền', 'Huỳnh Nguyên Bảo', 'Lê Thị Phương Hạnh'].map(
                    (name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setNewTaskForm({ ...newTaskForm, assignee: name })}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition"
                      >
                        +{name}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trạng thái ban đầu</label>
                  <select
                    value={newTaskForm.status}
                    onChange={(e) =>
                      setNewTaskForm({
                        ...newTaskForm,
                        status: e.target.value as MonthlyTaskItem['status'],
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  >
                    <option value="Đang thực hiện">Đang thực hiện</option>
                    <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội dung chi tiết & Ghi chú</label>
                <textarea
                  rows={2}
                  value={newTaskForm.details || ''}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, details: e.target.value })}
                  placeholder="Mô tả cụ thể yêu cầu cần đạt hoặc lưu ý cho giáo viên..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveNewTask}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Đầu Việc</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Chỉnh sửa đầu việc */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                Chỉnh Sửa Đầu Việc
              </h4>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên đầu việc *</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mảng nghiệp vụ</label>
                  <select
                    value={editingTask.category}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        category: e.target.value as MonthlyTaskItem['category'],
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  >
                    <option value="Hồ sơ 5512">Hồ sơ 5512</option>
                    <option value="Dự giờ NCBH">Dự giờ NCBH</option>
                    <option value="Kiểm tra KSCL">Kiểm tra KSCL</option>
                    <option value="Bồi dưỡng HSG">Bồi dưỡng HSG</option>
                    <option value="Chuyển đổi số">Chuyển đổi số</option>
                    <option value="Chuyên môn">Chuyên môn</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thời hạn</label>
                  <input
                    type="text"
                    value={editingTask.deadline}
                    onChange={(e) => setEditingTask({ ...editingTask, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Người phụ trách</label>
                <input
                  type="text"
                  value={editingTask.assignee}
                  onChange={(e) => setEditingTask({ ...editingTask, assignee: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Trạng thái tiến độ</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Chưa bắt đầu', 'Đang thực hiện', 'Hoàn thành'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditingTask({ ...editingTask, status: st })}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        editingTask.status === st
                          ? st === 'Hoàn thành'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : st === 'Đang thực hiện'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-700 text-white border-slate-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Chi tiết công việc</label>
                <textarea
                  rows={2}
                  value={editingTask.details || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, details: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveEditTask}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Thay Đổi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
