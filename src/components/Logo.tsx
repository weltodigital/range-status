import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'light' | 'dark'
  className?: string
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
  xl: 'h-24',
}

export default function Logo({ size = 'md', variant = 'light', className = '' }: LogoProps) {
  const logoSrc = variant === 'dark' ? '/logo.png' : '/range-status.png'

  return (
    <Image
      src={logoSrc}
      alt="Range Status"
      width={200}
      height={200}
      className={`${sizeClasses[size]} w-auto ${className}`}
      priority
    />
  )
}