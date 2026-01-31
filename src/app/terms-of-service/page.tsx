import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Terms of Service - Range Status',
  description: 'Terms of Service for Range Status - the terms and conditions for using our service.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString('en-GB')}
          </p>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-6">
              By accessing and using Range Status ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-6">
              Range Status provides real-time information about crowd levels at golf driving ranges across the UK. We connect golfers with driving ranges to help them find the best times to practice.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
            <p className="text-gray-700 mb-4">You agree to use our service responsibly and:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Provide accurate and current information when required</li>
              <li>Not use the service for any unlawful or prohibited purpose</li>
              <li>Not attempt to gain unauthorized access to our systems</li>
              <li>Not interfere with the proper working of the service</li>
              <li>Respect the intellectual property rights of others</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Range Owner Services</h2>
            <p className="text-gray-700 mb-6">
              For golf driving range owners who use our service to update their range status, additional terms may apply. Range owners are responsible for providing accurate status updates and maintaining their subscription to continue using premium features.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Information Accuracy</h2>
            <p className="text-gray-700 mb-6">
              While we strive to provide accurate and up-to-date information, we cannot guarantee the accuracy of range status information. Status updates are provided by range owners and may not reflect real-time conditions. We recommend calling ranges directly to confirm current conditions.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Privacy</h2>
            <p className="text-gray-700 mb-6">
              Your privacy is important to us. Please review our <a href="/privacy-policy" className="text-secondary hover:underline">Privacy Policy</a>, which also governs your use of the service, to understand our practices.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 mb-6">
              The service and its original content, features, and functionality are owned by Range Status and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 mb-6">
              Range Status shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Service Availability</h2>
            <p className="text-gray-700 mb-6">
              We strive to maintain service availability but cannot guarantee uninterrupted access. We may suspend or discontinue the service temporarily for maintenance, updates, or other operational reasons.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Subscription and Payment</h2>
            <p className="text-gray-700 mb-6">
              Some features of our service may require a paid subscription. Subscription fees are billed in advance on a monthly or yearly basis. You may cancel your subscription at any time, but refunds are not provided for unused subscription periods.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Termination</h2>
            <p className="text-gray-700 mb-6">
              We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-700 mb-6">
              These Terms shall be interpreted and governed by the laws of England and Wales. Any disputes relating to these terms will be subject to the exclusive jurisdiction of the English courts.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700 mb-6">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-700 mb-6">
              If you have any questions about these Terms of Service, please contact us at:
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