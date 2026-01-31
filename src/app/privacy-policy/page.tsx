import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Privacy Policy - Range Status',
  description: 'Privacy Policy for Range Status - how we collect, use and protect your personal information.',
}

export default function PrivacyPolicyPage() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString('en-GB')}
          </p>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-6">
              Range Status ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our service to find golf driving range status information.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 mb-4">We may collect the following types of information:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li><strong>Personal Information:</strong> Name, email address, and contact details when you contact us or register for range owner services</li>
              <li><strong>Usage Data:</strong> Information about how you use our website, including pages visited and time spent</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, and other technical identifiers</li>
              <li><strong>Location Data:</strong> General location information to help find nearby ranges (not precise location)</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Provide and improve our range status service</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send important updates about our service</li>
              <li>Analyze usage patterns to improve our website</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
            <p className="text-gray-700 mb-6">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>With your explicit consent</li>
              <li>To comply with legal requirements</li>
              <li>To protect our rights and property</li>
              <li>With trusted service providers who assist in operating our website</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-6">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-700 mb-4">Under UK GDPR, you have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Cookies</h2>
            <p className="text-gray-700 mb-6">
              Our website uses cookies to enhance your experience. For detailed information about our use of cookies, please see our <a href="/cookies-policy" className="text-secondary hover:underline">Cookies Policy</a>.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Changes to This Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
            <p className="text-gray-700 mb-6">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-700">
              Email: <a href="mailto:rangestatus@weltodigital.com" className="text-secondary hover:underline">rangestatus@weltodigital.com</a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}