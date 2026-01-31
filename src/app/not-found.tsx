import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-400">404</h1>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Oops, no driving range here
        </h2>

        <p className="text-gray-600 mb-8">
          Looks like you've hit this page into the rough. Let's get you back to finding the perfect driving range.
        </p>

        <div>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium transition-colors"
          >
            View All Ranges
          </Link>
        </div>
      </div>
    </div>
  )
}