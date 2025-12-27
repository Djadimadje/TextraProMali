
'use client';
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        <img 
          src="/image/landing.jpeg"
          alt="TexPro AI Manufacturing Background"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: 'block' }}
        />
        <div className="relative z-20 min-h-screen flex items-center">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                TexPro AI – Intelligent Efficiency for Textile Manufacturing
              </h1>
              <p className="text-xl text-white mb-8 leading-relaxed">
                Optimizing production with CMDT's smart, AI-driven system.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl">
                    Login to Dashboard
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose TexPro AI
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive AI solutions designed specifically for textile manufacturing excellence
            </p>
          </div>

          <div className="space-y-8">
            {/* First Row - 2 Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-none mx-auto">
              {/* Feature 1 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Automated Workflow Tracking
                  </h3>
                </div>
                <p className="text-gray-600">
                  Real-time view of production stages with intelligent monitoring and reporting capabilities.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    AI-Powered Resource Planning
                  </h3>
                </div>
                <p className="text-gray-600">
                  Smart material and workforce optimization for maximum efficiency and cost savings.
                </p>
              </div>
            </div>

            {/* Second Row - 2 Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-none mx-auto">
              {/* Feature 3 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 011 1v1a2 2 0 104 0V4z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Predictive Maintenance
                  </h3>
                </div>
                <p className="text-gray-600">
                  Avoid downtime using machine learning algorithms for proactive maintenance scheduling.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Quality Assurance
                  </h3>
                </div>
                <p className="text-gray-600">
                  Automated textile defect detection ensuring consistent product quality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Our Team Says Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Team Says
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="mb-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  "TexPro AI has transformed how we manage production. The real-time insights have been invaluable."
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Factory Supervisor</h4>
                <p className="text-gray-600">Production Management</p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="mb-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  "We've cut machine downtime by 40% thanks to predictive maintenance. The ROI has been exceptional."
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Maintenance Engineer</h4>
                <p className="text-gray-600">Technical Operations</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}