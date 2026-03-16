import React, { useState } from 'react';
import { supabase } from './supabase';

const generatePartnerCode = (orgName) => {
  const prefix = orgName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 4)
    .toUpperCase();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 5; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${suffix}`;
};

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

const COMMISSION_PERCENTAGE = 10;

const Partners = () => {
  const [view, setView] = useState('landing');

  // Registration form state
  const [formData, setFormData] = useState({
    contactName: '',
    organization: '',
    email: '',
    phone: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  // Dashboard state
  const [dashboardCode, setDashboardCode] = useState('');
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const partnerCode = generatePartnerCode(formData.organization);

      // Create the club entry
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .insert([
          {
            club_code: partnerCode,
            club_name: formData.organization.trim(),
            commission_percentage: COMMISSION_PERCENTAGE,
            total_earned: 0,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (clubError) {
        if (clubError.code === '23505') {
          setError('A partner with this organization code already exists. Please try again.');
          setIsSubmitting(false);
          return;
        }
        throw clubError;
      }

      // Create a coupon for the partner code (10% off delivery fee)
      const { error: couponError } = await supabase.from('coupons').insert([
        {
          coupon_code: partnerCode,
          percentage: 10,
          valid: true,
          category: 'partner',
          max_usage: 9999,
          categories: 'delivery-fee',
        },
      ]);

      if (couponError) {
        console.error('Coupon creation error:', couponError);
      }

      // Create the partner contact record
      const { error: partnerError } = await supabase.from('partners').insert([
        {
          club_id: clubData.id,
          contact_name: formData.contactName.trim(),
          organization: formData.organization.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          description: formData.description.trim() || null,
        },
      ]);

      if (partnerError) throw partnerError;

      setGeneratedCode(partnerCode);
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

      // Look up the club
      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('club_code', code)
        .single();

      if (clubError || !club) {
        setDashboardError('Partner code not found. Please check your code and try again.');
        setDashboardLoading(false);
        return;
      }

      // Get partner info
      const { data: partner } = await supabase
        .from('partners')
        .select('*')
        .eq('club_id', club.id)
        .single();

      // Get all orders for this club
      const { data: orders, error: ordersError } = await supabase
        .from('club_orders')
        .select('*')
        .eq('club_id', club.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.order_total || 0), 0) || 0;
      const totalEarnings = orders?.reduce((sum, o) => sum + Number(o.commission_amount || 0), 0) || 0;
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
      console.error('Dashboard lookup error:', err);
      setDashboardError('Something went wrong. Please try again.');
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
                  desc: `Get ${COMMISSION_PERCENTAGE}% commission on every order placed using your partner code.`,
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
              Fill out the form below and we'll generate your exclusive partner code.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
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

              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn-primary w-full text-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Creating your partner code...' : 'Register as Partner'}
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
              Your partner account has been created. Share the code below with your members so they
              can get discounts on the QuickBites app. You'll earn{' '}
              <span className="font-bold text-quickbites-purple">{COMMISSION_PERCENTAGE}% commission</span>{' '}
              on every order they place.
            </p>

            <div className="bg-gray-50 border-2 border-dashed border-quickbites-yellow rounded-2xl p-8 mb-8">
              <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-2">
                Your Partner Code
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
              Save this code — you'll need it to access your partner dashboard.
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
                  setFormData({ contactName: '', organization: '', email: '', phone: '', description: '' });
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
              setDashboardError('');
            }}
            className="text-gray-600 hover:text-quickbites-yellow transition-colors mb-6 font-medium"
          >
            ← Back
          </button>

          <h1 className="text-4xl font-bold text-gray-800 mb-2">Partner Dashboard</h1>
          <p className="text-gray-600 mb-8">Enter your partner code to view your earnings and orders.</p>

          {/* Lookup form */}
          <div className="card bg-white p-6 rounded-2xl shadow-xl mb-8">
            <form onSubmit={handleDashboardLookup} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={dashboardCode}
                onChange={(e) => setDashboardCode(e.target.value.toUpperCase())}
                placeholder="Enter your partner code (e.g. CCNY-AB123)"
                className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300 font-mono text-lg tracking-wider uppercase"
                required
              />
              <button
                type="submit"
                disabled={dashboardLoading}
                className={`btn-primary whitespace-nowrap ${dashboardLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {dashboardLoading ? 'Loading...' : 'View Dashboard'}
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
                    label: 'Total Earnings',
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
                    commission on every order placed with your code. Payouts are processed monthly.
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
