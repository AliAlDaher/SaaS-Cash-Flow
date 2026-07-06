import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Globe, 
  Building2, 
  Mail, 
  Lock, 
  Check,
  X, 
  Loader2, 
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle,
  FileText,
  UserCheck,
  Users,
  Compass,
  Zap,
  ChevronDown,
  Landmark,
  Coins,
  Calendar
} from 'lucide-react';

import yotaxLogo from './assets/yotax_logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const translations = {
  EN: {
    // Header
    problem: "The Problem",
    howItWorks: "How It Works",
    features: "Features",
    aboutUs: "About Us",
    pricing: "Pricing",
    login: "Login",
    startTrial: "Start Trial",
    createWorkspace: "Create Workspace",
    
    // Hero
    heroBadge: "Simple Treasury Software",
    heroTitle1: "Know your cash flow.",
    heroTitle2: "Predict your balance.",
    heroSubtext: "Track bank accounts, cheques, and bills in one place. Stop guessing your balance and start planning your cash flow with simple, automated tools.",
    createWorkspaceBtn: "Create Your Workspace",
    seeHowItWorks: "See How it Works",

    // Problems
    problemsBadge: "The Problem with Manual Tracking",
    problemsTitle: "What holds finance teams back?",
    problemsSubtext: "Businesses suffer silent cash leaks every day due to outdated tools, delayed bank notifications, and fragile spreadsheet templates.",
    
    // Problem Card 1
    prob1Title: "Spreadsheet Errors",
    prob1Text: "A typo in a cell ruins your forecast. This leads to wrong balance calculations and cash flow mistakes.",
    prob1Foot: "✖ High human error rate",

    // Problem Card 2
    prob2Title: "Post-Dated Cheques",
    prob2Text: "Cheques sit in drawers. Without due date tracking, your bank account can bounce and cost you fees.",
    prob2Foot: "✖ Unpredictable bank balances",

    // Problem Card 3
    prob3Title: "Late Collections",
    prob3Text: "Forgetting to collect client payments reduces your liquidity. Your books look profitable, but your cash is low.",
    prob3Foot: "✖ Locked working capital",

    // Bypass / How it works
    bypassBadge: "How Yotax Works",
    bypassTitle: "Simple automation for your money",
    bypassSubtext: "When you launch your workspace, manual record entry is bypassed. Every critical transaction reconciles automatically.",
    
    // Bypass Card 1
    bypass1Title: "1. Import Your Ledgers",
    bypass1Text: "Create your company workspace in seconds. Move your bank ledgers in and start tracking cash immediately.",
    bypass1Foot: "✔ Private Workspace Vault",

    // Bypass Card 2
    bypass2Title: "2. Auto-Generate Bills",
    bypass2Text: "Utility bills, rents, and salaries populate automatically on the first of the month to show your baseline cash outflow.",
    bypass2Foot: "✔ Zero manual clerical setup",

    // Bypass Card 3
    bypass3Title: "3. Auto-Reconcile Cheques",
    bypass3Text: "Post-dated cheques clear automatically on their due dates. This keeps your cash flow chart and balance up to date.",
    bypass3Foot: "✔ Live synchronized liquid status",

    // Features Section
    featuresBadge: "Main Modules",
    featuresTitle: "Simple features to manage your cash",
    featuresSubtext: "Discover the built-in modules designed to enforce financial control, secure company assets, and eliminate administrative bottlenecks.",
    
    feat1Title: "Company Workspaces",
    feat1Text: "Get a dedicated space for your company financial ledgers and bank accounts.",
    feat2Title: "Expense Seeding",
    feat2Text: "Automatically generate recurring bills every month to predict your baseline expenses.",
    feat3Title: "Cheque Workflows",
    feat3Text: "Log post-dated cheques, set clearance dates, and record cash updates automatically.",
    feat4Title: "Supplier Reminders",
    feat4Text: "Track vendor invoice due dates to pay on time and avoid late payment fees.",
    feat5Title: "Dedicated URL",
    feat5Text: "Log into your own company address, like yourcompany.yotax.com.",
    feat6Title: "User Roles",
    feat6Text: "Give specific access to accountants, managers, and data entry staff.",

    // About Us Section
    aboutBadge: "About Us",
    aboutTitle: "Built for practical cash management",
    aboutText1: "We started Yotax to solve a simple problem: businesses spend too much time tracking bank balances and cheques in manual ledgers.",
    aboutText2: "We built this tool to automate basic bookkeeping tasks. It logs cheques, generates recurring expenses, and draws clear cash flow curves automatically.",
    aboutText3: "Today, over 150 companies use Yotax to track bank balances, record invoices, and forecast cash positions.",
    
    stat1: "Companies",
    stat2: "Cash Tracked",
    stat3: "System Uptime",

    aboutVal1Title: "Simple Financial Tracking",
    aboutVal1Text: "All bank ledgers, cheque collections, and expenses are tracked in one simple workspace.",
    aboutVal2Title: "Automated Operations",
    aboutVal2Text: "Cheques clear and monthly utility categories seed automatically without manual entries.",
    aboutVal3Title: "Multi-User Access",
    aboutVal3Text: "Add accountants, managers, and data entry staff to manage your records together.",

    // Pricing Section
    pricingBadge: "Pricing",
    pricingTitle: "Simple, Flat-Rate Pricing",
    pricingSubtext: "One simple plan with unlimited capabilities. Get full access to all cash flow features with zero limits.",

    planTitle: "Monthly Subscription",
    planDesc: "Everything included to manage your business cash flow.",
    planPrice: "$30",
    planPeriod: "/month",
    planFeat1: "Private Workspace Subdomain",
    planFeat2: "Unlimited Bank Accounts",
    planFeat3: "Post-Dated Cheque Tracking",
    planFeat4: "Automated Monthly Expense Seeding",
    planFeat5: "Team Member Role Permissions",
    planFeat6: "PDF Financial Reports & Reminders",
    planBtn: "Start Free Trial",

    // FAQ Section
    faqBadge: "Frequently Asked Questions",
    faqTitle: "Got Questions? We Have Answers",
    faqSubtext: "Learn how Yotax helps you manage your day-to-day cash flow and cheque transactions.",

    // Footer
    copyright: "© 2026 Yotax Inc. All rights reserved.",

    // Modal
    modalTitle: "Create New Workspace",
    modalCompLabel: "Company Name",
    modalCompPlaceholder: "e.g. Acme Corp",
    modalSubdomainLabel: "Workspace Subdomain",
    modalSubdomainPlaceholder: "acme",
    modalSubdomainHelp: "Your workspace address will be:",
    modalEmailLabel: "Admin Email Address",
    modalEmailPlaceholder: "admin@company.com",
    modalPassLabel: "Admin Password",
    modalPassPlaceholder: "Minimum 6 characters",
    modalSubmitBtn: "Complete Setup & Launch Workspace",
    modalSubmittingBtn: "Creating your workspace..."
  },
  AR: {
    // Header
    problem: "العقبات الماليّة",
    howItWorks: "آلية العمل",
    features: "المزايا",
    aboutUs: "من نحن",
    pricing: "الأسعار",
    login: "دخول",
    startTrial: "ابدأ التجربة",
    createWorkspace: "إنشاء مساحة عمل",

    // Hero
    heroBadge: "برنامج بسيط لإدارة التدفقات النقدية والخزينة",
    heroTitle1: "أدر تدفقاتك النقدية بسهولة.",
    heroTitle2: "وتوقع رصيدك البنكي بدقة.",
    heroSubtext: "منصة متكاملة لتتبع حساباتك البنكية، وجدولة الشيكات، وإدارة النفقات. وداعاً للافتراضات اليدوية، وابدأ بإدارة سيولتك النقدية بذكاء ووضوح.",
    createWorkspaceBtn: "أنشئ مساحة العمل لشركتك",
    seeHowItWorks: "شاهد آلية العمل",

    // Problems
    problemsBadge: "عقبات الإدارة المالية التقليدية",
    problemsTitle: "ما الذي يعطل الفريق المالي في شركتك؟",
    problemsSubtext: "تتعرض الشركات لخسائر مالية غير محسوسة يومياً بسبب الاعتماد على جداول البيانات الهشة، وتأخر إشعارات الشيكات والتحصيل.",

    // Problem Card 1
    prob1Title: "أخطاء صياغة جداول البيانات",
    prob1Text: "خطأ واحد في إدخال خلية أو معادلة إكسل يفسد توقعاتك المالية بالكامل، مما يعرض التزاماتك ورواتب موظفيك للخطر.",
    prob1Foot: "✖ نسبة خطأ بشري عالية",

    // Problem Card 2
    prob2Title: "إهمال متابعة الشيكات المؤجلة",
    prob2Text: "بقاء الشيكات المؤجلة في الأدراج دون تتبع يعرض حساباتك البنكية للارتجاع المفاجئ وغرامات السحب على المكشوف وتوتر العلاقات مع الموردين.",
    prob2Foot: "✖ أرصدة بنكية غير متوقعة",

    // Problem Card 3
    prob3Title: "تراكم المستحقات وتأخر التحصيل",
    prob3Text: "عدم المتابعة الدورية لفواتير العملاء المستحقة يجمد رأس مال شركتك. تبدو أرباحك ممتازة ورقياً، لكن خزينتك الفعلية فارغة.",
    prob3Foot: "✖ رأس مال عامل مجمد في الذمم المدينة",

    // Bypass / How it works
    bypassBadge: "منهجية يوتاكس الذكية",
    bypassTitle: "تخطى الفوضى المالية بلمسة واحدة",
    bypassSubtext: "بمجرد تشغيل منصة يوتاكس، تتخلص تماماً من أعباء الحسابات والمتابعات اليدوية لتسوى جميع تدفقاتك النقدية مؤتمتة بالكامل.",

    // Bypass Card 1
    bypass1Title: "1. استيراد سلس وفوري",
    bypass1Text: "أنشئ مساحة عمل شركتك في ثوانٍ. انقل دفاتر حساباتك البنكية الحالية وابدأ تتبع حركاتها النقدية فوراً.",
    bypass1Foot: "✔ مساحة عمل خاصة ومستقلة",

    // Bypass Card 2
    bypass2Title: "2. جدولة المصروفات تلقائياً",
    bypass2Text: "يتم توليد فواتير الإيجار والمرافق ورواتب فريق العمل تلقائياً بداية كل شهر لتوضيح التزاماتك النقدية الأساسية.",
    bypass2Foot: "✔ صفر إعدادات يدوية مكررة",

    // Bypass Card 3
    bypass3Title: "3. تسوية آلية مستمرة",
    bypass3Text: "تُسوى الشيكات المؤجلة وتُدرج في رصيدك البنكي تلقائياً فور حلول تاريخ استحقاقها لتحديث منحنى السيولة لحظياً.",
    bypass3Foot: "✔ تحديث فوري للحالة المالية والسيولة",

    // Features Section
    featuresBadge: "الأقسام والوحدات الأساسية",
    featuresTitle: "ميزات بسيطة لإدارة تدفقاتك المالية",
    featuresSubtext: "اكتشف الوحدات والوحدات البرمجية المصممة لفرض الرقابة المالية وتسهيل العمليات وتقليل المعوقات الإدارية.",

    feat1Title: "مساحات عمل مخصصة للشركات",
    feat1Text: "احصل على مساحة عمل مستقلة ومخصصة لدفاتر شركتك وحساباتك البنكية.",
    feat2Title: "توليد المصروفات التلقائي",
    feat2Text: "أنشئ مصروفاتك الدورية شهرياً بشكل تلقائي لتتوقع إجمالي مدفوعاتك القادمة.",
    feat3Title: "مسار عمل الشيكات",
    feat3Text: "سجل الشيكات المؤجلة، وحدد تواريخ استحقاقها، وراقب تأثيراتها على رصيدك النقدية تلقائياً.",
    feat4Title: "تنبيهات استحقاق الفواتير",
    feat4Text: "تتبع تواريخ استحقاق فواتير الموردين لتسديدها في الوقت المحدد وتفادي رسوم التأخير.",
    feat5Title: "رابط مخصص لفريقك",
    feat5Text: "سجل الدخول عبر عنوان مخصص لشركتك، مثل yourcompany.yotax.com.",
    feat6Title: "أدوار وصلاحيات المستخدمين",
    feat6Text: "امنح صلاحيات مخصصة لكل من المحاسبين، المدراء، وموظفي إدخال البيانات.",

    // About Us Section
    aboutBadge: "من نحن",
    aboutTitle: "منصة صممت بأيدي خبراء ماليين لخدمة الشركات",
    aboutText1: "انطلقت يوتاكس لحل مشكلة واقعية يعاني منها أغلب مدراء الشركات: إهدار ساعات طويلة في مراجعة كشوفات الحسابات وتحديث دفاتر الشيكات اليدوية هرباً من مفاجآت السيولة.",
    aboutText2: "قمنا بتطوير هذه المنصة لأتمتة العمليات الأساسية لحركة الأموال. فهي تسجل الشيكات، وتوقع الفواتير الدورية، وترسم منحنيات تدفق السيولة بوضوح وتلقائية.",
    aboutText3: "اليوم، تعتمد أكثر من 150 شركة ماليًا على يوتاكس لمتابعة أرصدتها وتوقعات تدفقاتها النقدية بدقة متناهية.",

    stat1: "شركات نشطة",
    stat2: "نقدية متتبعة",
    stat3: "جاهزية النظام",

    aboutVal1Title: "تتبع مالي مبسط",
    aboutVal1Text: "يتم تتبع الحسابات البنكية والشيكات والمصروفات بالكامل في واجهة موحدة وسهلة الاستخدام.",
    aboutVal2Title: "عمليات مالية مؤتمتة",
    aboutVal2Text: "تتم تسوية الشيكات وتوليد مصروفات الفواتير الدورية تلقائياً دون إدخال بشرى مكرر.",
    aboutVal3Title: "صلاحيات متعددة للمستخدمين",
    aboutVal3Text: "أضف المحاسبين والمدراء وموظفي إدخال البيانات لإدارة دفاتركم المالية سوياً.",

    // Pricing Section
    pricingBadge: "باقة الاشتراك",
    pricingTitle: "تسعير بسيط وموحد للجميع",
    pricingSubtext: "خطة اشتراك واحدة بميزات كاملة وغير محدودة. احصل على وصول كامل لجميع أدوات إدارة السيولة النقدية دون أي قيود.",

    planTitle: "الاشتراك الشهري",
    planDesc: "كل ما تحتاجه لإدارة التدفقات النقدية والسيولة لشركتك.",
    planPrice: "$30",
    planPeriod: "/شهرياً",
    planFeat1: "مساحة عمل خاصة بنطاق فرعي مخصص",
    planFeat2: "حسابات بنكية غير محدودة",
    planFeat3: "تتبع كامل الشيكات المؤجلة",
    planFeat4: "توليد المصروفات الدورية تلقائياً كل شهر",
    planFeat5: "أدوار وصلاحيات غير محدودة للمستخدمين",
    planFeat6: "تقارير مالية وتنبيهات بصيغة PDF",
    planBtn: "ابدأ الفترة التجريبية مجاناً",

    // FAQ Section
    faqBadge: "الأسئلة الشائعة",
    faqTitle: "لديك استفسارات؟ لدينا الإجابات",
    faqSubtext: "تعرف على كيفية مساعدة يوتاكس لشركتك في إدارة التدفق النقدي اليومي ومتابعة الشيكات.",

    // Footer
    copyright: "© 2026 يوتاكس. جميع الحقوق محفوظة.",

    // Modal
    modalTitle: "إنشاء مساحة عمل جديدة",
    modalCompLabel: "اسم الشركة",
    modalCompPlaceholder: "مثال: شركة النخبة التجارية",
    modalSubdomainLabel: "النطاق الفرعي لمساحة العمل",
    modalSubdomainPlaceholder: "acme",
    modalSubdomainHelp: "عنوان رابط مساحة العمل الخاصة بك سيكون:",
    modalEmailLabel: "البريد الإلكتروني للمسؤول",
    modalEmailPlaceholder: "admin@company.com",
    modalPassLabel: "كلمة مرور المسؤول",
    modalPassPlaceholder: "6 أحرف كحد أدنى",
    modalSubmitBtn: "إكمال الإعداد وتدشين مساحة العمل",
    modalSubmittingBtn: "جاري إنشاء مساحة عملك..."
  }
};

// Premium Circular Orbit Micro-Animation for Hero Centerpiece
function TreasuryAnimation({ lang: _lang }: { lang: 'EN' | 'AR' }) {
  const [activePullIndex, setActivePullIndex] = React.useState<number | null>(null);
  const [stage, setStage] = React.useState<'idle' | 'pulling' | 'processing' | 'pushing' | 'done'>('idle');
  const [pulse, setPulse] = React.useState(false);
  const [ripples, setRipples] = React.useState<Array<{ id: number }>>([]);

  const R = 150; // Orbit Radius in pixels

  // Source Icons Definition
  const sourceIcons = [
    { icon: Landmark, color: "#3B5BFF" },     // Bank Account (12 o'clock)
    { icon: FileText, color: "#F59E0B" },     // Supplier Invoice (10 o'clock)
    { icon: Clock, color: "#06B6D4" },        // Post-Dated Cheque (2 o'clock)
    { icon: Layers, color: "#F43F5E" },       // Expense Receipt (8 o'clock)
    { icon: Coins, color: "#8B5CF6" },        // Payment (4 o'clock)
    { icon: Calendar, color: "#EC4899" }      // Monthly Expense (6 o'clock)
  ];

  // Base angles for the 6 orbiting icons
  const angles = [270, 210, 330, 150, 30, 90];

  // Handle circular workflow spawning
  React.useEffect(() => {
    let active = true;

    const runCycle = () => {
      if (!active) return;

      // Pick a random icon to pull in
      const idx = Math.floor(Math.random() * 6);
      
      // Start pulling in
      setActivePullIndex(idx);
      setStage('pulling');

      // 1. Hits center at 1.0s
      setTimeout(() => {
        if (!active) return;
        setStage('processing');
        setPulse(true);

        const rippleId = Math.random();
        setRipples(prev => [...prev, { id: rippleId }]);

        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== rippleId));
        }, 700);

        setTimeout(() => {
          setPulse(false);
        }, 500);
      }, 1000);

      // 2. Starts emerging from center to opposite side at 1.3s
      setTimeout(() => {
        if (!active) return;
        setStage('pushing');
      }, 1300);

      // 3. Reaches opposite side and locks in at 2.3s
      setTimeout(() => {
        if (!active) return;
        setStage('done');
      }, 2300);

      // 4. Vanishes and resets back to orbit at 3.8s
      setTimeout(() => {
        if (!active) return;
        setStage('idle');
        setActivePullIndex(null);
      }, 3800);

      // Schedule next cycle (runs every 6 seconds)
      setTimeout(runCycle, 6000);
    };

    // Start first cycle after a short initial delay
    const initialTimer = setTimeout(runCycle, 2000);

    return () => {
      active = false;
      clearTimeout(initialTimer);
    };
  }, []);

  return (
    <div className="relative max-w-[640px] w-full mx-auto h-[380px] hidden md:flex items-center justify-center overflow-visible bg-transparent mt-12 mb-8 select-none">
      {/* Background Radial Glow */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 -z-10 rounded-full" 
        style={{
          background: 'radial-gradient(circle at center, rgba(59, 91, 255, 0.04) 0%, rgba(16, 185, 129, 0.01) 60%, transparent 80%)',
          filter: 'blur(14px)',
          transform: 'scale(1.1)'
        }}
      />

      {/* Inject orbital CSS keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes orbit-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes orbit-spin-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .animate-orbit-container {
          animation: orbit-spin 45s linear infinite;
        }
        .animate-orbit-icon-reverse {
          animation: orbit-spin-reverse 45s linear infinite;
        }

        @keyframes pulse-ripple-orbit {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-pulse-ripple-orbit-item {
          animation: pulse-ripple-orbit 0.7s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }

        @keyframes gentle-logo-float-orbit {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-gentle-logo-float-orbit {
          animation: gentle-logo-float-orbit 4s ease-in-out infinite;
        }

        /* Slowly rotate each icon bubble on its own axis */
        @keyframes slow-wobble {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(8deg); }
        }
        .animate-slow-wobble {
          animation: slow-wobble 4s ease-in-out infinite;
        }
      ` }} />

      {/* Orbit Track Rings (Subtle decorative dotted circles) */}
      <div className="absolute w-[300px] h-[300px] rounded-full border border-dashed border-slate-100 pointer-events-none" />

      {/* Orbit Container (slowly spinning) */}
      <div className="absolute w-[360px] h-[360px] flex items-center justify-center animate-orbit-container select-none">
        
        {/* Render 6 Orbiting Icons */}
        {angles.map((angle, idx) => {
          const IconComponent = sourceIcons[idx].icon;
          const color = sourceIcons[idx].color;
          const isBeingPulled = activePullIndex === idx;
          
          let style = {};
          
          if (isBeingPulled) {
            if (stage === 'pulling') {
              // Sliding straight to the center
              style = {
                transform: `rotate(${angle}deg) translate(0px) rotate(-${angle}deg) scale(0.5)`,
                opacity: 0,
                transition: 'transform 1.0s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1.0s ease-in'
              };
            } else {
              // Processing, hidden at center
              style = {
                transform: `rotate(${angle}deg) translate(0px) rotate(-${angle}deg) scale(0.2)`,
                opacity: 0,
                transition: 'none'
              };
            }
          } else {
            // Normal orbiting position
            style = {
              transform: `rotate(${angle}deg) translate(${R}px) rotate(-${angle}deg) scale(1)`,
              opacity: stage === 'idle' ? 1 : 0.85,
              transition: 'transform 0.8s ease-out, opacity 0.8s ease-out'
            };
          }

          return (
            <div 
              key={`orbit-node-${idx}`}
              className="absolute w-13 h-13 flex items-center justify-center pointer-events-none"
              style={style}
            >
              {/* Outer icon card */}
              <div 
                className="w-13 h-13 rounded-full bg-white border border-slate-200/80 shadow-md flex items-center justify-center animate-orbit-icon-reverse"
              >
                <div className="animate-slow-wobble flex items-center justify-center">
                  <IconComponent className="w-6.5 h-6.5" style={{ color }} />
                </div>
              </div>
            </div>
          );
        })}

        {/* Render Emerging Output Card (emerges on opposite side) */}
        {activePullIndex !== null && (stage === 'pushing' || stage === 'done') && (() => {
          const idx = activePullIndex;
          const IconComponent = sourceIcons[idx].icon;
          
          // Opposite angle (A + 180)
          const baseAngle = angles[idx];
          const oppositeAngle = baseAngle + 180;

          // Transition settings
          let style = {};
          if (stage === 'pushing') {
            // Emerging from center
            style = {
              transform: `rotate(${oppositeAngle}deg) translate(${R}px) rotate(-${oppositeAngle}deg) scale(1.05)`,
              opacity: 1,
              transition: 'transform 1.0s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease-out'
            };
          } else {
            // Reached opposite side, fading out after 1.5s
            style = {
              transform: `rotate(${oppositeAngle}deg) translate(${R}px) rotate(-${oppositeAngle}deg) scale(1.05)`,
              opacity: 0,
              transition: 'transform 0.5s ease-in, opacity 1.5s ease-in'
            };
          }

          return (
            <div 
              className="absolute w-13 h-13 flex items-center justify-center animate-orbit-icon-reverse z-20 pointer-events-none"
              style={style}
            >
              <div className="w-13 h-13 rounded-full bg-blue-50 border border-blue-300 shadow-md flex items-center justify-center text-blue-600 relative">
                <IconComponent className="w-6.5 h-6.5" />
                {/* Blue checkmark badge */}
                <div className="absolute -top-1.5 -right-1.5 w-5.5 h-5.5 rounded-full bg-blue-500 flex items-center justify-center text-white border border-white shadow-sm">
                  <Check className="w-3.5 h-3.5 font-bold" />
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Central Glassmorphic Yotax Hexagon Hub (Logo Engine) */}
      <div className="absolute w-[88px] h-[88px] flex items-center justify-center select-none pointer-events-none z-10 animate-gentle-logo-float-orbit">
        {/* subtle rotating outer ring */}
        <div className="absolute inset-[-22px] rounded-full border border-slate-200/50 border-dashed animate-rotate-outer-ring" />
        
        {/* soft glowing ring */}
        <div className="absolute inset-[-10px] rounded-full border-2 border-blue-500/5 shadow-[0_0_12px_rgba(59,91,255,0.06)]" />

        {/* expanding ripple whenever new data arrives */}
        {ripples.map(r => (
          <div 
            key={r.id}
            className="absolute inset-0 rounded-full border border-blue-500/20 bg-blue-500/5 animate-pulse-ripple-orbit-item"
          />
        ))}

        {/* main glass circle containing logo */}
        <div className={`relative w-17 h-17 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/85 shadow-lg flex items-center justify-center transition-all duration-300 ${pulse ? 'scale-[1.08] shadow-[0_0_15px_rgba(59,91,255,0.18)] border-blue-400/50' : ''}`}>
          <svg className="w-8.5 h-8.5 overflow-visible" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="logo-blue-v2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B5BFF" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <filter id="logo-glow-v2" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            {/* Hexagon outline */}
            <path 
              d="M 50 8 L 92 32 L 92 68 L 65 84 L 58 80 L 80 63 L 80 37 L 50 20 L 20 37 L 20 63 L 42 80 L 35 84 L 8 68 L 8 32 Z" 
              fill="url(#logo-blue-v2)"
              filter="url(#logo-glow-v2)"
              className="animate-pulse"
              style={{ animationDuration: '4s' }}
            />
            
            {/* Dark Gray 'Y' */}
            <path 
              d="M 44 90 A 6 6 0 0 0 56 90 L 56 58 L 78 40 L 72 32 L 50 48 L 28 32 L 22 40 L 44 58 Z" 
              fill="#1e293b" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
}


export default function LandingPage() {
  const [lang, setLang] = useState<'EN' | 'AR'>('EN');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    subdomain: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdSubdomain, setCreatedSubdomain] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const t = translations[lang];

  const faqs = [
    {
      q: lang === 'EN' ? "How does cheque tracking work?" : "كيف يعمل تتبع الشيكات؟",
      a: lang === 'EN' 
        ? "You log your post-dated cheques with their due dates. Yotax tracks the due dates and alerts you before they clear, helping you avoid overdraft fees."
        : "تقوم بتسجيل شيكاتك المؤجلة مع تواريخ استحقاقها. يتتبع يوتاكس تواريخ الاستحقاق وينبهك قبل موعد سحبها، مما يجنبك غرامات السحب على المكشوف."
    },
    {
      q: lang === 'EN' ? "What bank accounts can I track?" : "ما هي الحسابات البنكية التي يمكنني تتبعها؟",
      a: lang === 'EN'
        ? "You can track any current, savings, or credit card accounts. You log or import your bank transactions to keep your cash flow charts accurate."
        : "يمكنك تتبع أي حسابات جارية، أو ادخارية، أو حسابات بطاقات الائتمان. تقوم بتسجيل أو استيراد حركات حسابك لتحديث رسومات التدفق النقدي."
    },
    {
      q: lang === 'EN' ? "What is expense seeding?" : "ما هو التوليد التلقائي للمصروفات؟",
      a: lang === 'EN'
        ? "It automatically generates recurring bills like rent, utilities, and employee salaries on the first of each month. This saves time on manual bookkeeping."
        : "هي ميزة تنشئ مصروفاتك الدورية تلقائياً (مثل الإيجار، فواتير الكهرباء، ورواتب الموظفين) في اليوم الأول من كل شهر لتفادي الكتابة اليدوية."
    },
    {
      q: lang === 'EN' ? "Can my accountant use this too?" : "هل يمكن للمحاسب الخاص بي استخدام النظام؟",
      a: lang === 'EN'
        ? "Yes. You can invite team members like accountants, managers, or data-entry staff with customized view or edit access."
        : "نعم، يمكنك دعوة أعضاء فريق العمل مثل المحاسبين أو المدراء الماليين أو مدخلي البيانات مع تحديد صلاحيات مخصصة لكل منهم للعرض أو التعديل."
    },
    {
      q: lang === 'EN' ? "How does Yotax predict my balance?" : "كيف يتوقع يوتاكس رصيدي المستقبلي؟",
      a: lang === 'EN'
        ? "It combines your current bank balances, upcoming post-dated cheques, and recurring bills to draw a cash flow chart for the next 30 days."
        : "يقوم النظام بدمج رصيدك الحالي الفعلي في البنك مع الشيكات المؤجلة القادمة والمصروفات الدورية المجدولة ليرسم لك خط السيولة للـ 30 يوماً القادمة."
    }
  ];

  const getDomainBase = () => {
    let host = window.location.host;
    if (host.startsWith('www.')) {
      host = host.substring(4);
    }
    return host;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'subdomain') {
      const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/onboarding/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      setSuccess(true);
      setCreatedSubdomain(data.subdomain);
      
      setTimeout(() => {
        window.location.href = `${window.location.protocol}//${data.subdomain}.${getDomainBase()}/login`;
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#fafafd] text-slate-800 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden relative"
      dir={lang === 'AR' ? 'rtl' : 'ltr'}
    >
      
      {/* Custom Keyframe Animations CSS */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1.5deg); }
        }
        @keyframes blob-a {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-25px, 35px) scale(0.95); }
        }
        @keyframes blob-b {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-35px, 40px) scale(0.9); }
          66% { transform: translate(45px, -25px) scale(1.1); }
        }
        @keyframes chart-draw {
          from { stroke-dashoffset: 200; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes live-dot {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 7s ease-in-out infinite;
        }
        .animate-live-dot {
          animation: live-dot 2s infinite ease-in-out;
        }

        /* 1. Spreadsheet Pain Animations */
        @keyframes cell-switch {
          0%, 30%, 100% { opacity: 1; transform: scale(1); }
          38%, 92% { opacity: 0; transform: scale(0.95); }
        }
        @keyframes cell-error-switch {
          0%, 30%, 100% { opacity: 0; transform: scale(0.95); }
          38%, 92% { opacity: 1; transform: scale(1); }
        }
        @keyframes cell-shake {
          0%, 30%, 92%, 100% { transform: rotate(0deg); }
          38%, 50%, 62%, 74%, 86% { transform: rotate(-1.5deg) scale(1.02); }
          44%, 56%, 68%, 80% { transform: rotate(1.5deg) scale(1.02); }
        }
        .animate-cell-normal {
          animation: cell-switch 4.5s ease-in-out infinite;
        }
        .animate-cell-error {
          animation: cell-error-switch 4.5s ease-in-out infinite;
        }
        .animate-cell-shake {
          animation: cell-shake 4.5s ease-in-out infinite;
        }

        /* 2. Cheque Bounced Animations */
        @keyframes cheque-move {
          0% { transform: translateX(calc(-100% - 10px)); opacity: 0; }
          15%, 45% { transform: translateX(0); opacity: 1; }
          55%, 85% { transform: translateX(calc(100% + 40px)); opacity: 0.1; }
          100% { transform: translateX(calc(100% + 80px)); opacity: 0; }
        }
        @keyframes warning-bounce {
          0%, 48%, 100% { opacity: 0; transform: translate(-50%, 10px) scale(0.9); }
          56%, 82% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        .animate-cheque-flow {
          animation: cheque-move 5s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }
        .animate-bounce-warn {
          animation: warning-bounce 5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        /* 3. Invoice Lock Animations */
        @keyframes invoice-dim {
          0%, 30%, 100% { opacity: 1; filter: grayscale(0%); }
          45%, 85% { opacity: 0.2; filter: grayscale(100%); }
        }
        @keyframes lock-pop {
          0%, 32%, 100% { opacity: 0; transform: scale(0.6) translate(-50%, -50%); }
          46%, 82% { opacity: 1; transform: scale(1) translate(-50%, -50%); }
        }
        .animate-invoice-dim {
          animation: invoice-dim 4.5s ease-in-out infinite;
        }
        .animate-lock-pop {
          animation: lock-pop 4.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        /* 4. Bypass Flows */
        @keyframes flow-particles {
          0% { left: 0%; opacity: 0; }
          12% { opacity: 1; }
          88% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes vault-pulse {
          0%, 75%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
          85% { transform: scale(1.08); box-shadow: 0 0 16px 4px rgba(37, 99, 235, 0.25); }
        }
        .animate-flow-p1 { animation: flow-particles 2.4s linear infinite; }
        .animate-flow-p2 { animation: flow-particles 2.4s linear infinite; animation-delay: 0.8s; }
        .animate-flow-p3 { animation: flow-particles 2.4s linear infinite; animation-delay: 1.6s; }
        .animate-vault-pulse { animation: vault-pulse 2.4s ease-in-out infinite; }

        /* 5. Seeding Animations */
        @keyframes row-cascade {
          0% { transform: translateY(-12px); opacity: 0; }
          10%, 90% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(12px); opacity: 0; }
        }
        .animate-cascade-1 { animation: row-cascade 4.5s cubic-bezier(0.25, 1, 0.5, 1) infinite; }
        .animate-cascade-2 { animation: row-cascade 4.5s cubic-bezier(0.25, 1, 0.5, 1) infinite; animation-delay: 0.6s; }
        .animate-cascade-3 { animation: row-cascade 4.5s cubic-bezier(0.25, 1, 0.5, 1) infinite; animation-delay: 1.2s; }

        /* 6. Cheque Clearance Animations */
        @keyframes cheque-slide-down {
          0%, 100% { transform: translateY(-15px) scale(0.95); opacity: 0; }
          15%, 72% { transform: translateY(0) scale(1); opacity: 1; }
          85% { transform: translateY(15px) scale(0.95); opacity: 0; }
        }
        @keyframes bar-grow {
          0%, 15%, 85%, 100% { height: 35%; }
          35%, 72% { height: 82%; }
        }
        .animate-clear-slide { animation: cheque-slide-down 4.2s cubic-bezier(0.25, 1, 0.5, 1) infinite; }
        .animate-bar-grow { animation: bar-grow 4.2s ease-in-out infinite; }

        /* Chart drawings */
        .chart-line-draw {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: chart-draw 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .chart-fill-draw {
          opacity: 0;
          transition: opacity 1.5s ease-out 1s;
        }
        .group\/card:hover .chart-fill-draw {
          opacity: 1;
        }
      `}</style>

      {/* Floating Graticule Background Grid */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 -z-20" 
        style={{
          backgroundImage: `linear-gradient(to right, color-mix(in oklab, var(--color-sky-500) 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--color-sky-500) 8%, transparent) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 95% 72% at 50% 0%, black 30%, transparent 76%)',
          WebkitMaskImage: 'radial-gradient(ellipse 95% 72% at 50% 0%, black 30%, transparent 76%)'
        }}
      />

      {/* Glowing Blur Blobs */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-32 -start-40 size-[38rem] rounded-full blur-[110px] opacity-25 -z-10" 
        style={{
          background: 'radial-gradient(circle, var(--color-sky-500) 0%, transparent 70%)',
          animation: 'blob-a 15s ease-in-out infinite'
        }}
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute top-10 -end-44 size-[32rem] rounded-full blur-[110px] opacity-20 -z-10" 
        style={{
          background: 'radial-gradient(circle, var(--color-sky-200) 0%, transparent 70%)',
          animation: 'blob-b 15s ease-in-out infinite',
          animationDelay: '3s'
        }}
      />

      {/* Floating Header */}
      <header className="fixed top-3 sm:top-4 inset-x-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 w-full">
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-full h-14 pl-3 pr-2 sm:pl-4 sm:pr-3 flex items-center justify-between gap-2 shadow-lg shadow-slate-100/50">
            <a className="flex items-center min-w-0" aria-label="Yotax" href="/">
              <img 
                src={yotaxLogo} 
                alt="Yotax Logo" 
                className="inline-block w-auto select-none h-7 sm:h-8 shrink-0 object-contain" 
              />
            </a>
            <nav className="flex items-center gap-0.5 sm:gap-1">
              <a className="hidden md:inline-block px-3 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors rounded-full" href="#problems">{t.problem}</a>
              <a className="hidden md:inline-block px-3 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors rounded-full" href="#demo-video">{t.howItWorks}</a>
              <a className="hidden md:inline-block px-3 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors rounded-full" href="#features">{t.features}</a>
              <a className="hidden md:inline-block px-3 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors rounded-full" href="#about">{t.aboutUs}</a>
              <a className="hidden md:inline-block px-3 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors rounded-full" href="#pricing">{t.pricing}</a>
              
              <span className="hidden lg:inline text-slate-200 mx-1">|</span>

              {/* Language switcher flag icon */}
              <div 
                onClick={() => setLang(lang === 'EN' ? 'AR' : 'EN')}
                className="w-8 h-8 rounded-full overflow-hidden border border-slate-200/60 flex items-center justify-center shrink-0 shadow-sm bg-slate-50 cursor-pointer hover:border-slate-300 transition-colors"
                title={lang === 'EN' ? 'العربية' : 'English'}
              >
                <span className="text-[14px] select-none">{lang === 'EN' ? '🇸🇦' : '🇬🇧'}</span>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="group/button inline-flex shrink-0 items-center justify-center font-bold whitespace-nowrap transition-all outline-none select-none h-7 gap-1 px-3 text-[0.8rem] rounded-full hover:bg-slate-100 text-slate-700"
              >
                {t.login}
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="group/button inline-flex shrink-0 items-center justify-center font-bold whitespace-nowrap transition-all outline-none select-none h-7 gap-1 px-3.5 text-[0.8rem] rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10"
              >
                {t.startTrial}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-36 pb-20 sm:pb-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 w-full">
        <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-7 z-10 relative">
          <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-blue-700 shadow-sm">
            <span className="size-1.5 rounded-full bg-blue-500 animate-live-dot" />
            {t.heroBadge}
          </p>
          <h1 className="text-[2.75rem] sm:text-6xl lg:text-7xl font-extrabold leading-[1.06] text-slate-900 tracking-tight">
            <span className="block">{lang === 'EN' ? "Know your cash flow," : "أدر تدفقاتك النقدية بسهولة،"}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {lang === 'EN' ? "Predict your balance." : "وتوقع رصيدك البنكي بدقة."}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-[1.7] max-w-2xl mx-auto font-medium">
            {t.heroSubtext}
          </p>
          <div className="flex flex-wrap gap-2 justify-center pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              {lang === 'EN' ? "Automatic Seeding" : "توليد تلقائي للمصروفات"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
              {lang === 'EN' ? "Cheque Clearance Sync" : "تسوية الشيكات المؤجلة"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              {lang === 'EN' ? "Unlimited Accounts" : "حسابات بنكية غير محدودة"}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding font-bold transition-all outline-none h-12 sm:h-13 px-8 text-base rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/10 flex gap-2"
            >
              {t.createWorkspaceBtn}
              <ArrowRight className={`w-5 h-5 ${lang === 'AR' ? 'rotate-180' : ''}`} />
            </button>
            <a 
              href="#demo-video"
              className="group/button inline-flex shrink-0 items-center justify-center bg-clip-padding font-bold transition-all border border-slate-200 h-12 sm:h-13 px-8 text-base rounded-xl bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              {t.seeHowItWorks}
            </a>
          </div>
        </div>

        
        {/* Centerpiece Forecasting Mockup (Circular Orbit Animation) */}
        <TreasuryAnimation lang={lang} />
      </section>

      {/* The Problem Section */}
      <section id="problems" className="py-24 border-t border-slate-200/50 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs sm:text-[13px] font-extrabold uppercase mb-3 text-rose-600 tracking-wider">{t.problemsBadge}</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">{t.problemsTitle}</h2>
            <p className="text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              {t.problemsSubtext}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Excel Pain */}
            <div className="p-7 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between overflow-hidden relative group hover:shadow-md hover:border-rose-200 transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-6">
                  <FileSpreadsheet className="w-5.5 h-5.5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2.5">{t.prob1Title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {t.prob1Text}
                </p>
                
                {/* Visual Loop: Spreadsheet with error shakes */}
                <div className="relative h-28 w-full bg-white rounded-xl overflow-hidden p-3 font-mono text-[10px] text-slate-700 border border-slate-200 animate-cell-shake">
                  {/* Table Normal */}
                  <div className="absolute inset-0 p-3 flex flex-col justify-between animate-cell-normal">
                    <div className="flex justify-between text-slate-400 border-b border-slate-100 pb-1">
                      <span>BUDGET_Q3.XLSX</span>
                      <span className="text-emerald-500 font-bold">● OK</span>
                    </div>
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between"><span>Bank Balance</span><span>$13,500</span></div>
                      <div className="flex justify-between font-bold text-slate-800"><span>FORECAST</span><span>$15,000</span></div>
                    </div>
                  </div>
                  {/* Table Typo Error */}
                  <div className="absolute inset-0 p-3 flex flex-col justify-between animate-cell-error opacity-0">
                    <div className="flex justify-between text-rose-500 border-b border-rose-100 pb-1">
                      <span>BUDGET_Q3.XLSX</span>
                      <span className="text-rose-600 font-bold">● TYPO ERROR</span>
                    </div>
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between text-rose-600"><span>Bank Balance</span><span>13o50</span></div>
                      <div className="flex justify-between font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1 rounded"><span>FORECAST</span><span>#VALUE!</span></div>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-600 mt-6 block">{t.prob1Foot}</span>
            </div>

            {/* Card 2: Unmonitored Cheque Clears */}
            <div className="p-7 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between overflow-hidden relative group hover:shadow-md hover:border-amber-200 transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-6">
                  <Clock className="w-5.5 h-5.5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2.5">{t.prob2Title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {t.prob2Text}
                </p>
                
                {/* Visual Loop: Sliding cheque and bounce warning */}
                <div className="relative h-28 w-full bg-white rounded-xl overflow-hidden p-3 border border-slate-200">
                  <div className="absolute inset-x-3 top-3 h-0.5 bg-slate-100 rounded">
                    <div className="absolute top-1/2 left-2/3 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-500 border border-white" />
                  </div>
                  
                  {/* Sliding Cheque Document */}
                  <div className="absolute left-4 top-8 p-1.5 rounded bg-amber-50 border border-amber-200 text-[9px] font-mono text-slate-700 flex items-center gap-1.5 animate-cheque-flow shadow-sm">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>Cheque #4029 ($8.5k)</span>
                  </div>
                  
                  {/* Bounced alert banner */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-[9px] font-bold text-rose-700 flex items-center gap-1.5 animate-bounce-warn opacity-0 shadow-md">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>BOUNCED! -$45 NSF FEE</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-600 mt-6 block">{t.prob2Foot}</span>
            </div>

            {/* Card 3: Delayed Invoice Reminders */}
            <div className="p-7 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between overflow-hidden relative group hover:shadow-md hover:border-blue-200 transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6">
                  <AlertTriangle className="w-5.5 h-5.5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2.5">{t.prob3Title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {t.prob3Text}
                </p>
                
                {/* Visual Loop: Fading invoice under padlock */}
                <div className="relative h-28 w-full bg-white rounded-xl overflow-hidden p-3 flex justify-between items-center border border-slate-200">
                  {/* Invoice card */}
                  <div className="w-24 p-2 rounded bg-slate-50 border border-slate-150 text-[8px] font-mono space-y-1.5 animate-invoice-dim">
                    <div className="h-1 w-8 bg-slate-200" />
                    <div className="h-1.5 w-16 bg-blue-500" />
                    <div className="h-1 w-12 bg-slate-300" />
                    <div className="text-right text-blue-600 font-bold">$12,000</div>
                  </div>

                  {/* Hourglass or Clock */}
                  <div className="w-8 h-8 rounded-full border-2 border-slate-200 relative flex items-center justify-center">
                    <div className="absolute w-0.5 h-3 bg-slate-400 origin-bottom bottom-1/2 left-[15px] animate-spin" style={{ animationDuration: '3.5s' }} />
                    <div className="absolute w-0.5 h-2 bg-slate-300 origin-bottom bottom-1/2 left-[15px] animate-spin" style={{ animationDuration: '10s' }} />
                  </div>

                  {/* Absolute Padlock center */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-lock-pop opacity-0 pointer-events-none">
                    <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 font-extrabold text-[9px] flex items-center gap-1.5 shadow-lg">
                      <Lock className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
                      <span>CAPITAL LOCKED</span>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600 mt-6 block">{t.prob3Foot}</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / METHODOLOGY SECTION (Nuqtaty style) */}
      <section id="demo-video" className="py-24 bg-slate-50 border-t border-slate-200/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs sm:text-[13px] font-extrabold uppercase mb-3 text-blue-600 tracking-wider">{t.bypassBadge}</p>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">{t.bypassTitle}</h3>
            <p className="text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              {t.bypassSubtext}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Import Ledgers */}
            <div className="p-7 sm:p-8 rounded-2xl bg-white border border-slate-200/80 flex flex-col justify-between overflow-hidden shadow-sm relative group hover:border-blue-300 hover:shadow-md transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6">
                  <Layers className="w-5.5 h-5.5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2.5">{t.bypass1Title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {t.bypass1Text}
                </p>

                {/* Animation: Particles flowing to vault */}
                <div className="relative h-28 w-full bg-slate-50 rounded-xl overflow-hidden p-3 border border-slate-100 flex items-center justify-between">
                  <FileSpreadsheet className="w-7 h-7 text-emerald-500 shrink-0" />
                  
                  {/* Track path */}
                  <div className="flex-1 mx-3 h-0.5 bg-slate-200 relative">
                    <span className="absolute w-2 h-2 rounded-full bg-blue-600 -translate-y-1/2 animate-flow-p1" />
                    <span className="absolute w-2 h-2 rounded-full bg-blue-600 -translate-y-1/2 animate-flow-p2" />
                    <span className="absolute w-2 h-2 rounded-full bg-blue-600 -translate-y-1/2 animate-flow-p3" />
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 animate-vault-pulse">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600 mt-6 block">{t.bypass1Foot}</span>
            </div>

            {/* Card 2: Auto-Seed Expenses */}
            <div className="p-7 sm:p-8 rounded-2xl bg-white border border-slate-200/80 flex flex-col justify-between overflow-hidden shadow-sm relative group hover:border-blue-300 hover:shadow-md transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6">
                  <Clock className="w-5.5 h-5.5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2.5">{t.bypass2Title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {t.bypass2Text}
                </p>

                {/* Animation: Cascade list seeds */}
                <div className="relative h-28 w-full bg-slate-50 rounded-xl overflow-hidden p-3 border border-slate-100 space-y-1.5 flex flex-col justify-center">
                  <div className="p-1.5 bg-white rounded border border-slate-200 text-[8px] font-bold text-slate-800 flex justify-between items-center animate-cascade-1">
                    <span>Rent & Utilities</span>
                    <span className="text-[7px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-bold">SEEDED</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200 text-[8px] font-bold text-slate-800 flex justify-between items-center animate-cascade-2 opacity-0">
                    <span>Team Salaries</span>
                    <span className="text-[7px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-bold">SEEDED</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200 text-[8px] font-bold text-slate-800 flex justify-between items-center animate-cascade-3 opacity-0">
                    <span>Office Supplies</span>
                    <span className="text-[7px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-bold">SEEDED</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600 mt-6 block">{t.bypass2Foot}</span>
            </div>

            {/* Card 3: Auto-Reconcile Cheques */}
            <div className="p-7 sm:p-8 rounded-2xl bg-white border border-slate-200/80 flex flex-col justify-between overflow-hidden shadow-sm relative group hover:border-blue-300 hover:shadow-md transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6">
                  <Sparkles className="w-5.5 h-5.5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2.5">{t.bypass3Title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {t.bypass3Text}
                </p>

                {/* Animation: Cheque slip and chart grow */}
                <div className="relative h-28 w-full bg-slate-50 rounded-xl overflow-hidden p-3 border border-slate-100 flex justify-between items-end">
                  {/* Ledger bar chart */}
                  <div className="flex gap-2 items-end h-full w-20">
                    <div className="w-3 bg-slate-200 rounded-t h-[48%]" />
                    <div className="w-3 bg-blue-500 rounded-t transition-all duration-500 animate-bar-grow" />
                    <div className="w-3 bg-slate-200 rounded-t h-[38%]" />
                  </div>
                  
                  {/* Cleared Cheque pop */}
                  <div className="absolute right-4 bottom-4 p-2 rounded bg-white border border-slate-200 text-[8px] font-mono text-slate-800 space-y-1 shadow-md animate-clear-slide">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-sans font-bold">Cheque #1049 Cleared</span>
                    </div>
                    <span className="text-emerald-500 font-extrabold font-sans block">+$15,000.00</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600 mt-6 block">{t.bypass3Foot}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-24 border-t border-slate-200/50 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs sm:text-[13px] font-extrabold uppercase mb-3 text-blue-600 tracking-wider">{t.featuresBadge}</p>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">{t.featuresTitle}</h3>
            <p className="text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              {t.featuresSubtext}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/40 hover:border-blue-300 hover:bg-white hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{t.feat1Title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t.feat1Text}
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/40 hover:border-blue-300 hover:bg-white hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{t.feat2Title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t.feat2Text}
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/40 hover:border-blue-300 hover:bg-white hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{t.feat3Title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t.feat3Text}
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/40 hover:border-blue-300 hover:bg-white hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{t.feat4Title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t.feat4Text}
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/40 hover:border-blue-300 hover:bg-white hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{t.feat5Title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t.feat5Text}
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/40 hover:border-blue-300 hover:bg-white hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{t.feat6Title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t.feat6Text}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Expanded "ABOUT US" Section */}
      <section id="about" className="py-24 border-t border-slate-200/50 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-blue-100/40 blur-[130px] rounded-full pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Story/Copy */}
            <div className="lg:col-span-7 space-y-6">
              <p className="text-xs sm:text-[13px] font-extrabold uppercase text-blue-600 tracking-wider mb-0">{t.aboutBadge}</p>
              <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                {t.aboutTitle}
              </h3>
              
              <div className="space-y-5 text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                <p>{t.aboutText1}</p>
                <p>{t.aboutText2}</p>
                <p>{t.aboutText3}</p>
              </div>

              {/* Stat callouts */}
              <div className="grid grid-cols-3 gap-6 mt-10 border-t border-slate-200/80 pt-8">
                <div>
                  <span className="text-2xl md:text-3xl font-extrabold text-blue-600 block">150+</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider mt-1">{t.stat1}</span>
                </div>
                <div>
                  <span className="text-2xl md:text-3xl font-extrabold text-blue-600 block">$40M+</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider mt-1">{t.stat2}</span>
                </div>
                <div>
                  <span className="text-2xl md:text-3xl font-extrabold text-blue-600 block">99.9%</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider mt-1">{t.stat3}</span>
                </div>
              </div>
            </div>

            {/* Core Values */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-md shadow-slate-100 flex gap-4 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600 shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{t.aboutVal1Title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {t.aboutVal1Text}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-md shadow-slate-100 flex gap-4 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{t.aboutVal2Title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {t.aboutVal2Text}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-md shadow-slate-100 flex gap-4 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{t.aboutVal3Title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {t.aboutVal3Text}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-slate-200/50 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs sm:text-[13px] font-extrabold uppercase mb-3 text-blue-600 tracking-wider">{t.pricingBadge}</p>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">{t.pricingTitle}</h3>
            <p className="text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              {t.pricingSubtext}
            </p>
          </div>

          <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border-2 border-blue-600 flex flex-col justify-between relative shadow-xl shadow-blue-500/5 hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold tracking-wide uppercase">
              {lang === 'EN' ? 'All-Inclusive Plan' : 'باقة شاملة المزايا'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">{t.planTitle}</h3>
              <p className="text-xs text-slate-500 mb-6 text-center font-medium">{t.planDesc}</p>
              
              <div className="flex items-baseline justify-center gap-1 mb-6 border-b border-slate-100 pb-6">
                <span className="text-5xl font-extrabold text-slate-900">{t.planPrice}</span>
                <span className="text-slate-500 text-sm font-semibold">{t.planPeriod}</span>
              </div>
              
              <ul className="space-y-4 text-sm text-slate-600 mb-8 pt-2">
                <li className="flex items-center gap-3">
                  <span className="size-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="font-semibold">{t.planFeat1}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="font-semibold">{t.planFeat2}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="font-semibold">{t.planFeat3}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="font-semibold">{t.planFeat4}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="font-semibold">{t.planFeat5}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="font-semibold">{t.planFeat6}</span>
                </li>
              </ul>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/10"
            >
              {t.planBtn}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-slate-200/50 bg-[#fafafd] relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs sm:text-[13px] font-extrabold uppercase mb-3 text-blue-600 tracking-wider">{t.faqBadge}</p>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">{t.faqTitle}</h3>
            <p className="text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              {t.faqSubtext}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    <span className="text-base md:text-lg font-bold">{faq.q}</span>
                    <span className={`w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-blue-50 text-blue-600' : ''}`}>
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-40 border-t border-slate-100' : 'max-h-0'}`}
                  >
                    <div className="p-6 text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 py-12 bg-slate-50 text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <img src={yotaxLogo} alt="Yotax Logo" className="h-7 w-auto object-contain" />
          </div>
          <span className="text-xs font-semibold">
            {t.copyright}
          </span>
        </div>
      </footer>

      {/* Onboarding Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300" dir={lang === 'AR' ? 'rtl' : 'ltr'}>
          <div className="relative w-full max-w-lg overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-2xl p-8 transition-transform duration-300 hover:scale-[1.01]">
            
            {/* Close Button */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">{t.modalTitle}</h3>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setSuccess(false);
                  setError(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {error}
              </div>
            )}

            {/* Success state */}
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Workspace Created Successfully!</h4>
                <p className="text-sm text-slate-500 mb-6 font-medium">
                  We have created your private workspace <span className="font-mono text-blue-600 font-semibold">{createdSubdomain}</span>.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-bold">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  Redirecting to Workspace Login Page...
                </div>
              </div>
            ) : (
              /* Registration Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {t.modalCompLabel}
                  </label>
                  <div className="relative">
                    <Building2 className={`absolute ${lang === 'AR' ? 'right-4' : 'left-4'} top-3.5 w-5 h-5 text-slate-400`} />
                    <input 
                      type="text" 
                      name="companyName"
                      required
                      placeholder={t.modalCompPlaceholder}
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className={`w-full ${lang === 'AR' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm focus:bg-white transition-colors font-medium`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {t.modalSubdomainLabel}
                  </label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-600 focus-within:bg-white transition-colors">
                    <div className="pl-4 pr-1 text-slate-400 text-sm font-semibold select-none flex items-center gap-1.5">
                      <Globe className="w-4 h-4" />
                      https://
                    </div>
                    <input 
                      type="text" 
                      name="subdomain"
                      required
                      placeholder={t.modalSubdomainPlaceholder}
                      value={formData.subdomain}
                      onChange={handleInputChange}
                      className="flex-1 py-3 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-sm font-semibold"
                    />
                    <div className="pr-4 pl-2 text-slate-400 text-xs font-mono select-none">
                      .{getDomainBase()}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1.5 font-medium">
                    {t.modalSubdomainHelp} <strong className="text-blue-600 font-semibold font-mono">{formData.subdomain || 'your-company'}.{getDomainBase()}</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {t.modalEmailLabel}
                  </label>
                  <div className="relative">
                    <Mail className={`absolute ${lang === 'AR' ? 'right-4' : 'left-4'} top-3.5 w-5 h-5 text-slate-400`} />
                    <input 
                      type="email" 
                      name="email"
                      required
                      placeholder={t.modalEmailPlaceholder}
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full ${lang === 'AR' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm focus:bg-white transition-colors font-medium`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {t.modalPassLabel}
                  </label>
                  <div className="relative">
                    <Lock className={`absolute ${lang === 'AR' ? 'right-4' : 'left-4'} top-3.5 w-5 h-5 text-slate-400`} />
                    <input 
                      type="password" 
                      name="password"
                      required
                      placeholder={t.modalPassPlaceholder}
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full ${lang === 'AR' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm focus:bg-white transition-colors font-medium`}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 hover:scale-[1.01] mt-8 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      {t.modalSubmittingBtn}
                    </>
                  ) : (
                    <>
                      {t.modalSubmitBtn}
                      <ArrowRight className={`w-4 h-4 ${lang === 'AR' ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
