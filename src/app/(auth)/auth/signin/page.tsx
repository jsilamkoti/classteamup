'use client';

import React, { useState, useEffect } from 'react';
import SignInBranding from '@/components/auth/signin/SignInBranding';
import SignInForm from '@/components/auth/signin/SignInForm';
import { ThemeContext } from '@/components/auth/signin/ThemeContext';

const SignInPage = () => {
  // Check local storage for a saved theme, otherwise defaults to 'light'
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden md:flex md:max-w-4xl">
          <SignInBranding />
          <SignInForm />
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default SignInPage;