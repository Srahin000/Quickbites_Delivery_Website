import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const Updates = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch updates from Supabase
  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false }); // Most recent first

      if (fetchError) {
        console.error('Error fetching updates:', fetchError);
        setError('Failed to load updates. Please try again later.');
      } else {
        setUpdates(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    console.log('Form data being submitted:', formData);

    try {
      const { error } = await supabase
        .from('Newsletter_users')
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email
          }
        ]);

      console.log('Supabase response:', { error });

      if (error) {
        console.error('Error subscribing:', error);
        if (error.code === '42501') {
          setMessage('Newsletter signup is temporarily unavailable. Please try again later.');
        } else {
          setMessage('Error subscribing. Please try again.');
        }
      } else {
        setMessage('Successfully subscribed! Thank you.');
        setFormData({ firstName: '', lastName: '', email: '' });
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage('Error subscribing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get featured update (first one marked as featured, or first update if none)
  const featuredUpdate = updates.find(update => update.featured) || updates[0];
  const otherUpdates = updates.filter(update => update.id !== featuredUpdate?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-24 mt-16">
        <div className="container-custom">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-6 text-white text-shadow">
              QuickBites Updates
            </h1>
            <p className="text-xl text-white/90 max-w-5xl mx-auto">
              Stay up to date with the latest news, features, and announcements from QuickBites
            </p>
          </div>
        </div>
      </section>

      {/* Updates Content */}
      <section className="py-16">
        <div className="container-custom">
          {loading && (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600">Loading updates...</p>
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {!loading && !error && updates.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600">No updates available yet. Check back soon!</p>
            </div>
          )}

          {!loading && !error && featuredUpdate && (
            <>
              {/* Featured Update */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Featured Update</h2>
                <div className="card bg-gradient-to-r from-quickbites-yellow/10 to-quickbites-purple/10 border border-quickbites-yellow/20 p-8 rounded-3xl shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-quickbites-yellow text-white px-4 py-2 rounded-full text-sm font-bold">
                      {featuredUpdate.category}
                    </span>
                    <span className="text-gray-600 font-medium">
                      {formatDate(featuredUpdate.created_at)}
                    </span>
                  </div>
                  <h3 className="text-4xl font-bold text-gray-800 mb-4">{featuredUpdate.title}</h3>
                  <div className="text-lg text-gray-600 leading-relaxed whitespace-pre-line">
                    {featuredUpdate.content}
                  </div>
                </div>
              </div>

              {/* All Updates List */}
              {otherUpdates.length > 0 && (
                <div className="space-y-8">
                  {otherUpdates.map((update) => (
                    <div key={update.id} className="card bg-white/90 backdrop-blur-sm border border-gray-200 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                          {update.category}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {formatDate(update.created_at)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-quickbites-yellow transition-colors duration-300">
                        {update.title}
                      </h3>
                      <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {update.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Newsletter Signup */}
          <div className="mt-20 mb-16">
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-2xl text-center max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold mb-4 text-gray-800">Stay Updated</h3>
              <p className="text-lg text-gray-600 mb-8">
                Get the latest QuickBites news and updates delivered to your inbox
              </p>
              
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full sm:w-32 p-4 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-quickbites-yellow transition-colors duration-300 text-lg"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full sm:w-32 p-4 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-quickbites-yellow transition-colors duration-300 text-lg"
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full sm:w-64 p-4 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-quickbites-yellow transition-colors duration-300 text-lg"
              />
            </div>
            
            {message && (
              <p className={`text-sm ${message.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
            
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`mx-auto bg-quickbites-yellow text-black p-4 px-8 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition-colors duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Updates;
