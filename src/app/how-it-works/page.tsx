import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Logo from '@/components/Logo'
import Link from 'next/link'

export const metadata = {
  title: 'How It Works - Range Status',
  description: 'Learn how Range Status helps you find the best times to visit golf driving ranges with real-time crowd information.',
}

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      title: 'Find Ranges Near You',
      description: 'Browse our map or list to discover golf driving ranges in your area.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      number: 2,
      title: 'Check Real-Time Status',
      description: 'See live crowd levels: Quiet, Moderate, or Busy - updated by range staff.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      number: 3,
      title: 'Plan Your Visit',
      description: 'Choose the perfect time to visit when it\'s less crowded for the best experience.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary to-secondary/90 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How Range Status Works
          </h1>
          <p className="text-white/90 text-xl max-w-2xl mx-auto">
            Discover the best times to visit golf driving ranges with real-time crowd information
          </p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-secondary">
                {step.icon}
              </div>
              <div className="bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* For Range Owners Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">For Range Owners</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Attract More Customers</h3>
              <p className="text-gray-600">Let golfers know when your range is less busy, encouraging visits during quieter periods.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Simple Status Updates</h3>
              <p className="text-gray-600">Easily update your range status throughout the day with our simple dashboard.</p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/pricing"
              className="bg-secondary text-white px-8 py-3 rounded-lg hover:bg-secondary/90 transition-colors font-medium inline-block"
            >
              View Pricing →
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-secondary to-secondary/90 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Find the Perfect Time to Practice?
          </h2>
          <p className="text-white/90 text-xl mb-8">
            Start exploring golf driving ranges near you
          </p>
          <Link
            href="/"
            className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium inline-block"
          >
            Explore Ranges
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}