import React, { useState, useRef } from 'react';
import {
  Eye,
  Award,
  PlusCircle,
  Search,
  Printer,
  BookOpen,
  Calendar,
  FileDown,
  Loader2,
  Trash2,
  Edit3,
  FileText,
  Sparkles,
  CheckCircle2,
  Headphones,
  MessageSquare,
  PenTool,
  Presentation,
  RotateCcw,
} from 'lucide-react';
import { Teacher, LessonObservation, DepartmentSetting, ObservationCriterion } from '../types';
import { exportElementToPdf } from '../utils/pdfExport';
import { useToast } from '../context/ToastContext';
import { useAuthRole } from '../context/AuthRoleContext';

export interface EnglishObservationTemplate {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  lessonType: LessonObservation['lessonType'];
  suggestedGradeClass: string;
  suggestedLessonName: string;
  badgeColor: string;
  criteria: ObservationCriterion[];
  sampleGeneralComments: string;
  sampleSuggestions: string;
}

export const ENGLISH_OBSERVATION_TEMPLATES: EnglishObservationTemplate[] = [
  {
    id: 'tpl-en-01',
    code: 'Mẫu TA-01',
    title: 'Getting Started & A Closer Look 1 (Vocabulary - Pronunciation)',
    subtitle: 'Đánh giá tiết dạy Từ vựng, Ngữ âm & Giao tiếp mở đầu (Global Success)',
    lessonType: 'Dự giờ định kỳ',
    suggestedGradeClass: '6A1',
    suggestedLessonName: 'Unit 3: My Friends - A closer look 1 (Vocabulary & Pronunciation /b/ and /p/)',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    criteria: [
      {
        id: 'c1',
        name: '1. Hoạt động Warm-up / Lead-in & Sử dụng ngôn ngữ lớp học (Classroom English)',
        maxScore: 5,
        score: 5,
        comment: 'Khởi động sinh động, GV sử dụng Classroom English rõ ràng, phát âm chuẩn xác, tạo hứng thú đầu giờ.',
      },
      {
        id: 'c2',
        name: '2. Kỹ thuật giới thiệu từ vựng (Visuals/Context/CCQs) & Dạy ngữ âm (Pronunciation)',
        maxScore: 5,
        score: 4.5,
        comment: 'Khai thác tranh trực quan, audio chuẩn bản xứ; hướng dẫn khẩu hình âm và trọng âm từ rõ ràng.',
      },
      {
        id: 'c3',
        name: '3. Tổ chức hoạt động luyện tập từ vựng & phát âm (Individual / Pairwork / Games)',
        maxScore: 5,
        score: 4.5,
        comment: 'Chuỗi hoạt động luyện tập đa dạng, kết hợp trò chơi ngôn ngữ giúp HS ghi nhớ từ vựng ngay tại lớp.',
      },
      {
        id: 'c4',
        name: '4. Mức độ tích cực phát âm, ghi nhớ từ và vận dụng đặt câu của học sinh',
        maxScore: 5,
        score: 4.5,
        comment: 'Học sinh tích cực luyện đọc đồng thanh và cá nhân, phát âm đúng âm cuối (ending sounds).',
      },
    ],
    sampleGeneralComments:
      'Tiết dạy đúng đặc trưng bộ môn Tiếng Anh. Giáo viên phát âm chuẩn, ngữ điệu tự nhiên, kết hợp hiệu quả tranh ảnh và file nghe audio bản xứ.',
    sampleSuggestions:
      'Dành thêm 2 phút cuối bài để học sinh đặt câu thực tế với các từ vựng vừa học theo cặp (Pairwork).',
  },
  {
    id: 'tpl-en-02',
    code: 'Mẫu TA-02',
    title: 'A Closer Look 2 (Grammar in Context - Ngữ pháp giao tiếp)',
    subtitle: 'Đánh giá tiết dạy Ngữ pháp gắn với ngữ cảnh giao tiếp thực tế',
    lessonType: 'Dự giờ định kỳ',
    suggestedGradeClass: '7A2',
    suggestedLessonName: 'Unit 4: Music and Arts - A closer look 2 (Comparisons: like, different from, as...as)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    criteria: [
      {
        id: 'c1',
        name: '1. Dẫn nhập ngữ cảnh tự nhiên & Rút quy tắc ngữ pháp (Inductive Presentation)',
        maxScore: 5,
        score: 5,
        comment: 'Dẫn dắt cấu trúc ngữ pháp từ tình huống gần gũi, học sinh tự khám phá công thức và cách dùng (Form & Use).',
      },
      {
        id: 'c2',
        name: '2. Tổ chức luyện tập từ có kiểm soát đến tự do (Controlled to Free Practice)',
        maxScore: 5,
        score: 4.5,
        comment: 'Chuyển giao nhiệm vụ rõ ràng, sử dụng câu hỏi kiểm tra khái niệm (CCQs) ngắn gọn, hiệu quả.',
      },
      {
        id: 'c3',
        name: '3. Ứng dụng thiết bị dạy học số & Trò chơi tương tác củng cố ngữ pháp',
        maxScore: 5,
        score: 4.5,
        comment: 'Ứng dụng slide tương tác và bài tập trắc nghiệm nhanh giúp kiểm tra mức độ hiểu bài của cả lớp.',
      },
      {
        id: 'c4',
        name: '4. Năng lực vận dụng cấu trúc ngữ pháp vào giao tiếp thực tế của học sinh',
        maxScore: 5,
        score: 4.5,
        comment: 'Học sinh hiểu rõ cấu trúc, hoàn thành tốt các bài tập trong SGK và tự đặt được câu giao tiếp.',
      },
    ],
    sampleGeneralComments:
      'Giáo viên tổ chức tiết dạy ngữ pháp nhẹ nhàng, không nặng lý thuyết hàn lâm mà chú trọng thực hành giao tiếp theo định hướng GDPT 2018.',
    sampleSuggestions:
      'Khuyến khích học sinh tự sửa lỗi chéo (Peer-correction) khi viết câu lên bảng.',
  },
  {
    id: 'tpl-en-03',
    code: 'Mẫu TA-03',
    title: 'Skills 1: Reading & Speaking (Kỹ năng Đọc hiểu & Nói)',
    subtitle: 'Đánh giá tiết rèn luyện kỹ năng Đọc lướt, Đọc quét & Thuyết trình/Hội thoại',
    lessonType: 'Tiết dạy thao giảng',
    suggestedGradeClass: '8A1',
    suggestedLessonName: 'Unit 4: Ethnic Groups of Viet Nam - Skills 1 (Reading & Speaking: Stilt houses)',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    criteria: [
      {
        id: 'c1',
        name: '1. Tổ chức hiệu quả tiến trình Pre - While - Post Reading (Skimming & Scanning)',
        maxScore: 5,
        score: 5,
        comment: 'Hướng dẫn rõ chiến thuật tìm từ khóa (Keywords), học sinh đọc hiểu văn bản tiếng Anh nhanh và chính xác.',
      },
      {
        id: 'c2',
        name: '2. Kỹ thuật chuyển giao nhiệm vụ Nói (Pairwork / Groupwork / Role-play)',
        maxScore: 5,
        score: 5,
        comment: 'Cung cấp đầy đủ cấu trúc gợi ý (Useful expressions / Speaking prompts) giúp học sinh tự tin trao đổi.',
      },
      {
        id: 'c3',
        name: '3. Khả năng bao quát, hỗ trợ ngôn ngữ (Scaffolding) & Sửa lỗi phát âm tinh tế',
        maxScore: 5,
        score: 4.5,
        comment: 'Giáo viên di chuyển hỗ trợ các nhóm kịp thời, ghi nhận và sửa lỗi phát âm cuối hoạt động (Delayed correction).',
      },
      {
        id: 'c4',
        name: '4. Độ trôi chảy (Fluency), phản xạ giao tiếp và sự tự tin trình bày của học sinh',
        maxScore: 5,
        score: 4.5,
        comment: 'Các nhóm thảo luận sôi nổi bằng tiếng Anh, đại diện trình bày tự tin, ngữ điệu tốt.',
      },
    ],
    sampleGeneralComments:
      'Tiết dạy thao giảng phát huy xuất sắc năng lực giao tiếp tiếng Anh của học sinh. Phân bố thời gian hợp lý giữa hai kỹ năng Reading và Speaking.',
    sampleSuggestions:
      'Có thể mời thêm học sinh đặt câu hỏi phản biện ngắn (Q&A) sau phần trình bày của các nhóm.',
  },
  {
    id: 'tpl-en-04',
    code: 'Mẫu TA-04',
    title: 'Skills 2: Listening & Writing (Kỹ năng Nghe hiểu & Viết)',
    subtitle: 'Đánh giá tiết rèn luyện kỹ năng Nghe audio bản xứ & Viết đoạn văn tiếng Anh',
    lessonType: 'Dự giờ định kỳ',
    suggestedGradeClass: '9A1',
    suggestedLessonName: 'Unit 2: City Life - Skills 2 (Listening & Writing a paragraph about city problems)',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    criteria: [
      {
        id: 'c1',
        name: '1. Tiến trình Pre - While - Post Listening & Khai thác file nghe Audio chuẩn',
        maxScore: 5,
        score: 5,
        comment: 'Cho học sinh dự đoán thông tin trước khi nghe (Prediction), âm thanh rõ nét, dẫn chứng từ bài nghe thuyết phục.',
      },
      {
        id: 'c2',
        name: '2. Hướng dẫn dàn ý bài viết (Outline), từ nối (Connectors) & cấu trúc câu',
        maxScore: 5,
        score: 4.5,
        comment: 'Cung cấp sơ đồ tư duy (Mindmap) và khung bài viết (Writing frame) rõ ràng theo từng mức độ học sinh.',
      },
      {
        id: 'c3',
        name: '3. Tổ chức chấm chữa bài mẫu trực quan (Peer-editing & Teacher Feedback)',
        maxScore: 5,
        score: 4.5,
        comment: 'Chiếu sản phẩm viết của học sinh lên màn hình để nhận xét lỗi từ vựng, ngữ pháp trực quan.',
      },
      {
        id: 'c4',
        name: '4. Chất lượng sản phẩm đoạn văn tiếng Anh & Mức độ hoàn thành bài nghe của học sinh',
        maxScore: 5,
        score: 4.5,
        comment: 'Đa số học sinh nghe bắt được ý chính và viết được đoạn văn hoàn chỉnh đúng yêu cầu.',
      },
    ],
    sampleGeneralComments:
      'Tiết dạy chuẩn bị công phu, kết nối chặt chẽ nội dung bài nghe làm chất liệu đầu vào (Input) cho hoạt động viết đoạn văn (Output).',
    sampleSuggestions:
      'Cung cấp thêm bảng tiêu chí tự kiểm tra bài viết ngắn gọn (Writing Checklist) để học sinh tự rà soát lỗi chính tả.',
  },
  {
    id: 'tpl-en-05',
    code: 'Mẫu TA-05',
    title: 'Looking Back & Project / Chuyên Đề Nghiên Cứu Bài Học (NCBH)',
    subtitle: 'Đánh giá tiết Thuyết trình Dự án Tiếng Anh & Sinh hoạt chuyên môn CV 5555',
    lessonType: 'Chuyên đề Nghiên cứu bài học',
    suggestedGradeClass: '8A2',
    suggestedLessonName: 'Unit 3: Teenagers - Looking Back & Project (Our School Club Poster Presentation)',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    criteria: [
      {
        id: 'c1',
        name: '1. Hệ thống hóa từ vựng & ngữ pháp trọng tâm của Unit (Review & Consolidation)',
        maxScore: 5,
        score: 5,
        comment: 'Ôn tập nhanh gọn, sinh động qua hoạt động nhóm, giúp học sinh nắm vững kiến thức cốt lõi của Unit.',
      },
      {
        id: 'c2',
        name: '2. Tổ chức báo cáo dự án bằng tiếng Anh (English Project Presentation)',
        maxScore: 5,
        score: 5,
        comment: 'Sản phẩm Poster/Slide sáng tạo, học sinh thuyết trình bằng tiếng Anh lưu loát, phân công đều các thành viên.',
      },
      {
        id: 'c3',
        name: '3. Ứng dụng CNTT, học liệu số & Tổ chức đánh giá đồng đẳng (Peer-assessment Rubric)',
        maxScore: 5,
        score: 5,
        comment: 'Có phiếu chấm điểm dự án (Rubric) cho các nhóm nhận xét lẫn nhau bằng tiếng Anh rất hiệu quả.',
      },
      {
        id: 'c4',
        name: '4. Sự tự tin, sáng tạo, kỹ năng làm việc nhóm và giao tiếp của học sinh',
        maxScore: 5,
        score: 4.5,
        comment: '100% học sinh hào hứng tham gia vào sản phẩm dự án, không khí lớp học cởi mở, tích cực.',
      },
    ],
    sampleGeneralComments:
      'Tiết dạy Nghiên cứu bài học (NCBH) thể hiện rõ tinh thần đổi mới kiểm tra đánh giá và phát triển phẩm chất, năng lực giao tiếp tiếng Anh.',
    sampleSuggestions:
      'Trưng bày các sản phẩm Poster tiếng Anh của học sinh tại góc học tập bộ môn để lan tỏa phong trào học tiếng Anh.',
  },
];

interface ObservationManagerProps {
  settings: DepartmentSetting;
  teachers: Teacher[];
  observations: LessonObservation[];
  onAddObservation: (obs: LessonObservation) => void;
  onUpdateObservation?: (obs: LessonObservation) => void;
  onDeleteObservation: (id: string) => void;
  onClearObservations?: () => void;
  onPrintObservation: (obs: LessonObservation) => void;
}

export const ObservationManager: React.FC<ObservationManagerProps> = ({
  settings,
  teachers,
  observations,
  onAddObservation,
  onUpdateObservation,
  onDeleteObservation,
  onClearObservations,
  onPrintObservation,
}) => {
  const { isHead } = useAuthRole();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [selectedObs, setSelectedObs] = useState<LessonObservation | null>(observations[0] || null);
  const [previewTemplate, setPreviewTemplate] = useState<EnglishObservationTemplate>(
    ENGLISH_OBSERVATION_TEMPLATES[0]
  );
  const [isBlankFormMode, setIsBlankFormMode] = useState<boolean>(observations.length === 0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObsId, setEditingObsId] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const obsSheetRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    teacherId: teachers[1]?.id || teachers[0]?.id || '',
    observerId: teachers[0]?.id || '',
    subject: 'Tiếng Anh',
    className: ENGLISH_OBSERVATION_TEMPLATES[0].suggestedGradeClass,
    period: 2,
    lessonName: ENGLISH_OBSERVATION_TEMPLATES[0].suggestedLessonName,
    lessonType: ENGLISH_OBSERVATION_TEMPLATES[0].lessonType,
    criteria: JSON.parse(JSON.stringify(ENGLISH_OBSERVATION_TEMPLATES[0].criteria)) as ObservationCriterion[],
    generalComments: ENGLISH_OBSERVATION_TEMPLATES[0].sampleGeneralComments,
    suggestions: ENGLISH_OBSERVATION_TEMPLATES[0].sampleSuggestions,
  });

  const getTeacher = (id: string) => teachers.find((t) => t.id === id);

  const filteredObservations = observations.filter((obs) => {
    const teacher = getTeacher(obs.teacherId);
    const observer = getTeacher(obs.observerId);

    const matchesSearch =
      (teacher?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (observer?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      obs.lessonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.className.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating = ratingFilter === 'all' || obs.rating === ratingFilter;

    return matchesSearch && matchesRating;
  });

  // Open modal pre-filled with a chosen English template
  const handleUseTemplate = (tpl: EnglishObservationTemplate) => {
    setEditingObsId(null);
    setForm({
      date: new Date().toISOString().split('T')[0],
      teacherId: teachers[1]?.id || teachers[0]?.id || '',
      observerId: teachers[0]?.id || '',
      subject: 'Tiếng Anh',
      className: tpl.suggestedGradeClass,
      period: 2,
      lessonName: tpl.suggestedLessonName,
      lessonType: tpl.lessonType,
      criteria: JSON.parse(JSON.stringify(tpl.criteria)),
      generalComments: tpl.sampleGeneralComments,
      suggestions: tpl.sampleSuggestions,
    });
    setIsModalOpen(true);
  };

  // Open modal to edit an existing observation
  const handleEditObservation = (obs: LessonObservation) => {
    setEditingObsId(obs.id);
    setForm({
      date: obs.date,
      teacherId: obs.teacherId,
      observerId: obs.observerId,
      subject: 'Tiếng Anh',
      className: obs.className,
      period: obs.period,
      lessonName: obs.lessonName,
      lessonType: obs.lessonType,
      criteria: JSON.parse(JSON.stringify(obs.criteria)),
      generalComments: obs.generalComments,
      suggestions: obs.suggestions,
    });
    setIsModalOpen(true);
  };

  // Apply template inside the modal form
  const handleApplyTemplateInModal = (tplId: string) => {
    const tpl = ENGLISH_OBSERVATION_TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    setForm((prev) => ({
      ...prev,
      className: tpl.suggestedGradeClass,
      lessonName: tpl.suggestedLessonName,
      lessonType: tpl.lessonType,
      criteria: JSON.parse(JSON.stringify(tpl.criteria)),
      generalComments: tpl.sampleGeneralComments,
      suggestions: tpl.sampleSuggestions,
    }));
    toast.info(`Đã nạp tiêu chí ${tpl.code}: ${tpl.title}`, 'Biểu mẫu Tiếng Anh');
  };

  const handleScoreChange = (index: number, newScore: number) => {
    const updated = [...form.criteria];
    updated[index].score = Math.min(5, Math.max(0, newScore));
    setForm({ ...form, criteria: updated });
  };

  const handleCriterionCommentChange = (index: number, newComment: string) => {
    const updated = [...form.criteria];
    updated[index].comment = newComment;
    setForm({ ...form, criteria: updated });
  };

  const handleCriterionNameChange = (index: number, newName: string) => {
    const updated = [...form.criteria];
    updated[index].name = newName;
    setForm({ ...form, criteria: updated });
  };

  const handleSaveObservation = (e: React.FormEvent) => {
    e.preventDefault();
    const totalScore = Number(
      form.criteria.reduce((sum, c) => sum + Number(c.score), 0).toFixed(1)
    );

    let rating: 'Giỏi' | 'Khá' | 'Trung bình' | 'Chưa đạt' = 'Khá';
    if (totalScore >= 18) rating = 'Giỏi';
    else if (totalScore >= 14) rating = 'Khá';
    else if (totalScore >= 10) rating = 'Trung bình';
    else rating = 'Chưa đạt';

    const obsRecord: LessonObservation = {
      id: editingObsId || `obs-en-${Date.now()}`,
      date: form.date,
      teacherId: form.teacherId,
      observerId: form.observerId,
      subject: 'Tiếng Anh',
      className: form.className,
      period: Number(form.period),
      lessonName: form.lessonName,
      lessonType: form.lessonType,
      criteria: form.criteria,
      totalScore,
      rating,
      generalComments: form.generalComments,
      suggestions: form.suggestions,
    };

    if (editingObsId && onUpdateObservation) {
      onUpdateObservation(obsRecord);
    } else {
      onAddObservation(obsRecord);
    }

    setIsModalOpen(false);
    setEditingObsId(null);
    setSelectedObs(obsRecord);
    setIsBlankFormMode(false);
  };

  const handleExportPdf = async () => {
    if (!obsSheetRef.current) return;
    setIsExportingPdf(true);
    try {
      if (isBlankFormMode || !selectedObs) {
        await exportElementToPdf(obsSheetRef.current, {
          filename: `Bieu_mau_du_gio_Tieng_Anh_${previewTemplate.code.replace(/\s+/g, '_')}.pdf`,
          pageTitle: `Biểu mẫu dự giờ Tiếng Anh - ${previewTemplate.title}`,
          leftMarginMm: 20,
          rightMarginMm: 15,
          topMarginMm: 15,
          bottomMarginMm: 15,
        });
        toast.success(`Đã xuất biểu mẫu dự giờ Tiếng Anh (${previewTemplate.code}) sang PDF!`, 'Xuất PDF');
      } else {
        const teacher = getTeacher(selectedObs.teacherId);
        const safeTeacher = teacher ? teacher.fullName.replace(/\s+/g, '_') : 'GV';
        const cleanDate = selectedObs.date.replace(/[\/\\]/g, '-');
        await exportElementToPdf(obsSheetRef.current, {
          filename: `Phieu_du_gio_Tieng_Anh_${safeTeacher}_${cleanDate}.pdf`,
          pageTitle: `Phiếu dự giờ Tiếng Anh - ${teacher?.fullName || ''}`,
          leftMarginMm: 20,
          rightMarginMm: 15,
          topMarginMm: 15,
          bottomMarginMm: 15,
        });
        toast.success(`Đã xuất phiếu dự giờ Tiếng Anh (${teacher?.fullName}) sang PDF!`, 'Xuất PDF');
      }
    } catch (err) {
      console.error('Lỗi xuất PDF phiếu dự giờ:', err);
      toast.error('Không thể xuất file PDF. Vui lòng thử lại!', 'Lỗi xuất PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider border border-indigo-100 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Bộ Môn Tiếng Anh THCS (Global Success - GDPT 2018)
            </div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-6 h-6 text-indigo-600" />
              Biểu Mẫu & Sổ Dự Giờ, Đánh Giá Tiết Dạy Môn Tiếng Anh
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Hệ thống biểu mẫu đánh giá tiết dạy chuyên biệt cho môn Tiếng Anh (Vocabulary, Grammar, Reading, Speaking, Listening, Writing & Project) theo Công văn 5555/BGDĐT
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {observations.length > 0 && onClearObservations && (
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ các phiếu dự giờ hiện có?')) {
                    onClearObservations();
                    setSelectedObs(null);
                    setIsBlankFormMode(true);
                  }
                }}
                className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Xóa tất cả phiếu dự giờ trong danh sách"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa Tất Cả ({observations.length})</span>
              </button>
            )}

            <button
              onClick={() => handleUseTemplate(previewTemplate)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Phiếu Dự Giờ Tiếng Anh Mới</span>
            </button>
          </div>
        </div>

        {/* LIBRARY OF 5 ENGLISH OBSERVATION TEMPLATES */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              5 Biểu Mẫu Dự Giờ Chuẩn Môn Tiếng Anh (Chọn biểu mẫu để xem / in phiếu trống hoặc chấm điểm):
            </h3>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Thiết kế riêng cho cấu trúc SGK Tiếng Anh Global Success 6, 7, 8, 9
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {ENGLISH_OBSERVATION_TEMPLATES.map((tpl) => {
              const isCurrentTemplate = isBlankFormMode && previewTemplate.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setPreviewTemplate(tpl);
                    setIsBlankFormMode(true);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-xs ${
                    isCurrentTemplate
                      ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-200 shadow-sm'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-indigo-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${tpl.badgeColor}`}
                      >
                        {tpl.code}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">CV 5555</span>
                    </div>
                    <h4 className="font-bold text-slate-900 leading-snug line-clamp-2">
                      {tpl.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {tpl.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplate(tpl);
                        setIsBlankFormMode(true);
                      }}
                      className="text-[11px] font-semibold text-slate-600 hover:text-indigo-700"
                    >
                      Xem biểu mẫu
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTemplate(tpl);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition"
                    >
                      + Lập phiếu
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Saved Observations List (Left) & Printable Sheet Preview (Right 2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Saved Observations List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Phiếu Dự Giờ Đã Lưu ({filteredObservations.length})
            </span>
            {observations.length > 0 && (
              <button
                onClick={() => setIsBlankFormMode(true)}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Xem biểu mẫu trống
              </button>
            )}
          </div>

          {observations.length > 0 && (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm GV, Unit bài dạy, lớp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                />
              </div>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-slate-700 font-medium"
              >
                <option value="all">Tất cả</option>
                <option value="Giỏi">Giỏi</option>
                <option value="Khá">Khá</option>
                <option value="Trung bình">TB</option>
              </select>
            </div>
          )}

          {filteredObservations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 text-center space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  Danh sách dự giờ đang trống
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Đã xóa toàn bộ các nội dung cũ. Chọn 1 trong <strong>5 Biểu mẫu dự giờ môn Tiếng Anh</strong> phía trên để in phiếu trống hoặc bấm nút bên dưới để chấm phiếu dự giờ mới.
                </p>
              </div>
              <button
                onClick={() => handleUseTemplate(previewTemplate)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Lập Phiếu Dự Giờ Tiếng Anh</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredObservations.map((obs) => {
                const teacher = getTeacher(obs.teacherId);
                const observer = getTeacher(obs.observerId);
                const isSelected = !isBlankFormMode && selectedObs?.id === obs.id;

                return (
                  <div
                    key={obs.id}
                    onClick={() => {
                      setSelectedObs(obs);
                      setIsBlankFormMode(false);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-xs space-y-2 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-200/50 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" /> {obs.date} • Tiết {obs.period} ({obs.className})
                      </span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                          obs.rating === 'Giỏi'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : obs.rating === 'Khá'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {obs.rating} ({obs.totalScore}/20đ)
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                      {obs.lessonName}
                    </h3>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">GV Giảng dạy:</span>
                        <span className="font-bold text-slate-800">{teacher?.fullName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Người dự giờ:</span>
                        <span className="font-bold text-indigo-700">{observer?.fullName}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditObservation(obs);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold text-[11px] flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Xóa phiếu dự giờ này?')) {
                            onDeleteObservation(obs.id);
                            if (selectedObs?.id === obs.id) {
                              setSelectedObs(null);
                              setIsBlankFormMode(true);
                            }
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-[11px] flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 2 cols: Official English Observation Evaluation Sheet */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden text-xs text-slate-800">
            {/* Toolbar */}
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2 no-print">
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-900">
                  {isBlankFormMode || !selectedObs
                    ? `Biểu Mẫu Dự Giờ Tiếng Anh: ${previewTemplate.code} - ${previewTemplate.title}`
                    : 'Phiếu Đánh Giá Tiết Dạy Môn Tiếng Anh (Đã Chấm)'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {(isBlankFormMode || !selectedObs) && (
                  <button
                    onClick={() => handleUseTemplate(previewTemplate)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Điền & Chấm Theo Mẫu Này</span>
                  </button>
                )}

                {!isBlankFormMode && selectedObs && (
                  <button
                    onClick={() => handleEditObservation(selectedObs)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa Phiếu</span>
                  </button>
                )}

                <button
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
                  title="Xuất phiếu dự giờ Tiếng Anh sang định dạng PDF chuẩn A4"
                >
                  {isExportingPdf ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang tạo PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Xuất PDF A4</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Phiếu A4</span>
                </button>

                {!isBlankFormMode && selectedObs && (
                  <button
                    onClick={() => {
                      if (confirm('Xóa phiếu dự giờ này?')) {
                        onDeleteObservation(selectedObs.id);
                        setSelectedObs(null);
                        setIsBlankFormMode(true);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-semibold cursor-pointer"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>

            {/* Printable Evaluation Sheet (Either Blank English Template OR Saved Observation) */}
            <div ref={obsSheetRef} className="p-8 space-y-5 max-w-3xl mx-auto font-serif bg-white">
              {/* Header */}
              <div className="grid grid-cols-2 text-center text-xs pb-3 border-b border-slate-300">
                <div>
                  <p className="uppercase font-bold text-slate-800">{settings.districtCity}</p>
                  <p className="uppercase font-extrabold text-slate-900">{settings.schoolName}</p>
                  <p className="uppercase font-bold text-indigo-900">TỔ TIẾNG ANH</p>
                </div>
                <div>
                  <p className="uppercase font-extrabold text-slate-900">
                    PHIẾU DỰ GIỜ & ĐÁNH GIÁ TIẾT DẠY MÔN TIẾNG ANH
                  </p>
                  <p className="text-[11px] italic text-slate-600">
                    (Theo Công văn số 5555/BGDĐT-GDTrH • Chương trình GDPT 2018)
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1 font-sans font-semibold">
                    {isBlankFormMode || !selectedObs
                      ? `${previewTemplate.code}: ${previewTemplate.title}`
                      : `Ngày dự giờ: ${selectedObs.date}`}
                  </p>
                </div>
              </div>

              {/* Lesson Info Box */}
              {isBlankFormMode || !selectedObs ? (
                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-300 grid grid-cols-2 gap-3 text-xs leading-relaxed">
                  <div>
                    <p><strong>Họ và tên giáo viên dạy:</strong> ............................................................</p>
                    <p><strong>Lớp dạy:</strong> ....................... • <strong>Tiết PPCT:</strong> ....................... • <strong>Ngày:</strong> ....../....../202...</p>
                    <p><strong>Bộ môn:</strong> Tiếng Anh (SGK Global Success)</p>
                  </div>
                  <div>
                    <p><strong>Họ và tên người dự giờ:</strong> ............................................................</p>
                    <p><strong>Chức vụ / Tổ chuyên môn:</strong> Tổ Tiếng Anh</p>
                    <p><strong>Loại hình dự giờ:</strong> {previewTemplate.lessonType}</p>
                  </div>
                  <div className="col-span-2 pt-1.5 border-t border-slate-200">
                    <p>
                      <strong>Tên bài dạy (Unit / Lesson):</strong>{' '}
                      <span className="italic text-slate-700">
                        .................................................................................................................................... (Gợi ý: {previewTemplate.suggestedLessonName})
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p><strong>Giáo viên giảng dạy:</strong> {getTeacher(selectedObs.teacherId)?.fullName}</p>
                    <p><strong>Lớp:</strong> {selectedObs.className} • <strong>Tiết thứ:</strong> {selectedObs.period}</p>
                    <p><strong>Bộ môn:</strong> Tiếng Anh</p>
                  </div>
                  <div>
                    <p><strong>Người dự giờ:</strong> {getTeacher(selectedObs.observerId)?.fullName}</p>
                    <p><strong>Chức vụ:</strong> {getTeacher(selectedObs.observerId)?.role}</p>
                    <p><strong>Loại tiết dạy:</strong> {selectedObs.lessonType}</p>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200">
                    <p>
                      <strong>Tên bài dạy (Unit / Lesson):</strong>{' '}
                      <span className="font-bold text-indigo-950">{selectedObs.lessonName}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* English Pedagogical Observation Table (Hoạt động GV & HS + 4 Tiêu chí CV 5555) */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase text-slate-900 text-xs">
                  I. ĐÁNH GIÁ THEO TIÊU CHÍ ĐẶC THÙ BỘ MÔN TIẾNG ANH (THANG ĐIỂM 20):
                </h4>
                <table className="w-full text-left border border-slate-300 text-xs">
                  <thead className="bg-slate-100 uppercase text-[11px]">
                    <tr>
                      <th className="p-2 border border-slate-300 w-10 text-center">STT</th>
                      <th className="p-2 border border-slate-300">Tiêu chí đánh giá tiết dạy Tiếng Anh</th>
                      <th className="p-2 border border-slate-300 w-20 text-center">Điểm tối đa</th>
                      <th className="p-2 border border-slate-300 w-20 text-center">Điểm chấm</th>
                      <th className="p-2 border border-slate-300">Nhận xét & Minh chứng hoạt động GV - HS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isBlankFormMode || !selectedObs
                      ? previewTemplate.criteria
                      : selectedObs.criteria
                    ).map((c, i) => (
                      <tr key={c.id}>
                        <td className="p-2.5 border border-slate-300 text-center font-medium">{i + 1}</td>
                        <td className="p-2.5 border border-slate-300 font-semibold text-slate-800">{c.name}</td>
                        <td className="p-2.5 border border-slate-300 text-center font-semibold">{c.maxScore}đ</td>
                        <td className="p-2.5 border border-slate-300 text-center font-bold text-indigo-900">
                          {isBlankFormMode || !selectedObs ? '....... / 5.0' : `${c.score}đ`}
                        </td>
                        <td className="p-2.5 border border-slate-300 text-slate-700 text-[11px] leading-relaxed">
                          {c.comment}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold">
                    <tr>
                      <td colSpan={2} className="p-2.5 border border-slate-300 text-right uppercase">
                        Tổng điểm và Xếp loại tiết dạy Tiếng Anh:
                      </td>
                      <td className="p-2.5 border border-slate-300 text-center">20.0đ</td>
                      <td className="p-2.5 border border-slate-300 text-center text-indigo-900 text-sm">
                        {isBlankFormMode || !selectedObs ? '....... / 20' : `${selectedObs.totalScore}đ`}
                      </td>
                      <td className="p-2.5 border border-slate-300 text-emerald-800 text-xs font-extrabold uppercase">
                        {isBlankFormMode || !selectedObs
                          ? 'XẾP LOẠI: [  ] Giỏi   [  ] Khá   [  ] TB'
                          : `XẾP LOẠI: ${selectedObs.rating}`}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Progress of 4 Activities (Warm-up / Presentation / Practice / Production) */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold uppercase text-slate-900 text-xs">
                  II. GHI NHẬN TIẾN TRÌNH TỔ CHỨC HOẠT ĐỘNG DẠY HỌC TIẾNG ANH (CV 5512 & 5555):
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50/50">
                    <strong className="block text-indigo-950">1. Warm-up / Lead-in</strong>
                    <span className="text-slate-600">Khởi động, kết nối vào chủ đề Unit bằng tiếng Anh</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50/50">
                    <strong className="block text-indigo-950">2. Presentation / Pre-stage</strong>
                    <span className="text-slate-600">Giới thiệu từ vựng, ngữ âm, ngữ cảnh hoặc chuẩn bị kỹ năng</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50/50">
                    <strong className="block text-indigo-950">3. Practice / While-stage</strong>
                    <span className="text-slate-600">Rèn kỹ năng Nghe - Nói - Đọc - Viết cá nhân/cặp/nhóm</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50/50">
                    <strong className="block text-indigo-950">4. Production / Post-stage</strong>
                    <span className="text-slate-600">Vận dụng giao tiếp thực tế, thuyết trình & mở rộng</span>
                  </div>
                </div>
              </div>

              {/* Qualitative Comments & Suggestions */}
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-900 mb-1">
                    III. Nhận xét chung về ưu điểm (Phát âm, Classroom English, Kỹ thuật dạy học, Tương tác HS):
                  </h5>
                  <p className="text-slate-700 leading-relaxed">
                    {isBlankFormMode || !selectedObs
                      ? previewTemplate.sampleGeneralComments
                      : selectedObs.generalComments}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-900 mb-1">
                    IV. Những điểm cần trao đổi, góp ý rút kinh nghiệm chuyên môn:
                  </h5>
                  <p className="text-slate-700 leading-relaxed">
                    {isBlankFormMode || !selectedObs
                      ? previewTemplate.sampleSuggestions
                      : selectedObs.suggestions || 'Không có.'}
                  </p>
                </div>
              </div>

              {/* Signature Block */}
              <div className="grid grid-cols-2 text-center pt-6 text-xs font-sans">
                <div>
                  <p className="font-bold uppercase text-slate-800">GIÁO VIÊN GIẢNG DẠY</p>
                  <p className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</p>
                  <div className="h-16 flex items-end justify-center">
                    <span className="font-bold text-slate-900">
                      {isBlankFormMode || !selectedObs
                        ? '................................................'
                        : getTeacher(selectedObs.teacherId)?.fullName}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="font-bold uppercase text-slate-800">NGƯỜI DỰ GIỜ / ĐÁNH GIÁ</p>
                  <p className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</p>
                  <div className="h-16 flex items-end justify-center">
                    <span className="font-bold text-slate-900">
                      {isBlankFormMode || !selectedObs
                        ? '................................................'
                        : getTeacher(selectedObs.observerId)?.fullName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create or Edit English Observation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full text-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-indigo-900 to-blue-900 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-300" />
                  {editingObsId
                    ? 'Chỉnh Sửa Phiếu Dự Giờ Môn Tiếng Anh'
                    : 'Lập Phiếu Dự Giờ & Đánh Giá Tiết Dạy Môn Tiếng Anh'}
                </h3>
                <p className="text-[11px] text-indigo-200 mt-0.5">
                  Tích hợp sẵn 5 bộ tiêu chí chuẩn môn Tiếng Anh (Global Success 6, 7, 8, 9)
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-300 hover:text-white text-xl font-bold px-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveObservation} className="p-6 space-y-4 text-xs overflow-y-auto">
              {/* Quick Template Selector inside Modal */}
              <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200/80">
                <label className="block font-bold text-indigo-950 mb-2">
                  Chọn nhanh Biểu mẫu tiêu chí theo dạng bài dạy Tiếng Anh:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ENGLISH_OBSERVATION_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleApplyTemplateInModal(tpl.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 border border-indigo-200 font-semibold text-[11px] transition shadow-2xs"
                    >
                      {tpl.code}: {tpl.title.split('(')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Giáo viên giảng dạy (Tổ Tiếng Anh)
                  </label>
                  <select
                    value={form.teacherId}
                    onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Người dự giờ / Đánh giá
                  </label>
                  <select
                    value={form.observerId}
                    onChange={(e) => setForm({ ...form, observerId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày dự giờ</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lớp dạy</label>
                  <input
                    type="text"
                    value={form.className}
                    onChange={(e) => setForm({ ...form, className: e.target.value })}
                    placeholder="VD: 6A1, 7A2, 8A1, 9A1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tiết thứ</label>
                  <select
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                      <option key={p} value={p}>
                        Tiết {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loại hình dự giờ</label>
                  <select
                    value={form.lessonType}
                    onChange={(e) => setForm({ ...form, lessonType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="Dự giờ định kỳ">Dự giờ định kỳ</option>
                    <option value="Tiết dạy thao giảng">Tiết dạy thao giảng</option>
                    <option value="Chuyên đề Nghiên cứu bài học">Chuyên đề NCBH</option>
                    <option value="Kiểm tra đột xuất">Kiểm tra chuyên môn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên bài dạy Tiếng Anh (Unit / Lesson - Global Success)
                </label>
                <input
                  type="text"
                  value={form.lessonName}
                  onChange={(e) => setForm({ ...form, lessonName: e.target.value })}
                  placeholder="VD: Unit 3: Teenagers - Skills 1 (Reading & Speaking)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold text-indigo-950"
                  required
                />
              </div>

              {/* Criteria Scoring & Detailed Comments */}
              <div className="space-y-2.5 border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Chấm điểm & Nhận xét 4 tiêu chí đặc thù môn Tiếng Anh (Tối đa 20 điểm):
                  </span>
                  <span className="font-extrabold text-indigo-700 text-sm">
                    Tổng: {form.criteria.reduce((s, c) => s + Number(c.score), 0).toFixed(1)} / 20.0đ
                  </span>
                </div>

                {form.criteria.map((c, i) => (
                  <div
                    key={c.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) => handleCriterionNameChange(i, e.target.value)}
                        className="flex-1 font-bold text-slate-800 text-xs bg-white px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-slate-500 text-[11px]">Điểm:</span>
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          max="5"
                          value={c.score}
                          onChange={(e) => handleScoreChange(i, parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-center font-bold border border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 text-indigo-900"
                        />
                        <span className="text-slate-500 font-medium">/ 5.0đ</span>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={c.comment}
                      onChange={(e) => handleCriterionCommentChange(i, e.target.value)}
                      placeholder="Nhận xét chi tiết tiêu chí này..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nhận xét chung về ưu điểm tiết dạy Tiếng Anh
                  </label>
                  <textarea
                    rows={3}
                    value={form.generalComments}
                    onChange={(e) => setForm({ ...form, generalComments: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ý kiến góp ý, trao đổi rút kinh nghiệm chuyên môn
                  </label>
                  <textarea
                    rows={3}
                    value={form.suggestions}
                    onChange={(e) => setForm({ ...form, suggestions: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  {editingObsId ? 'Lưu Cập Nhật Phiếu Dự Giờ' : 'Lưu & Xếp Loại Tiết Dạy Tiếng Anh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
