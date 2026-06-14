// Shared kernel — input angka dgn slider + input manual SINKRON DUA ARAH
// (lihat CLAUDE.md § Aturan Input (Global): "Slider + input manual sinkron
// dua arah. Nilai lama = placeholder, bukan pre-fill").

/**
 * @param {{
 *   value: number | undefined,
 *   onChange: (value: number) => void,
 *   min?: number,
 *   max?: number,
 *   step?: number,
 *   placeholder?: number | string,
 *   label?: string,
 * }} props
 */
export function NumberInput({ value, onChange, min = 0, max = 100, step = 1, placeholder, label }) {
  return (
    <div>
      {label && <label className="mb-1 block font-sans text-label text-charcoal-600">{label}</label>}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value ?? min}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 flex-1 accent-gold-500"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value ?? ''}
          placeholder={placeholder !== undefined ? String(placeholder) : undefined}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          className="w-24 rounded-lg border border-border bg-surface px-3 py-2 text-right font-sans text-body tabular-nums text-navy-900 outline-none focus:border-gold-500"
        />
      </div>
    </div>
  )
}
