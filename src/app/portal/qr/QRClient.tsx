'use client'

import { useState, useEffect } from 'react'
import { Range } from '@/lib/supabase-db'
import { useRouter } from 'next/navigation'
import { generateQRCode } from '@/lib/qr'
import Logo from '@/components/Logo'
import Footer from '@/components/Footer'

interface QRClientProps {
  range: Range
}

export default function QRClient({ range }: QRClientProps) {
  const router = useRouter()
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const publicUrl = `https://www.rangestatus.com/r/${range.slug}`

  useEffect(() => {
    async function createQR() {
      try {
        const qrUrl = await generateQRCode(publicUrl)
        setQrCodeUrl(qrUrl)
      } catch (error) {
        console.error('Failed to generate QR code:', error)
      } finally {
        setLoading(false)
      }
    }

    createQR()
  }, [publicUrl])

  const handlePrint = () => {
    window.print()
  }

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      alert('URL copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto print:max-w-none print:mx-0">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 print:shadow-none print:rounded-none">
          <div className="flex items-center mb-6 print:hidden">
            <button
              onClick={() => router.back()}
              className="mr-4 text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">QR Code & Public Link</h1>
              <p className="text-sm text-gray-600">{range.name}</p>
            </div>
          </div>

          <div className="text-center print:mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 print:text-4xl">
              {range.name}
            </h2>
            <p className="text-gray-600 mb-8 print:text-xl print:mb-12">
              Check how busy we are
            </p>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Generating QR code...</div>
              </div>
            ) : (
              <div className="mb-8 print:mb-12">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="mx-auto w-64 h-64 print:w-80 print:h-80"
                />
                <p className="text-lg font-medium text-gray-900 mt-4 print:text-2xl print:mt-8">
                  Scan to check how busy we are
                </p>
              </div>
            )}

            <div className="space-y-4 print:space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg print:bg-white print:border print:border-gray-300">
                <p className="text-sm text-gray-600 mb-2 print:text-base">Public page:</p>
                <p className="font-mono text-sm text-gray-900 break-all print:text-lg">
                  {publicUrl}
                </p>
              </div>

              <div className="hidden print:block mt-8 pt-8 border-t border-gray-200">
                <div className="flex justify-center">
                  <Logo variant="dark" size="md" />
                </div>
              </div>

              <div className="print:hidden space-y-3">
                <button
                  onClick={copyUrl}
                  className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  Copy URL
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full px-4 py-2 bg-secondary text-white rounded hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                >
                  Print Poster
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="print:hidden bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-3">Usage Tips</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Print the poster and display it prominently at your range</li>
            <li>• Share the URL on your website or social media</li>
            <li>• Customers can scan the QR code or visit the URL to check how busy you are</li>
            <li>• The page shows your current status and opening hours</li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  )
}