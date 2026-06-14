// Shared kernel — badge generik (dipakai StatusBadge & lainnya).
// Lihat architecture.md § Struktur Folder Proyek → components/ui.

const TONE = {
  navy: 'bg-navy-900 text-champagne-100',
  gold: 'bg-gold-500 text-navy-900',
  success: 'bg-success/15 text-success',
  danger: 'bg-danger/15 text-danger',
  warning: 'bg-warning/15 text-warning',
  info: 'bg-info/15 text-info',
  neutral: 'bg-champagne-200 text-charcoal-600',
}

/**
 * @param {{ tone?: keyof typeof TONE, children: import('react').ReactNode, className?: string }} props
 */
export function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 font-sans text-label ${TONE[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
