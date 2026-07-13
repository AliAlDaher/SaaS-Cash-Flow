import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Scale, 
  DollarSign, 
  Mail, 
  Trash2 
} from 'lucide-react';
import yotaxLogo from './assets/yotax_logo.png';

// Translation strings for the Legal pages
const legalTranslations = {
  EN: {
    problem: "Why Yotax",
    howItWorks: "How It Works",
    features: "Features",
    aboutUs: "About",
    pricing: "Pricing",
    login: "Login",
    startTrial: "Start Free Trial",
    copyright: "© 2026 Yotax. All rights reserved.",
    footerDesc: "Keep supplier invoices, post-dated cheques, payments, and cash balances organized in one place.",
    footerCta: "Start Free Trial",
    footerProduct: "Product",
    footerSupport: "Support",
    footerLegal: "Legal",
    footerFaq: "Frequently Asked Questions",
    footerLogin: "Login",
    footerContact: "Contact Us",
    footerWhatsapp: "WhatsApp",
    footerEmail: "Email Support",
    footerDeleteAccount: "Delete Account and Data",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Use",
    footerRefund: "Cancellation and Refund Policy",
    backToHome: "Back to Home"
  },
  AR: {
    problem: "لماذا يوتاكس",
    howItWorks: "كيف يعمل",
    features: "المزايا",
    aboutUs: "عن يوتاكس",
    pricing: "الأسعار",
    login: "تسجيل الدخول",
    startTrial: "ابدأ التجربة المجانية",
    copyright: "© 2026 يوتاكس. جميع الحقوق محفوظة.",
    footerDesc: "رتّب فواتير الموردين، والشيكات المؤجلة، والمدفوعات، وتابع وضع السيولة من مكان واحد.",
    footerCta: "ابدأ التجربة المجانية",
    footerProduct: "المنتج",
    footerSupport: "الدعم",
    footerLegal: "قانوني",
    footerFaq: "الأسئلة الشائعة",
    footerLogin: "تسجيل الدخول",
    footerContact: "تواصل معنا",
    footerWhatsapp: "تواصل عبر واتساب",
    footerEmail: "البريد الإلكتروني",
    footerDeleteAccount: "حذف الحساب والبيانات",
    footerPrivacy: "سياسة الخصوصية",
    footerTerms: "شروط الاستخدام",
    footerRefund: "سياسة الإلغاء والاسترداد",
    backToHome: "العودة للرئيسية"
  }
};

// Reusable Layout for Legal Pages
interface LegalLayoutProps {
  children: (lang: 'EN' | 'AR') => React.ReactNode;
  titleEN: string;
  titleAR: string;
}

export function LegalLayout({ children, titleEN, titleAR }: LegalLayoutProps) {
  const [lang, setLang] = useState<'EN' | 'AR'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang')?.toLowerCase();
      if (urlLang === 'ar') return 'AR';
      if (urlLang === 'en') return 'EN';
      
      const stored = localStorage.getItem('yotax_landing_lang');
      if (stored === 'AR' || stored === 'EN') return stored;

      const browserLang = navigator.language?.substring(0, 2).toLowerCase();
      return browserLang === 'ar' ? 'AR' : 'EN';
    } catch {
      return 'EN';
    }
  });

  const handleLangToggle = (newLang: 'EN' | 'AR') => {
    setLang(newLang);
    try {
      localStorage.setItem('yotax_landing_lang', newLang);
      const url = new URL(window.location.href);
      url.searchParams.set('lang', newLang.toLowerCase());
      window.history.pushState({}, '', url.toString());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang === 'AR' ? 'ar' : 'en';
    document.documentElement.dir = lang === 'AR' ? 'rtl' : 'ltr';
    document.title = `Yotax | ${lang === 'AR' ? titleAR : titleEN}`;
  }, [lang, titleEN, titleAR]);

  const t = legalTranslations[lang];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to={`/?lang=${lang.toLowerCase()}`} className="shrink-0">
              <img 
                src={yotaxLogo} 
                alt="Yotax Logo" 
                className="inline-block w-auto h-8 shrink-0 object-contain" 
              />
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              <Link className="relative px-3.5 py-2 text-sm font-semibold text-slate-650 hover:text-sky-600 transition-colors" to={`/?lang=${lang.toLowerCase()}#problems`}>
                {t.problem}
              </Link>
              <Link className="relative px-3.5 py-2 text-sm font-semibold text-slate-650 hover:text-sky-600 transition-colors" to={`/?lang=${lang.toLowerCase()}#demo-video`}>
                {t.howItWorks}
              </Link>
              <Link className="relative px-3.5 py-2 text-sm font-semibold text-slate-650 hover:text-sky-600 transition-colors" to={`/?lang=${lang.toLowerCase()}#features`}>
                {t.features}
              </Link>
              <Link className="relative px-3.5 py-2 text-sm font-semibold text-slate-650 hover:text-sky-600 transition-colors" to={`/?lang=${lang.toLowerCase()}#about`}>
                {t.aboutUs}
              </Link>
              <Link className="relative px-3.5 py-2 text-sm font-semibold text-slate-650 hover:text-sky-600 transition-colors" to={`/?lang=${lang.toLowerCase()}#pricing`}>
                {t.pricing}
              </Link>
            </div>
          </div>
          
          <nav className="flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <button 
              dir={lang === 'AR' ? 'rtl' : 'ltr'}
              onClick={() => handleLangToggle(lang === 'EN' ? 'AR' : 'EN')}
              className={`flex ${lang === 'AR' ? 'flex-row-reverse' : 'flex-row'} items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all font-semibold text-xs shadow-sm select-none`}
              title={lang === 'EN' ? 'العربية' : 'English'}
            >
              <span>{lang === 'EN' ? '🇬🇧 EN' : '🇯🇴 العربية'}</span>
            </button>

            <span className="text-slate-200 mx-1 select-none">|</span>

            <Link 
              to={`/?lang=${lang.toLowerCase()}&openModal=login`}
              className="font-bold text-slate-600 hover:text-slate-900 px-3.5 py-2 text-sm transition-colors"
            >
              {t.login}
            </Link>
            
            <Link 
              to={`/?lang=${lang.toLowerCase()}&openModal=register`}
              className="px-4 py-2 text-sm font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-500/10 hover:shadow-lg hover:shadow-sky-500/15 transition-all duration-200"
            >
              {t.startTrial}
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-16">
        <div className="mb-6">
          <Link 
            to={`/?lang=${lang.toLowerCase()}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-650 hover:text-sky-700 transition-colors"
          >
            {lang === 'AR' ? '← ' : '← '} {t.backToHome}
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/85 shadow-sm p-8 md:p-12">
          {children(lang)}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 py-16 bg-white text-slate-400">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-200/60">
            {/* Column 1: Brand & Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2.5">
                <img src={yotaxLogo} alt="Yotax Logo" className="h-7.5 w-auto object-contain opacity-90" />
              </div>
              <p className="text-slate-550 text-sm leading-relaxed max-w-sm font-medium">
                {t.footerDesc}
              </p>
              <div>
                <Link 
                  to={`/?lang=${lang.toLowerCase()}&openModal=register`}
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-500/10 hover:shadow-lg"
                >
                  {t.footerCta}
                </Link>
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t.footerProduct}</h4>
              <ul className="space-y-2.5 text-sm font-semibold text-slate-550">
                <li>
                  <Link to={`/?lang=${lang.toLowerCase()}#problems`} className="hover:text-sky-600 transition-colors">{t.problem}</Link>
                </li>
                <li>
                  <Link to={`/?lang=${lang.toLowerCase()}#demo-video`} className="hover:text-sky-600 transition-colors">{t.howItWorks}</Link>
                </li>
                <li>
                  <Link to={`/?lang=${lang.toLowerCase()}#features`} className="hover:text-sky-600 transition-colors">{t.features}</Link>
                </li>
                <li>
                  <Link to={`/?lang=${lang.toLowerCase()}#pricing`} className="hover:text-sky-600 transition-colors">{t.pricing}</Link>
                </li>
                <li>
                  <Link to={`/?lang=${lang.toLowerCase()}#faq`} className="hover:text-sky-600 transition-colors">{t.footerFaq}</Link>
                </li>
                <li>
                  <Link to={`/?lang=${lang.toLowerCase()}&openModal=login`} className="hover:text-sky-600 transition-colors text-left font-semibold">{t.footerLogin}</Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Support */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t.footerSupport}</h4>
              <ul className="space-y-2.5 text-sm font-semibold text-slate-550">
                <li>
                  <Link to="/contact" className="hover:text-sky-600 transition-colors">{t.footerContact}</Link>
                </li>
                <li>
                  <a href="https://wa.me/962790620675" target="_blank" rel="noopener noreferrer" className="hover:text-sky-600 transition-colors">{t.footerWhatsapp}</a>
                </li>
                <li>
                  <a href="mailto:support@yotax.app" className="hover:text-sky-600 transition-colors">{t.footerEmail}</a>
                </li>
                <li>
                  <Link to="/delete-account" className="hover:text-sky-600 transition-colors text-rose-500 hover:text-rose-600">{t.footerDeleteAccount}</Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t.footerLegal}</h4>
              <ul className="space-y-2.5 text-sm font-semibold text-slate-550">
                <li>
                  <Link to="/privacy" className="hover:text-sky-600 transition-colors">{t.footerPrivacy}</Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-sky-600 transition-colors">{t.footerTerms}</Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="hover:text-sky-600 transition-colors">{t.footerRefund}</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 text-xs font-semibold">
            <span className="tracking-wide text-slate-400">
              {t.copyright}
            </span>

            {/* Bottom Language Selector */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleLangToggle('AR')}
                className={`transition-colors ${lang === 'AR' ? 'text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-900'}`}
              >
                العربية
              </button>
              <span className="text-slate-200">|</span>
              <button 
                onClick={() => handleLangToggle('EN')}
                className={`transition-colors ${lang === 'EN' ? 'text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-900'}`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// 1. Privacy Policy Page Component
export function PrivacyPolicy() {
  return (
    <LegalLayout titleEN="Privacy Policy" titleAR="سياسة الخصوصية">
      {(lang) => lang === 'EN' ? (
        <article className="prose prose-slate max-w-none">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 m-0">Privacy Policy</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0 mb-6 font-bold">Last updated: July 14, 2026</p>
          
          <div className="text-slate-600 space-y-6 text-[15px] leading-relaxed font-medium">
            <p>Yotax collects the information needed to create your account, operate your workspace, and provide the features available through the service. This policy explains what information we collect, how we use it, and the choices available to you.</p>
            
            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">1. Information We Collect</h3>
            <p>When you create an account or use Yotax, we may collect the following information:</p>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <strong>Account information:</strong> This may include your company name, account administrator’s name, email address, selected workspace subdomain, and the login information needed to access your account.
              </li>
              <li>
                <strong>Information added to your workspace:</strong> This may include bank accounts and balances, supplier invoices, payments, post-dated cheques, and due dates. This information is entered by you or your team. Yotax does not retrieve it directly from your bank.
              </li>
              <li>
                <strong>Usage information:</strong> We may collect technical information that helps us operate and protect the service, such as your device and browser type, IP address, login times, and the pages used within the platform.
              </li>
            </ul>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">2. How We Use Information</h3>
            <p>We may use your information to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Create and manage your account and workspace.</li>
              <li>Display the balances, invoices, payments, and cheques you enter.</li>
              <li>Calculate outstanding amounts and show upcoming transactions.</li>
              <li>Send account notifications and due-date reminders.</li>
              <li>Provide customer support.</li>
              <li>Protect accounts and investigate technical or security issues.</li>
              <li>Improve the performance and usability of the service.</li>
            </ul>
            <p>We do not sell your personal information or financial records for advertising purposes.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">3. How Information Is Shared</h3>
            <p>We may work with trusted service providers that help us operate Yotax, including hosting, email, authentication, backups, customer support, and payment-processing providers. In particular, our infrastructure and databases run on infrastructure services provided by providers such as Netlify and Render.</p>
            <p>These providers receive only the information needed to provide their services to us.</p>
            <p>We may also disclose information when required by law or when reasonably necessary to protect our rights, users, or service.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">4. Data Retention and Account Deletion</h3>
            <p>We keep your account information while your Yotax account remains active. After an account is closed, we delete or anonymize its information within 30 days, unless we are legally required to keep certain records for longer.</p>
            <p>Some information may remain in backups for a limited period before being permanently removed.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">5. Protecting Your Information</h3>
            <p>We use reasonable measures to protect accounts and information against unauthorized access, loss, or alteration. However, no online service can guarantee complete security. You should use a strong password and avoid sharing your login details with others.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">6. Team Member Access</h3>
            <p>Workspace administrators may invite team members and choose the permissions available to them. The business account administrator is responsible for managing access and removing users who no longer need access to the workspace.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">7. Your Rights and Choices</h3>
            <p>Depending on the laws that apply to you, you may have the right to request information about the data connected to your account, correct inaccurate information, request a copy of your information, request the deletion of your account and data, object to certain uses of your information, or withdraw consent where processing is based on consent.</p>
            <p>Requests can be sent directly to our support and privacy email at <a href="mailto:support@yotax.app" className="text-sky-655 hover:text-sky-700 underline font-semibold">support@yotax.app</a> or via our dedicated <Link to="/delete-account" className="text-sky-655 hover:text-sky-700 underline font-semibold">Account Deletion request page</Link>.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">8. Cookies</h3>
            <p>The website may use essential cookies to keep you signed in, remember your language settings, and protect your session.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">9. Third-Party Services</h3>
            <p>Yotax may contain links to or integrations with third-party services. Those services have their own privacy practices, and this policy does not cover how they handle information.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">10. Changes to This Policy</h3>
            <p>We may update this policy when the service or applicable requirements change. If an update materially affects how information is handled, we may notify you through the website or the email address connected to your account.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">11. Contact Us</h3>
            <p>For privacy questions or requests, contact us at:</p>
            <ul className="list-none pl-0 space-y-1 text-sm font-semibold text-slate-700">
              <li><span className="text-slate-500 font-bold">Service operator:</span> Yotax</li>
              <li><span className="text-slate-500 font-bold">Email:</span> <a href="mailto:support@yotax.app" className="text-sky-655 hover:text-sky-700 underline font-semibold">support@yotax.app</a></li>
              <li><span className="text-slate-500 font-bold">Country:</span> Jordan</li>
              <li><span className="text-slate-500 font-bold">Mailing address:</span> Amman, Jordan</li>
            </ul>
          </div>
        </article>
      ) : (
        <article className="prose prose-slate max-w-none text-right" dir="rtl">
          <div className="flex items-center gap-3 mb-2 justify-start">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 m-0">سياسة الخصوصية</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0 mb-6 font-bold">آخر تحديث: 14 يوليو 2026</p>

          <div className="text-slate-600 space-y-6 text-[15px] leading-relaxed font-medium">
            <p>في يوتاكس، نجمع بعض البيانات الضرورية حتى نقدر ننشئ حسابك ونشغّل مساحة العمل والخدمات المرتبطة بها. توضح هذه السياسة ما البيانات التي نجمعها، وكيف نستخدمها، والخيارات المتاحة لك بخصوص بياناتك.</p>
            
            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">1. البيانات التي نجمعها</h3>
            <p>عند إنشاء حساب أو استخدام يوتاكس، قد نجمع الأنواع التالية من البيانات:</p>
            <ul className="list-disc pr-5 space-y-3">
              <li>
                <strong>بيانات الحساب:</strong> مثل اسم الشركة، اسم مسؤول الحساب، البريد الإلكتروني، النطاق الفرعي الذي تختاره، وبيانات تسجيل الدخول اللازمة للوصول إلى حسابك.
              </li>
              <li>
                <strong>البيانات التي تضيفها إلى مساحة العمل:</strong> مثل الحسابات البنكية والأرصدة، فواتير الموردين، المدفوعات، الشيكات المؤجلة، ومواعيد الاستحقاق. هذه المعلومات يتم إدخالها من طرفك أو من طرف أعضاء فريقك، ولا يقوم يوتاكس بجلبها مباشرة من البنك.
              </li>
              <li>
                <strong>بيانات الاستخدام:</strong> قد نجمع معلومات تقنية تساعدنا على تشغيل الخدمة وحمايتها، مثل نوع الجهاز والمتصفح، عنوان الإنترنت، مواعيد تسجيل الدخول، والصفحات المستخدمة داخل المنصة.
              </li>
            </ul>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">2. كيف نستخدم البيانات</h3>
            <p>نستخدم البيانات للأغراض التالية:</p>
            <ul className="list-disc pr-5 space-y-2">
              <li>إنشاء حسابك وإدارة مساحة العمل.</li>
              <li>عرض الأرصدة والفواتير والمدفوعات والشيكات التي تسجلها.</li>
              <li>حساب المبالغ المتبقية وإظهار العمليات القادمة.</li>
              <li>إرسال التنبيهات والتذكيرات المتعلقة بحسابك.</li>
              <li>تقديم الدعم والرد على الاستفسارات.</li>
              <li>حماية الحسابات ومتابعة الأعطال أو محاولات الاستخدام غير المصرح بها.</li>
              <li>تحسين أداء الخدمة وتجربة الاستخدام.</li>
            </ul>
            <p>لا نبيع بياناتك الشخصية أو سجلاتك المالية لأغراض إعلانية.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">3. مشاركة البيانات</h3>
            <p>قد نستعين بجهات موثوقة تساعدنا في تشغيل يوتاكس، مثل خدمات الاستضافة (Netlify و Render)، البريد الإلكتروني، تسجيل الدخول، النسخ الاحتياطي، الدعم الفني، ومعالجة المدفوعات.</p>
            <p>لا تحصل هذه الجهات إلا على المعلومات اللازمة لتقديم خدماتها لنا، ويكون استخدامها للبيانات مرتبطًا بتشغيل يوتاكس.</p>
            <p>وقد نكشف عن بعض المعلومات عندما يكون ذلك مطلوبًا بموجب القانون أو لحماية حقوقنا وحقوق المستخدمين.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">4. حفظ البيانات وحذفها</h3>
            <p>نحتفظ ببيانات حسابك طوال فترة استخدامك ليوتاكس.</p>
            <p>عند إغلاق الحساب، نقوم بحذف البيانات أو إخفاء هويتها خلال 30 يوماً، إلا إذا كان القانون يطلب منا الاحتفاظ ببعض المعلومات لمدة أطول.</p>
            <p>يمكن أن تبقى بعض البيانات لفترة محدودة داخل النسخ الاحتياطية قبل حذفها نهائيًا.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">5. حماية الحساب والبيانات</h3>
            <p>نتخذ إجراءات مناسبة لحماية الحسابات والبيانات من الوصول غير المصرح به أو التعديل أو الفقدان.</p>
            <p>لكن لا توجد خدمة عبر الإنترنت يمكنها ضمان حماية كاملة بنسبة 100%، لذلك ننصح باستخدام كلمة مرور قوية وعدم مشاركة بيانات الدخول مع أي شخص.</p>

            <h3 className="text-lg font-bold text-slate-950 mt-8 mb-2">6. صلاحيات أعضاء الفريق</h3>
            <p>يمكن لمسؤول مساحة العمل إضافة أعضاء آخرين وتحديد الصلاحيات المتاحة لهم. مسؤول الشركة هو المسؤول عن الأشخاص الذين يمنحهم حق الوصول، وعن إزالة صلاحيات أي عضو لم يعد يحتاج إلى استخدام الحساب.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">7. حقوقك وخياراتك</h3>
            <p>بحسب القوانين المطبقة في بلدك، يمكنك طلب معرفة البيانات المرتبطة بحسابك، تصحيح المعلومات غير الدقيقة، الحصول على نسخة من بياناتك، حذف حسابك وبياناتك، الاعتراض على بعض طرق استخدام البيانات، أو سحب موافقتك عندما يكون استخدام البيانات مبنيًا على الموافقة.</p>
            <p>يمكن إرسال هذه الطلبات مباشرة إلى بريد الدعم الخاص بنا <a href="mailto:support@yotax.app" className="text-sky-655 hover:text-sky-700 underline font-semibold">support@yotax.app</a> أو من خلال صفحة <Link to="/delete-account" className="text-sky-655 hover:text-sky-700 underline font-semibold">طلب حذف الحساب والبيانات</Link>.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">8. ملفات الارتباط</h3>
            <p>قد يستخدم الموقع ملفات ارتباط ضرورية لتسجيل الدخول، حفظ إعدادات اللغة، والمحافظة على أمان الجلسة.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">9. خدمات ومواقع خارجية</h3>
            <p>قد يحتوي يوتاكس على روابط أو خدمات مقدمة من جهات أخرى. تخضع هذه الخدمات لسياسات الخصوصية الخاصة بها، ولسنا مسؤولين عن محتوى أو ممارسات المواقع الخارجية.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">10. التغييرات على هذه السياسة</h3>
            <p>قد نقوم بتحديث سياسة الخصوصية عندما تتغير الخدمة أو المتطلبات القانونية. عند إجراء تغيير مهم، سنعرض إشعارًا داخل الموقع أو نرسل إشعارًا إلى البريد المرتبط بالحساب.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">11. تواصل معنا</h3>
            <p>لأي سؤال متعلق بالخصوصية أو لاستخدام حقوقك، تواصل معنا عبر:</p>
            <ul className="list-none pr-0 space-y-1 text-sm font-semibold text-slate-700 text-right">
              <li><span className="text-slate-500 font-bold">اسم الجهة المشغلة:</span> يوتاكس (Yotax)</li>
              <li><span className="text-slate-500 font-bold">البريد الإلكتروني:</span> <a href="mailto:support@yotax.app" className="text-sky-655 hover:text-sky-700 underline font-semibold">support@yotax.app</a></li>
              <li><span className="text-slate-500 font-bold">الدولة:</span> الأردن</li>
              <li><span className="text-slate-500 font-bold">عنوان المراسلات:</span> عمان، الأردن</li>
            </ul>
          </div>
        </article>
      )}
    </LegalLayout>
  );
}

// 2. Terms of Use Page Component
export function TermsOfUse() {
  return (
    <LegalLayout titleEN="Terms of Use" titleAR="شروط الاستخدام">
      {(lang) => lang === 'EN' ? (
        <article className="prose prose-slate max-w-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Scale className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 m-0">Terms of Use</h1>
          </div>
          <div className="text-slate-600 space-y-6 text-[15px] leading-relaxed font-medium">
            <p>By creating a workspace on Yotax, you agree to comply with and be bound by the following Terms of Use.</p>
            
            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">1. Registration and Accounts</h3>
            <p>You must provide accurate company and admin registration information. You are solely responsible for maintaining the confidentiality of your workspace password and for all activity conducted within your subdomain.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">2. Acceptable Use</h3>
            <p>Yotax is designed for manual entry of invoices, cheques, and bank balance estimates. You agree not to use the service for any illegal activities, or to bypass or disrupt the integrity of the application infrastructure.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">3. Disclaimers</h3>
            <p>Yotax is a tool to organize manual entries. The estimated balances and due dates calculated are based on the data you enter. You should verify critical cashing and payment dates independently with your banking institutions.</p>

            <div className="mt-12 p-6 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-sm">
              <strong>Jurisdiction Placeholder:</strong> These terms are governed by the laws of <code>[Insert Company Legal Jurisdiction / Governing Law here]</code>.
            </div>
          </div>
        </article>
      ) : (
        <article className="prose prose-slate max-w-none text-right" dir="rtl">
          <div className="flex items-center gap-3 mb-6 justify-start">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Scale className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 m-0">شروط الاستخدام</h1>
          </div>
          <div className="text-slate-600 space-y-6 text-[15px] leading-relaxed font-medium">
            <p>بإنشاء مساحة عمل على يوتاكس، فإنك توافق على الامتثال لشروط الاستخدام التالية والالتزام بها.</p>
            
            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">1. التسجيل والحسابات</h3>
            <p>يجب تقديم تفاصيل تسجيل دقيقة للشركة والمسؤول. أنت مسؤول بالكامل عن الحفاظ على سرية كلمة مرور مساحة العمل وعن جميع الأنشطة التي تتم تحت النطاق الفرعي الخاص بك.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">2. الاستخدام المقبول</h3>
            <p>يوتاكس مصمم لمتابعة وتسجيل الفواتير والشيكات والأرصدة يدوياً. توافق على عدم استخدام الخدمة في أي أنشطة غير قانونية، أو محاولة تعطيل البنية التحتية للتطبيق.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">3. إخلاء المسؤولية</h3>
            <p>يوتاكس هو أداة لتنظيم السجلات المالية اليدوية. الأرصدة المتوقعة وتواريخ الاستحقاق يتم احتسابها بناءً على البيانات التي تدخلها بنفسك. يجب التحقق من المواعيد الحرجة بشكل مستقل مع البنك.</p>

            <div className="mt-12 p-6 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-905 text-sm text-right">
              <strong>الولاية القضائية (نائب):</strong> تخضع شروط الاستخدام هذه لقوانين <code>[أدخل الولاية القضائية / القانون المعمول به هنا]</code>.
            </div>
          </div>
        </article>
      )}
    </LegalLayout>
  );
}

// 3. Refund Policy Page Component
export function RefundPolicy() {
  return (
    <LegalLayout titleEN="Cancellation & Refund" titleAR="سياسة الإلغاء والاسترداد">
      {(lang) => lang === 'EN' ? (
        <article className="prose prose-slate max-w-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 m-0">Cancellation & Refund Policy</h1>
          </div>
          <div className="text-slate-600 space-y-6 text-[15px] leading-relaxed font-medium">
            <p>Thank you for using Yotax. Please read our cancellation and refund policies carefully.</p>
            
            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">1. Subscription Billing</h3>
            <p>Yotax is billed on a recurring monthly basis. You can review your billing schedule and payment details directly from your workspace billing dashboard.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">2. Cancellation</h3>
            <p>You can cancel your Yotax subscription at any time. When cancelled, your workspace remains fully accessible until the end of the current paid billing period, and no further monthly charges will apply.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">3. Refunds</h3>
            <p>Because Yotax provides instant setup of private workspaces, refunds are evaluated on a case-by-case basis. To request a refund, please contact support with details of your workspace subdomain.</p>

            <div className="mt-12 p-6 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-sm">
              <strong>Refund Details Placeholder:</strong> To request a cancellation or refund, email <code>[Insert Refund Support Email / Contact Info here]</code>. Refund requests must be made within <code>[Insert Refund Request Window, e.g. 7 days or 14 days]</code> of the transaction.
            </div>
          </div>
        </article>
      ) : (
        <article className="prose prose-slate max-w-none text-right" dir="rtl">
          <div className="flex items-center gap-3 mb-6 justify-start">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 m-0">سياسة الإلغاء والاسترداد</h1>
          </div>
          <div className="text-slate-600 space-y-6 text-[15px] leading-relaxed font-medium">
            <p>نشكرك على استخدام يوتاكس. يرجى قراءة سياسة الإلغاء والاسترداد بعناية.</p>
            
            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">1. فوترة الاشتراكات</h3>
            <p>يتم تحصيل رسوم يوتاكس شهرياً بشكل متكرر. يمكنك مراجعة جدول الفوترة الخاص بك من إعدادات مساحة العمل.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">2. الإلغاء</h3>
            <p>يمكنك إلغاء اشتراكك في يوتاكس في أي وقت. عند الإلغاء، يظل حسابك ومساحة عملك نشطة بالكامل حتى نهاية فترة الفوترة الحالية ولا يتم تحصيل أي رسوم إضافية.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">3. الاسترداد</h3>
            <p>نظراً لأن يوتاكس يقدم مساحات عمل رقمية فورية، فإن طلبات الاسترداد يتم تقييمها بشكل فردي. يرجى التواصل مع الدعم لتقديم الطلب.</p>

            <div className="mt-12 p-6 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-905 text-sm text-right">
              <strong>تفاصيل الاسترداد (نائب):</strong> لطلب الاسترداد أو الإلغاء، يرجى مراسلة <code>[أدخل البريد الإلكتروني أو معلومات التواصل لطلبات الاسترداد هنا]</code>. يجب تقديم طلب الاسترداد خلال <code>[أدخل فترة طلب الاسترداد، مثل 7 أيام أو 14 يوماً]</code> من تاريخ المعاملة.
            </div>
          </div>
        </article>
      )}
    </LegalLayout>
  );
}

// 4. Contact Us Page Component
export function ContactUs() {
  return (
    <LegalLayout titleEN="Contact Us" titleAR="تواصل معنا">
      {(lang) => lang === 'EN' ? (
        <article className="prose prose-slate max-w-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Mail className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 m-0">Contact Us</h1>
          </div>
          <div className="text-slate-600 space-y-6 text-[15px] leading-relaxed font-medium">
            <p>If you have questions about Yotax, need help with your workspace, or want to get in touch with our team, please use the contacts below:</p>
            
            <ul className="space-y-4 list-none pl-0 mt-6">
              <li className="flex items-start gap-3">
                <span className="font-bold text-slate-900 w-32 shrink-0">WhatsApp Support:</span>
                <div>
                  <a href="https://wa.me/962790620675" target="_blank" rel="noopener noreferrer" className="text-sky-655 hover:text-sky-700 font-semibold underline">
                    +962 79 062 0675 (Chat on WhatsApp)
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-slate-900 w-32 shrink-0">Email Support:</span>
                <div>
                  <a href="mailto:support@yotax.app" className="text-sky-655 hover:text-sky-700 font-semibold underline">
                    support@yotax.app
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-slate-900 w-32 shrink-0">Response Time:</span>
                <span className="text-slate-600">We try to respond to all inquiries within 24 hours.</span>
              </li>
            </ul>

            <div className="mt-12 p-6 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-sm">
              <strong>Office Location Placeholder:</strong> <code>[Insert Business Office Address / Mailing Location here, if applicable]</code>.
            </div>
          </div>
        </article>
      ) : (
        <article className="prose prose-slate max-w-none text-right" dir="rtl">
          <div className="flex items-center gap-3 mb-6 justify-start">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Mail className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 m-0">تواصل معنا</h1>
          </div>
          <div className="text-slate-600 space-y-6 text-[15px] leading-relaxed font-medium">
            <p>إذا كانت لديك أسئلة حول يوتاكس، أو تحتاج إلى مساعدة في مساحة العمل الخاصة بك، أو ترغب في التواصل مع فريقنا، يرجى استخدام قنوات التواصل أدناه:</p>
            
            <ul className="space-y-4 list-none pr-0 mt-6">
              <li className="flex items-start gap-3">
                <span className="font-bold text-slate-900 w-32 shrink-0">دعم واتساب:</span>
                <div>
                  <a href="https://wa.me/962790620675" target="_blank" rel="noopener noreferrer" className="text-sky-655 hover:text-sky-700 font-semibold underline">
                    962790620675+ (تواصل عبر واتساب)
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-slate-900 w-32 shrink-0">البريد الإلكتروني:</span>
                <div>
                  <a href="mailto:support@yotax.app" className="text-sky-655 hover:text-sky-700 font-semibold underline">
                    support@yotax.app
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-slate-900 w-32 shrink-0">وقت الاستجابة:</span>
                <span className="text-slate-600">نحاول الرد على جميع الاستفسارات في غضون 24 ساعة.</span>
              </li>
            </ul>

            <div className="mt-12 p-6 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-905 text-sm text-right">
              <strong>عنوان المكتب (نائب):</strong> <code>[أدخل عنوان المكتب أو صندوق البريد هنا، إن وجد]</code>.
            </div>
          </div>
        </article>
      )}
    </LegalLayout>
  );
}

// 5. Delete Account Page Component
export function DeleteAccount() {
  return (
    <LegalLayout titleEN="Delete Account" titleAR="حذف الحساب والبيانات">
      {(lang) => lang === 'EN' ? (
        <article className="prose prose-slate max-w-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 m-0">Delete Account and Data</h1>
          </div>
          <div className="text-slate-600 space-y-6 text-[15px] leading-relaxed font-medium">
            <p>If you wish to close your Yotax workspace and delete all manually logged business data (invoices, cheques, payments, and balances), you can request permanent deletion.</p>
            
            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">How to Request Deletion:</h3>
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <strong>Self-Service:</strong> Log in to your workspace account, navigate to <strong>Settings</strong> &gt; <strong>Danger Zone</strong>, and click <strong>Delete Workspace</strong>.
              </li>
              <li>
                <strong>By Email:</strong> Alternatively, send an email request to <a href="mailto:support@yotax.app" className="text-sky-655 hover:text-sky-700 underline font-semibold">support@yotax.app</a> from the administrator email address registered on your workspace.
              </li>
            </ol>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">What Happens Upon Deletion:</h3>
            <p>All manually logged bank balances, invoice lists, cheques, user accounts, and credentials associated with your subdomain will be permanently wiped from our active databases.</p>

            <div className="mt-12 p-6 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-sm">
              <strong>Deletion Timeframe Placeholder:</strong> Upon confirming your email request, data deletion will be completed within <code>[Insert expected data deletion timeframe, e.g. 7 days or 30 days]</code>.
            </div>
          </div>
        </article>
      ) : (
        <article className="prose prose-slate max-w-none text-right" dir="rtl">
          <div className="flex items-center gap-3 mb-6 justify-start">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 m-0">حذف الحساب والبيانات</h1>
          </div>
          <div className="text-slate-600 space-y-6 text-[15px] leading-relaxed font-medium">
            <p>إذا كنت ترغب في إغلاق مساحة العمل الخاصة بك في يوتاكس وحذف جميع السجلات اليدوية (الفواتير، الشيكات، المدفوعات، الأرصدة)، يمكنك تقديم طلب حذف نهائي.</p>
            
            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">كيفية تقديم طلب الحذف:</h3>
            <ol className="list-decimal pr-5 space-y-3">
              <li>
                <strong>الخدمة الذاتية:</strong> سجل الدخول إلى مساحة العمل الخاصة بك، وانتقل إلى <strong>الإعدادات</strong> &gt; <strong>منطقة الخطر</strong>، واضغط على <strong>حذف مساحة العمل</strong>.
              </li>
              <li>
                <strong>عبر البريد الإلكتروني:</strong> راسلنا من بريد المسؤول المسجل لدينا على <a href="mailto:support@yotax.app" className="text-sky-655 hover:text-sky-700 underline font-semibold">support@yotax.app</a> لطلب حذف مساحة العمل.
              </li>
            </ol>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">ماذا يحدث بعد الحذف:</h3>
            <p>سيتم حذف جميع سجلات الحسابات البنكية المضافة، وتواريخ الفواتير، وبيانات الشيكات، وحسابات أعضاء فريقك بشكل نهائي ولا يمكن استعادتها.</p>

            <div className="mt-12 p-6 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-905 text-sm text-right">
              <strong>الإطار الزمني للحذف (نائب):</strong> بمجرد تأكيد طلبك، ستكتمل عملية إزالة البيانات بشكل نهائي في غضون <code>[أدخل الإطار الزمني المتوقع لعملية الحذف النهائي للبيانات، مثل 7 أيام أو 30 يوماً]</code>.
            </div>
          </div>
        </article>
      )}
    </LegalLayout>
  );
}
