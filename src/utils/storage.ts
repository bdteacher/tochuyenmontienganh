import { Teacher, MeetingMinute, LessonObservation, LessonPlanReview, SubstituteTeaching, DepartmentSetting, DepartmentRequest, MonthlyPlan, TeacherReport, WeeklySchedulePlan } from '../types';
import {
  initialDepartmentSetting,
  initialTeachers,
  initialMeetingMinutes,
  initialLessonObservations,
  initialSubstituteTeachings,
  initialLessonPlanReviews,
  initialDepartmentRequests,
  initialMonthlyPlan,
  initialTeacherReports,
  initialWeeklySchedule,
} from '../data/initialData';

const STORAGE_KEYS = {
  TEACHERS: 'thcs_nguyen_du_teachers_v6',
  MEETINGS: 'thcs_nguyen_du_meetings',
  OBSERVATIONS: 'thcs_nguyen_du_observations_en_v3',
  SUBSTITUTES: 'thcs_nguyen_du_substitutes',
  LESSON_PLANS: 'thcs_nguyen_du_lesson_plans',
  SETTINGS: 'thcs_nguyen_du_settings',
  REQUESTS: 'thcs_nguyen_du_requests',
  ROLE_OVERRIDE: 'thcs_nguyen_du_role_override',
  SCHEDULE_IMAGES: 'thcs_nguyen_du_schedule_files_v2',
  SCHEDULE_IMAGE: 'thcs_nguyen_du_schedule_image_v2',
  SCHEDULE_TITLE: 'thcs_nguyen_du_schedule_title_v2',
  SCHEDULE_UPDATED_AT: 'thcs_nguyen_du_schedule_updated_at_v2',
  MONTHLY_PLAN: 'thcs_nguyen_du_monthly_plan_v4',
  REPORTS: 'thcs_nguyen_du_teacher_reports_v1',
  WEEKLY_SCHEDULE: 'thcs_nguyen_du_weekly_schedule_v1',
};

const MATH_LEGACY_REGEX = /toán|tin học|pythagore|phương trình|hình học|đại số|tam giác|hàm số|phân thức|đa thức|căn bậc|python|pascal|scratch/i;

const OLD_TEACHER_NAME_REGEX = /nguyễn văn hưng|tổ trưởng chuyên môn|lê quốc tuấn|trần thị mai lan|phạm hoàng yến|đỗ minh đức|vũ thu trang|hoàng trọng nghĩa|bùi thị ánh tuyết|đặng văn nam|ngô hồng hạnh/i;

export const getStoredData = () => {
  // Preserve avatars from v4 / v5 before removing legacy keys
  let previousAvatars: Record<string, string> = {};
  try {
    ['thcs_nguyen_du_teachers_v4', 'thcs_nguyen_du_teachers_v5'].forEach((oldKey) => {
      const oldRaw = localStorage.getItem(oldKey);
      if (oldRaw) {
        const parsed = JSON.parse(oldRaw) as Teacher[];
        if (Array.isArray(parsed)) {
          parsed.forEach((t) => {
            if (t.id && t.avatarUrl) {
              previousAvatars[t.id] = t.avatarUrl;
            }
          });
        }
      }
    });
    localStorage.removeItem('thcs_nguyen_du_teachers');
    localStorage.removeItem('thcs_nguyen_du_teachers_v2');
    localStorage.removeItem('thcs_nguyen_du_teachers_v3');
    localStorage.removeItem('thcs_nguyen_du_teachers_v4');
    localStorage.removeItem('thcs_nguyen_du_teachers_v5');
    localStorage.removeItem('thcs_nguyen_du_monthly_plan');
    localStorage.removeItem('thcs_nguyen_du_observations');
    localStorage.removeItem('thcs_nguyen_du_schedule_images');
    localStorage.removeItem('thcs_nguyen_du_schedule_image');
    localStorage.removeItem('thcs_nguyen_du_schedule_title');
    localStorage.removeItem('thcs_nguyen_du_schedule_updated_at');
  } catch (e) {
    // ignore
  }

  const load = <T>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(`Failed to load ${key} from storage:`, e);
    }
    return fallback;
  };

  const storedTeachers = load<Teacher[]>(STORAGE_KEYS.TEACHERS, initialTeachers);
  const hasLegacyTeachers = storedTeachers.some((t) => OLD_TEACHER_NAME_REGEX.test(t.fullName));
  const rawTeachers = hasLegacyTeachers || storedTeachers.length !== 10 ? initialTeachers : storedTeachers;

  const teachers = rawTeachers.map((t, idx) => {
    const fallback = initialTeachers.find((it) => it.id === t.id) || initialTeachers[idx] || initialTeachers[0];
    const hasMathNotes = MATH_LEGACY_REGEX.test(t.notes || '');
    const hasMathTopic = MATH_LEGACY_REGEX.test(t.departmentTopic || '');
    return {
      ...t,
      fullName: fallback.fullName,
      role: fallback.role,
      degree: t.degree || fallback.degree,
      campusOrGroup: t.campusOrGroup || fallback.campusOrGroup,
      isPartyMember: typeof t.isPartyMember === 'boolean' ? t.isPartyMember : fallback.isPartyMember,
      email: fallback.email,
      gender: fallback.gender,
      majorSubject: 'Tiếng Anh',
      birthDate: t.birthDate || fallback.birthDate,
      departmentTopic: (!t.departmentTopic || hasMathTopic) ? fallback.departmentTopic : t.departmentTopic,
      notes: hasMathNotes ? fallback.notes : (t.notes || fallback.notes),
      additionalTasks: t.additionalTasks && t.additionalTasks.length > 0 ? t.additionalTasks : fallback.additionalTasks,
      avatarUrl: t.avatarUrl || previousAvatars[fallback.id] || fallback.avatarUrl,
    };
  });

  const rawSettings = load<DepartmentSetting>(STORAGE_KEYS.SETTINGS, initialDepartmentSetting);
  const settings: DepartmentSetting = {
    ...rawSettings,
    departmentName: rawSettings.departmentName === 'TỔ TOÁN - TIN HỌC' ? 'TỔ TIẾNG ANH' : rawSettings.departmentName,
    headOfDepartmentEmail:
      rawSettings.headOfDepartmentEmail === 'hung.nguyen@thcsnguyendu.edu.vn'
        ? 'bdteacher@gmail.com'
        : rawSettings.headOfDepartmentEmail,
  };

  const rawLessonPlans = load<LessonPlanReview[]>(STORAGE_KEYS.LESSON_PLANS, initialLessonPlanReviews);
  const lessonPlans = rawLessonPlans.map((lp, idx) => {
    const fallbackLp = initialLessonPlanReviews[idx] || initialLessonPlanReviews[0];
    const hasMathFeedback = MATH_LEGACY_REGEX.test(lp.feedback || '');
    return {
      ...lp,
      subject: 'Tiếng Anh',
      feedback: hasMathFeedback ? fallbackLp.feedback : lp.feedback,
    };
  });

  const rawObservations = load<LessonObservation[]>(STORAGE_KEYS.OBSERVATIONS, initialLessonObservations);
  const observations = rawObservations
    .filter(
      (obs) =>
        !MATH_LEGACY_REGEX.test(obs.lessonName || '') &&
        !MATH_LEGACY_REGEX.test(obs.generalComments || '') &&
        !MATH_LEGACY_REGEX.test(obs.suggestions || '')
    )
    .map((obs) => ({
      ...obs,
      subject: 'Tiếng Anh',
    }));

  const rawSubstitutes = load<SubstituteTeaching[]>(STORAGE_KEYS.SUBSTITUTES, initialSubstituteTeachings);
  const substitutes = rawSubstitutes.map((sub, idx) => {
    const fallbackSub = initialSubstituteTeachings[idx] || initialSubstituteTeachings[0];
    const hasMathLesson = MATH_LEGACY_REGEX.test(sub.lessonName || '');
    return {
      ...sub,
      subject: 'Tiếng Anh',
      lessonName: hasMathLesson ? fallbackSub.lessonName : sub.lessonName,
    };
  });

  const rawMonthlyPlan = load<MonthlyPlan>(STORAGE_KEYS.MONTHLY_PLAN, initialMonthlyPlan);
  const monthlyPlan: MonthlyPlan = {
    ...rawMonthlyPlan,
    tasks: (rawMonthlyPlan.tasks || []).map((task) => ({
      ...task,
      assignee: (task.assignee || '')
        .replace(/Thầy Hưng \(TT\)/gi, 'Tổ trưởng')
        .replace(/Thầy Hưng/gi, 'Tổ trưởng'),
    })),
  };

  return {
    teachers,
    meetings: load<MeetingMinute[]>(STORAGE_KEYS.MEETINGS, initialMeetingMinutes),
    observations,
    substitutes,
    lessonPlans,
    settings,
    requests: load<DepartmentRequest[]>(STORAGE_KEYS.REQUESTS, initialDepartmentRequests),
    roleOverride: load<string | null>(STORAGE_KEYS.ROLE_OVERRIDE, null),
    monthlyPlan,
    reports: load<TeacherReport[]>(STORAGE_KEYS.REPORTS, initialTeacherReports),
    weeklySchedule: load<WeeklySchedulePlan>(STORAGE_KEYS.WEEKLY_SCHEDULE, initialWeeklySchedule),
  };
};

export const saveTeachers = (teachers: Teacher[]) => {
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
};

export const saveMeetings = (meetings: MeetingMinute[]) => {
  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
};

export const saveObservations = (observations: LessonObservation[]) => {
  localStorage.setItem(STORAGE_KEYS.OBSERVATIONS, JSON.stringify(observations));
};

export const saveSubstitutes = (substitutes: SubstituteTeaching[]) => {
  localStorage.setItem(STORAGE_KEYS.SUBSTITUTES, JSON.stringify(substitutes));
};

export const saveLessonPlans = (lessonPlans: LessonPlanReview[]) => {
  localStorage.setItem(STORAGE_KEYS.LESSON_PLANS, JSON.stringify(lessonPlans));
};

export const saveSettings = (settings: DepartmentSetting) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const saveRequests = (requests: DepartmentRequest[]) => {
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
};

export const saveMonthlyPlan = (monthlyPlan: MonthlyPlan) => {
  localStorage.setItem(STORAGE_KEYS.MONTHLY_PLAN, JSON.stringify(monthlyPlan));
};

export const saveTeacherReports = (reports: TeacherReport[]) => {
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
};

export const saveWeeklySchedule = (weeklySchedule: WeeklySchedulePlan) => {
  localStorage.setItem(STORAGE_KEYS.WEEKLY_SCHEDULE, JSON.stringify(weeklySchedule));
};

export const saveRoleOverride = (role: string | null) => {
  if (role) {
    localStorage.setItem(STORAGE_KEYS.ROLE_OVERRIDE, JSON.stringify(role));
  } else {
    localStorage.removeItem(STORAGE_KEYS.ROLE_OVERRIDE);
  }
};

export const resetAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.TEACHERS);
  localStorage.removeItem(STORAGE_KEYS.MEETINGS);
  localStorage.removeItem(STORAGE_KEYS.OBSERVATIONS);
  localStorage.removeItem(STORAGE_KEYS.SUBSTITUTES);
  localStorage.removeItem(STORAGE_KEYS.LESSON_PLANS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.REQUESTS);
  localStorage.removeItem(STORAGE_KEYS.ROLE_OVERRIDE);
  localStorage.removeItem(STORAGE_KEYS.SCHEDULE_IMAGES);
  localStorage.removeItem(STORAGE_KEYS.SCHEDULE_IMAGE);
  localStorage.removeItem(STORAGE_KEYS.SCHEDULE_TITLE);
  localStorage.removeItem(STORAGE_KEYS.SCHEDULE_UPDATED_AT);
  localStorage.removeItem(STORAGE_KEYS.MONTHLY_PLAN);
  localStorage.removeItem(STORAGE_KEYS.REPORTS);
  localStorage.removeItem(STORAGE_KEYS.WEEKLY_SCHEDULE);
};


