import React, { useState, useRef, useMemo } from 'react';
import {
  FileUp,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Upload,
  Download,
  Trash2,
  Edit3,
  Eye,
  X,
  Check,
  UserCheck,
  Calendar,
  Tag,
  ExternalLink,
  Printer,
  Sparkles,
  FileSpreadsheet,
  MessageSquare,
  Send,
} from 'lucide-react';
import {
  Teacher,
  TeacherReport,
  TeacherReportCategory,
  DepartmentSetting,
} from '../types';
import { useAuthRole } from '../context/AuthRoleContext';
import { useToast } from '../context/ToastContext';

interface TeacherReportManagerProps {
  settings: DepartmentSetting;
  teachers: Teacher[];
  reports: TeacherReport[];
  onAddReport: (report: TeacherReport) => void;
  onUpdateReport: (report: TeacherReport) => void;
  onDeleteReport: (id: string) => void;
}

const REPORT_CATEGORIES: TeacherReportCategory[] = [
  'Báo cáo chuyên đề / NCBH',
  'Báo cáo chất lượng bộ môn',
  'Báo cáo bồi dưỡng HSG / Phụ đạo',
  'Báo cáo thao giảng / Dự giờ',
  'Báo cáo chuyển đổi số / Học liệu',
  'Báo cáo công tác chủ nhiệm / Khác',
];

const QUICK_REPORT_TEMPLATES: {
  title: string;
  category: TeacherReportCategory;
  period: string;
  summary: string;
  suggestedFileName: string;
}[] = [
  {
    title: 'Báo cáo kết quả sinh hoạt chuyên môn theo Nghiên cứu bài học (CV 5555)',
    category: 'Báo cáo chuyên đề / NCBH',
    period: 'Tháng 10/2026',
    summary:
      'Báo cáo tổng kết tiết dạy minh họa chương trình Tiếng Anh Global Success. Học sinh chủ động tham gia 4 hoạt động học (Warm-up, Presentation, Practice, Production), phát triển tốt năng lực giao tiếp tiếng Anh trên lớp.',
    suggestedFileName: 'Bao_cao_Chuyen_de_NCBH_TiengAnh.docx',
  },
  {
    title: 'Báo cáo thống kê chất lượng bộ môn Tiếng Anh & Phân loại học sinh',
    category: 'Báo cáo chất lượng bộ môn',
    period: 'Giữa Học kỳ I (2025 - 2026)',
    summary:
      'Thống kê phổ điểm kiểm tra thường xuyên và giữa kỳ môn Tiếng Anh các lớp phụ trách. Tỷ lệ đạt từ Trung bình trở lên đạt 92%, tỷ lệ Khá - Giỏi đạt 68%. Đề xuất danh sách học sinh cần phụ đạo bổ sung ngữ pháp cơ bản.',
    suggestedFileName: 'Bao_cao_Chat_luong_Bo_mon_TiengAnh.xlsx',
  },
  {
    title: 'Báo cáo tiến độ bồi dưỡng đội tuyển Học sinh giỏi Tiếng Anh & Thi IOE',
    category: 'Báo cáo bồi dưỡng HSG / Phụ đạo',
    period: 'Tháng 10/2026',
    summary:
      'Báo cáo chuyên cần và kết quả kiểm tra định kỳ đội tuyển HSG Tiếng Anh. Đã hoàn thành ôn luyện các chuyên đề Phonetics, Lexico-Grammar, Reading Comprehension và Listening nâng cao.',
    suggestedFileName: 'Bao_cao_Boi_duong_HSG_TiengAnh.docx',
  },
  {
    title: 'Báo cáo ứng dụng CNTT, AI và khai thác phòng Lab ngoại ngữ trong giảng dạy',
    category: 'Báo cáo chuyển đổi số / Học liệu',
    period: 'Học kỳ I (2025 - 2026)',
    summary:
      'Tổng hợp các tiết dạy có ứng dụng học liệu số, phần mềm tương tác Quizizz, Padlet và khai thác thiết bị phòng học ngoại ngữ đa phương tiện giúp nâng cao kỹ năng Listening & Speaking cho học sinh.',
    suggestedFileName: 'Bao_cao_Chuyen_doi_so_Hoc_lieu_TA.pdf',
  },
];

export const TeacherReportManager: React.FC<TeacherReportManagerProps> = ({
  settings,
  teachers,
  reports,
  onAddReport,
  onUpdateReport,
  onDeleteReport,
}) => {
  const { isHead } = useAuthRole();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTeacherId, setFilterTeacherId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<TeacherReport | null>(null);
  const [editingReport, setEditingReport] = useState<TeacherReport | null>(null);
  const [reviewNoteInput, setReviewNoteInput] = useState<string>('');

  // Form state for submitting/editing a report
  const [formState, setFormState] = useState<{
    teacherId: string;
    title: string;
    category: TeacherReportCategory;
    period: string;
    submissionDate: string;
    summary: string;
    fileName: string;
    fileSize: string;
    fileDataUrl: string;
    driveLink: string;
  }>({
    teacherId: teachers[0]?.id || 'gv-01',
    title: '',
    category: 'Báo cáo chuyên đề / NCBH',
    period: 'Tháng 10/2026',
    submissionDate: new Date().toISOString().split('T')[0],
    summary: '',
    fileName: '',
    fileSize: '',
    fileDataUrl: '',
    driveLink: '',
  });

  // KPI metrics
  const totalReports = reports.length;
  const approvedCount = reports.filter((r) => r.status === 'Đã duyệt').length;
  const pendingCount = reports.filter((r) => r.status === 'Chờ duyệt').length;
  const revisionCount = reports.filter((r) => r.status === 'Yêu cầu bổ sung').length;

  const submittedTeacherIds = useMemo(() => {
    return new Set(reports.map((r) => r.teacherId));
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (filterCategory !== 'all' && r.category !== filterCategory) return false;
      if (filterTeacherId !== 'all' && r.teacherId !== filterTeacherId) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const t = teachers.find((item) => item.id === r.teacherId);
        const teacherName = (t?.fullName || '').toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchSummary = r.summary.toLowerCase().includes(q);
        const matchCode = r.code.toLowerCase().includes(q);
        if (!teacherName.includes(q) && !matchTitle && !matchSummary && !matchCode) {
          return false;
        }
      }
      return true;
    });
  }, [reports, filterStatus, filterCategory, filterTeacherId, searchQuery, teachers]);

  const openNewReportModal = (preselectedTeacherId?: string) => {
    setEditingReport(null);
    setFormState({
      teacherId: preselectedTeacherId || teachers[0]?.id || 'gv-01',
      title: '',
      category: 'Báo cáo chuyên đề / NCBH',
      period: 'Tháng 10/2026',
      submissionDate: new Date().toISOString().split('T')[0],
      summary: '',
      fileName: '',
      fileSize: '',
      fileDataUrl: '',
      driveLink: '',
    });
    setIsSubmitModalOpen(true);
  };

  const openEditReportModal = (rep: TeacherReport) => {
    setEditingReport(rep);
    setFormState({
      teacherId: rep.teacherId,
      title: rep.title,
      category: rep.category,
      period: rep.period,
      submissionDate: rep.submissionDate,
      summary: rep.summary,
      fileName: rep.fileName || '',
      fileSize: rep.fileSize || '',
      fileDataUrl: rep.fileDataUrl || '',
      driveLink: rep.driveLink || '',
    });
    setIsSubmitModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKb = Math.max(1, Math.round(file.size / 1024));
    const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      setFormState((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: sizeStr,
        fileDataUrl: typeof reader.result === 'string' ? reader.result : '',
      }));
      toast.success(`Đã đính kèm tệp "${file.name}" (${sizeStr})`, 'Đính kèm tệp báo cáo');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApplyTemplate = (tpl: (typeof QUICK_REPORT_TEMPLATES)[0]) => {
    setFormState((prev) => ({
      ...prev,
      title: tpl.title,
      category: tpl.category,
      period: tpl.period,
      summary: tpl.summary,
      fileName: prev.fileName || tpl.suggestedFileName,
      fileSize: prev.fileSize || '115 KB',
    }));
    toast.info('Đã điền nội dung mẫu báo cáo. Thầy/Cô có thể chỉnh sửa thêm trước khi nộp.', 'Mẫu báo cáo nhanh');
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim()) {
      toast.warning('Vui lòng nhập tiêu đề báo cáo.', 'Thiếu thông tin');
      return;
    }
    if (!formState.summary.trim()) {
      toast.warning('Vui lòng nhập tóm tắt nội dung hoặc kết quả báo cáo.', 'Thiếu thông tin');
      return;
    }

    if (editingReport) {
      const updated: TeacherReport = {
        ...editingReport,
        teacherId: formState.teacherId,
        title: formState.title.trim(),
        category: formState.category,
        period: formState.period.trim() || 'Học kỳ I',
        submissionDate: formState.submissionDate,
        summary: formState.summary.trim(),
        fileName: formState.fileName.trim() || undefined,
        fileSize: formState.fileSize || undefined,
        fileDataUrl: formState.fileDataUrl || undefined,
        driveLink: formState.driveLink.trim() || undefined,
      };
      onUpdateReport(updated);
      setIsSubmitModalOpen(false);
    } else {
      const nextNum = String(reports.length + 1).padStart(2, '0');
      const newReport: TeacherReport = {
        id: `rep-${Date.now()}`,
        code: `BC-TA-${nextNum}`,
        teacherId: formState.teacherId,
        title: formState.title.trim(),
        category: formState.category,
        period: formState.period.trim() || 'Tháng 10/2026',
        submissionDate: formState.submissionDate,
        summary: formState.summary.trim(),
        fileName: formState.fileName.trim() || undefined,
        fileSize: formState.fileSize || undefined,
        fileDataUrl: formState.fileDataUrl || undefined,
        driveLink: formState.driveLink.trim() || undefined,
        status: isHead ? 'Đã duyệt' : 'Chờ duyệt',
        reviewerNote: isHead ? 'Tổ trưởng trực tiếp lập và phê duyệt lưu hồ sơ.' : undefined,
        reviewedAt: isHead ? new Date().toISOString().split('T')[0] : undefined,
      };
      onAddReport(newReport);
      setIsSubmitModalOpen(false);
    }
  };

  const handleQuickApprove = (rep: TeacherReport, newStatus: TeacherReport['status'], customNote?: string) => {
    const updated: TeacherReport = {
      ...rep,
      status: newStatus,
      reviewerNote:
        customNote !== undefined
          ? customNote
          : newStatus === 'Đã duyệt'
          ? rep.reviewerNote || 'Tổ trưởng Bùi Hưng Đức đã kiểm tra và phê duyệt báo cáo.'
          : 'Đề nghị giáo viên rà soát và bổ sung thêm minh chứng / số liệu chi tiết.',
      reviewedAt: new Date().toISOString().split('T')[0],
    };
    onUpdateReport(updated);
    if (viewingReport?.id === rep.id) {
      setViewingReport(updated);
    }
  };

  const handleDownloadAttachment = (rep: TeacherReport) => {
    if (rep.fileDataUrl) {
      const a = document.createElement('a');
      a.href = rep.fileDataUrl;
      a.download = rep.fileName || `${rep.code}_Bao_cao.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success(`Đang tải tệp "${rep.fileName}" về máy...`, 'Tải tệp đính kèm');
      return;
    }

    // Generate a clean text/doc summary download if it's a sample file without raw binary
    const teacher = teachers.find((t) => t.id === rep.teacherId);
    const content = [
      `${settings.schoolName} - ${settings.departmentName}`,
      `MÃ BÁO CÁO: ${rep.code}`,
      `TIÊU ĐỀ: ${rep.title}`,
      `GIÁO VIÊN NỘP: ${teacher?.fullName || ''}`,
      `PHÂN LOẠI: ${rep.category}`,
      `KỲ BÁO CÁO: ${rep.period}`,
      `NGÀY NỘP: ${rep.submissionDate}`,
      `TRẠNG THÁI: ${rep.status}`,
      `----------------------------------------`,
      `NỘI DUNG BÁO CÁO:`,
      rep.summary,
      `----------------------------------------`,
      `Ý KIẾN TỔ TRƯỞNG (Bùi Hưng Đức):`,
      rep.reviewerNote || 'Chưa có nhận xét',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rep.code}_${(teacher?.fullName || 'GV').replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Đã tải bản tóm tắt báo cáo "${rep.code}"!`, 'Tải báo cáo');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-800 via-indigo-700 to-blue-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-amber-300 text-xs font-semibold mb-2 border border-white/10">
            <FileUp className="w-3.5 h-3.5" />
            Cổng Nộp Báo Cáo &amp; Hồ Sơ Chuyên Môn ({settings.departmentName})
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Quản Lý &amp; Nộp Báo Cáo Của Giáo Viên
          </h2>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Nơi 10 giáo viên trong Tổ Tiếng Anh nộp báo cáo chuyên đề NCBH, thống kê chất lượng bộ môn, bồi dưỡng HSG và học liệu số để Tổ trưởng Bùi Hưng Đức kiểm tra, phê duyệt.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => openNewReportModal()}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nộp Báo Cáo Mới</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Tổng Hợp</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng báo cáo đã nộp</span>
            <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalReports}</div>
          <div className="mt-1 text-[11px] text-slate-500">
            {submittedTeacherIds.size}/{teachers.length} giáo viên đã có báo cáo
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Đã ký duyệt</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">{approvedCount}</div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            Đạt chuẩn hồ sơ chuyên môn
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Đang chờ Tổ trưởng duyệt</span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700">{pendingCount}</div>
          <div className="mt-1 text-[11px] text-amber-600 font-medium">
            {pendingCount > 0 ? 'Cần Tổ trưởng kiểm tra' : 'Đã xử lý hết'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700">Yêu cầu bổ sung</span>
            <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-700">{revisionCount}</div>
          <div className="mt-1 text-[11px] text-rose-600 font-medium">
            Cần hoàn thiện lại số liệu
          </div>
        </div>
      </div>

      {/* 10 Teachers Submission Status Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              Theo Dõi Tiến Độ Nộp Báo Cáo Của 10 Giáo Viên Trong Tổ
            </h3>
            <p className="text-xs text-slate-500">
              Nhấp vào tên giáo viên để lọc báo cáo hoặc bấm nút <strong>+ Nộp</strong> để nộp báo cáo cho giáo viên đó
            </p>
          </div>
          {filterTeacherId !== 'all' && (
            <button
              onClick={() => setFilterTeacherId('all')}
              className="text-xs text-indigo-600 hover:underline font-bold self-start sm:self-auto"
            >
              Xem tất cả 10 giáo viên
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {teachers.map((t) => {
            const teacherReports = reports.filter((r) => r.teacherId === t.id);
            const hasSubmitted = teacherReports.length > 0;
            const isSelected = filterTeacherId === t.id;

            return (
              <div
                key={t.id}
                onClick={() => setFilterTeacherId(isSelected ? 'all' : t.id)}
                className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                    : hasSubmitted
                    ? 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/70'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      {t.role === 'Tổ trưởng' ? 'Tổ trưởng' : t.role === 'Tổ phó' ? 'Tổ phó' : t.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        hasSubmitted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {hasSubmitted ? `${teacherReports.length} báo cáo` : 'Chưa nộp'}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs mt-1.5 truncate" title={t.fullName}>
                    {t.fullName}
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Khối {t.assignedClasses[0]?.slice(0, 1) || '6-9'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openNewReportModal(t.id);
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Nộp</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'all', label: `Tất cả (${totalReports})` },
              { id: 'Chờ duyệt', label: `Chờ duyệt (${pendingCount})` },
              { id: 'Đã duyệt', label: `Đã duyệt (${approvedCount})` },
              { id: 'Yêu cầu bổ sung', label: `Cần bổ sung (${revisionCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === tab.id
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category + Search */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả loại báo cáo</option>
              {REPORT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên GV, tiêu đề báo cáo..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                <th className="py-3 px-3 w-24">Mã BC</th>
                <th className="py-3 px-3 w-44">Giáo Viên Nộp</th>
                <th className="py-3 px-3 min-w-[260px]">Tiêu Đề &amp; Tóm Tắt Nội Dung</th>
                <th className="py-3 px-3 w-44">Loại Báo Cáo / Kỳ</th>
                <th className="py-3 px-3 w-40">Tệp Đính Kèm</th>
                <th className="py-3 px-3 w-36 text-center">Trạng Thái</th>
                <th className="py-3 px-3 w-32 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-sm text-slate-700">Không tìm thấy báo cáo nào phù hợp</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Hãy bấm nút &ldquo;Nộp Báo Cáo Mới&rdquo; để gửi báo cáo chuyên môn lên hệ thống.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((rep) => {
                  const teacher = teachers.find((t) => t.id === rep.teacherId);
                  return (
                    <tr key={rep.id} className="hover:bg-indigo-50/30 transition">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                        {rep.code}
                        <div className="text-[10px] font-sans font-normal text-slate-400 mt-0.5">
                          {rep.submissionDate}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{teacher?.fullName || 'Giáo viên'}</div>
                        <div className="text-[11px] text-slate-500">
                          {teacher?.role} • dạy {teacher?.assignedClasses.join(', ')}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div
                          onClick={() => {
                            setViewingReport(rep);
                            setReviewNoteInput(rep.reviewerNote || '');
                          }}
                          className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer leading-snug"
                        >
                          {rep.title}
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                          {rep.summary}
                        </p>
                        {rep.reviewerNote && (
                          <div className="mt-1.5 px-2 py-1 rounded-lg bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-900">
                            <strong>Ý kiến Tổ trưởng:</strong> {rep.reviewerNote}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-bold text-[10px]">
                          <Tag className="w-2.5 h-2.5" />
                          {rep.category}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{rep.period}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {rep.fileName ? (
                          <button
                            type="button"
                            onClick={() => handleDownloadAttachment(rep)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 font-medium text-[11px] max-w-[160px] truncate transition"
                            title={`Tải xuống: ${rep.fileName}`}
                          >
                            <Download className="w-3 h-3 shrink-0 text-indigo-600" />
                            <span className="truncate">{rep.fileName}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Báo cáo trực tuyến</span>
                        )}
                        {rep.driveLink && (
                          <a
                            href={rep.driveLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline font-semibold block"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            Link Google Drive
                          </a>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            rep.status === 'Đã duyệt'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : rep.status === 'Chờ duyệt'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {rep.status === 'Đã duyệt' && <Check className="w-3 h-3" />}
                          {rep.status === 'Chờ duyệt' && <Clock className="w-3 h-3" />}
                          {rep.status === 'Yêu cầu bổ sung' && <AlertCircle className="w-3 h-3" />}
                          {rep.status}
                        </span>

                        {/* 1-Click Quick Approve for Head of Department */}
                        {isHead && rep.status !== 'Đã duyệt' && (
                          <div className="mt-1.5">
                            <button
                              type="button"
                              onClick={() => handleQuickApprove(rep, 'Đã duyệt')}
                              className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition shadow-2xs"
                            >
                              ✓ Duyệt nhanh
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setViewingReport(rep);
                              setReviewNoteInput(rep.reviewerNote || '');
                            }}
                            title="Xem chi tiết & Phê duyệt"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditReportModal(rep)}
                            title="Chỉnh sửa báo cáo"
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Xóa báo cáo "${rep.title}" khỏi danh sách?`)) {
                                onDeleteReport(rep.id);
                              }
                            }}
                            title="Xóa báo cáo"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
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
      </div>

      {/* MODAL 1: Nộp / Chỉnh sửa Báo Cáo */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <FileUp className="w-5 h-5 text-indigo-600" />
                {editingReport ? 'Cập Nhật Báo Cáo Chuyên Môn' : 'Nộp Báo Cáo Giáo Viên Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Templates Bar */}
            {!editingReport && (
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3 space-y-2">
                <div className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Chọn nhanh mẫu báo cáo chuẩn Tổ Tiếng Anh (GDPT 2018):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {QUICK_REPORT_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="text-left p-2 rounded-lg bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200/70 text-[11px] font-semibold text-slate-700 transition truncate"
                    >
                      + {tpl.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Giáo viên nộp báo cáo *
                  </label>
                  <select
                    value={formState.teacherId}
                    onChange={(e) => setFormState({ ...formState, teacherId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Loại báo cáo chuyên môn *
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        category: e.target.value as TeacherReportCategory,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {REPORT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tiêu đề báo cáo *
                </label>
                <input
                  type="text"
                  required
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="VD: Báo cáo kết quả khảo sát giữa Học kỳ I môn Tiếng Anh khối 8..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Đợt / Kỳ báo cáo
                  </label>
                  <input
                    type="text"
                    value={formState.period}
                    onChange={(e) => setFormState({ ...formState, period: e.target.value })}
                    placeholder="VD: Tháng 10/2026, Giữa Học kỳ I..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Ngày nộp
                  </label>
                  <input
                    type="date"
                    value={formState.submissionDate}
                    onChange={(e) => setFormState({ ...formState, submissionDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tóm tắt nội dung / Kết quả đạt được / Kiến nghị *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formState.summary}
                  onChange={(e) => setFormState({ ...formState, summary: e.target.value })}
                  placeholder="Nhập nội dung chính của báo cáo, số liệu thống kê chất lượng, thuận lợi, khó khăn và đề xuất với Tổ chuyên môn..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
                />
              </div>

              {/* File Upload & Google Drive Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tệp báo cáo đính kèm (Word, Excel, PDF)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".doc,.docx,.xls,.xlsx,.pdf,.txt,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold flex items-center gap-1.5 transition shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn tệp từ máy</span>
                    </button>
                    {formState.fileName ? (
                      <div className="text-[11px] text-emerald-700 font-semibold truncate flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{formState.fileName}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">Chưa chọn tệp</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Hoặc dán Link Google Drive (tùy chọn)
                  </label>
                  <input
                    type="url"
                    value={formState.driveLink}
                    onChange={(e) => setFormState({ ...formState, driveLink: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{editingReport ? 'Lưu Cập Nhật' : 'Gửi Nộp Báo Cáo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Xem Chi Tiết & Tổ Trưởng Phê Duyệt Báo Cáo */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono font-bold text-xs">
                    {viewingReport.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {viewingReport.category} • {viewingReport.period}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mt-1">
                  {viewingReport.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingReport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Giáo viên báo cáo:</span>
                <strong className="text-slate-900">
                  {teachers.find((t) => t.id === viewingReport.teacherId)?.fullName}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Ngày gửi nộp:</span>
                <strong className="text-slate-900">{viewingReport.submissionDate}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Trạng thái:</span>
                <strong
                  className={
                    viewingReport.status === 'Đã duyệt'
                      ? 'text-emerald-700'
                      : viewingReport.status === 'Chờ duyệt'
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }
                >
                  {viewingReport.status}
                </strong>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Nội dung báo cáo chi tiết:
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-line">
                {viewingReport.summary}
              </div>
            </div>

            {viewingReport.fileName && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="font-bold text-slate-900">{viewingReport.fileName}</div>
                    <div className="text-[10px] text-slate-500">
                      Dung lượng: {viewingReport.fileSize || '120 KB'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadAttachment(viewingReport)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải về</span>
                </button>
              </div>
            )}

            {/* Head of Department Review Box */}
            <div className="pt-3 border-t border-slate-200 space-y-2.5 text-xs">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Nhận xét &amp; Phê duyệt của Tổ trưởng (Bùi Hưng Đức):</span>
              </label>
              <textarea
                rows={2}
                value={reviewNoteInput}
                onChange={(e) => setReviewNoteInput(e.target.value)}
                placeholder="Nhập ý kiến nhận xét, đánh giá hoặc yêu cầu bổ sung..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleQuickApprove(viewingReport, 'Đã duyệt', reviewNoteInput);
                      toast.success('Đã phê duyệt báo cáo của giáo viên!', 'Ký duyệt báo cáo');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Phê duyệt (Đã duyệt)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleQuickApprove(viewingReport, 'Yêu cầu bổ sung', reviewNoteInput);
                      toast.warning('Đã gửi yêu cầu bổ sung báo cáo.', 'Yêu cầu bổ sung');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Yêu cầu bổ sung</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingReport(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
