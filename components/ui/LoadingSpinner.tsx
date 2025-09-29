// components/ui/LoadingSpinner.tsx
export default function LoadingSpinner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  }

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} spinner`}></div>
    </div>
  )
}
