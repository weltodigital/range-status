import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full bg-gray-100 rounded-lg border flex items-center justify-center" style={{ height: '400px' }}>
      <div className="text-gray-500 text-sm">Loading map...</div>
    </div>
  )
})

export default Map