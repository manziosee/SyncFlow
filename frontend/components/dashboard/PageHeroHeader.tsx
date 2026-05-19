'use client'

import clsx from 'clsx'

// Curated abstract art images (from Unsplash, free to use)
const ART_IMAGES = [
  'https://images.unsplash.com/photo-1536849460588-696219a9e98d?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85', // blue-orange brushstroke
  'https://images.unsplash.com/photo-1552043519-6b4dc5347ea9?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85', // orange-blue abstract
  'https://images.unsplash.com/photo-1558880323-3193dacc4d29?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85', // red-orange
  'https://images.unsplash.com/photo-1538342014732-212dc8f76863?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85', // blue
  'https://images.unsplash.com/photo-1669125453774-c1642484a01b?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85', // mountain abstract
  'https://images.unsplash.com/photo-1529405456913-530d6c6d2966?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85', // blue-red
]

interface PageHeroHeaderProps {
  /** Page title — the main heading in the hero */
  title: string
  /** Highlighted word or phrase rendered in orange within the title */
  highlight?: string
  /** Smaller subtitle below the title */
  subtitle?: string
  /** Action buttons / elements shown in top-right corner */
  actions?: React.ReactNode
  /** Stats or quick-info chips shown below the title */
  stats?: { label: string; value: string | number; positive?: boolean }[]
  /** Index into the ART_IMAGES array (0-5). Each page gets a different artwork. */
  imageIndex?: number
  /** Extra CSS classes on the outer container */
  className?: string
}

export default function PageHeroHeader({
  title,
  highlight,
  subtitle,
  actions,
  stats,
  imageIndex = 0,
  className,
}: PageHeroHeaderProps) {
  const imageUrl = ART_IMAGES[imageIndex % ART_IMAGES.length]

  // Split title around the highlighted word for inline orange coloring
  const renderTitle = () => {
    if (!highlight) return <span>{title}</span>
    const idx = title.toLowerCase().indexOf(highlight.toLowerCase())
    if (idx === -1) return <span>{title}</span>
    return (
      <>
        {title.slice(0, idx)}
        <span className="text-orange-400">{title.slice(idx, idx + highlight.length)}</span>
        {title.slice(idx + highlight.length)}
      </>
    )
  }

  return (
    <div
      className={clsx('relative w-full overflow-hidden shrink-0', className)}
      style={{ minHeight: 140 }}
    >
      {/* Abstract art background */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.22) 55%, rgba(0,0,0,0.10) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex items-start justify-between px-8 pt-6 pb-6 h-full">
        {/* Left — title block */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            {renderTitle()}
          </h1>

          {subtitle && (
            <p className="text-sm text-white/70 leading-snug max-w-md">{subtitle}</p>
          )}

          {/* Quick stats */}
          {stats && stats.length > 0 && (
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1"
                >
                  <span className={clsx(
                    'text-sm font-bold',
                    s.positive === true ? 'text-emerald-300' :
                    s.positive === false ? 'text-red-300' :
                    'text-white'
                  )}>
                    {s.value}
                  </span>
                  <span className="text-[11px] text-white/60">{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — actions */}
        {actions && (
          <div className="flex items-start gap-2 shrink-0 ml-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

/** Styled button for use inside PageHeroHeader actions */
export function HeroButton({
  children,
  onClick,
  variant = 'ghost',
  className,
  ...rest
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'ghost' | 'solid' | 'orange'
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all',
        variant === 'ghost' &&
          'bg-white/15 backdrop-blur-sm border border-white/25 text-white hover:bg-white/25',
        variant === 'solid' &&
          'bg-white text-gray-900 hover:bg-gray-100 shadow-sm',
        variant === 'orange' &&
          'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/30',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
