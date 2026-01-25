'use client'

interface StatusButtonProps {
  status: 'QUIET' | 'MODERATE' | 'BUSY'
  isActive: boolean
  onClick: () => void
  disabled?: boolean
}

export default function StatusButton({ status, isActive, onClick, disabled }: StatusButtonProps) {
  const colors = {
    QUIET: {
      bg: 'bg-quiet',
      activeBg: 'bg-green-600',
      inactiveBg: 'bg-green-100',
      text: 'text-white',
      inactiveText: 'text-green-700',
    },
    MODERATE: {
      bg: 'bg-moderate',
      activeBg: 'bg-amber-600',
      inactiveBg: 'bg-amber-100',
      text: 'text-white',
      inactiveText: 'text-amber-700',
    },
    BUSY: {
      bg: 'bg-busy',
      activeBg: 'bg-red-600',
      inactiveBg: 'bg-red-100',
      text: 'text-white',
      inactiveText: 'text-red-700',
    },
  }

  const color = colors[status]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-8 px-4 rounded-lg font-semibold text-xl transition-all duration-200
        touch-target active:scale-95
        ${isActive
          ? `${color.bg} ${color.text} shadow-lg`
          : `${color.inactiveBg} ${color.inactiveText} hover:shadow-md active:shadow-lg`
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-4 focus:ring-primary/30
      `}
    >
      {status}
    </button>
  )
}