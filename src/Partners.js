import React, { useState } from 'react';
import { supabase } from './supabase';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/** Shown in UI; must match `commission_percentage` set in register_partner_organization (SQL). */
const COMMISSION_PERCENTAGE = 3;

const Partners = () => {
  const [view, setView] = useState('landing');

  // Registration form state
  const [formData, setFormData] = useState({
    clubCode: '',
    contactName: '',
    organization: '',
    email: '',
    phone: '',
    description: '',
    dashboardPassword: '',
    confirmDashboardPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  // Dashboard state
  const [dashboardCode, setDashboardCode] = useState('');
  const [dashboardPassword, setDashboardPassword] = useState('');
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClubCodeChange = (e) => {
    const next = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
    setFormData((prev) => ({ ...prev, clubCode: next }));
  };

  const rpcErrorText = (err) =>
    [err?.message, err?.details, err?.hint].filter(Boolean).join(' — ');

  const mapRegisterRpcError = (fullText) => {
    const m = (fullText || '').toLowerCase();
    if (m.includes('invalid_club_code')) {
      return 'Choose a club code of exactly 5 letters (A–Z).';
    }
    if (m.includes('weak_password')) {
      return 'Dashboard password must be at least 8 characters.';
    }
    if (m.includes('duplicate_club_code') || m.includes('unique violation') || m.includes('23505')) {
      return 'That club code is already taken (or that coupon code already exists). Pick another code.';
    }
    if (m.includes('does not exist') && m.includes('partners')) {
      return 'Database is missing the partners table. Run partners_prereqs_only.sql in Supabase, then try again.';
    }
    if (m.includes('function') && m.includes('register_partner_organization') && m.includes('does not exist')) {
      return 'Database function register_partner_organization is missing. Run club_partner_dashboard_migration.sql in Supabase.';
    }
    if (m.includes('permission denied') || m.includes('rls') || m.includes('row-level security')) {
      return 'Database permissions blocked registration. Check RLS policies and GRANT EXECUTE on the RPC for the anon role.';
    }
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (formData.clubCode.length !== 5) {
        setError('Club code must be exactly 5 letters (all uppercase).');
        setIsSubmitting(false);
        return;
      }
      if (formData.dashboardPassword.length < 8) {
        setError('Dashboard password must be at least 8 characters.');
        setIsSubmitting(false);
        return;
      }
      if (formData.dashboardPassword !== formData.confirmDashboardPassword) {
        setError('Passwords do not match.');
        setIsSubmitting(false);
        return;
      }

      const org = (formData.organization ?? '').trim();
      const { data, error: rpcError } = await supabase.rpc('register_partner_organization', {
        p_club_code: String(formData.clubCode ?? ''),
        p_club_name: org,
        p_dashboard_password: String(formData.dashboardPassword ?? ''),
        p_contact_name: (formData.contactName ?? '').trim(),
        p_organization: org,
        p_email: (formData.email ?? '').trim(),
        p_phone: (formData.phone ?? '').trim(),
        p_description: (formData.description ?? '').trim(),
      });

      if (rpcError) {
        const full = rpcErrorText(rpcError);
        if (process.env.NODE_ENV === 'development') {
          console.error('register_partner_organization RPC error:', rpcError.code, full);
        }
        const mapped = mapRegisterRpcError(full);
        setError(mapped || full || 'Something went wrong. Please try again or contact us.');
        setIsSubmitting(false);
        return;
      }

      const clubCode = data?.club_code;
      if (!clubCode) {
        setError('Registration did not complete. Please run the database migration (club_partner_dashboard_migration.sql) or contact support.');
        setIsSubmitting(false);
        return;
      }

      setGeneratedCode(clubCode);
      setView('success');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Something went wrong. Please try again or contact us.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = generatedCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleDashboardLookup = async (e) => {
    e.preventDefault();
    setDashboardError('');
    setDashboardLoading(true);
    setDashboardData(null);

    try {
      const code = dashboardCode.trim().toUpperCase();
      if (code.length !== 5 || !/^[A-Z]{5}$/.test(code)) {
        setDashboardError('Enter your 5-letter club code (A–Z).');
        setDashboardLoading(false);
        return;
      }
      if (!dashboardPassword) {
        setDashboardError('Enter the dashboard password you set during registration.');
        setDashboardLoading(false);
        return;
      }

      const { data: club, error: verifyError } = await supabase.rpc('verify_club_dashboard_access', {
        p_club_code: code,
        p_password: dashboardPassword,
      });

      if (verifyError) throw verifyError;

      if (!club || !club.id) {
        setDashboardError('Invalid club code or password, or your club is still pending activation.');
        setDashboardLoading(false);
        return;
      }

      const { data: partner } = await supabase
        .from('partners')
        .select('*')
        .eq('club_id', club.id)
        .single();

      const { data: orders, error: ordersError } = await supabase
        .from('club_orders')
        .select('*')
        .eq('club_id', club.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.order_total || 0), 0) || 0;
      const totalEarnings = Number(club.total_earned ?? 0);
      const pendingPayout = orders
        ?.filter((o) => !o.paid_out)
        .reduce((sum, o) => sum + Number(o.commission_amount || 0), 0) || 0;

      setDashboardData({
        club,
        partner,
        orders: orders || [],
        stats: { totalOrders, totalRevenue, totalEarnings, pendingPayout },
      });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Dashboard lookup error:', rpcErrorText(err) || err);
      }
      setDashboardError(rpcErrorText(err) || 'Something went wrong. Please try again.');
    } finally {
      setDashboardLoading(false);
    }
  };

  // ─── Landing View ───
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="gradient-bg text-white py-24 mt-16">
          <div className="container-custom text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white text-shadow">
              Partner With QuickBites
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10">
              Join our partner program and earn commission on every order placed with your
              exclusive code. Perfect for student organizations, clubs, and campus groups.
            </p>
            <div className="flex flex-col items-center gap-8 mt-6">
              <button
                onClick={() => setView('register')}
                style={{
                  width: '260px',
                  padding: '14px 0',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#fff',
                  background: 'rgba(249, 173, 21, 0.55)',
                  border: '1px solid rgba(249, 173, 21, 0.7)',
                  borderRadius: '9999px',
                  boxShadow: '0 2px 10px rgba(249, 173, 21, 0.2)',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249, 173, 21, 0.75)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249, 173, 21, 0.55)'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Become a Partner
              </button>
              <button
                onClick={() => setView('dashboard')}
                style={{
                  width: '260px',
                  padding: '14px 0',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#fff',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.45)',
                  borderRadius: '9999px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Partner Dashboard
              </button>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16">
          <div className="container-custom">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '💰',
                  title: 'Earn Commission',
                  desc: `Get ${COMMISSION_PERCENTAGE}% of each order's food subtotal (before tax and delivery) when members use your club code in the app.`,
                },
                {
                  icon: '📊',
                  title: 'Track Performance',
                  desc: 'Access your real-time dashboard to monitor orders, revenue, and payouts.',
                },
                {
                  icon: '🎟️',
                  title: 'Exclusive Discounts',
                  desc: 'Your members get exclusive discounts on delivery fees when they use your code.',
                },
              ].map((benefit, i) => (
                <div
                  key={i}
                  className="card bg-white/90 backdrop-blur-sm border border-gray-200 p-8 rounded-2xl shadow-xl text-center"
                >
                  <div className="text-5xl mb-4">{benefit.icon}</div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-800">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ─── Registration Form ───
  if (view === 'register') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mt-20 pt-10 pb-16 container-custom max-w-2xl">
          <button
            onClick={() => setView('landing')}
            className="text-gray-600 hover:text-quickbites-yellow transition-colors mb-6 font-medium"
          >
            ← Back
          </button>

          <div className="card bg-white p-8 rounded-2xl shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Partner Registration</h2>
            <p className="text-gray-600 mb-8">
              Choose a 5-letter code for your organization (used in the QuickBites app) and a dashboard
              password to view earnings on this site.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Club code (5 letters, A–Z) *
                </label>
                <input
                  type="text"
                  name="clubCode"
                  value={formData.clubCode}
                  onChange={handleClubCodeChange}
                  placeholder="e.g. CHESS"
                  maxLength={5}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300 font-mono text-lg tracking-widest uppercase"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  This exact code is stored for your club and used in the mobile app at checkout.
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Contact Name *</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Organization Name *</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  placeholder="e.g. CCNY Chess Club"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@organization.com"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(optional)"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Tell us about your organization
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of your organization and how you plan to share the partner code..."
                  rows="4"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300 resize-vertical"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Dashboard password *</label>
                <input
                  type="password"
                  name="dashboardPassword"
                  value={formData.dashboardPassword}
                  onChange={handleInputChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300"
                  required
                  minLength={8}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Use this password with your club code to open the partner dashboard on this website.
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Confirm dashboard password *</label>
                <input
                  type="password"
                  name="confirmDashboardPassword"
                  value={formData.confirmDashboardPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300"
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn-primary w-full text-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Creating your partner account...' : 'Register as Partner'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── Success View ───
  if (view === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 mt-20 pt-10 pb-16 flex items-center justify-center">
        <div className="container-custom max-w-2xl">
          <div className="card bg-white p-10 rounded-2xl shadow-2xl text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome Aboard!</h2>
            <p className="text-lg text-gray-600 mb-8">
              Your partner account has been created and is pending admin approval. Once your club and code
              are activated, share your club code with members in the QuickBites app. Your organization earns{' '}
              <span className="font-bold text-quickbites-purple">{COMMISSION_PERCENTAGE}%</span> of each
              order's food subtotal (excluding tax and delivery) when the code is used at checkout.
              Members can also get delivery-fee discounts when your code is activated as a coupon where
              configured.
            </p>

            <div className="bg-gray-50 border-2 border-dashed border-quickbites-yellow rounded-2xl p-8 mb-8">
              <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-2">
                Your club code
              </p>
              <p className="text-4xl font-mono font-bold gradient-text tracking-widest mb-4">
                {generatedCode}
              </p>
              <button
                onClick={handleCopyCode}
                className="px-6 py-2 bg-quickbites-yellow text-white rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                {codeCopied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            <p className="text-gray-500 text-sm mb-8">
              Save your club code and dashboard password. An admin needs to activate your club and coupon
              code before dashboard login and checkout usage will work.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setDashboardCode(generatedCode);
                  setView('dashboard');
                }}
                className="btn-primary"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  setView('landing');
                  setFormData({
                    clubCode: '',
                    contactName: '',
                    organization: '',
                    email: '',
                    phone: '',
                    description: '',
                    dashboardPassword: '',
                    confirmDashboardPassword: '',
                  });
                  setGeneratedCode('');
                }}
                className="btn-secondary"
              >
                Back to Partners
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Dashboard View ───
  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mt-20 pt-10 pb-16 container-custom">
          <button
            onClick={() => {
              setView('landing');
              setDashboardData(null);
              setDashboardCode('');
              setDashboardPassword('');
              setDashboardError('');
            }}
            className="text-gray-600 hover:text-quickbites-yellow transition-colors mb-6 font-medium"
          >
            ← Back
          </button>

          <h1 className="text-4xl font-bold text-gray-800 mb-2">Partner Dashboard</h1>
          <p className="text-gray-600 mb-8">
            Sign in with the 5-letter club code you chose and the dashboard password you set at
            registration.
          </p>

          {/* Lookup form */}
          <div className="card bg-white p-6 rounded-2xl shadow-xl mb-8">
            <form onSubmit={handleDashboardLookup} className="flex flex-col gap-4">
              <input
                type="text"
                value={dashboardCode}
                onChange={(e) =>
                  setDashboardCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5))
                }
                placeholder="Club code (5 letters)"
                maxLength={5}
                autoComplete="username"
                spellCheck={false}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300 font-mono text-lg tracking-wider uppercase"
                required
              />
              <input
                type="password"
                value={dashboardPassword}
                onChange={(e) => setDashboardPassword(e.target.value)}
                placeholder="Dashboard password"
                autoComplete="current-password"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300"
                required
              />
              <button
                type="submit"
                disabled={dashboardLoading}
                className={`btn-primary whitespace-nowrap w-full sm:w-auto ${dashboardLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {dashboardLoading ? 'Loading...' : 'View dashboard'}
              </button>
            </form>
            {dashboardError && (
              <p className="text-red-600 text-sm mt-3">{dashboardError}</p>
            )}
          </div>

          {/* Dashboard content */}
          {dashboardData && (
            <div className="space-y-8">
              {/* Partner info header */}
              <div className="card bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {dashboardData.partner?.organization || dashboardData.club.club_name}
                    </h2>
                    {dashboardData.partner && (
                      <p className="text-gray-500">
                        {dashboardData.partner.contact_name} &middot; {dashboardData.partner.email}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold text-quickbites-purple tracking-wider">
                      {dashboardData.club.club_code}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        dashboardData.club.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {dashboardData.club.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Total Orders',
                    value: dashboardData.stats.totalOrders,
                    color: 'bg-blue-50 border-blue-200',
                    textColor: 'text-blue-700',
                  },
                  {
                    label: 'Order Revenue',
                    value: formatCurrency(dashboardData.stats.totalRevenue),
                    color: 'bg-purple-50 border-purple-200',
                    textColor: 'text-purple-700',
                  },
                  {
                    label: 'Total earned (organization)',
                    value: formatCurrency(dashboardData.stats.totalEarnings),
                    color: 'bg-green-50 border-green-200',
                    textColor: 'text-green-700',
                  },
                  {
                    label: 'Pending Payout',
                    value: formatCurrency(dashboardData.stats.pendingPayout),
                    color: 'bg-yellow-50 border-yellow-200',
                    textColor: 'text-yellow-700',
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className={`p-6 rounded-2xl border-2 ${stat.color}`}
                  >
                    <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Commission info */}
              <div className="card bg-gradient-to-r from-quickbites-purple/10 to-quickbites-yellow/10 border-2 border-quickbites-purple/20 p-6 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💡</span>
                  <p className="text-gray-700">
                    You earn <span className="font-bold">{dashboardData.club.commission_percentage}%</span>{' '}
                    of each qualifying order's food subtotal (tax and delivery excluded) when your club
                    code is used in the app. The green total above is your organization's running balance
                    from those commissions. Payouts are processed monthly.
                    {dashboardData.club.last_payout_date && (
                      <span className="ml-1">
                        Last payout: {formatDate(dashboardData.club.last_payout_date)}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Orders table */}
              <div className="card bg-white p-6 rounded-2xl shadow-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Recent Orders ({dashboardData.orders.length})
                </h3>
                {dashboardData.orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-lg">No orders yet</p>
                    <p className="text-sm">
                      Share your code with your members to start earning!
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-100">
                          <th className="text-left py-3 px-4 text-sm font-bold text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-bold text-gray-500 uppercase tracking-wider">
                            Order Total
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-bold text-gray-500 uppercase tracking-wider">
                            Your Earnings
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-bold text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.orders.map((order) => (
                          <tr
                            key={order.id}
                            className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4 text-gray-700">
                              {formatDate(order.created_at)}
                            </td>
                            <td className="py-3 px-4 text-gray-700 font-medium">
                              {formatCurrency(order.order_total)}
                            </td>
                            <td className="py-3 px-4 text-green-600 font-bold">
                              {formatCurrency(order.commission_amount)}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  order.paid_out
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {order.paid_out ? 'Paid' : 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default Partners;
