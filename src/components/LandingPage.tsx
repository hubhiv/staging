import React, { useState } from 'react';
import { Calendar, DollarSign, Gift, Home, ArrowRight, CheckCircle } from 'lucide-react';
import { RegisterModal } from './auth/RegisterModal';
import { LoginModal } from './auth/LoginModal';
import { PasswordResetModal } from './auth/PasswordResetModal';
export const LandingPage: React.FC = () => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const openRegisterModal = () => {
    setShowLoginModal(false);
    setShowResetModal(false);
    setShowRegisterModal(true);
  };
  const openLoginModal = () => {
    setShowRegisterModal(false);
    setShowResetModal(false);
    setShowLoginModal(true);
  };
  const openResetModal = () => {
    setShowRegisterModal(false);
    setShowLoginModal(false);
    setShowResetModal(true);
  };
  const closeAllModals = () => {
    setShowRegisterModal(false);
    setShowLoginModal(false);
    setShowResetModal(false);
  };
  return <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm z-50 border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="font-bold text-xl text-blue-600">HubHiv</div>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#features" className="text-gray-600 hover:text-gray-900">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900">
                Contact
              </a>
              <button onClick={openLoginModal} className="text-blue-600 hover:text-blue-800 font-medium">
                Login
              </button>
              <button onClick={openRegisterModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                Get Started
              </button>
            </div>
            <div className="md:hidden">
              <button className="text-gray-600 hover:text-gray-900">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Organize Your Home Services Effortlessly
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Keep track of all your home maintenance tasks, schedule
                services, and save money with our all-in-one platform.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button onClick={openRegisterModal} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-lg transition-colors flex items-center justify-center">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <a href="#demo" className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium text-lg transition-colors flex items-center justify-center">
                  See Demo
                </a>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-600/5 backdrop-blur-sm z-10 flex items-center justify-center">
                  <button onClick={openRegisterModal} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-lg transition-colors">
                    Try It Now
                  </button>
                </div>
                {/* Kanban Board Preview */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex overflow-x-auto pb-4 gap-4">
                    {/* To Do Column */}
                    <div className="flex-shrink-0 w-72 bg-gray-100 rounded-md">
                      <div className="p-3 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-sm">To Do</h3>
                          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                            2
                          </span>
                        </div>
                      </div>
                      <div className="p-2 space-y-2">
                        <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200 animate-pulse">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              Medium
                            </span>
                          </div>
                          <h4 className="font-medium text-sm mb-4">
                            HVAC Annual Maintenance
                          </h4>
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                            </div>
                            <button className="text-xs bg-blue-600 text-white py-1 px-2 rounded-md flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>Request Booking</span>
                            </button>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                              Urgent
                            </span>
                          </div>
                          <h4 className="font-medium text-sm mb-4">
                            Plumbing Inspection
                          </h4>
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                            </div>
                            <button className="text-xs bg-blue-600 text-white py-1 px-2 rounded-md flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>Request Booking</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Scheduled Column */}
                    <div className="flex-shrink-0 w-72 bg-gray-100 rounded-md">
                      <div className="p-3 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-sm">Scheduled</h3>
                          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                            1
                          </span>
                        </div>
                      </div>
                      <div className="p-2 space-y-2">
                        <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                              High
                            </span>
                          </div>
                          <h4 className="font-medium text-sm mb-4">
                            Roof Inspection
                          </h4>
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                            </div>
                            <button className="text-xs bg-blue-600 text-white py-1 px-2 rounded-md flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>Scheduled</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Booked Column */}
                    <div className="flex-shrink-0 w-72 bg-gray-100 rounded-md">
                      <div className="p-3 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-sm">Booked</h3>
                          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                            1
                          </span>
                        </div>
                      </div>
                      <div className="p-2 space-y-2">
                        <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200 animate-pulse">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                              Low
                            </span>
                          </div>
                          <h4 className="font-medium text-sm mb-4">
                            Lawn Care Service
                          </h4>
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                            </div>
                            <div className="text-xs bg-green-600 text-white py-1 px-2 rounded-md">
                              Booked: May 15
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Complete Column */}
                    <div className="flex-shrink-0 w-72 bg-gray-100 rounded-md">
                      <div className="p-3 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-sm">Complete</h3>
                          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                            1
                          </span>
                        </div>
                      </div>
                      <div className="p-2 space-y-2">
                        <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                              Medium
                            </span>
                          </div>
                          <h4 className="font-medium text-sm mb-4">
                            Window Cleaning
                          </h4>
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                            </div>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Feature Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose HubHiv?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform helps you manage all your home services in one place,
              saving you time and money.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Scheduling</h3>
              <p className="text-gray-600">
                Schedule and track all your home maintenance services in one
                visual dashboard.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cost Tracking</h3>
              <p className="text-gray-600">
                Monitor your spending on home services and find opportunities to
                save.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bundle Savings</h3>
              <p className="text-gray-600">
                Save money with exclusive bundles and discounts on service
                packages.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that works best for your home management needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-xl font-bold mb-2">Basic</h3>
              <p className="text-gray-500 mb-4">
                For homeowners just getting started
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Up to 10 home service tasks</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Basic calendar view</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Email reminders</span>
                </li>
              </ul>
              <button onClick={openRegisterModal} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors">
                Get Started
              </button>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-blue-500 transform md:-translate-y-4">
              <div className="bg-blue-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-2 rounded-full inline-block mb-2">
                Popular
              </div>
              <h3 className="text-xl font-bold mb-2">Premium</h3>
              <p className="text-gray-500 mb-4">For active home maintenance</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$9.99</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Unlimited home service tasks</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Advanced calendar with reminders</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Service provider integrations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Exclusive discounts (up to 15%)</span>
                </li>
              </ul>
              <button onClick={openRegisterModal} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Get Started
              </button>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-xl font-bold mb-2">Family</h3>
              <p className="text-gray-500 mb-4">For multiple properties</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$19.99</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Everything in Premium</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Manage up to 5 properties</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Family member access</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Premium support</span>
                </li>
              </ul>
              <button onClick={openRegisterModal} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-xl text-gray-600">
              Have questions about HubHiv? We're here to help.
            </p>
          </div>
          <div className="bg-white shadow-md rounded-xl p-8 border border-gray-100">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input type="text" id="name" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input type="email" id="email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Your email" />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input type="text" id="subject" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="How can we help?" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea id="message" rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Your message"></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="font-bold text-xl text-blue-600 mb-4">HubHiv</div>
              <p className="text-gray-600 mb-4">
                Simplifying home service management for homeowners everywhere.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Testimonials
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} HubHiv. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      {/* Authentication Modals */}
      {showRegisterModal && <RegisterModal onClose={closeAllModals} onLoginClick={openLoginModal} />}
      {showLoginModal && <LoginModal onClose={closeAllModals} onRegisterClick={openRegisterModal} onForgotPasswordClick={openResetModal} />}
      {showResetModal && <PasswordResetModal onClose={closeAllModals} onBackToLoginClick={openLoginModal} />}
    </div>;
};
// Helper component for rating stars
const Star: React.FC<{
  className?: string;
}> = ({
  className
}) => {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>;
};