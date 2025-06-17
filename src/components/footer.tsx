import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <span className="text-gray-700 font-medium">Pusdatin</span>
          </div>
          
          <div className="text-sm text-gray-500">
            © 2025 All rights reserved
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;