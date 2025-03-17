'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Users, Zap, Award, Star, Sun, Moon } from 'lucide-react' // Added Sun and Moon
import { useState, useEffect } from 'react' // Import useState and useEffect

export default function HomePage() {
  const tealColor = '#18A5A7';
  const lightTealHover = '#138082';
  const darkBg = '#121212';
  const darkText = '#F5F5F5';
  const lightGrayBg = '#F9FAFB';

  // Use state for dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Use useEffect to check for system preference on initial load
    useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const bgColor = isDarkMode ? darkBg : 'white';
  const textColor = isDarkMode ? darkText : 'gray-800';
  const buttonBgColor = tealColor; // Always use tealColor
  const buttonHoverBgColor = lightTealHover; // Always use lightTealHover
  const sectionBgColor = isDarkMode ? darkBg : lightGrayBg;
  const cardBgColor = isDarkMode ? '#242424' : 'white';
  const cardBorderColor = isDarkMode ? '#374151' : 'border-gray-200';
  const cardShadow = isDarkMode ? 'shadow-none' : 'shadow-sm';
  const iconBgColor = isDarkMode ? '#374151' : '#D7ECEC';
  const navBgColor = isDarkMode ? '#1a202c' : '#e0f2f1'; // Lighter teal for light mode nav, dark gray for dark mode

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-white'} ${isDarkMode ? 'text-white' : 'text-gray-800'} font-sans`}>
      {/* Navigation */}
      {/* Navigation */}
      <header className={`sticky top-0 z-50 shadow-md ${isDarkMode ? 'bg-[#1a202c]' : 'bg-[#e0f2f1]'} text-white py-4`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src={isDarkMode ? '/dark logo.png' : '/logo.png'}
                  alt="ClassTeamUp"
                  width={60}  // Increased width
                  height={60} // Increased height
                  className="h-16 w-auto mr-2" // Increased image size
                />
                <span className={`font-bold text-2xl ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>ClassTeamUp</span> {/* Adjusted text size and color */}
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className={`text-gray-600 hover:${textColor} ${isDarkMode ? 'text-white' : ''}`}>
                Features
              </Link>
              <Link href="#how-it-works" className={`text-gray-600 hover:${textColor} ${isDarkMode ? 'text-white' : ''}`}>
                How It Works
              </Link>
              <Link href="#testimonials" className={`text-gray-600 hover:${textColor} ${isDarkMode ? 'text-white' : ''}`}>
                Testimonials
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <button onClick={toggleDarkMode} className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {isDarkMode ? <Sun className="h-5 w-5 text-white" /> : <Moon className="h-5 w-5 text-black" />}
              </button>
              <Link
                href="/auth/signin"
                className={`text-gray-600 hover:${textColor} font-medium ${isDarkMode ? 'text-white' : ''}`}
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: buttonBgColor }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = buttonHoverBgColor}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = buttonBgColor}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        className={`relative overflow-hidden ${isDarkMode ? 'bg-black' : 'bg-white'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 md:py-24 lg:py-32">
            <div className="max-w-3xl">
              <h1 className={`text-4xl font-extrabold tracking-tight ${textColor} sm:text-5xl md:text-6xl`}>
                <span className="block">Form Perfect Teams</span>
                <span className="block" style={{ color: buttonBgColor }}>for Your Class Projects</span>
              </h1>
              <p className={`mt-6 text-xl ${isDarkMode ? 'text-white' : 'text-gray-500'}`}>
                Connect with classmates, match skills, and build successful teams effortlessly. Your academic success starts with the right team.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: buttonBgColor }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = buttonHoverBgColor}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = buttonBgColor}
                >
                  Get Started Free
                </Link>
                <Link
                  href="/auth/signin"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: buttonBgColor }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = buttonHoverBgColor}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = buttonBgColor}
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1/3 hidden lg:block">
          <Image
            src={isDarkMode ? '/dark final student discussion img.png' : '/final student discussion img.png'} //Dynamic student image.
            alt="Students collaborating"
            width={500}
            height={500}
            className="w-full h-auto"
          />
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className={`py-16 ${sectionBgColor}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className={`text-3xl font-extrabold ${textColor} sm:text-4xl`}>
              Everything you need to build the perfect team
            </h2>
            <p className={`mt-4 text-lg ${isDarkMode ? 'text-white' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Find teammates based on skills, schedules, and course requirements.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              className={`p-6 rounded-lg ${cardShadow} border ${cardBorderColor} ${cardBgColor} hover:shadow-md transition-shadow`}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4`} style={{ backgroundColor: iconBgColor }}>
                <Users className="w-6 h-6" style={{ color: buttonBgColor }} />
              </div>
              <h3 className={`text-xl font-bold ${textColor} mb-2`}>Smart Team Matching</h3>
              <p className={`text-gray-600 ${isDarkMode ? 'text-white' : ''}`}>
                Find teammates based on skills, schedules, and course requirements
              </p>
            </motion.div>

            <motion.div
              className={`p-6 rounded-lg ${cardShadow} border ${cardBorderColor} ${cardBgColor} hover:shadow-md transition-shadow`}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4`} style={{ backgroundColor: iconBgColor }}>
                <Zap className="w-6 h-6" style={{ color: buttonBgColor }} />
              </div>
              <h3 className={`text-xl font-bold ${textColor} mb-2`}>Schedule Coordination</h3>
              <p className={`text-gray-600 ${isDarkMode ? 'text-white' : ''}`}>
                Easily coordinate meeting times with built-in availability tools
              </p>
            </motion.div>

            <motion.div
              className={`p-6 rounded-lg ${cardShadow} border ${cardBorderColor} ${cardBgColor} hover:shadow-md transition-shadow`}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4`} style={{ backgroundColor: iconBgColor }}>
                <Award className="w-6 h-6" style={{ color: buttonBgColor }} />
              </div>
              <h3 className={`text-xl font-bold ${textColor} mb-2`}>Progress Tracking</h3>
              <p className={`text-gray-600 ${isDarkMode ? 'text-white' : ''}`}>
                Keep everyone on track with project milestones and deadlines
              </p>
            </motion.div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section style={{ backgroundColor: buttonBgColor }}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            <span className="block">Ready to build your dream team?</span>
            <span className="block text-white">Get started today - it's free.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-teal-500 bg-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'white', color: tealColor }} // White button and teal text
                onMouseOver={(e) => {e.currentTarget.style.backgroundColor = '#f2f2f2'; e.currentTarget.style.color = tealColor;}} // Lighter gray on hover
                onMouseOut={(e) => {e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = tealColor;}} // Back to white and teal
              >
                Sign Up - It's Free
                <ArrowRight className="ml-2 h-5 w-5" style={{color: tealColor}}/>
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-teal-500 bg-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'white', color: tealColor }} // White button and teal text
                onMouseOver={(e) => {e.currentTarget.style.backgroundColor = '#f2f2f2'; e.currentTarget.style.color = tealColor;}} // Lighter gray on hover
                onMouseOut={(e) => {e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = tealColor;}} // Back to white and teal
              >
                Instructor Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center md:justify-start">
            <Link href="/" className="flex items-center">
              <Image
                src={isDarkMode ? '/dark logo.png' : '/logo.png'} // Dynamic logo
                alt="ClassTeamUp"
                width={30}
                height={30}
                className="mr-2"
              />
              <span className={`font-bold ${textColor}`}>ClassTeamUp</span>
            </Link>
          </div>
          <div className="mt-8 md:mt-0">
            <p className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-500'}`}>
              © 2025 ClassTeamUp. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}