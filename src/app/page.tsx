import Link from 'next/link'
import Logo from '@/components/Logo'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-secondary/90 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <Logo size="xl" className="mx-auto" />
        </div>

        <h1 className="text-3xl font-bold text-secondary mb-4">
          Range Status
        </h1>
        <p className="text-accent mb-8 text-lg">
          Check how busy golf driving ranges are before you go
        </p>

        <div className="space-y-4">
          <Link
            href="/ranges"
            className="block w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Browse Ranges
          </Link>

          <Link
            href="/login"
            className="block w-full px-6 py-3 bg-accent/10 text-secondary border-2 border-accent/20 rounded-lg hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-accent/50 font-medium transition-all duration-200"
          >
            Range Login
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-accent/20">
          <p className="text-sm text-accent">
            Range staff can update their status in seconds.
            <br />
            Golfers can check before they go.
          </p>
        </div>
      </div>
    </div>
  )
}