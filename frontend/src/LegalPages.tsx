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
// 2. Terms of Use Page Component
// 2. Terms of Use Page Component
export function TermsOfUse() {
  return (
    <LegalLayout titleEN="Terms of Use" titleAR="شروط الاستخدام">
      {(lang) => lang === 'EN' ? (
        <article className="prose prose-slate max-w-none">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Scale className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 m-0">Terms of Use</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0 mb-6 font-bold">Last updated: July 14, 2026</p>
          
          <div className="text-slate-600 space-y-6 text-[15px] leading-relaxed font-medium">
            <p>These Terms explain the rules for using Yotax. By creating an account or using the service, you agree to follow them.</p>
            
            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">1. Creating an Account</h3>
            <p>You must provide accurate information when registering and keep it up to date.</p>
            <p>You are responsible for protecting your login details and for activity carried out through your account or your team members’ accounts. Contact us promptly at <a href="mailto:support@yotax.app" className="text-sky-655 hover:text-sky-700 underline">support@yotax.app</a> if you notice any unusual activity.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">2. Using the Service</h3>
            <p>Yotax helps you organize supplier invoices, payments, post-dated cheques, and account balances entered by you or your team.</p>
            <p>You may not use the service to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Carry out unlawful activities.</li>
              <li>Access another user’s account or information.</li>
              <li>Disrupt or interfere with the service.</li>
              <li>Upload harmful files or content.</li>
              <li>Copy or resell the service without our written permission.</li>
            </ul>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">3. Accuracy of Information</h3>
            <p>The balances, due dates, and projections shown in Yotax depend on the information entered into your workspace. You are responsible for keeping that information accurate and up to date. Important payment and cheque dates should be confirmed with your bank or supplier when necessary.</p>
            <p>Yotax is an organization and tracking tool. It is not a substitute for professional accounting, financial, or legal advice.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">4. Subscriptions and Payments</h3>
            <p>Some Yotax features may require a paid subscription. The price and billing cycle will be shown before payment is completed.</p>
            <p>Subscriptions renew according to the billing cycle shown in your account unless cancelled before the next renewal date.</p>
            <p>Cancellations and refunds are handled under our Cancellation and Refund Policy.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">5. Team Members</h3>
            <p>Workspace administrators may invite team members and choose the permissions available to them. The account owner is responsible for managing access and removing users who no longer need it.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">6. Ownership of Your Information</h3>
            <p>You or your business continue to own the information entered into your workspace. You give us only the permission needed to process that information and provide the service connected to your account.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">7. Service Availability</h3>
            <p>We aim to keep Yotax available, but the service may occasionally be interrupted because of maintenance, updates, or events outside our control. We do not guarantee uninterrupted availability at all times.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">8. Account Suspension or Closure</h3>
            <p>We may suspend or restrict an account if the service is used in violation of these Terms or in a way that may harm the service or other users. Where reasonably possible, we will try to contact the account owner before taking action.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">9. Limitation of Responsibility</h3>
            <p>Yotax helps organize and display the information entered into your account. It does not guarantee that projected balances will match actual future balances. We are not responsible for financial or business decisions made using incorrect or incomplete information entered into the service.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">10. Changes to These Terms</h3>
            <p>We may update these Terms when the service or the way it is provided changes. For important changes, we may display a notice on the website or contact you through the email connected to your account.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">11. Governing Law</h3>
            <p>These Terms are governed by the laws of Jordan.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">12. Contact Us</h3>
            <p>For questions about these Terms, contact:</p>
            <ul className="list-none pl-0 space-y-1 text-sm font-semibold text-slate-700">
              <li><span className="text-slate-500 font-bold">Email:</span> <a href="mailto:support@yotax.app" className="text-sky-655 hover:text-sky-700 underline">support@yotax.app</a></li>
              <li><span className="text-slate-500 font-bold">Service operator:</span> Yotax</li>
              <li><span className="text-slate-500 font-bold">Country:</span> Jordan</li>
            </ul>
          </div>
        </article>
      ) : (
        <article className="prose prose-slate max-w-none text-right" dir="rtl">
          <div className="flex items-center gap-3 mb-2 justify-start">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Scale className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 m-0">شروط الاستخدام</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0 mb-6 font-bold">آخر تحديث: 14 يوليو 2026</p>

          <div className="text-slate-600 space-y-6 text-[15px] leading-relaxed font-medium">
            <p>توضح هذه الشروط القواعد الخاصة باستخدام يوتاكس. عند إنشاء حساب أو استخدام الخدمة، فأنت توافق على الالتزام بهذه الشروط.</p>
            
            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">1. إنشاء الحساب</h3>
            <p>لاستخدام يوتاكس، يجب تقديم معلومات صحيحة عند التسجيل والمحافظة على تحديثها.</p>
            <p>أنت مسؤول عن حماية بيانات تسجيل الدخول، وعن جميع العمليات التي تتم من خلال حسابك أو حسابات أعضاء فريقك. إذا لاحظت أي استخدام غير معتاد، يرجى التواصل معنا مباشرة على البريد الإلكتروني <a href="mailto:support@yotax.app" className="text-sky-655 hover:text-sky-700 underline">support@yotax.app</a>.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">2. استخدام الخدمة</h3>
            <p>يوتاكس يساعدك على تنظيم فواتير الموردين، والمدفوعات، والشيكات المؤجلة، وأرصدة الحسابات التي تدخلها أنت أو أعضاء فريقك.</p>
            <p>يجب عدم استخدام الخدمة في أي نشاط مخالف للقانون، أو لمحاولة الدخول إلى حسابات أو بيانات تخص مستخدمين آخرين، أو لتعطيل الخدمة أو التأثير على عملها، أو لرفع ملفات أو محتوى ضار، أو لإعادة بيع الخدمة أو نسخها دون موافقة مكتوبة منا.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">3. دقة البيانات</h3>
            <p>تعتمد النتائج والمبالغ المتوقعة ومواعيد الاستحقاق الظاهرة في يوتاكس على البيانات التي تدخلها. أنت مسؤول عن التأكد من صحة هذه البيانات وتحديثها. ويجب مراجعة المواعيد والمدفوعات المهمة مع البنك أو المورد عند الحاجة.</p>
            <p>يوتاكس أداة للمساعدة في المتابعة والتنظيم، وليس بديلًا عن الاستشارة المحاسبية أو المالية أو القانونية.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">4. الاشتراك والدفع</h3>
            <p>قد تتطلب بعض مزايا يوتاكس اشتراكًا مدفوعًا. تظهر قيمة الاشتراك ودورة الفوترة قبل إتمام عملية الدفع. يتم تجديد الاشتراك حسب الدورة الموضحة في حسابك، ما لم تقم بإلغائه قبل موعد التجديد. تخضع عمليات الإلغاء والاسترداد لسياسة الإلغاء والاسترداد المنشورة على الموقع.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">5. أعضاء الفريق</h3>
            <p>يمكن لمسؤول مساحة العمل إضافة أعضاء إلى الحساب وتحديد الصلاحيات المتاحة لهم. صاحب الحساب مسؤول عن إدارة هذه الصلاحيات وعن إزالة أي عضو لم يعد بحاجة إلى الوصول.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">6. ملكية البيانات</h3>
            <p>تظل البيانات التي تدخلها في مساحة العمل ملكًا لك أو لشركتك. تمنحنا فقط الصلاحية اللازمة لمعالجة هذه البيانات من أجل تشغيل الخدمة وتقديم المزايا المرتبطة بحسابك.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">7. توفر الخدمة</h3>
            <p>نسعى إلى إبقاء يوتاكس متاحًا بشكل مستمر، لكن قد تتوقف الخدمة مؤقتًا بسبب الصيانة أو التحديثات أو الأعطال الخارجة عن إرادتنا. لا نضمن أن الخدمة ستكون متاحة دون انقطاع في جميع الأوقات.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">8. تعليق الحساب أو إغلاقه</h3>
            <p>يجوز لنا تعليق الحساب أو تقييد الوصول إليه إذا تم استخدام الخدمة بطريقة مخالفة لهذه الشروط، أو إذا كانت هناك محاولة للإضرار بالخدمة أو بالمستخدمين الآخرين. سنحاول التواصل مع صاحب الحساب قبل اتخاذ هذا الإجراء عندما يكون ذلك ممكنًا.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">9. حدود المسؤولية</h3>
            <p>يوتاكس يساعدك على تنظيم ومتابعة البيانات التي تدخلها، لكنه لا يضمن أن التوقعات أو الأرصدة المستقبلية ستكون مطابقة للنتائج الفعلية. لا نتحمل مسؤولية القرارات المالية أو التجارية التي يتم اتخاذها اعتمادًا على بيانات غير صحيحة أو غير مكتملة داخل الحساب.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">10. تحديث الشروط</h3>
            <p>قد نقوم بتحديث هذه الشروط عند إضافة مزايا جديدة أو تغيير طريقة تقديم الخدمة. إذا كان التغيير مهمًا، سنعرض إشعارًا داخل الموقع أو نتواصل معك عبر البريد الإلكتروني المرتبط بالحساب.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">11. القانون المعمول به</h3>
            <p>تخضع هذه الشروط لقوانين الأردن.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">12. التواصل معنا</h3>
            <p>لأي سؤال متعلق بهذه الشروط، تواصل معنا عبر:</p>
            <ul className="list-none pr-0 space-y-1 text-sm font-semibold text-slate-700 text-right">
              <li><span className="text-slate-500 font-bold">البريد الإلكتروني:</span> <a href="mailto:support@yotax.app" className="text-sky-655 hover:text-sky-700 underline">support@yotax.app</a></li>
              <li><span className="text-slate-500 font-bold">الجهة المشغلة:</span> يوتاكس (Yotax)</li>
              <li><span className="text-slate-500 font-bold">الدولة:</span> الأردن</li>
            </ul>
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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 m-0">Cancellation & Refund Policy</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0 mb-6 font-bold">Last updated: July 14, 2026</p>
          
          <div className="text-slate-600 space-y-6 text-[15px] leading-relaxed font-medium">
            <p>This Policy explains how to cancel a Yotax subscription and when a refund request may be considered.</p>
            
            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">1. Billing</h3>
            <p>Subscription fees are charged according to the billing cycle shown during signup and in your account’s billing page. You can review the subscription price and the period covered before confirming payment.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">2. Cancelling a Subscription</h3>
            <p>You may cancel your subscription through your account settings or by contacting our support team. Cancelling stops the next automatic renewal, and you will not be charged for the following billing cycle. Your account will remain available until the end of the paid period.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">3. Requesting a Refund</h3>
            <p>Refund requests may be submitted within 14 days of the payment date.</p>
            <p>A request may be reviewed when:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The same payment was charged more than once.</li>
              <li>A charge was made after a subscription was cancelled on time.</li>
              <li>A significant technical problem prevented normal use of the service.</li>
              <li>Another situation reasonably requires review.</li>
            </ul>
            <p>Submitting a request does not guarantee approval. We will review the account and payment details before making a decision.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">4. Refunds That May Not Be Approved</h3>
            <p>A refund may not be available when:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The customer changes their mind after using the service.</li>
              <li>The account was not used even though the service was available.</li>
              <li>The request is submitted after the stated 14-day refund period.</li>
              <li>The account was closed because of a violation of the Terms of Use.</li>
            </ul>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">5. How to Submit a Request</h3>
            <p>To request a cancellation or refund, contact us at:</p>
            <ul className="list-none pl-0 space-y-1 text-sm font-semibold text-slate-700">
              <li><span className="text-slate-500 font-bold">Email:</span> <a href="mailto:support@yotax.app" className="text-sky-655 hover:text-sky-700 underline">support@yotax.app</a></li>
              <li>Include your account email, workspace name, payment date, and reason for the request. We usually respond within 3 business days.</li>
            </ul>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">6. Refund Processing Time</h3>
            <p>Approved refunds are returned through the original payment method. Depending on the payment provider or bank, the refund may take 7 days to appear.</p>
          </div>
        </article>
      ) : (
        <article className="prose prose-slate max-w-none text-right" dir="rtl">
          <div className="flex items-center gap-3 mb-2 justify-start">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 m-0">سياسة الإلغاء والاسترداد</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0 mb-6 font-bold">آخر تحديث: 14 يوليو 2026</p>

          <div className="text-slate-600 space-y-6 text-[15px] leading-relaxed font-medium">
            <p>توضح هذه السياسة طريقة إلغاء اشتراك يوتاكس والحالات التي يمكن فيها تقديم طلب استرداد.</p>
            
            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">1. الفوترة</h3>
            <p>يتم احتساب رسوم الاشتراك وفق دورة الفوترة الموضحة عند الاشتراك وفي صفحة الفواتير داخل حسابك. قبل تأكيد عملية الدفع، يمكنك مراجعة قيمة الاشتراك والفترة التي تغضاها الدفعة.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">2. إلغاء الاشتراك</h3>
            <p>يمكنك إلغاء الاشتراك في أي وقت من إعدادات الحساب، أو عن طريق التواصل مع فريق الدعم. عند الإلغاء، يتوقف التجديد التلقائي ولا يتم احتساب دفعة جديدة في دورة الفوترة التالية. يبقى الحساب متاحًا حتى نهاية الفترة المدفوعة.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">3. طلب الاسترداد</h3>
            <p>يمكن تقديم طلب استرداد خلال 14 يوماً من تاريخ الدفع.</p>
            <p>تتم مراجعة الطلبات في الحالات التالية:</p>
            <ul className="list-disc pr-5 space-y-2">
              <li>تم خصم المبلغ أكثر من مرة بالخطأ.</li>
              <li>تم احتساب رسوم بعد إلغاء الاشتراك في الوقت المحدد.</li>
              <li>حدث خطأ تقني منعك من استخدام الخدمة بشكل أساسي.</li>
              <li>توجد حالة أخرى نرى أنها تستحق المراجعة.</li>
            </ul>
            <p>لا يعني تقديم الطلب الموافقة التلقائية على الاسترداد. سنراجع تفاصيل الحساب وعملية الدفع قبل اتخاذ القرار.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">4. الحالات غير المؤهلة للاسترداد</h3>
            <p>قد لا يتم قبول طلب الاسترداد في الحالات التالية:</p>
            <ul className="list-disc pr-5 space-y-2">
              <li>تغيير الرأي بعد استخدام الخدمة خلال الفترة المدفوعة.</li>
              <li>عدم استخدام الحساب رغم توفر الخدمة.</li>
              <li>تقديم الطلب بعد انتهاء المدة المحددة وهي 14 يوماً.</li>
              <li>إغلاق الحساب بسبب مخالفة شروط الاستخدام.</li>
            </ul>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">5. طريقة تقديم الطلب</h3>
            <p>لطلب الإلغاء أو الاسترداد، تواصل معنا عبر:</p>
            <ul className="list-none pr-0 space-y-1 text-sm font-semibold text-slate-700 text-right">
              <li><span className="text-slate-500 font-bold">البريد الإلكتروني:</span> <a href="mailto:support@yotax.app" className="text-sky-655 hover:text-sky-700 underline">support@yotax.app</a></li>
              <li>المعلومات المطلوبة: بريد الحساب، اسم مساحة العمل، تاريخ الدفع، وسبب الطلب. ونرد على الطلبات عادة خلال 3 أيام عمل.</li>
            </ul>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">6. موعد وصول المبلغ</h3>
            <p>عند الموافقة على الاسترداد، تتم إعادة المبلغ من خلال وسيلة الدفع الأصلية. قد يحتاج المبلغ إلى 7 أيام حتى يظهر في حسابك، بحسب البنك أو مزود الدفع.</p>
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
            </ul>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">Company Information</h3>
            <ul className="list-none pl-0 space-y-1 text-sm font-semibold text-slate-700">
              <li><span className="text-slate-500 font-bold">Service operator:</span> Yotax</li>
              <li><span className="text-slate-500 font-bold">Country:</span> Jordan</li>
              <li><span className="text-slate-500 font-bold">Mailing address:</span> Amman, Jordan</li>
            </ul>
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
            </ul>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">معلومات الجهة المشغلة</h3>
            <ul className="list-none pr-0 space-y-1 text-sm font-semibold text-slate-700 text-right">
              <li><span className="text-slate-500 font-bold">اسم الجهة المشغلة:</span> يوتاكس (Yotax)</li>
              <li><span className="text-slate-500 font-bold">الدولة:</span> الأردن</li>
              <li><span className="text-slate-500 font-bold">عنوان المراسلات:</span> عمان، الأردن</li>
            </ul>
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
            <h1 className="text-3xl font-extrabold text-slate-900 m-0">Delete Your Account and Data</h1>
          </div>
          <div className="text-slate-600 space-y-6 text-[15px] leading-relaxed font-medium">
            <p>You may request the closure of your workspace and deletion of the information connected to it when you no longer need Yotax. This includes information added by you or your team, such as invoices, payments, cheques, and account balances.</p>
            
            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">How to Request Deletion</h3>
            <p>Send a deletion request from the workspace administrator’s registered email address to:</p>
            <ul className="list-none pl-0 space-y-1">
              <li>
                <strong>Email:</strong> <a href="mailto:support@yotax.app" className="text-sky-655 hover:text-sky-700 underline font-semibold">support@yotax.app</a>
              </li>
              <li>
                <strong>Include:</strong> The workspace name, the administrator’s email address, and a clear request to delete the account and its information.
              </li>
            </ul>
            <p>We may ask you to confirm your identity before processing the request to protect the account from unauthorized deletion.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">What Happens After a Request Is Confirmed?</h3>
            <p>After confirmation:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access to the workspace is disabled.</li>
              <li>Team-member accounts are removed.</li>
              <li>Invoices, payments, cheques, balances, and related workspace information are deleted.</li>
              <li>The account’s subscription or renewal is stopped, depending on its current status.</li>
            </ul>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">Deletion Timeframe</h3>
            <p>A confirmed deletion request will be completed within 30 days. Some information may remain temporarily in backups and will be removed according to our backup schedule. We may keep limited billing or transaction records where required by law.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">Before Deleting Your Account</h3>
            <p>Account deletion is permanent, and the information may not be recoverable after the process is completed. We recommend that you download any reports or records you need before confirming deletion.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">Need Help?</h3>
            <p>Contact us at:</p>
            <ul className="list-none pl-0 space-y-1 text-sm font-semibold text-slate-700">
              <li><span className="text-slate-500 font-bold">Email:</span> <a href="mailto:support@yotax.app" className="text-sky-655 hover:text-sky-700 underline">support@yotax.app</a></li>
            </ul>
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
            <p>يمكنك طلب إغلاق مساحة العمل وحذف البيانات المرتبطة بها عندما لا تعود بحاجة إلى استخدام يوتاكس. يشمل ذلك البيانات التي أضفتها أنت أو أعضاء فريقك، مثل الفواتير، والمدفوعات، والشيكات، والأرصدة.</p>
            
            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">كيف تطلب حذف الحساب؟</h3>
            <p>أرسل طلبًا من البريد الإلكتروني الخاص بمسؤول مساحة العمل إلى البريد الإلكتروني الخاص بالدعم:</p>
            <ul className="list-none pr-0 space-y-1 text-right">
              <li>
                <strong>البريد الإلكتروني:</strong> <a href="mailto:support@yotax.app" className="text-sky-655 hover:text-sky-700 underline font-semibold">support@yotax.app</a>
              </li>
              <li>
                <strong>واكتب في الرسالة:</strong> اسم مساحة العمل، البريد الإلكتروني الخاص بالمسؤول، وطلبًا واضحًا بحذف الحساب والبيانات.
              </li>
            </ul>
            <p>قد نطلب منك تأكيد هويتك قبل تنفيذ الطلب لحماية الحساب من الحذف غير المصرح به.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">ماذا يحدث بعد تقديم الطلب؟</h3>
            <p>بعد تأكيد الطلب:</p>
            <ul className="list-disc pr-5 space-y-2">
              <li>يتم إيقاف الوصول إلى مساحة العمل.</li>
              <li>يتم حذف حسابات أعضاء الفريق.</li>
              <li>يتم حذف الفواتير، والمدفوعات، والشيكات، والأرصدة والبيانات المرتبطة بالحساب.</li>
              <li>يتم إيقاف الاشتراك أو التجديد المرتبط بالحساب، بحسب حالة الاشتراك.</li>
            </ul>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">مدة تنفيذ الحذف</h3>
            <p>يتم تنفيذ طلب الحذف خلال 30 يوماً من تاريخ تأكيده. قد تبقى بعض المعلومات لفترة محدودة داخل النسخ الاحتياطية، ثم تُحذف وفق دورة النسخ الاحتياطي المعتمدة لدينا. وقد نحتفظ ببعض سجلات الفواتير أو المدفوعات عندما يطلب القانون ذلك.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">قبل حذف الحساب</h3>
            <p>حذف الحساب إجراء نهائي، وقد لا يكون من الممكن استعادة البيانات بعد تنفيذه. ننصح بتنزيل أي تقارير أو بيانات تحتاج إليها قبل تأكيد الحذف.</p>

            <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2">تحتاج إلى مساعدة؟</h3>
            <p>تواصل معنا عبر:</p>
            <ul className="list-none pr-0 space-y-1 text-sm font-semibold text-slate-700 text-right">
              <li><span className="text-slate-500 font-bold">البريد الإلكتروني:</span> <a href="mailto:support@yotax.app" className="text-sky-655 hover:text-sky-700 underline">support@yotax.app</a></li>
            </ul>
          </div>
        </article>
      )}
    </LegalLayout>
  );
}
