
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Download, Apple, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Footer from './Footer';

const LandingPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    document.title = "Assist App - Financial Aid Platform";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation - Sleeker with gradient background */}
      <header className="bg-gradient-to-r from-background to-background/90 border-b border-border/30 backdrop-blur-sm py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <a href="/" className="flex items-center">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform hover:scale-105 transition-transform">
                <path d="M17 34C26.3888 34 34 26.3888 34 17C34 7.61116 26.3888 0 17 0C7.61116 0 0 7.61116 0 17C0 26.3888 7.61116 34 17 34Z" fill="#00C795"/>
                <path d="M21.5 13.5L15.5 20.5L12.5 17.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <span className="font-semibold text-lg hidden md:inline-block">Assist</span>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="p-1">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-8">
              <li><a href="#playbook" className="text-foreground/80 hover:text-primary nav-text transition-colors">Playbook</a></li>
              <li><a href="#faq" className="text-foreground/80 hover:text-primary nav-text transition-colors">FAQs</a></li>
              <li><a href="#terms" className="text-foreground/80 hover:text-primary nav-text transition-colors">Terms</a></li>
              <li><a href="#privacy" className="text-foreground/80 hover:text-primary nav-text transition-colors">Privacy</a></li>
            </ul>
          </nav>
          
          <Button onClick={() => navigate('/admin/login')} className="hidden md:flex bg-black hover:bg-black/90 text-white rounded-full px-6 shadow-md transition-all duration-300 hover:shadow-lg">
            <Apple className="mr-2 h-4 w-4" />
            Download on iOS
          </Button>
        </div>
      </header>

      {/* Main Content - More modern layout with subtle animations */}
      <div className="flex-1 flex flex-col items-center bg-gradient-to-br from-background via-background/95 to-background/90">
        <div className="container mx-auto px-4 py-8 md:py-16 flex flex-col md:flex-row items-center">
          {/* Left Content */}
          <div className="w-full md:w-1/2 text-center md:text-left mb-10 md:mb-0 animate-fade-in">
            <div className="space-y-4 max-w-lg mx-auto md:mx-0 md:pr-8">
              <div className="inline-block bg-black/5 text-black px-3 py-1 rounded-full text-xs font-medium mb-2">
                Coming Soon
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 leading-tight">
                Believe in<br />
                <span className="text-black">Assistance</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-6">
                Everyone deserves support in times of need. We're building the future of community-driven financial aid.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-8">
                <Button className="bg-black hover:bg-black/90 text-white rounded-full px-6 py-6 shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]">
                  <Apple className="mr-2 h-5 w-5" />
                  Download on iOS
                </Button>
                
                <Button variant="outline" className="rounded-full border-black/20 hover:border-black/30 px-6 py-6 bg-white/50 hover:bg-white/80 transition-all duration-300">
                  Learn more
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              
              {/* QR Code with improved styling */}
              {!isMobile && (
                <div className="bg-white rounded-2xl shadow-lg p-5 max-w-sm mx-auto md:mx-0 flex items-center border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="mr-4 p-1 bg-gray-50 rounded-xl">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://assist-app.org" 
                      alt="QR Code for Assist App" 
                      className="w-24 h-24"
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold mb-1">Available on iOS</h3>
                    <p className="text-muted-foreground text-sm">
                      Point your phone camera<br />
                      to scan the QR code
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* App Showcase - Three device showcase */}
          <div className="w-full md:w-1/2 relative h-[450px] md:h-[600px]">
            <div className="app-showcase-container">
              {/* Left tilted phone */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/4 -rotate-12 z-10 hidden md:block">
                <div className="transform hover:scale-[1.02] transition-all duration-700 shadow-2xl rounded-3xl overflow-hidden">
                  <img 
                    src="/assets/screen1.png" 
                    alt="Assist App Screen" 
                    className="h-[400px] object-contain rounded-3xl"
                    style={{ filter: 'brightness(0.95)' }}
                  />
                </div>
              </div>
              
              {/* Center main phone */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="transform hover:scale-[1.05] transition-all duration-700 shadow-2xl rounded-3xl overflow-hidden">
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-3/4 h-6 bg-black/10 blur-xl rounded-full"></div>
                  <img 
                    src="/assets/screen2.png" 
                    alt="Assist App Main Screen" 
                    className="h-[450px] md:h-[500px] object-contain rounded-3xl"
                  />
                </div>
              </div>
              
              {/* Right tilted phone */}
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/4 rotate-12 z-10 hidden md:block">
                <div className="transform hover:scale-[1.02] transition-all duration-700 shadow-2xl rounded-3xl overflow-hidden">
                  <img 
                    src="/assets/screen3.png" 
                    alt="Assist App Screen" 
                    className="h-[400px] object-contain rounded-3xl"
                    style={{ filter: 'brightness(0.95)' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features section (optional) */}
        {!isMobile && (
          <div className="w-full bg-white/60 backdrop-blur-sm py-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 rounded-xl hover:bg-white/80 transition-all duration-300">
                  <div className="w-14 h-14 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 9L9 15" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 9L15 15" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Simple Process</h3>
                  <p className="text-muted-foreground">Request assistance in minutes with our streamlined application process</p>
                </div>
                <div className="text-center p-6 rounded-xl hover:bg-white/80 transition-all duration-300">
                  <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#00C795" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13.73 21C13.5542 21.3031 13.3018 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="#00C795" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Fast Payouts</h3>
                  <p className="text-muted-foreground">Receive assistance quickly when you need it most</p>
                </div>
                <div className="text-center p-6 rounded-xl hover:bg-white/80 transition-all duration-300">
                  <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.42 4.58C20.9704 5.13063 21.4059 5.78283 21.7037 6.49906C22.0014 7.21529 22.1548 7.98178 22.1548 8.755C22.1548 9.52822 22.0014 10.2947 21.7037 11.0109C21.4059 11.7272 20.9704 12.3794 20.42 12.93L12 21.35L3.58 12.93C3.02964 12.3794 2.5941 11.7272 2.29635 11.0109C1.99861 10.2947 1.84523 9.52822 1.84523 8.755C1.84523 7.98178 1.99861 7.21529 2.29635 6.49906C2.5941 5.78283 3.02964 5.13063 3.58 4.58C4.69982 3.46018 6.21646 2.82736 7.8 2.82736C9.38354 2.82736 10.9002 3.46018 12.02 4.58L12 4.6L11.98 4.58C13.0998 3.46018 14.6165 2.82736 16.2 2.82736C17.7835 2.82736 19.3002 3.46018 20.42 4.58Z" stroke="#00C795" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Community Support</h3>
                  <p className="text-muted-foreground">Join a network of people who care and want to help</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Add custom styles for the showcase */}
      <style>
        {`
        .app-showcase-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        @media (max-width: 768px) {
          .app-showcase-container {
            transform: scale(0.9);
          }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        `}
      </style>
    </div>
  );
};

export default LandingPage;
