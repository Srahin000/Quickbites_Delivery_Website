import React, { useState } from 'react';

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
    <nav className="fixed top-0 w-full z-50 gradient-bg backdrop-blur-custom shadow-lg">
      <div className="container-custom">
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
          <div className={`md:flex md:space-x-8 ${isMenuOpen ? 'flex flex-col absolute top-16 left-0 w-full gradient-bg shadow-lg py-8 space-y-4' : 'hidden'}`}>
            <a href="#home" className="text-white hover:text-quickbites-yellow transition-colors duration-300 font-bold text-lg">Home</a>
            <a href="#about" className="text-white hover:text-quickbites-yellow transition-colors duration-300 font-bold text-lg">About</a>
            <a href="#how-it-works" className="text-white hover:text-quickbites-yellow transition-colors duration-300 font-bold text-lg">How It Works</a>
            <a href="#app" className="text-white hover:text-quickbites-yellow transition-colors duration-300 font-bold text-lg">Download App</a>
            <a href="#contact" className="text-white hover:text-quickbites-yellow transition-colors duration-300 font-bold text-lg">Contact</a>
          </div>
          <button 
            className="md:hidden flex flex-col space-y-1" 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

const HeroSection = () => {
  return (
    <section id="home" className="gradient-bg min-h-screen flex items-center text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-quickbites-yellow rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-in-left">
            <div className="card bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl">
              <h1 className="text-6xl lg:text-7xl font-bold mb-6 text-white text-shadow">
                QuickBites
                <span className="block text-3xl lg:text-4xl font-light text-quickbites-yellow mt-2">
                  Fast, Fresh, Delicious
                </span>
              </h1>
              <p className="text-xl mb-8 text-white/90 leading-relaxed">
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
          
          <div className="animate-slide-in-right flex justify-center">
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
            {stats.map((stat, index) => (
              <div key={index} className="card text-center flex flex-col items-center justify-center">
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
  const steps = [
    {
      number: "1",
      title: "Browse & Order",
      description: "Open the QuickBites app and browse through hundreds of restaurants. Select your favorite dishes and add them to your cart."
    },
    {
      number: "2", 
      title: "Track Your Order",
      description: "Watch your order being prepared in real-time. Get updates on preparation status and delivery progress."
    },
    {
      number: "3",
      title: "Enjoy Your Meal", 
      description: "Receive your delicious food at your doorstep. Enjoy your meal and rate your experience to help others."
    }
  ];

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
              
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
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
                <div className="relative">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                    alt="Get it on Google Play" 
                    className="h-16 w-auto grayscale opacity-50 cursor-not-allowed"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-bold">
                      Coming Soon
                    </span>
                  </div>
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
          
          <div className="flex justify-center">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "/screenshots/Simulator Screenshot - iPhone 16 Plus - 2025-06-30 at 14.04.29.png",
                "/screenshots/Simulator Screenshot - iPhone 16 Plus - 2025-07-01 at 16.38.42.png",
                "/screenshots/Simulator Screenshot - iPhone 16 Plus - 2025-07-01 at 16.38.54.png",
                "/screenshots/Simulator Screenshot - iPhone 16 Plus - 2025-07-01 at 17.07.14.png",
                "/screenshots/Simulator Screenshot - iPhone 16 Plus - 2025-07-01 at 17.50.52.png",
                "/screenshots/Simulator Screenshot - iPhone 16 Plus - 2025-07-01 at 17.50.56.png"
              ].map((screenshot, index) => (
                <div key={index} className="phone-mockup">
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
          
          <div className="card bg-white/90 backdrop-blur-sm border border-gray-200 p-8 rounded-2xl shadow-xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Send us a Message</h3>
            <form className="space-y-6">
              <div>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300"
                  required 
                />
              </div>
              <div>
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300"
                  required 
                />
              </div>
              <div>
                <textarea 
                  placeholder="Your Message" 
                  rows="5"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300 resize-vertical"
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn-primary w-full">
                Send Message
              </button>
            </form>
          </div>
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
              <li><a href="#about" className="text-gray-400 hover:text-quickbites-yellow transition-colors">About Us</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-quickbites-yellow transition-colors">How It Works</a></li>
              <li><a href="#app" className="text-gray-400 hover:text-quickbites-yellow transition-colors">Download App</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-quickbites-yellow transition-colors">Contact</a></li>
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

function App() {
  return (
    <div className="App">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <HowItWorksSection />
      <AppDownloadSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

export default App;