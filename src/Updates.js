import React, { useState } from 'react';
import { supabase } from './supabase';

const Updates = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

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

  const updates = [
    {
      id: 1,
      title: "🚀 Beta Launch - QuickBites is Coming October 1st!",
      date: "September 15, 2025",
      category: "Launch",
      content: "🚧 QuickBites Beta Launch - October 1st! We're thrilled to share that QuickBites is officially opening its doors in beta this fall. This is the first step in bringing a faster, more affordable, and student-focused food delivery experience to CCNY. During this phase, we'll be testing our systems, learning from real orders, and working closely with students to make QuickBites the best it can be. Think of it as getting a sneak peek at what's to come — and your feedback will directly shape how we grow. Stay tuned here for live updates, new features, and ways to get involved as we build this service together.",
      featured: true
    }
  ];

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

          {/* Featured Update */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Featured Update</h2>
            <div className="card bg-gradient-to-r from-quickbites-yellow/10 to-quickbites-purple/10 border border-quickbites-yellow/20 p-8 rounded-3xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-quickbites-yellow text-white px-4 py-2 rounded-full text-sm font-bold">
                  {updates[0].category}
                </span>
                <span className="text-gray-600 font-medium">{updates[0].date}</span>
              </div>
              <h3 className="text-4xl font-bold text-gray-800 mb-4">{updates[0].title}</h3>
              <div className="text-lg text-gray-600 leading-relaxed whitespace-pre-line">{updates[0].content}</div>
            </div>
          </div>

          {/* All Updates List */}
          <div className="space-y-8">
            {updates.slice(1).map((update) => (
              <div key={update.id} className="card bg-white/90 backdrop-blur-sm border border-gray-200 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    {update.category}
                  </span>
                  <span className="text-gray-500 text-sm">{update.date}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-quickbites-yellow transition-colors duration-300">
                  {update.title}
                </h3>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">{update.content}</div>
              </div>
            ))}
          </div>

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
