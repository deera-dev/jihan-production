// Shared kernel — modal generik. Dipakai utk konfirmasi aksi destruktif
// (lihat CLAUDE.md § Prinsip UI/UX: "langsung modal dengan form alasan,
// tidak ada 'apakah yakin?' terpisah").

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   title: string,
 *   children: import('react').ReactNode,
 * }} props
 */
export function Modal({ open, onClose, title, children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-900/40 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-2xl bg-surface p-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <h2 className="mb-4 font-heading text-subheading text-navy-900">{title}</h2>
        {children}
      </div>
    </div>
  )
}
