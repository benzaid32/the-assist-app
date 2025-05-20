
import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu, Apple } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  
  return (
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
        
        <Button onClick={() => navigate('/admin/login')} className="hidden md:flex bg-green-500 hover:bg-green-600 text-white rounded-full px-6 shadow-md transition-all duration-300 hover:shadow-lg">
          <Apple className="mr-2 h-4 w-4" />
          Download on iOS
        </Button>
      </div>
    </header>
  );
};

export default Header;
