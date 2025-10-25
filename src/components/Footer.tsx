
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              SportChain
            </h3>
            <p className="text-sm text-muted-foreground">
              Decentralized platform for urban sports courses, powered by blockchain technology.
            </p>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SportChain. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
