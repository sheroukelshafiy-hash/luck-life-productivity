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

  // Life Hub
  "Life Hub": "مركز الحياة",
  Planner: "المخطط",
  Budget: "الميزانية",
  "Life Hub / Planner": "مركز الحياة / المخطط",
  "Life Hub / Budget": "مركز الحياة / الميزانية",
  "Plan the rest of your life.": "خطّط لبقية حياتك.",
  "Appointments, meetings and events — separate from your tasks, together in one view.":
    "المواعيد والاجتماعات والفعاليات — منفصلة عن مهامك، ومجتمعة في مكان واحد.",
  "Money, calmly tracked.": "أموالك، بمتابعة هادئة.",
  "See where every unit goes and how the month is really trending.":
    "اعرف أين تذهب كل وحدة وكيف يسير الشهر فعليًا.",
  Day: "يوم",
  Week: "أسبوع",
  Month: "شهر",
  Previous: "السابق",
  Next: "التالي",
  "New appointment": "موعد جديد",
  "Add appointment": "إضافة موعد",
  "Appointment details": "تفاصيل الموعد",
  Appointments: "المواعيد",
  "Appointments live alongside your tasks without mixing with them.":
    "تظهر المواعيد بجانب مهامك دون أن تختلط بها.",
  "Nothing scheduled. Add your first appointment for this day.":
    "لا شيء مجدول. أضف أول موعد لهذا اليوم.",
  "Give the appointment a title.": "أضف عنوانًا للموعد.",
  "End time must be after the start time.": "يجب أن يكون وقت الانتهاء بعد البداية.",
  Meeting: "اجتماع",
  Class: "محاضرة",
  "Doctor appointment": "موعد طبي",
  Travel: "سفر",
  "Personal event": "حدث شخصي",
  Type: "النوع",
  "Start time": "وقت البداية",
  "End time": "وقت الانتهاء",
  Location: "الموقع",
  "Office, clinic, link…": "مكتب، عيادة، رابط…",
  "Work, health, family…": "عمل، صحة، عائلة…",
  "Reminder (minutes before)": "تذكير (دقائق قبل)",
  "Color label": "لون التصنيف",
  "Product sync": "اجتماع المنتج",

  // Budget
  Income: "الدخل",
  Expense: "مصروف",
  Expenses: "المصروفات",
  Amount: "المبلغ",
  Salary: "الراتب",
  Freelance: "عمل حر",
  Food: "الطعام",
  Transportation: "المواصلات",
  Shopping: "التسوق",
  Education: "التعليم",
  Bills: "الفواتير",
  Health: "الصحة",
  Entertainment: "الترفيه",
  Other: "أخرى",
  "Add expense": "إضافة مصروف",
  "Add income": "إضافة دخل",
  "Add transaction": "إضافة معاملة",
  "New transaction": "معاملة جديدة",
  "Transaction details": "تفاصيل المعاملة",
  "Track what comes in and what goes out.": "تابع ما يدخل وما يخرج.",
  "Enter an amount greater than zero.": "أدخل مبلغًا أكبر من صفر.",
  "Today's spending": "إنفاق اليوم",
  "Weekly spending": "الإنفاق الأسبوعي",
  "Monthly spending": "الإنفاق الشهري",
  "Remaining budget": "الميزانية المتبقية",
  "Monthly income": "الدخل الشهري",
  "Monthly expenses": "المصروفات الشهرية",
  "Monthly budget": "الميزانية الشهرية",
  "Planned vs actual": "المخطط مقابل الفعلي",
  "Set budget": "تحديد الميزانية",
  "Spending by category": "الإنفاق حسب الفئة",
  "Monthly spending trend": "اتجاه الإنفاق الشهري",
  "Income vs expenses": "الدخل مقابل المصروفات",
  "Recent transactions": "أحدث المعاملات",
  "No transactions yet.": "لا توجد معاملات بعد.",
  "No spending yet": "لا يوجد إنفاق بعد",
  "Add a transaction and your breakdown will appear here.":
    "أضف معاملة وسيظهر التوزيع هنا.",
  Breakdown: "التوزيع",
  Trend: "الاتجاه",
  Balance: "الرصيد",
  History: "السجل",
  Total: "الإجمالي",
  planned: "مخطط",
  "left this month": "متبقٍ هذا الشهر",
  "Over budget by": "تجاوز الميزانية بمقدار",
  Currency: "العملة",
  "Egyptian Pound": "الجنيه المصري",
  "US Dollar": "الدولار الأمريكي",
  Euro: "اليورو",

  // Months (chart labels)
  Jan: "يناير",
  Feb: "فبراير",
  Mar: "مارس",
  Apr: "أبريل",
  May: "مايو",
  Jun: "يونيو",
  Jul: "يوليو",
  Aug: "أغسطس",
  Sep: "سبتمبر",
  Oct: "أكتوبر",
  Nov: "نوفمبر",
  Dec: "ديسمبر",

  // Daily timeline
  Timeline: "الجدول الزمني",
  "activities planned": "أنشطة مخططة",
  "Add activity": "إضافة نشاط",
  "Edit activity": "تعديل النشاط",
  "New activity": "نشاط جديد",
  "Give this hour a purpose.": "امنح هذه الساعة هدفًا.",
  "Give this activity a title.": "أعطِ هذا النشاط عنوانًا.",
  "Toggle done": "تبديل الإنجاز",
  "Nothing planned yet. Tap any hour to add an activity.":
    "لا يوجد شيء مخطط بعد. اضغط على أي ساعة لإضافة نشاط.",

  // Focus session extras
  "Focus Together": "التركيز معًا",
  "Life Hub / Focus": "مركز الحياة / التركيز",
  "Short break": "استراحة قصيرة",
  "Long break": "استراحة طويلة",
  "Breathe. Then come back sharper.": "خذ نفسًا، ثم عد أكثر تركيزًا.",
  "Session complete. Nicely done.": "انتهت الجلسة. أحسنت.",
  "Sessions today": "جلسات اليوم",
  "Focused today": "تركيز اليوم",
  "Total focus time": "إجمالي وقت التركيز",
  "Daily focus goal": "هدف التركيز اليومي",
  Resume: "استئناف",
  Start: "بدء",
  Pause: "إيقاف مؤقت",
  Reset: "إعادة ضبط",

  // Focus Together
  "Share a timer, keep each other accountable — quietly.":
    "شاركوا مؤقتًا واحدًا، وحافظوا على التزامكم — بهدوء.",
  Solo: "منفرد",
  Together: "معًا",
  "Solo room": "غرفة منفردة",
  "Shared room": "غرفة مشتركة",
  "in focus now": "في تركيز الآن",
  "Everyone in the room shares this timer.": "كل من في الغرفة يشارك هذا المؤقت.",
  "Room is focusing. Notifications muted.": "الغرفة في وضع التركيز. الإشعارات صامتة.",
  "Waiting to start.": "بانتظار البدء.",
  "Your status": "حالتك",
  Available: "متاح",
  Busy: "مشغول",
  "In Focus": "في تركيز",
  Break: "استراحة",
  Offline: "غير متصل",
  "Invite friends": "دعوة الأصدقاء",
  "Share this room code. Anyone with it joins your synced timer.":
    "شارك رمز الغرفة. أي شخص لديه الرمز ينضم إلى مؤقتك المتزامن.",
  "Copy invite code": "نسخ رمز الدعوة",
  Copied: "تم النسخ",
  "No chat, ever. Focus rooms stay silent by design.":
    "لا محادثات إطلاقًا. غرف التركيز صامتة بالتصميم.",
  Participants: "المشاركون",
  "Add participant": "إضافة مشارك",
  "Participant name": "اسم المشارك",
  "Add someone to your focus room.": "أضف شخصًا إلى غرفة تركيزك.",
  "Enter a name.": "أدخل اسمًا.",
  "Participant actions": "إجراءات المشارك",
  "View profile": "عرض الملف",
  "Invite to focus session": "دعوة لجلسة تركيز",
  "Remove participant": "إزالة المشارك",
  "Remove this participant?": "إزالة هذا المشارك؟",
  "They will be removed from your focus room. This cannot be undone.":
    "سيتم إزالته من غرفة تركيزك. لا يمكن التراجع عن هذا.",
  Remove: "إزالة",
  "No participants yet. Add someone to focus with.": "لا يوجد مشاركون بعد. أضف شخصًا لتركزوا معًا.",
  "Join room": "الانضمام للغرفة",
  "Leave room": "مغادرة الغرفة",
  "You joined the room.": "لقد انضممت إلى الغرفة.",
  "You are not in the room.": "أنت لست في الغرفة.",
  "d streak": " يوم متتالٍ",
  "Session length": "مدة الجلسة",
  Profile: "الملف الشخصي",
  Status: "الحالة",
  Streak: "السلسلة",
  Close: "إغلاق",
  Invited: "تمت الدعوة",

  // Settings extras
  "Time format": "تنسيق الوقت",
  "24-hour": "٢٤ ساعة",
  "12-hour (AM/PM)": "١٢ ساعة (ص/م)",
  "Applies to planner, calendar, tasks and notifications.":
    "يطبق على المخطط والتقويم والمهام والإشعارات.",
  "Used across Budget and every financial view.": "يستخدم في الميزانية وكل العروض المالية.",
};

export function useT() {
  const { settings } = useLuckLive();
  const lang = settings.language;
  return useCallback((key: string) => (lang === "ar" ? (ar[key] ?? key) : key), [lang]);
}

export function useLocale() {
  const { settings } = useLuckLive();
  return settings.language === "ar" ? "ar-EG" : "en-US";
}

/** Formats an "HH:MM" string using the user's Time format setting and locale. */
export function useFormatTime() {
  const { settings } = useLuckLive();
  const locale = useLocale();
  const hour12 = settings.timeFormat === "12h";
  return useCallback(
    (hhmm: string) => {
      const [h, m] = hhmm.split(":").map((n) => Number(n));
      if (!Number.isFinite(h)) return hhmm;
      const d = new Date(2000, 0, 1, h ?? 0, m ?? 0);
      return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12 });
    },
    [locale, hour12],
  );
}

