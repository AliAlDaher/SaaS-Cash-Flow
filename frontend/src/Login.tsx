import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import logo from './assets/yotax_logo.png';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const apiBase = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      if (data.subdomain) {
        localStorage.setItem('tenantSubdomain', data.subdomain);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      navigate('/app');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '1rem',
        fontFamily: lang === 'ar' ? "'Cairo', sans-serif" : "'Inter', sans-serif",
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#ffffff',
        padding: '2.5rem 2rem',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        position: 'relative',
      }}>
        
        {/* Language Toggle */}
        <div style={{ position: 'absolute', top: '1rem', right: lang === 'ar' ? 'auto' : '1rem', left: lang === 'ar' ? '1rem' : 'auto' }}>
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.375rem 0.75rem', borderRadius: '0.5rem',
              border: '1px solid #e2e8f0', fontSize: '0.75rem',
              fontWeight: 700, color: '#64748b', cursor: 'pointer',
              background: '#fff', transition: 'background 0.2s',
            }}
          >
            <span style={{ fontSize: '1rem' }}>{lang === 'en' ? '🇸🇦' : '🇬🇧'}</span>
            <span>{lang === 'en' ? 'عربي' : 'EN'}</span>
          </button>
        </div>

        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Yotax Logo" className="h-14 w-auto object-contain mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 text-center">
            {t('login.welcome')}
          </h2>
          <p className="text-slate-500 mt-2 text-sm text-center">
            {t('login.subtitle')}
          </p>
        </div>

        {/* Login Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}
          
          {/* Email / Username Field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              {lang === 'ar' ? 'البريد الإلكتروني / اسم المستخدم' : 'Email / Username'}
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                name="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow`}
                placeholder="admin@example.com"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              {t('label.password')}
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow`}
                placeholder="••••••••"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`flex justify-center items-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              style={{ width: '100%' }}
            >
              {loading ? t('login.signingIn') : t('login.signIn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <LanguageProvider>
      <LoginForm />
    </LanguageProvider>
  );
}
