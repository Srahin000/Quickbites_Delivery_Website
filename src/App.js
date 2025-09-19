import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Updates from './Updates';
import { supabase } from './supabase';

// Theme colors
export const themeColors = {
  text: "#f9ad15",
  bgColor: opacity => `rgba(249, 173, 21, ${opacity})`,
  bgColor2: "#502efa",
  purple: "#502efa",
  yellow: "#f9ad15"
};

// Components
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 gradient-bg backdrop-blur-custom shadow-lg nav-mobile">
        <div className="container-custom relative">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-1">
              <img 
                src="/screenshots/Logo.png" 
                alt="QuickBites Logo" 
                className="h-20 w-20 object-contain"
              />
              <span className="text-2xl font-bold text-white">
                QuickBites
              </span>
            </div>
            <div className={`md:flex md:space-x-8 ${isMenuOpen ? 'flex flex-col absolute top-full left-0 right-0 w-full gradient-bg shadow-lg py-6 px-4 space-y-3 z-40 mobile-dropdown' : 'hidden'}`}>
              <a href="/" className="text-white hover:text-quickbites-yellow transition-colors duration-300 font-bold text-lg py-2 px-4 rounded-lg hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>Home</a>
              <a href="/#about" className="text-white hover:text-quickbites-yellow transition-colors duration-300 font-bold text-lg py-2 px-4 rounded-lg hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>About</a>
              <a href="/#how-it-works" className="text-white hover:text-quickbites-yellow transition-colors duration-300 font-bold text-lg py-2 px-4 rounded-lg hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>How It Works</a>
              <a href="/#app" className="text-white hover:text-quickbites-yellow transition-colors duration-300 font-bold text-lg py-2 px-4 rounded-lg hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>Download App</a>
              <a href="/updates" className="text-white hover:text-quickbites-yellow transition-colors duration-300 font-bold text-lg py-2 px-4 rounded-lg hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>Updates</a>
              <a href="/#contact" className="text-white hover:text-quickbites-yellow transition-colors duration-300 font-bold text-lg py-2 px-4 rounded-lg hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>Contact</a>
            </div>
            <button 
              className="md:hidden" 
              onClick={toggleMenu}
              aria-label="Toggle menu"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px'
              }}
            >
              <div style={{
                fontSize: '20px',
                color: 'white',
                fontWeight: 'bold',
                lineHeight: '1',
                textAlign: 'center',
                fontFamily: 'Arial, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%'
              }}>
                {isMenuOpen ? '✕' : '☰'}
              </div>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Mobile menu backdrop */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};

const HeroSection = () => {
  return (
    <section id="home" className="gradient-bg min-h-screen flex items-center text-white relative overflow-hidden pt-20 hero-mobile">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-quickbites-yellow rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="animate-slide-in-left order-2 lg:order-1">
            <div className="card bg-white/10 backdrop-blur-md border border-white/20 p-6 lg:p-8 rounded-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 lg:mb-6 text-white text-shadow">
                QuickBites
                <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-quickbites-yellow mt-2">
                  Fast, Fresh, Delicious
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl mb-6 lg:mb-8 text-white/90 leading-relaxed">
                Fast, affordable food delivery made for students. Get local eats with low fees, 
                student discounts, and quick campus-focused service around CCNY.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#app" className="btn-primary inline-block text-center">
                  Download App
                </a>
                <a href="#how-it-works" className="btn-secondary inline-block text-center">
                  Learn More
                </a>
              </div>
            </div>
          </div>
          
          <div className="animate-slide-in-right flex justify-center order-1 lg:order-2">
            <div className="phone-mockup">
              <img 
                src="/screenshots/Simulator Screenshot - iPhone 16 Plus - 2025-06-30 at 14.04.24.png" 
                alt="QuickBites App Screenshot" 
                className="phone-screen object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AboutSection = () => {
  const stats = [
    { number: "50+", label: "Student Orders" },
    { number: "15min", label: "Average Delivery" },
    { number: "CCNY", label: "Campus Focus" }
  ];

  return (
    <section id="about" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-24">
          <h2 className="text-5xl font-bold mb-3 gradient-text">About QuickBites</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Revolutionizing food delivery, one bite at a time
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <div className="card bg-white/90 backdrop-blur-sm border border-gray-200 p-8 rounded-2xl shadow-xl">
              <h3 className="text-3xl font-bold mb-4 text-gray-800">Our Mission</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                At QuickBites, we believe that great food should be accessible to students, 
                delivered quickly and affordably. Our mission is to connect hungry students 
                around CCNY campus with local restaurants through our innovative mobile app platform, 
                offering low fees and student discounts.
              </p>
            </div>
            
            <div className="card bg-white/90 backdrop-blur-sm border border-gray-200 p-8 rounded-2xl shadow-xl">
              <h3 className="text-3xl font-bold mb-6 text-gray-800">Why Choose QuickBites?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "⚡ Lightning-fast delivery times",
                  "🎓 Student discounts & low fees",
                  "🏫 Campus-focused service",
                  "📱 User-friendly mobile app",
                  "💳 Secure payment options",
                  "⭐ Real-time order tracking"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-quickbites-yellow/10 to-quickbites-purple/10 rounded-xl border border-quickbites-yellow/20">
                    <span className="text-2xl">{feature.split(' ')[0]}</span>
                    <span className="text-gray-700 font-medium">{feature.substring(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {stats.map((stat, index) => (              <div key={index} className="card text-center flex flex-col items-center justify-center">
                <h3 className="text-4xl font-bold gradient-text mb-2">{stat.number}</h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-24">
          <h2 className="text-5xl font-bold mb-3 gradient-text">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Getting your favorite food delivered is as easy as 1-2-3
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center group">
            <div className="card bg-white/90 backdrop-blur-sm border border-gray-200 p-8 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300">
              <div className="w-20 h-20 bg-yellow-500 rounded-full mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{color: 'white', fontSize: '2rem', fontWeight: 'bold', lineHeight: '1'}}>1</div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Browse & Order</h3>
              <p className="text-gray-600 leading-relaxed">Open the QuickBites app and browse through restaurants. Select your favorite dishes and add them to your cart.</p>
            </div>
          </div>
          <div className="text-center group">
            <div className="card bg-white/90 backdrop-blur-sm border border-gray-200 p-8 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300">
              <div className="w-20 h-20 bg-yellow-500 rounded-full mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{color: 'white', fontSize: '2rem', fontWeight: 'bold', lineHeight: '1'}}>2</div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Track Your Order</h3>
              <p className="text-gray-600 leading-relaxed">Watch your order being prepared in real-time. Get updates on preparation status and delivery progress.</p>
            </div>
          </div>
          <div className="text-center group">
            <div className="card bg-white/90 backdrop-blur-sm border border-gray-200 p-8 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300">
              <div className="w-20 h-20 bg-yellow-500 rounded-full mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{color: 'white', fontSize: '2rem', fontWeight: 'bold', lineHeight: '1'}}>3</div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Enjoy Your Meal</h3>
              <p className="text-gray-600 leading-relaxed">Receive your delicious food at your doorstep. Enjoy your meal and rate your experience to help others.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

  const AppDownloadSection = () => {
    const [activePhoneIndex, setActivePhoneIndex] = useState(0);

    const handlePointerMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX || e.touches?.[0]?.clientX || 0;
      const relativeX = x - rect.left;
      const width = rect.width;
      const percentage = Math.max(0, Math.min(1, relativeX / width));
      
      // Map percentage to phone index (0 to phones.length - 1)
      const phoneCount = 6;
      const index = Math.min(Math.floor(percentage * phoneCount), phoneCount - 1);
      setActivePhoneIndex(index);
    };

    const handlePointerLeave = () => {
      setActivePhoneIndex(0); // Reset to first phone when pointer leaves
    };

    return (
      <section id="app" className="section-padding gradient-bg text-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="card bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl mb-8">
                <h2 className="text-5xl font-bold mb-6 text-white">Download the QuickBites App</h2>
                <p className="text-xl mb-8 text-white/90">
                  Get the full QuickBites experience on your mobile device. 
                  Order food around CCNY campus, track deliveries, and enjoy student discounts 
                  and low fees designed specifically for students.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 mb-8 justify-center items-start">
                  <div className="flex flex-col items-center gap-2">
                    <a 
                      href="https://apps.apple.com/us/app/quickbites-delivery/id6745470307" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="transition-transform duration-300 hover:scale-105"
                    >
                      <img 
                        src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
                        alt="Download on the App Store" 
                        className="h-16 w-auto"
                      />
                    </a>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                      alt="Get it on Google Play" 
                      className="h-16 w-auto grayscale opacity-50 cursor-not-allowed"
                    />
                    <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-bold">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="card bg-white/20 backdrop-blur-md border border-white/30 p-6 rounded-2xl shadow-xl">
                  <div className="w-24 h-24 bg-white rounded-lg mb-4 mx-auto flex items-center justify-center p-2">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://apps.apple.com/us/app/quickbites-delivery/id6745470307"
                      alt="QR Code for App Store Download"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-white font-medium">Scan to download</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center items-center w-full">
              <div 
                className="relative phone-container" 
                style={{
                  width: '32rem', 
                  height: '50rem', 
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseMove={handlePointerMove}
                onMouseLeave={handlePointerLeave}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerLeave}
              >
                {[
                  "/screenshots/Simulator Screenshot - iPhone 16 Plus - 2025-06-30 at 14.04.29.png",
                  "/screenshots/Simulator Screenshot - iPhone 16 Plus - 2025-07-01 at 16.38.42.png",
                  "/screenshots/Simulator Screenshot - iPhone 16 Plus - 2025-07-01 at 16.38.54.png",
                  "/screenshots/Simulator Screenshot - iPhone 16 Plus - 2025-07-01 at 17.07.14.png",
                  "/screenshots/Simulator Screenshot - iPhone 16 Plus - 2025-07-01 at 17.50.52.png",
                  "/screenshots/Simulator Screenshot - iPhone 16 Plus - 2025-07-01 at 17.50.56.png"
                ].map((screenshot, index) => (
                  <div 
                    key={index} 
                    className="phone-mockup absolute cursor-pointer"
                    style={{
                      transform: `rotate(${index * 4 - 8}deg) translate(${index * 15 - 30}px, ${index * 20 - 40}px)`,
                      zIndex: activePhoneIndex === index ? 10 : 6 - index,
                      transition: 'all 0.3s ease',
                      top: '50%',
                      left: '50%',
                      position: 'absolute',
                      marginTop: '-18rem',
                      marginLeft: '-9rem'
                    }}
                  >
                    <img 
                      src={screenshot} 
                      alt={`QuickBites App Screenshot ${index + 1}`}
                      className="phone-screen object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

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
    setSubmitStatus('');

    try {
      console.log('Attempting to submit form with data:', formData);
      
      const { error } = await supabase
        .from('form_responses')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            message: formData.message
          }
        ]);

      console.log('Supabase response - error:', error);

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Form submitted successfully!');
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-24">
          <h2 className="text-5xl font-bold mb-3 gradient-text">Get in Touch</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Have questions? We'd love to hear from you
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div className="card bg-white/90 backdrop-blur-sm border border-gray-200 p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">📧 Email</h3>
              <p className="text-lg text-gray-600">officialquickbite@gmail.com</p>
            </div>
            <div className="card bg-white/90 backdrop-blur-sm border border-gray-200 p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Follow Us</h3>
              <div className="flex space-x-4">
                <a 
                  href="https://www.instagram.com/getquickbites?utm_source=ig_web_button_share_sheet&igsh=a2IwZWZqZ3N0a3Jk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-quickbites-yellow text-white rounded-full flex items-center justify-center text-xl hover:bg-yellow-500 transition-colors duration-300"
                  aria-label="Instagram"
                >
                  📷
                </a>
              </div>
            </div>
          </div>
          
          <div className="card bg-white/90 backdrop-blur-sm border border-gray-200 p-8 rounded-2xl shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Send us a Message</h3>
            
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl">
                ✅ Message sent successfully! We'll get back to you soon.
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                ❌ Failed to send message. Please try again or contact us directly.
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Your Name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300"
                  required 
                />
              </div>
              <div>
                <input 
                  type="email" 
                  name="email"
                  placeholder="Your Email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300"
                  required 
                />
              </div>
              <div>
                <textarea 
                  name="message"
                  placeholder="Your Message" 
                  rows="5"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300 resize-vertical"
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`btn-primary w-full ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const NewsletterSignup = () => {
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

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
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
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container-custom">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-1 mb-4">
              <img 
                src="/screenshots/Logo.png" 
                alt="QuickBites Logo" 
                className="h-5 w-5 object-contain"
              />
              <h3 className="text-2xl font-bold gradient-text">QuickBites</h3>
            </div>
            <p className="text-gray-400">
              Fast, fresh, and delicious food delivery at your fingertips.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-4 text-quickbites-yellow">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/#about" className="text-gray-400 hover:text-quickbites-yellow transition-colors">About Us</a></li>
              <li><a href="/#how-it-works" className="text-gray-400 hover:text-quickbites-yellow transition-colors">How It Works</a></li>
              <li><a href="/#app" className="text-gray-400 hover:text-quickbites-yellow transition-colors">Download App</a></li>
              <li><a href="/updates" className="text-gray-400 hover:text-quickbites-yellow transition-colors">Updates</a></li>
              <li><a href="/#contact" className="text-gray-400 hover:text-quickbites-yellow transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-4 text-quickbites-yellow">Download App</h4>
            <div className="space-y-3">
              <a href="https://apps.apple.com/us/app/quickbites-delivery/id6745470307" className="block">
                <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-center hover:bg-gray-700 transition-colors">
                  App Store
                </div>
              </a>
              <div className="bg-gray-800 text-gray-500 px-4 py-2 rounded-lg text-center cursor-not-allowed">
                Google Play
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2024 QuickBites. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const HomePage = () => (
  <div>
    <HeroSection />
    <AboutSection />
    <HowItWorksSection />
    <AppDownloadSection />
    <ContactSection />
    <NewsletterSignup />
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/updates" element={<Updates />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;