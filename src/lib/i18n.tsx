import { useCallback } from "react";
import { useLuckLive } from "@/lib/luck-live-store";

/**
 * Lightweight localization layer.
 * Keys ARE the English source strings, so wrapping a string with t() can never
 * break rendering — an untranslated string falls back to English automatically.
 */
const ar: Record<string, string> = {
  // Brand / shell
  "Luck Life": "لَك لايف",
  Workspace: "مساحة العمل",
  "Your space": "مساحتك",
  Overview: "نظرة عامة",
  "My tasks": "مهامي",
  Insights: "التحليلات",
  Calendar: "التقويم",
  Projects: "المشاريع",
  Settings: "الإعدادات",
  About: "حول التطبيق",
  Sherluck: "شيرلوك",
  "Personal workspace": "مساحة عمل شخصية",
  "Search tasks": "ابحث في المهام",
  Notifications: "الإشعارات",
  "Add task": "إضافة مهمة",
  "Open navigation": "فتح القائمة",
  "Close navigation": "إغلاق القائمة",
  "Switch to light theme": "التبديل إلى الوضع الفاتح",
  "Switch to dark theme": "التبديل إلى الوضع الداكن",

  // Dashboard
  "Your daily cockpit": "لوحتك اليومية",
  "Make today count.": "اجعل يومك مثمرًا.",
  "You have a clear runway. Two high-impact tasks and a little momentum will get you there.":
    "أمامك مسار واضح. مهمتان مؤثرتان وقليل من الاندفاع يكفيان للوصول.",
  "Daily progress": "التقدم اليومي",
  "Keep the streak alive, one finish at a time.": "حافظ على سلسلة إنجازاتك، مهمة تلو الأخرى.",
  "Your progress updates as tasks are finished.": "يتحدث تقدمك مع كل مهمة تنهيها.",
  Momentum: "الزخم",
  "Completion rate": "معدل الإنجاز",
  "Next up": "التالي",
  "Today's tasks": "مهام اليوم",
  tasks: "مهام",
  of: "من",
  "day streak": "أيام متتالية",
  "Focus session": "جلسة تركيز",
  "Ready when you are.": "جاهز متى ما كنت مستعدًا.",
  "Deep work, no distractions.": "عمل عميق، بلا تشتيت.",
  Custom: "مخصص",
  "Custom duration": "مدة مخصصة",
  "Set your own focus length.": "حدد مدة تركيزك الخاصة.",
  Hours: "ساعات",
  Minutes: "دقائق",
  Seconds: "ثوانٍ",
  Cancel: "إلغاء",
  "Use duration": "استخدم المدة",
  "Start session": "ابدأ الجلسة",
  "Pause session": "إيقاف مؤقت",
  "Reset session": "إعادة ضبط",
  "Skip session": "تخطي الجلسة",
  "Use whole, non-negative numbers.": "استخدم أرقامًا صحيحة غير سالبة.",
  "Minutes and seconds must be under 60.": "يجب أن تكون الدقائق والثواني أقل من ٦٠.",
  "Pick a duration between 1 second and 24 hours.": "اختر مدة بين ثانية واحدة و٢٤ ساعة.",

  // Tasks
  "Workspace / My tasks": "مساحة العمل / مهامي",
  "Your task list": "قائمة مهامك",
  "Finish the next useful thing, then let momentum do the rest.":
    "أنجز الشيء المفيد التالي، ودع الزخم يكمل الباقي.",
  "Daily completion": "الإنجاز اليومي",
  completed: "مكتملة",
  "Keep moving": "واصل التقدم",
  week: "أسبوع",
  month: "شهر",
  high: "عالية",
  medium: "متوسطة",
  low: "منخفضة",
  Today: "اليوم",
  Tomorrow: "غدًا",
  "Mark as done": "وضع علامة كمنجزة",
  "Mark as not done": "إلغاء علامة الإنجاز",
  "No tasks yet.": "لا توجد مهام بعد.",
  "Task actions": "إجراءات المهمة",
  Edit: "تعديل",
  Duplicate: "تكرار",
  Archive: "أرشفة",
  Unarchive: "إلغاء الأرشفة",
  Delete: "حذف",
  Priority: "الأولوية",
  "Mark complete": "وضع علامة مكتملة",
  "Mark incomplete": "وضع علامة غير مكتملة",

  // Task dialog
  "Task details": "تفاصيل المهمة",
  "Update this task and save your changes.": "حدّث هذه المهمة واحفظ تغييراتك.",
  "Create a new task for your workspace.": "أنشئ مهمة جديدة في مساحة عملك.",
  Title: "العنوان",
  Description: "الوصف",
  Category: "الفئة",
  "Due date": "تاريخ الاستحقاق",
  Reminder: "التذكير",
  "Estimated time (minutes)": "الوقت المقدر (دقائق)",
  Notes: "ملاحظات",
  "Tags (comma separated)": "الوسوم (مفصولة بفواصل)",
  Save: "حفظ",
  "Save changes": "حفظ التغييرات",
  "Give the task a title.": "أعطِ المهمة عنوانًا.",

  // Calendar
  "Workspace / Calendar": "مساحة العمل / التقويم",
  "Your month at a glance": "شهرك في لمحة",
  "Track daily finishes and keep the streak visible.": "تابع إنجازاتك اليومية وحافظ على سلسلتك.",
  "Monthly view": "عرض شهري",
  "Previous month": "الشهر السابق",
  "Next month": "الشهر التالي",
  "Selected day": "اليوم المحدد",
  "No tasks yet for this day. Double-click a day to add one.":
    "لا توجد مهام لهذا اليوم. انقر نقرًا مزدوجًا على يوم لإضافة مهمة.",
  Sun: "أحد",
  Mon: "إثنين",
  Tue: "ثلاثاء",
  Wed: "أربعاء",
  Thu: "خميس",
  Fri: "جمعة",
  Sat: "سبت",

  // Insights
  "Workspace / Insights": "مساحة العمل / التحليلات",
  "Momentum, measured.": "الزخم، بالأرقام.",
  "A calm read on how your week is actually going.": "قراءة هادئة لسير أسبوعك.",
  "Focus hours": "ساعات التركيز",
  "Current streak": "السلسلة الحالية",
  "Tasks finished": "المهام المنجزة",
  "This week": "هذا الأسبوع",
  "Keep it alive": "حافظ عليها",
  "Last 30 days": "آخر ٣٠ يومًا",
  "No data yet": "لا توجد بيانات بعد",
  "Complete a few tasks and your momentum will appear here.":
    "أنجز بعض المهام وسيظهر زخمك هنا.",

  // Projects
  "Your space / Projects": "مساحتك / المشاريع",
  "Every initiative you're moving forward, grouped in one place.":
    "كل مبادرة تعمل عليها، مجمّعة في مكان واحد.",
  Project: "مشروع",
  "tasks complete": "مهام مكتملة",

  // Notifications
  "Notification center": "مركز الإشعارات",
  "Mark all as read": "تعليم الكل كمقروء",
  "Clear all": "مسح الكل",
  "You're all caught up.": "لا جديد لديك.",
  "Upcoming reminder": "تذكير قادم",
  "Due today": "مستحق اليوم",
  "Pomodoro complete": "انتهت جلسة البومودورو",
  Achievement: "إنجاز",
  "Weekly summary": "الملخص الأسبوعي",
  "just now": "الآن",
  "Focus session finished. Time for a break.": "انتهت جلسة التركيز. حان وقت الاستراحة.",
  "Nice work — you crossed half of today's list.": "عمل رائع — تجاوزت نصف قائمة اليوم.",
  "Your weekly review is ready.": "مراجعتك الأسبوعية جاهزة.",

  // About / Settings shared
  "Workspace / About": "مساحة العمل / حول التطبيق",
  "About Luck Life": "حول لَك لايف",
  "The story, the status and what comes next.": "القصة والحالة وما هو قادم.",
  General: "عام",
  Appearance: "المظهر",
  Language: "اللغة",
  Productivity: "الإنتاجية",
  Account: "الحساب",
  Privacy: "الخصوصية",
  Dark: "داكن",
  Light: "فاتح",
  System: "النظام",
  complete: "مكتمل",
  days: "أيام",
  "What needs doing?": "ما الذي تريد إنجازه؟",
  "Estimated time (min)": "الوقت المقدر (دقيقة)",
  Tags: "الوسوم",
  "Create task": "إنشاء مهمة",
  "Keep, refresh label": "إبقاء التاريخ وتحديث التسمية",
  "Push 1 day": "تأجيل يوم",
  "Push 1 week": "تأجيل أسبوع",
  "Pick a date…": "اختر تاريخًا…",
  "deep work, review": "عمل عميق، مراجعة",
  Small: "صغير",
  Medium: "متوسط",
  Large: "كبير",
};

export function useT() {
  const { settings } = useLuckLive();
  const lang = settings.language;
  return useCallback((key: string) => (lang === "ar" ? (ar[key] ?? key) : key), [lang]);
}

export function useLocale() {
  const { settings } = useLuckLive();
  return settings.language === "ar" ? "ar" : "en-US";
}
