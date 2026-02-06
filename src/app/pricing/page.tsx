import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Pricing - Range Status',
  description: 'Simple, transparent pricing for golf driving ranges. Start with a 7-day free trial.',
}

export default function PricingPage() {
  const features = [
    'Real-time status updates',
    'Customer dashboard access',
    'Mobile-friendly interface',
    'Analytics and insights',
    'Customer support',
    'Professional listing'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary to-secondary/90 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-white/90 text-xl max-w-2xl mx-auto">
            Attract more customers and manage your range's online presence with Range Status
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Monthly</h3>
              <p className="text-gray-600 mb-6">Perfect for getting started</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">£49</span>
                <span className="text-gray-600 ml-2">/ month</span>
              </div>
              <p className="text-sm text-gray-500">7-day free trial included</p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/contact"
              className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium text-center block"
            >
              Get Started
            </Link>
          </div>

          {/* Yearly Plan */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-secondary p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-secondary text-white px-4 py-1 rounded-full text-sm font-medium">
                Best Value
              </span>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Yearly</h3>
              <p className="text-gray-600 mb-6">Save £98 per year</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">£490</span>
                <span className="text-gray-600 ml-2">/ year</span>
              </div>
              <p className="text-sm text-green-600 font-medium">2 months free!</p>
              <p className="text-sm text-gray-500">7-day free trial included</p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/contact"
              className="w-full bg-secondary text-white py-3 px-6 rounded-lg hover:bg-secondary/90 transition-colors font-medium text-center block"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Trial Info */}
        <div className="text-center mt-12">
          <div className="bg-blue-50 rounded-xl p-8 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">7-Day Free Trial</h3>
            <p className="text-gray-600 mb-6">
              Try Range Status risk-free for 7 days. Get full access to all features and see how it can help grow your business.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No setup fees
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Cancel anytime
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No credit card required
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How does the free trial work?</h3>
              <p className="text-gray-600">You get full access to all Range Status features for 7 days. No credit card required to start. If you decide to continue, billing begins after your trial ends.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What's included in the service?</h3>
              <p className="text-gray-600">Your range gets a professional listing with real-time status updates, customer analytics, and a simple dashboard to manage your online presence.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How do customers find my range?</h3>
              <p className="text-gray-600">Your range appears on our public directory with map integration, making it easy for golfers to discover you when searching for nearby ranges.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-secondary to-secondary/90 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-white/90 text-xl mb-8">
            Join the growing network of golf ranges using Range Status
          </p>
          <Link
            href="/contact"
            className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium inline-block"
          >
            Contact Us Today
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}