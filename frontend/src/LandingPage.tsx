import React, { useState } from 'react';
import { 
  Layers, 
  ArrowRight, 
  Clock, 
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
  Users,
  Compass,
  Zap,
  ChevronDown,
  Landmark,
  Coins,
  Calendar,
  Shield,
  Database
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
    prob1Title: "Overlooked Vendor Invoices",
    prob1Text: "Outstanding supplier bills get lost in email threads and paperwork. Missing payment deadlines leads to tense relationships, cut credit lines, and delayed shipments.",
    prob1Foot: "✖ Ruined Supplier Relations",

    // Problem Card 2
    prob2Title: "Bounced Post-Dated Cheques",
    prob2Text: "Suppliers cash post-dated cheques without warning. Without cashing due date tracking, you risk low account balances, bouncing penalties, and tarnished banking credit.",
    prob2Foot: "✖ Bounced Cheques & Bank Fees",

    // Problem Card 3
    prob3Title: "Inaccurate Cash Runways",
    prob3Text: "Manual ledgers hide actual cash availability. You might appear highly profitable on paper, but run out of liquid money in the bank to cover salaries and urgent payouts.",
    prob3Foot: "✖ Cash Deficit Surprises",

    // Bypass / How it works
    bypassBadge: "How Yotax Works",
    bypassTitle: "Simple automation for your money",
    bypassSubtext: "When you launch your workspace, manual record entry is bypassed. Every critical transaction reconciles automatically.",
    
    // Bypass Card 1
    bypass1Title: "1. Enter Invoices & Cheques",
    bypass1Text: "Manually log your vendor invoices and post-dated cheques. The system immediately calculates due dates and payment schedules.",
    bypass1Foot: "✔ Automated Financial Scheduling",

    // Bypass Card 2
    bypass2Title: "2. FIFO Payment Allocation",
    bypass2Text: "Log supplier payments and auto-allocate them to outstanding invoices using FIFO logic to keep ledgers accurate.",
    bypass2Foot: "✔ Smart AP Allocation",

    // Bypass Card 3
    bypass3Title: "3. Post-Dated Cheque Tracking",
    bypass3Text: "Manage post-dated cheques in a secure log. Get notifications on upcoming due dates to maintain healthy bank balances.",
    bypass3Foot: "✔ Bouncing Prevention & Alerts",

    // Features Section
    featuresBadge: "Main Modules",
    featuresTitle: "Simple features to manage your cash",
    featuresSubtext: "Discover the built-in modules designed to enforce financial control, secure company assets, and eliminate administrative bottlenecks.",
    
    feat1Title: "Clear Cash Flow Dashboard",
    feat1Text: "Visualize cash flow trends, expected collections, and upcoming payments in real time to make data-driven decisions.",
    feat2Title: "Purchase Invoices & Due Dates",
    feat2Text: "Log supplier invoices, track remaining balances, and schedule due dates to keep AP relations healthy.",
    feat3Title: "Custom Supplier Payment Terms",
    feat3Text: "Customize payment terms for each supplier individually (e.g. 60 or 90 days) to auto-schedule future outflows.",
    feat4Title: "Post-Dated Cheques Registry",
    feat4Text: "Register post-dated cheques with cashing dates, and track lifecycle from pending to cleared or bounced.",
    feat5Title: "24-Hour Cheque Due Alerts",
    feat5Text: "Receive automatic warnings one day before a cheque is due to cash, ensuring bank liquidity is ready.",
    feat6Title: "Payment Warning Pop-up",
    feat6Text: "Get an immediate warning pop-up details on any critical supplier invoice or cheque due for payment today.",

    // About Us Section
    aboutBadge: "About Us",
    aboutTitle: "Built for practical cash management",
    aboutText1: "We started Yotax to solve a simple problem: businesses spend too much time tracking bank balances and cheques in manual ledgers.",
    aboutText2: "We built this tool to simplify day-to-day cash flow management. It tracks purchase invoices, logs cheques, and draws clear cash flow curves dynamically.",
    aboutText3: "Today, over 15 companies use Yotax to track bank balances, record invoices, and forecast cash positions.",
    
    stat1: "Companies",
    stat2: "Cash Tracked",
    stat3: "System Uptime",

    aboutVal1Title: "Simple Financial Tracking",
    aboutVal1Text: "All bank ledgers, cheque collections, and expenses are tracked in one simple workspace.",
    aboutVal2Title: "Custom Supplier Terms",
    aboutVal2Text: "Set custom payment terms per supplier (60/90 days) to track and schedule invoice maturities accurately.",
    aboutVal3Title: "Multi-User Access",
    aboutVal3Text: "Add accountants, managers, and data entry staff to manage your records together.",

    // Security Section
    securityBadge: "Data Protection",
    securityTitle: "Your financial records, locked down.",
    securitySubtext: "We secure your balances and cheques with industry-standard protocols.",
    sec1Title: "Isolated Databases",
    sec1Text: "Each workspace gets a private, separate database. Your data never mixes with others.",
    sec2Title: "Bank-Grade Encryption",
    sec2Text: "All records, transactions, and credentials are encrypted using AES-256 protocols.",
    sec3Title: "Daily Secure Backups",
    sec3Text: "Automated daily backups are saved securely in redundant cloud vaults.",

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
    planFeat4: "Custom Supplier Payment Terms",
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
    modalSubmittingBtn: "Creating your workspace...",
    loginModalTitle: "Access Your Workspace",
    loginModalSubdomainLabel: "Workspace Subdomain",
    loginModalSubdomainPlaceholder: "acme",
    loginModalSubmitBtn: "Go to Workspace",
    loginModalError: "Please enter a valid subdomain."
  },
  AR: {
    // Header
    problem: "المشاكل المالية",
    howItWorks: "كيف يشتغل؟",
    features: "الميزات",
    aboutUs: "مين إحنا؟",
    pricing: "الاشتراك",
    login: "دخول",
    startTrial: "جرب يوتاكس مجاناً",
    createWorkspace: "أنشئ مساحتك",

    // Hero
    heroBadge: "برنامج بسيط لتتبع الكاش وحسابات البنك",
    heroTitle1: "أدر تدفقاتك النقدية بسهولة،",
    heroTitle2: "وتوقع رصيدك البنكي بدقة.",
    heroSubtext: "منصة وحدة تلم حساباتك البنكية، شيكاتك المؤجلة، وفواتيرك. انسى الدفاتر اليدوية والـ Excel، وتابع سيولتك بكل وضوح وبشكل فوري.",
    createWorkspaceBtn: "سجل وجرب مساحتك مجاناً",
    seeHowItWorks: "شوف كيف يشتغل",

    // Problems
    problemsBadge: "ليش الإدارة اليدوية صعبة؟",
    problemsTitle: "شو اللي يعطل شغلك المالي اليوم؟",
    problemsSubtext: "الشركات تخسر فلوس بدون ما تحس بسبب دفاتر يدوية، شيكات تضيع، أو إشعارات بنكية متأخرة.",

    // Problem Card 1
    prob1Title: "فواتير موردين منسية",
    prob1Text: "الفواتير تضيع بين الإيميلات والأوراق المتراكمة. فواتير الموردين المنسية تخرب علاقاتك التجارية، وتقطع عليك التسهيلات وتأخر بضائعك.",
    prob1Foot: "✖ تخرب علاقتك مع الموردين",

    // Problem Card 2
    prob2Title: "مفاجأة الشيكات المؤجلة",
    prob2Text: "الموردين يصرفون الشيكات فجأة وبدون ما يبلغوك. إذا ما تتبعت تواريخ الاستحقاق، ممكن ينكشف حسابك، وتدخل بمشاكل شيكات مرتجعة وغرامات.",
    prob2Foot: "✖ شيكات مرتجعة ومصاريف بنكية",

    // Problem Card 3
    prob3Title: "حسابات سيولة غير دقيقة",
    prob3Text: "الدفاتر اليدوية تعطيك أرقام وهمية. ممكن تشوف شركتك ربحانة على الورق، لكن تتفاجأ إن رصيد البنك ما يغطي الرواتب أو الالتزامات المستعجلة.",
    prob3Foot: "✖ نقص مفاجئ بالسيولة",

    // Bypass / How it works
    bypassBadge: "مع يوتاكس الأمر مختلف",
    bypassTitle: "رتب حساباتك بلمسة واحدة",
    bypassSubtext: "بمجرد ما تسجل، بتبسط شغلك وتتخلص من تعقيد الدفاتر. كل شي بيمشي بشكل منظم وواضح.",

    // Bypass Card 1
    bypass1Title: "1. سجل فواتيرك وشيكاتك",
    bypass1Text: "دخل فواتير الموردين والشيكات المؤجلة في ثوانٍ. النظام بيبدأ فوراً يحسب التواريخ ويرتب جدول المدفوعات تلقائياً.",
    bypass1Foot: "✔ تواريخ مدفوعات مرتبة تلقائياً",

    // Bypass Card 2
    bypass2Title: "2. وزع المدفوعات بذكاء (FIFO)",
    bypass2Text: "سجل المبالغ اللي تدفعها للموردين، والنظام بيوزعها تلقائياً على فواتيرهم الأقدم فالأحدث عشان دفاترهم تكون دايم دقيقة.",
    bypass2Foot: "✔ تسوية فواتير صحيحة ومرتبة",

    // Bypass Card 3
    bypass3Title: "3. تتبع الشيكات بدون قلق",
    bypass3Text: "تابع شيكاتك المؤجلة في مكان واحد آمن، واحصل على تنبيهات قبل موعد الصرف عشان تحمي حسابك من الارتجاع.",
    bypass3Foot: "✔ حماية من الشيكات المرتجعة",

    // Features Section
    featuresBadge: "ميزات أساسية لشغلك",
    featuresTitle: "كل الأدوات اللي تحتاجها لإدارة الكاش",
    featuresSubtext: "وحدات برمجية مخصصة عشان تفرض السيطرة المالية، وتحمي أصول الشركة، وتريح راسك من المتابعة اليومية المكررة.",

    feat1Title: "لوحة تحكم واضحة وسهلة",
    feat1Text: "تابع حركة الكاش والتحصيلات المتوقعة ومدفوعاتك القادمة لحظة بلحظة برسم بياني بسيط ومريح.",
    feat2Title: "متابعة فواتير الموردين",
    feat2Text: "سجل فواتير الشراء، وتابع الأرصدة المتبقية وتواريخ استحقاقها عشان تضمن سدادها في وقتها.",
    feat3Title: "تخصيص فترات سداد الموردين",
    feat3Text: "حدد شروط الدفع لكل مورد (مثلاً 60 أو 90 يوم)، وخلي النظام يحسب تواريخ الاستحقاق تلقائياً لكل فاتورة.",
    feat4Title: "سجل شيكات مؤجلة متكامل",
    feat4Text: "وثّق كل شيك وتاريخ صرفه، وتابع حالته من قيد الانتظار إلى الصرف الفعلي بكل سهولة.",
    feat5Title: "تنبيهات الشيكات قبل 24 ساعة",
    feat5Text: "بيوصلك تنبيه تلقائي قبل 24 ساعة من موعد صرف الشيك عشان تتأكد إن رصيدك بالبنك كافي.",
    feat6Title: "تنبيه المدفوعات اليومية",
    feat6Text: "أول ما تفتح البرنامج، بتشوف نافذة تنبيهات واضحة تذكرك بأي فواتير أو شيكات مستحقة اليوم عشان ما تتأخر.",

    // About Us Section
    aboutBadge: "مين إحنا؟",
    aboutTitle: "صممنا يوتاكس عشان يحل مشاكل مالية حقيقية",
    aboutText1: "بلشنا يوتاكس لنحل مشكلة بيعاني منها كل صاحب عمل: ضياع الوقت في مراجعة كشوفات الحسابات البنكية وتحديث دفاتر الشيكات يدوياً خوفاً من مفاجآت السيولة.",
    aboutText2: "طورنا المنصة لتبسيط متابعة الكاش اليومية. يوتاكس بيتتبع فواتير الموردين، يسجل الشيكات، ويرسم منحنى التدفق النقدي بشكل فوري وواضح.",
    aboutText3: "اليوم، أكثر من 15 شركة بتعتمد على يوتاكس لتتبع كشوفاتها وتوقعات كاشها اليومي بكل ثقة.",

    stat1: "شركات تستخدمنا",
    stat2: "كاش متتبع",
    stat3: "جاهزية النظام",

    aboutVal1Title: "تتبع مالي مبسط",
    aboutVal1Text: "حساباتك البنكية، شيكاتك، ومصاريفك كلها بمكان واحد سهل ومريح للكل.",
    aboutVal2Title: "شروط دفع مرنة",
    aboutVal2Text: "رتب فترات السداد لكل مورد (60/90 يوم) وخل النظام يحسب ويوضح لك التواريخ.",
    aboutVal3Title: "فريق عمل واحد",
    aboutVal3Text: "ضف المحاسبين والمدراء ووزع الصلاحيات عشان تديروا الدفاتر سوى وبكل أمان.",

    // Security Section
    securityBadge: "حماية البيانات",
    securityTitle: "سجلاتك المالية في أمان تام",
    securitySubtext: "نحمي أرصدتك وشيكاتك بأعلى معايير الأمان وعزل البيانات السحابية.",
    sec1Title: "بيانات معزولة بالكامل",
    sec1Text: "لكل مساحة عمل قاعدة بيانات مستقلة وخاصة. لا تختلط بياناتك مع الآخرين نهائياً.",
    sec2Title: "تشفير بمستوى بنكي",
    sec2Text: "تشفير كامل لجميع السجلات والعمليات المالية باستخدام معيار AES-256 العالمي.",
    sec3Title: "نسخ احتياطي يومي",
    sec3Text: "نسخ احتياطي يومي وتلقائي يُحفظ بأمان في خوادم سحابية متعددة.",

    // Pricing Section
    pricingBadge: "باقة الاشتراك",
    pricingTitle: "اشتراك واحد بسيط وموحد للجميع",
    pricingSubtext: "خطة اشتراك وحدة بميزات كاملة وبدون أي حدود. وصول كامل لكل ميزات الكاش والشيكات بدون لف ودوران.",

    planTitle: "الاشتراك الشهري",
    planDesc: "كل الميزات اللي تحتاجها لإدارة الكاش والشيكات لشركتك.",
    planPrice: "$30",
    planPeriod: "/شهرياً",
    planFeat1: "نطاق فرعي خاص لشركتك (subdomain)",
    planFeat2: "ربط عدد غير محدود من الحسابات البنكية",
    planFeat3: "تتبع كامل للشيكات المؤجلة",
    planFeat4: "شروط دفع مخصصة للموردين",
    planFeat5: "أدوار وصلاحيات للمستخدمين",
    planFeat6: "تنبيهات وتقارير مالية PDF",
    planBtn: "جرب مجاناً الآن",

    // FAQ Section
    faqBadge: "الأسئلة الشائعة",
    faqTitle: "عندك أسئلة؟ إحنا هنا لنجاوبك",
    faqSubtext: "تعرف كيف يوتاكس بيساعدك ترتب أمورك المالية اليومية وتتبع شيكاتك المؤجلة بكل سهولة.",

    // Footer
    copyright: "© 2026 يوتاكس. جميع الحقوق محفوظة.",

    // Modal
    modalTitle: "إنشاء مساحة عمل جديدة",
    modalCompLabel: "اسم الشركة",
    modalCompPlaceholder: "مثال: شركة النخبة التجارية",
    modalSubdomainLabel: "رابط مساحة العمل (subdomain)",
    modalSubdomainPlaceholder: "acme",
    modalSubdomainHelp: "رابط الدخول الخاص بشركتك بيكون:",
    modalEmailLabel: "البريد الإلكتروني للمسؤول",
    modalEmailPlaceholder: "admin@company.com",
    modalPassLabel: "كلمة مرور المسؤول",
    modalPassPlaceholder: "6 أحرف كحد أدنى",
    modalSubmitBtn: "إنشاء وتجهيز مساحة العمل",
    modalSubmittingBtn: "جاري إنشاء مساحتك...",
    loginModalTitle: "الدخول إلى مساحة العمل",
    loginModalSubdomainLabel: "رابط مساحة العمل الفرعي (Subdomain)",
    loginModalSubdomainPlaceholder: "acme",
    loginModalSubmitBtn: "الانتقال لمساحة العمل",
    loginModalError: "يرجى إدخال نطاق فرعي صحيح."
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
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
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
          0%, 100% { transform: translate(-50%, -50%); }
          50% { transform: translate(-50%, calc(-50% - 3px)); }
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-dashed border-slate-100 pointer-events-none" />

      {/* Orbit Container (slowly spinning, centered) */}
      <div className="absolute top-1/2 left-1/2 w-[360px] h-[360px] flex items-center justify-center animate-orbit-container select-none">
        
        {/* Render 6 Orbiting Icons */}
        {angles.map((angle, idx) => {
          const IconComponent = sourceIcons[idx].icon;
          const color = sourceIcons[idx].color;
          const isBeingPulled = activePullIndex === idx;
          
          let style = {};
          
          if (isBeingPulled) {
            if (stage === 'pulling') {
              // Fade out quickly and collapse to a point — no ghost edge visible
              style = {
                transform: `rotate(${angle}deg) translate(0px) rotate(-${angle}deg) scale(0.05)`,
                opacity: 0,
                transition: 'transform 0.5s cubic-bezier(0.55, 0, 1, 0.45), opacity 0.35s ease-in'
              };
            } else {
              // Processing — completely invisible at center
              style = {
                transform: `rotate(${angle}deg) translate(0px) rotate(-${angle}deg) scale(0)`,
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

        {/* Output card rendered outside the orbit container — see below */}
      </div>

      {/* Output Card: rendered OUTSIDE the spinning orbit container, positioned via trig */}
      {activePullIndex !== null && (stage === 'pushing' || stage === 'done') && (() => {
        const idx = activePullIndex;
        const IconComponent = sourceIcons[idx].icon;
        const baseAngle = angles[idx];
        // Appear on the opposite side
        const angleDeg = baseAngle + 180;
        const angleRad = (angleDeg * Math.PI) / 180;
        // Position relative to center of the 380px-tall, full-width container
        // Center is at 50% / 50%
        const xOffset = Math.cos(angleRad) * R;
        const yOffset = Math.sin(angleRad) * R;

        const isAppearing = stage === 'pushing';
        return (
          <div
            key={`output-${idx}`}
            className="absolute w-13 h-13 flex items-center justify-center z-20 pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${xOffset}px), calc(-50% + ${yOffset}px)) scale(${isAppearing ? 1.05 : 1})`,
              opacity: isAppearing ? 1 : 0,
              transition: isAppearing
                ? 'opacity 0.5s ease-out, transform 0.5s ease-out'
                : 'opacity 1.5s ease-in, transform 0.5s ease-in',
            }}
          >
            <div className="w-13 h-13 rounded-full bg-sky-50 border border-sky-300 shadow-md flex items-center justify-center text-sky-600 relative">
              <IconComponent className="w-6.5 h-6.5" />
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-white border border-white shadow-sm">
                <Check className="w-3 h-3" />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Central Glassmorphic Yotax Hexagon Hub (Logo Engine) */}
      <div className="absolute top-1/2 left-1/2 w-[88px] h-[88px] flex items-center justify-center select-none pointer-events-none z-10 animate-gentle-logo-float-orbit">
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
  const [lang, setLang] = useState<'EN' | 'AR'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang')?.toLowerCase();
      if (urlLang === 'ar') return 'AR';
      if (urlLang === 'en') return 'EN';
      
      const browserLang = navigator.language?.substring(0, 2).toLowerCase();
      return browserLang === 'ar' ? 'AR' : 'EN';
    } catch {
      return 'EN';
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'register' | 'login'>('register');
  const [loginSubdomain, setLoginSubdomain] = useState('');
  
  const openModal = (mode: 'register' | 'login') => {
    setModalMode(mode);
    setIsModalOpen(true);
    setError(null);
  };

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
  const [scrolled, setScrolled] = useState(false);

  const handleLangToggle = (newLang: 'EN' | 'AR') => {
    setLang(newLang);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', newLang.toLowerCase());
      window.history.pushState({}, '', url.toString());
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    // 1. Update HTML language and direction
    document.documentElement.lang = lang === 'AR' ? 'ar' : 'en';
    document.documentElement.dir = lang === 'AR' ? 'rtl' : 'ltr';

    // 2. Dynamic SEO Text
    const seoTitle = lang === 'AR' 
      ? 'يوتاكس - برنامج بسيط لتتبع الكاش وحسابات البنك' 
      : 'Yotax - Simple Cash Flow & Financial Tracking';
    
    const seoDesc = lang === 'AR'
      ? 'منصة وحدة تلم حساباتك البنكية، شيكاتك المؤجلة، وفواتيرك. انسى الدفاتر اليدوية والـ Excel، وتابع سيولتك بكل وضوح وبشكل فوري.'
      : 'A simple cash flow tracking platform for modern businesses. Track bank accounts, schedule post-dated cheques, and manage vendor invoice payments in one clear dashboard.';

    // 3. Update Document Title
    document.title = seoTitle;

    // 4. Helper to update/create meta tag
    const updateMetaTag = (attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 5. Update descriptions
    updateMetaTag('name', 'description', seoDesc);
    updateMetaTag('property', 'og:title', seoTitle);
    updateMetaTag('property', 'og:description', seoDesc);
    updateMetaTag('name', 'twitter:title', seoTitle);
    updateMetaTag('name', 'twitter:description', seoDesc);
  }, [lang]);

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
    if (name === 'companyName') {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ 
        ...prev, 
        companyName: value,
        subdomain: generatedSlug 
      }));
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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginSubdomain.trim()) {
      setError(lang === 'EN' ? 'Please enter your workspace subdomain.' : 'يرجى إدخال نطاق مساحة العمل الفرعي.');
      return;
    }
    const slug = loginSubdomain
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    if (!slug) {
      setError(lang === 'EN' ? 'Please enter a valid subdomain.' : 'يرجى إدخال نطاق فرعي صحيح.');
      return;
    }

    // Redirect to the subdomain login page
    window.location.href = `${window.location.protocol}//${slug}.${getDomainBase()}/login`;
  };

  return (
    <div 
      className="min-h-screen bg-[#fafafd] text-slate-800 font-sans selection:bg-sky-600 selection:text-white overflow-x-hidden relative isolate"
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
          backgroundImage: `linear-gradient(to right, rgba(14, 165, 233, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(14, 165, 233, 0.08) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 95% 72% at 50% 0%, black 30%, transparent 76%)',
          WebkitMaskImage: 'radial-gradient(ellipse 95% 72% at 50% 0%, black 30%, transparent 76%)'
        }}
      />

      {/* Glowing Blur Blobs */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute top-10 -end-44 size-[32rem] rounded-full blur-[110px] opacity-20 -z-10" 
        style={{
          background: 'radial-gradient(circle, #bae6fd 0%, transparent 70%)',
          animation: 'blob-b 15s ease-in-out infinite',
          animationDelay: '3s'
        }}
      />

      {/* Premium Full-Width Sticky Header */}
      <header 
        dir={lang === 'AR' ? 'rtl' : 'ltr'}
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 bg-white border-b border-slate-200/50 shadow-sm ${
          scrolled ? 'h-16' : 'h-20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-4">
          {/* Logo and Navigation Tabs grouped together */}
          <div className="flex items-center gap-6 sm:gap-8 min-w-0">
            <a className="flex items-center shrink-0" aria-label="Yotax" href="/">
              <img 
                src={yotaxLogo} 
                alt="Yotax Logo" 
                className="inline-block w-auto select-none h-7 sm:h-8 shrink-0 object-contain" 
              />
            </a>
            
            <div className="hidden md:flex items-center gap-1">
              <a className="relative px-3.5 py-2 text-sm font-semibold text-slate-650 hover:text-sky-600 transition-colors group" href="#problems">
                {t.problem}
                <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-sky-650 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-250" />
              </a>
              <a className="relative px-3.5 py-2 text-sm font-semibold text-slate-650 hover:text-sky-600 transition-colors group" href="#demo-video">
                {t.howItWorks}
                <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-sky-650 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-250" />
              </a>
              <a className="relative px-3.5 py-2 text-sm font-semibold text-slate-650 hover:text-sky-600 transition-colors group" href="#features">
                {t.features}
                <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-sky-650 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-250" />
              </a>
              <a className="relative px-3.5 py-2 text-sm font-semibold text-slate-650 hover:text-sky-600 transition-colors group" href="#about">
                {t.aboutUs}
                <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-sky-650 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-250" />
              </a>
              <a className="relative px-3.5 py-2 text-sm font-semibold text-slate-650 hover:text-sky-600 transition-colors group" href="#pricing">
                {t.pricing}
                <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-sky-650 scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-250" />
              </a>
            </div>
          </div>
          
          {/* Actions / Buttons on the opposite side */}
          <nav className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Premium Language Switcher with Flags */}
            <button 
              dir={lang === 'AR' ? 'rtl' : 'ltr'}
              onClick={() => handleLangToggle(lang === 'EN' ? 'AR' : 'EN')}
              className={`flex ${lang === 'AR' ? 'flex-row-reverse' : 'flex-row'} items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all font-semibold text-[13px] shadow-sm select-none`}
              title={lang === 'EN' ? 'العربية' : 'English'}
            >
              <span className="text-base select-none leading-none">
                {lang === 'EN' ? '🇬🇧' : '🇯🇴'}
              </span>
              <span>{lang === 'EN' ? 'EN' : 'العربية'}</span>
            </button>

            <span className="text-slate-200 mx-0.5 sm:mx-1 select-none">|</span>

            <button 
              onClick={() => openModal('login')}
              className="font-bold text-slate-600 hover:text-slate-900 px-3.5 py-2 text-sm transition-colors"
            >
              {t.login}
            </button>
            
            <button 
              onClick={() => openModal('register')}
              className="px-4 py-2 text-sm font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-500/10 hover:shadow-lg hover:shadow-sky-500/15 hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0"
            >
              {t.startTrial}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-36 pb-20 sm:pb-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 w-full overflow-hidden">
        {/* Subtle decorative grid lines background */}
        <div 
          className="absolute inset-0 -z-20 opacity-[0.25] pointer-events-none" 
          style={{ 
            backgroundImage: `
              linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
            `, 
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(circle at center, black 50%, transparent 95%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 50%, transparent 95%)'
          }} 
        />
        
        <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-7 z-10 relative">
          <h1 className="text-[2.75rem] sm:text-6xl lg:text-7xl font-extrabold leading-[1.06] text-slate-900 tracking-tight">
            <span className="block">{lang === 'EN' ? "Know your cash flow," : "أدر تدفقاتك النقدية بسهولة،"}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-600">
              {lang === 'EN' ? "Predict your balance." : "وتوقع رصيدك البنكي بدقة."}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-[1.7] max-w-2xl mx-auto font-medium">
            {t.heroSubtext}
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <button 
              onClick={() => openModal('register')}
              className="group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding font-bold transition-all outline-none h-12 sm:h-13 px-8 text-base rounded-xl bg-sky-600 text-white hover:bg-sky-700 shadow-lg shadow-sky-500/10 flex gap-2 hover:scale-[1.02] active:scale-95 duration-200"
            >
              {t.createWorkspaceBtn}
              <ArrowRight className={`w-5 h-5 transition-transform group-hover/button:translate-x-1 ${lang === 'AR' ? 'rotate-180 group-hover/button:-translate-x-1' : ''}`} />
            </button>
            <a 
              href="#demo-video"
              className="group/button inline-flex shrink-0 items-center justify-center bg-clip-padding font-bold transition-all border border-slate-200 h-12 sm:h-13 px-8 text-base rounded-xl bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:scale-[1.02] active:scale-95 duration-200"
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
            {/* Card 1: Overlooked Vendor Invoices */}
            <div className="p-7 sm:p-8 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/80 flex flex-col justify-between overflow-hidden shadow-sm relative group hover:shadow-xl hover:border-rose-300/70 hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100/60 flex items-center justify-center text-rose-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-5.5 h-5.5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2.5">{t.prob1Title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                  {t.prob1Text}
                </p>
                
                {/* Visual Loop: Overlooked Supplier invoice */}
                <div className="relative h-28 w-full bg-white rounded-xl overflow-hidden p-3 font-mono text-[10px] text-slate-700 border border-slate-100 shadow-inner shadow-slate-50 animate-cell-shake">
                  <div className="flex flex-col justify-between h-full">
                    <div className="flex justify-between text-slate-400 border-b border-slate-100 pb-1 font-bold">
                      <span>{lang === 'AR' ? 'فواتير الموردين المستحقة' : 'VENDOR INVOICES'}</span>
                      <span className="text-rose-500 animate-pulse">● {lang === 'AR' ? 'منسية!' : 'OVERLOOKED!'}</span>
                    </div>
                    <div className="space-y-1.5 mt-2 text-[9px] font-sans">
                      <div className="flex justify-between text-slate-700 font-medium">
                        <span>{lang === 'AR' ? 'شركة توريد الأسمنت' : 'Cement Supply Co.'}</span>
                        <span className="text-rose-600 font-bold">{lang === 'AR' ? 'متأخرة 15 يوم' : '15 Days Overdue'}</span>
                      </div>
                      <div className="flex justify-between text-rose-600 font-bold bg-rose-50 border border-rose-100 px-2 py-1 rounded">
                        <span>{lang === 'AR' ? 'الوضع الائتماني للمورد' : 'Supplier Credit Line'}</span>
                        <span>{lang === 'AR' ? 'مـعـلّـق' : 'SUSPENDED'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-xs font-extrabold text-rose-600 mt-6 block uppercase tracking-wider">{t.prob1Foot}</span>
            </div>

            {/* Card 2: Bounced Post-Dated Cheques */}
            <div className="p-7 sm:p-8 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/80 flex flex-col justify-between overflow-hidden shadow-sm relative group hover:shadow-xl hover:border-amber-300/70 hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100/60 flex items-center justify-center text-amber-550 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="w-5.5 h-5.5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2.5">{t.prob2Title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                  {t.prob2Text}
                </p>
                
                {/* Visual Loop: Sliding cheque and bounce warning */}
                <div className="relative h-28 w-full bg-white rounded-xl overflow-hidden p-3 border border-slate-100 shadow-inner shadow-slate-50">
                  <div className="absolute inset-x-3 top-3 h-0.5 bg-slate-100 rounded">
                    <div className="absolute top-1/2 left-2/3 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-500 border border-white" />
                  </div>
                  
                  {/* Sliding Cheque Document */}
                  <div className="absolute left-4 top-8 p-1.5 rounded bg-amber-50 border border-amber-200 text-[9px] font-mono text-slate-700 flex items-center gap-1.5 animate-cheque-flow shadow-sm">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>{lang === 'AR' ? 'شيك مؤجل #4029 (8.5k د.أ)' : 'Cheque #4029 ($8.5k)'}</span>
                  </div>
                  
                  {/* Bounced alert banner */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-[9px] font-bold text-rose-700 flex items-center gap-1.5 animate-bounce-warn opacity-0 shadow-md">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    <span>{lang === 'AR' ? 'مرتجع! نقص رصيد بنكي' : 'BOUNCED! LOW BALANCE'}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-extrabold text-amber-600 mt-6 block uppercase tracking-wider">{t.prob2Foot}</span>
            </div>

            {/* Card 3: Misleading Cash Runways */}
            <div className="p-7 sm:p-8 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/80 flex flex-col justify-between overflow-hidden shadow-sm relative group hover:shadow-xl hover:border-sky-300/70 hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100/60 flex items-center justify-center text-sky-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileSpreadsheet className="w-5.5 h-5.5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2.5">{t.prob3Title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                  {t.prob3Text}
                </p>
                
                {/* Visual Loop: Misleading cash forecasting */}
                <div className="relative h-28 w-full bg-white rounded-xl overflow-hidden p-3 flex flex-col justify-between border border-slate-100 shadow-inner shadow-slate-50">
                  <div className="flex justify-between text-slate-400 border-b border-slate-100 pb-1 font-bold text-[9px]">
                    <span>{lang === 'AR' ? 'حالة السيولة والمركز المالي' : 'LIQUID RUNWAY STATUS'}</span>
                    <span className="text-rose-500">● {lang === 'AR' ? 'مضلل' : 'MISLEADING'}</span>
                  </div>
                  <div className="space-y-1.5 mt-2 text-[9px] font-sans">
                    <div className="flex justify-between text-slate-650 font-medium">
                      <span>{lang === 'AR' ? 'أرباح الدفاتر (ورقياً)' : 'Paper Book Profits'}</span>
                      <span className="text-emerald-600 font-bold">{lang === 'AR' ? '+45,000 د.أ' : '+$45,000.00'}</span>
                    </div>
                    <div className="flex justify-between text-rose-600 font-bold bg-rose-50 border border-rose-100 px-2 py-1 rounded">
                      <span>{lang === 'AR' ? 'رصيد البنك الفعلي' : 'Actual Bank Balance'}</span>
                      <span className="animate-pulse">{lang === 'AR' ? '-1,200 د.أ (عجز!)' : '-$1,200.00 (Danger!)'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-xs font-extrabold text-sky-600 mt-6 block uppercase tracking-wider">{t.prob3Foot}</span>
            </div>
          </div>
        </div>
      </section>
      {/* HOW IT WORKS / METHODOLOGY SECTION (Nuqtaty style) */}
      <section id="demo-video" className="py-24 bg-slate-50 border-t border-slate-200/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs sm:text-[13px] font-extrabold uppercase mb-3 text-sky-600 tracking-wider">{t.bypassBadge}</p>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">{t.bypassTitle}</h3>
            <p className="text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              {t.bypassSubtext}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Enter Invoices & Cheques */}
            <div className="p-7 sm:p-8 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/80 flex flex-col justify-between overflow-hidden shadow-sm relative group hover:border-sky-300/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100/60 flex items-center justify-center text-sky-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-5.5 h-5.5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2.5">{t.bypass1Title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                  {t.bypass1Text}
                </p>

                {/* Animation: Particles flowing to scheduler */}
                <div className="relative h-28 w-full bg-slate-50 rounded-xl overflow-hidden p-3 border border-slate-100 flex items-center justify-between">
                  <FileText className="w-7 h-7 text-emerald-500 shrink-0" />
                  
                  {/* Track path */}
                  <div className="flex-1 mx-3 h-0.5 bg-slate-250 relative">
                    <span className="absolute w-2 h-2 rounded-full bg-sky-600 -translate-y-1/2 animate-flow-p1" />
                    <span className="absolute w-2 h-2 rounded-full bg-sky-600 -translate-y-1/2 animate-flow-p2" />
                    <span className="absolute w-2 h-2 rounded-full bg-sky-600 -translate-y-1/2 animate-flow-p3" />
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0 animate-vault-pulse">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <span className="text-xs font-extrabold text-sky-600 mt-6 block uppercase tracking-wider">{t.bypass1Foot}</span>
            </div>

            {/* Card 2: FIFO Payment Allocation */}
            <div className="p-7 sm:p-8 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/80 flex flex-col justify-between overflow-hidden shadow-sm relative group hover:border-sky-300/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100/60 flex items-center justify-center text-sky-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-5.5 h-5.5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2.5">{t.bypass2Title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                  {t.bypass2Text}
                </p>

                {/* Animation: Cascade list seeds */}
                <div className="relative h-28 w-full bg-slate-50 rounded-xl overflow-hidden p-3 border border-slate-100 space-y-1.5 flex flex-col justify-center">
                  <div className="p-1.5 bg-white rounded border border-slate-200 text-[8px] font-bold text-slate-800 flex justify-between items-center animate-cascade-1 shadow-sm">
                    <span>{lang === 'AR' ? 'فاتورة رقم 1093' : 'Invoice #1093'}</span>
                    <span className="text-[7px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-bold">{lang === 'AR' ? 'مدفوعة (FIFO)' : 'PAID (FIFO)'}</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200 text-[8px] font-bold text-slate-800 flex justify-between items-center animate-cascade-2 opacity-0 shadow-sm">
                    <span>{lang === 'AR' ? 'فاتورة رقم 1094' : 'Invoice #1094'}</span>
                    <span className="text-[7px] bg-sky-50 text-sky-700 border border-sky-100 px-1.5 py-0.5 rounded font-bold">{lang === 'AR' ? 'جزئي (FIFO)' : 'PARTIAL (FIFO)'}</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200 text-[8px] font-bold text-slate-800 flex justify-between items-center animate-cascade-3 opacity-0 shadow-sm">
                    <span>{lang === 'AR' ? 'فاتورة رقم 1095' : 'Invoice #1095'}</span>
                    <span className="text-[7px] bg-slate-100 text-slate-650 border border-slate-200 px-1.5 py-0.5 rounded font-bold">{lang === 'AR' ? 'غير مدفوعة' : 'UNPAID'}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-extrabold text-sky-600 mt-6 block uppercase tracking-wider">{t.bypass2Foot}</span>
            </div>

            {/* Card 3: Post-Dated Cheques Tracking */}
            <div className="p-7 sm:p-8 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/80 flex flex-col justify-between overflow-hidden shadow-sm relative group hover:border-sky-300/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100/60 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-5.5 h-5.5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2.5">{t.bypass3Title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                  {t.bypass3Text}
                </p>

                {/* Animation: Cheque slip and chart grow */}
                <div className="relative h-28 w-full bg-slate-50 rounded-xl overflow-hidden p-3 border border-slate-100 flex justify-between items-end">
                  {/* Ledger bar chart */}
                  <div className="flex gap-2 items-end h-full w-20">
                    <div className="w-3 bg-slate-200 rounded-t h-[48%]" />
                    <div className="w-3 bg-sky-500 rounded-t transition-all duration-500 animate-bar-grow" />
                    <div className="w-3 bg-slate-200 rounded-t h-[38%]" />
                  </div>
                  
                  {/* Cleared Cheque pop */}
                  <div className="absolute right-4 bottom-4 p-2 rounded bg-white border border-slate-200 text-[8px] font-mono text-slate-800 space-y-1 shadow-md animate-clear-slide">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-sans font-bold">{lang === 'AR' ? 'تم تحصيل شيك #1049' : 'Cheque #1049 Cleared'}</span>
                    </div>
                    <span className="text-emerald-500 font-extrabold font-sans block">{lang === 'AR' ? '+15,000.00 د.أ' : '+$15,000.00'}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-extrabold text-sky-600 mt-6 block uppercase tracking-wider">{t.bypass3Foot}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-24 border-t border-slate-200/50 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs sm:text-[13px] font-extrabold uppercase mb-3 text-sky-600 tracking-wider">{t.featuresBadge}</p>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">{t.featuresTitle}</h3>
            <p className="text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              {t.featuresSubtext}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1: Dashboard */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/80 hover:border-sky-300/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100/50 flex items-center justify-center text-sky-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{t.feat1Title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {t.feat1Text}
              </p>
            </div>

            {/* Card 2: Invoices */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/80 hover:border-sky-300/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100/50 flex items-center justify-center text-sky-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{t.feat2Title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {t.feat2Text}
              </p>
            </div>

            {/* Card 3: Custom Supplier Terms */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/80 hover:border-amber-300/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100/50 flex items-center justify-center text-amber-550 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{t.feat3Title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {t.feat3Text}
              </p>
            </div>

            {/* Card 4: Post-Dated Cheques */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/80 hover:border-sky-300/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100/50 flex items-center justify-center text-sky-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Coins className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{t.feat4Title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {t.feat4Text}
              </p>
            </div>

            {/* Card 5: 24h Alerts */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/80 hover:border-amber-300/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100/50 flex items-center justify-center text-amber-550 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{t.feat5Title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {t.feat5Text}
              </p>
            </div>

            {/* Card 6: Popup alerts */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/80 hover:border-sky-300/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100/50 flex items-center justify-center text-rose-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{t.feat6Title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {t.feat6Text}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Trust & Security Section */}
      <section id="security" className="py-24 border-t border-slate-200/50 bg-white relative overflow-hidden" dir={lang === 'AR' ? 'rtl' : 'ltr'}>
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-sky-50/40 blur-[130px] rounded-full pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <p className="text-xs sm:text-[13px] font-extrabold uppercase text-sky-600 tracking-wider mb-3">
            {t.securityBadge}
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t.securityTitle}
          </h2>
          <p className="text-slate-500 max-w-3xl mx-auto text-base md:text-lg leading-relaxed mt-4 font-medium">
            {t.securitySubtext}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-start">
            {/* Database Isolation */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/80 hover:border-sky-300/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-sm flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100/50 flex items-center justify-center text-sky-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t.sec1Title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {t.sec1Text}
              </p>
            </div>

            {/* Encryption */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/80 hover:border-sky-300/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-sm flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100/50 flex items-center justify-center text-sky-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t.sec2Title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {t.sec2Text}
              </p>
            </div>

            {/* Automated Backup */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/80 hover:border-sky-300/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-sm flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100/50 flex items-center justify-center text-sky-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t.sec3Title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {t.sec3Text}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Expanded "ABOUT US" Section */}
      <section id="about" className="py-24 border-t border-slate-200/50 bg-slate-50/70 relative overflow-hidden">
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-sky-100/30 blur-[130px] rounded-full pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Story/Copy */}
            <div className="lg:col-span-7 space-y-6">
              <p className="text-xs sm:text-[13px] font-extrabold uppercase text-sky-600 tracking-wider mb-0">{t.aboutBadge}</p>
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
                  <span className="text-2xl md:text-3xl font-extrabold text-sky-600 block">15+</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider mt-1">{t.stat1}</span>
                </div>
                <div>
                  <span className="text-2xl md:text-3xl font-extrabold text-amber-550 block">$4M+</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider mt-1">{t.stat2}</span>
                </div>
                <div>
                  <span className="text-2xl md:text-3xl font-extrabold text-sky-600 block">99.9%</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider mt-1">{t.stat3}</span>
                </div>
              </div>
            </div>

            {/* Core Values */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/80 shadow-sm flex gap-4 hover:shadow-md hover:border-sky-200/60 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100/50 flex items-center justify-center text-sky-600 shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{t.aboutVal1Title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {t.aboutVal1Text}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/80 shadow-sm flex gap-4 hover:shadow-md hover:border-amber-200/60 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100/50 flex items-center justify-center text-amber-550 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{t.aboutVal2Title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {t.aboutVal2Text}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/80 shadow-sm flex gap-4 hover:shadow-md hover:border-sky-200/60 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100/50 flex items-center justify-center text-sky-600 shrink-0">
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
      <section id="pricing" className="py-24 border-t border-slate-200/50 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs sm:text-[13px] font-extrabold uppercase mb-3 text-sky-600 tracking-wider">{t.pricingBadge}</p>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">{t.pricingTitle}</h3>
            <p className="text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              {t.pricingSubtext}
            </p>
          </div>

          <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border-2 border-sky-600/80 flex flex-col justify-between relative shadow-2xl shadow-sky-500/8 hover:-translate-y-1.5 transition-transform duration-300">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-sky-600 text-white text-[10px] font-extrabold tracking-wide uppercase shadow-md shadow-sky-500/20">
              {lang === 'EN' ? 'All-Inclusive Plan' : 'باقة شاملة المزايا'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">{t.planTitle}</h3>
              <p className="text-xs text-slate-500 mb-6 text-center font-medium">{t.planDesc}</p>
              
              <div className="flex items-baseline justify-center gap-1 mb-6 border-b border-slate-100 pb-6">
                <span className="text-5xl font-extrabold text-slate-900">{t.planPrice}</span>
                <span className="text-slate-500 text-sm font-semibold">{t.planPeriod}</span>
              </div>
              
              <ul className="space-y-3.5 text-sm text-slate-600 mb-8 pt-2">
                <li className="flex items-center gap-3">
                  <span className="size-5 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-600 shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="font-semibold">{t.planFeat1}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-5 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-600 shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="font-semibold">{t.planFeat2}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-5 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-600 shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="font-semibold">{t.planFeat3}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-5 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-600 shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="font-semibold">{t.planFeat4}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-5 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-600 shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="font-semibold">{t.planFeat5}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="size-5 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-600 shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="font-semibold">{t.planFeat6}</span>
                </li>
              </ul>
            </div>
            
            <button 
              onClick={() => openModal('register')}
              className="w-full py-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-all shadow-lg shadow-sky-500/15 hover:scale-[1.01] active:scale-95 duration-200"
            >
              {t.planBtn}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-slate-200/50 bg-white relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs sm:text-[13px] font-extrabold uppercase mb-3 text-sky-600 tracking-wider">{t.faqBadge}</p>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">{t.faqTitle}</h3>
            <p className="text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              {t.faqSubtext}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm ${
                    isOpen
                      ? 'bg-sky-50/40 border-sky-200/70 shadow-md'
                      : 'bg-white border-slate-200/80 hover:border-slate-300/80 hover:shadow-md'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-slate-900 hover:text-sky-600 transition-colors"
                  >
                    <span className="text-base md:text-lg font-bold">{faq.q}</span>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ms-4 ${
                      isOpen
                        ? 'rotate-180 bg-sky-100 text-sky-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-48 border-t border-sky-100/60' : 'max-h-0'}`}
                  >
                    <div className="px-6 py-5 text-slate-600 text-sm md:text-base leading-relaxed font-medium">
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
      <footer className="border-t border-slate-200/60 py-12 bg-white text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <img src={yotaxLogo} alt="Yotax Logo" className="h-7 w-auto object-contain opacity-80" />
          </div>
          <span className="text-xs font-semibold tracking-wide">
            {t.copyright}
          </span>
        </div>
      </footer>

      {/* Floating WhatsApp Contact Button */}
      <div className="fixed bottom-6 end-6 z-50">
        <a 
          href="https://wa.me/962790620675" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 sm:p-3.5 rounded-full bg-[#25D366] text-white shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all duration-200 group outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          title={lang === 'EN' ? 'Chat on WhatsApp' : 'تواصل معنا عبر واتساب'}
        >
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out whitespace-nowrap text-sm font-bold select-none leading-none">
            {lang === 'EN' ? 'Chat on WhatsApp' : 'تواصل معنا عبر واتساب'}
          </span>
          <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.909-6.993-1.878-1.879-4.352-2.912-6.99-2.914-5.443 0-9.866 4.423-9.87 9.867-.001 1.714.453 3.39 1.31 4.877L1.93 21.055l4.717-1.901zM17.56 14.78c-.302-.15-1.785-.88-2.062-.98-.277-.1-.478-.15-.678.15-.2.3-.775.98-.95 1.18-.175.2-.35.225-.652.075-.302-.15-1.276-.47-2.43-1.499-.899-.8-1.505-1.79-1.682-2.09-.177-.3-.019-.462.13-.612.135-.135.302-.35.453-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.678-1.635-.93-2.245-.245-.59-.494-.51-.678-.52-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8.375-.278.3-1.06 1.038-1.06 2.532 0 1.495 1.09 2.94 1.24 3.14.15.2 2.14 3.268 5.19 4.582.723.313 1.288.5 1.728.64.727.23 1.39.198 1.91.12.58-.087 1.785-.73 2.037-1.435.252-.705.252-1.31.176-1.435-.076-.125-.277-.2-.58-.35z"/>
          </svg>
        </a>
      </div>

      {/* Onboarding Registration / Login Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300" dir={lang === 'AR' ? 'rtl' : 'ltr'}>
          <div className="relative w-full max-w-lg overflow-hidden bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-8">
            
            {/* Close Button */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600" />
                <h3 className="text-xl font-bold text-slate-900">
                  {modalMode === 'login' ? t.loginModalTitle : t.modalTitle}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setSuccess(false);
                  setError(null);
                  setLoginSubdomain('');
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
                  We have created your private workspace <span className="font-mono text-sky-600 font-semibold">{createdSubdomain}</span>.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-bold">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                  Redirecting to Workspace Login Page...
                </div>
              </div>
            ) : modalMode === 'login' ? (
              /* Login Subdomain Form */
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {t.loginModalSubdomainLabel}
                  </label>
                  <div className="relative">
                    <Building2 className={`absolute ${lang === 'AR' ? 'right-4' : 'left-4'} top-3.5 w-5 h-5 text-slate-400`} />
                    <input 
                      type="text" 
                      name="loginSubdomain"
                      required
                      placeholder={t.loginModalSubdomainPlaceholder}
                      value={loginSubdomain}
                      onChange={(e) => setLoginSubdomain(e.target.value)}
                      className={`w-full ${lang === 'AR' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-600 text-sm focus:bg-white transition-colors font-medium`}
                    />
                  </div>
                  {loginSubdomain && (
                    <div className="mt-2 text-xs text-slate-400 font-semibold flex items-center gap-1">
                      <span>{t.modalSubdomainHelp}</span>
                      <span className="font-mono text-sky-600">
                        {loginSubdomain.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()}.{getDomainBase()}
                      </span>
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-all shadow-lg shadow-sky-500/10 flex items-center justify-center gap-2 hover:scale-[1.01] mt-8"
                >
                  {t.loginModalSubmitBtn}
                  <ArrowRight className={`w-4 h-4 ${lang === 'AR' ? 'rotate-180' : ''}`} />
                </button>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('register');
                      setError(null);
                    }}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
                  >
                    {lang === 'EN' ? "Need a new workspace? Create one here" : "هل تحتاج لمساحة عمل جديدة؟ أنشئها هنا"}
                  </button>
                </div>
              </form>
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
                      className={`w-full ${lang === 'AR' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-600 text-sm focus:bg-white transition-colors font-medium`}
                    />
                  </div>
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
                  className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-all shadow-lg shadow-sky-500/10 flex items-center justify-center gap-2 hover:scale-[1.01] mt-8 disabled:opacity-50"
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

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('login');
                      setError(null);
                    }}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
                  >
                    {lang === 'EN' ? "Already have a workspace? Log in here" : "هل لديك مساحة عمل بالفعل؟ سجل الدخول هنا"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
