
import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center justify-center md:justify-start">
              <svg width="24" height="24" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M17 34C26.3888 34 34 26.3888 34 17C34 7.61116 26.3888 0 17 0C7.61116 0 0 7.61116 0 17C0 26.3888 7.61116 34 17 34Z" fill="#00C795" fillOpacity="0.2"/>
                <path d="M21.5 13.5L15.5 20.5L12.5 17.5" stroke="#00C795" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-sm text-gray-500">© {new Date().getFullYear()} Assist App. All rights reserved.</p>
            </div>
          </div>
          <div className="flex space-x-6">
            <a href="#privacy" className="text-sm text-gray-500 hover:text-green-500 transition-colors">Privacy Policy</a>
            <a href="#terms" className="text-sm text-gray-500 hover:text-green-500 transition-colors">Terms of Service</a>
            <a href="#contact" className="text-sm text-gray-500 hover:text-green-500 transition-colors">Contact</a>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-gray-400">
          Made with care for those in need
        </div>
      </div>
    </footer>
  );
};

export default Footer;
