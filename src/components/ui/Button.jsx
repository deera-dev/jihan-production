// Shared kernel — komponen UI generik dasar (lihat architecture.md
// § Struktur Folder Proyek → components/ui).
// Variant via props (Open/Closed Principle) — bukan duplikasi komponen.
// Selaras design-system.md: tombol besar, label teks jelas, minim icon.

const VARIANT = {
  primary: 'bg-navy-900 text-champagne-100 hover:bg-navy-700',
  gold: 'bg-gold-500 text-navy-900 hover:bg-gold-300',
  outline: 'border border-navy-900 text-navy-900 hover:bg-champagne-200',
  danger: 'bg-danger text-surface hover:opacity-90',
}

/**
 * @param {{
 *   variant?: keyof typeof VARIANT,
 *   className?: string,
 *   children: import('react').ReactNode,
 * } & import('react').ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export function Button({ variant = 'primary', className = '', children, ...rest }) {
  return (
    <button
      className={`w-full rounded-lg px-4 py-3 font-sans text-button transition-colors disabled:opacity-60 ${VARIANT[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
