import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
  xl: 'h-24',
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <Image
      src="/range-status.png"
      alt="Range Status"
      width={200}
      height={200}
      className={`${sizeClasses[size]} w-auto ${className}`}
      priority
    />
  )
}