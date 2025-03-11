'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Users, Zap, Award, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/CTU.svg" 
                  alt="ClassTeamUp" 
                  width={40} 
                  height={40} 
                  className="mr-2"
                />
                <span className="font-bold text-xl text-gray-900">ClassTeamUp</span>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900">
                How It Works
              </Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-gray-900">
                Testimonials
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/student-signin" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section 
        className="relative bg-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 md:py-24 lg:py-32">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Form the perfect team</span>
                <span className="block text-indigo-600">for your class projects</span>
              </h1>
              <p className="mt-6 text-xl text-gray-500">
                ClassTeamUp matches students based on complementary skills, interests, and availability to create balanced, high-performing teams.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/auth/student-signin" 
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Join as Student
                </Link>
                <Link 
                  href="/auth/instructor-signin" 
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-100 bg-indigo-800 hover:bg-indigo-900"
                >
                  Sign In as Instructor
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1/3 hidden lg:block">
          <Image 
            src="/students-collaborating.svg"
            alt="Students collaborating"
            width={500}
            height={500}
            className="w-full h-auto"
          />
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Features that make team formation easier
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform streamlines the team formation process with powerful features for both students and instructors.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Skill-Based Matching</h3>
              <p className="text-gray-600">
                Our algorithm pairs students with complementary skills to create balanced teams.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Automated Team Formation</h3>
              <p className="text-gray-600">
                Instructors can generate optimal teams with a single click based on custom criteria.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Student Profiles</h3>
              <p className="text-gray-600">
                Students can showcase their skills, interests, and availability for better matching.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            <span className="block">Ready to try ClassTeamUp?</span>
            <span className="block text-indigo-200">Get started today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link 
                href="/auth/register" 
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Get started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link 
                href="/auth/instructor-signin" 
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Instructor Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center md:justify-start">
            <Link href="/" className="flex items-center">
              <Image 
                src="/CTU.svg" 
                alt="ClassTeamUp" 
                width={30} 
                height={30} 
                className="mr-2"
              />
              <span className="font-bold text-gray-900">ClassTeamUp</span>
            </Link>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center text-gray-500">
              &copy; {new Date().getFullYear()} ClassTeamUp. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
