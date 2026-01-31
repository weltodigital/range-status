import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Cookies Policy - Range Status',
  description: 'Cookies Policy for Range Status - information about how we use cookies on our website.',
}

export default function CookiesPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookies Policy</h1>

          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString('en-GB')}
          </p>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. What Are Cookies</h2>
            <p className="text-gray-700 mb-6">
              Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better browsing experience by remembering your preferences and understanding how you use our site.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-700 mb-4">We use cookies for the following purposes:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Performance Cookies:</strong> Monitor website performance and user experience</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h2>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Essential Cookies</h3>
            <p className="text-gray-700 mb-4">
              These cookies are necessary for the website to function and cannot be switched off. They are usually set in response to actions you take, such as logging in or filling in forms.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
            <p className="text-gray-700 mb-4">
              We may use analytics services to help us understand how visitors interact with our website. These cookies collect information about pages visited, time spent on the site, and any errors encountered.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">Functional Cookies</h3>
            <p className="text-gray-700 mb-6">
              These cookies allow the website to remember choices you make and provide enhanced features. They may be set by us or by third-party providers whose services we use.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-700 mb-6">
              Some cookies on our website are placed by third-party services. We have no control over these cookies and recommend checking the respective privacy policies of these services.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Managing Cookies</h2>
            <p className="text-gray-700 mb-4">
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Browser settings: Most browsers allow you to refuse or delete cookies</li>
              <li>Opt-out tools: Some third parties provide opt-out mechanisms</li>
              <li>Website preferences: Where available, use our cookie preference settings</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Browser Settings</h2>
            <p className="text-gray-700 mb-6">
              You can set your browser to refuse all or some browser cookies, or to alert you when cookies are being sent. If you disable or refuse cookies, please note that some parts of our website may become inaccessible or not function properly.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Updates to This Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update this Cookies Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-700 mb-6">
              If you have any questions about our use of cookies, please contact us at:
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