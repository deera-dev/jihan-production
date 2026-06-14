// Shared kernel — komponen UI generik dasar yang dipakai lintas slice
// (Button, Badge, Input, Slider, Modal, dll). Lihat architecture.md
// § Struktur Folder Proyek & § Prinsip Arsitektur Kode → Shared Kernel.
//
// Aturan: HANYA taruh komponen di sini jika benar-benar generik (tidak
// mengandung logika/istilah bisnis Jihan Production). Kalau mengandung
// istilah bisnis (mis. StatusBadge utk STATUS_KODE), itu masuk ke
// components/shared/, bukan ke sini.

export { Button } from './Button'
export { Badge } from './Badge'
export { Modal } from './Modal'
export { NumberInput } from './NumberInput'

// TODO tambahan sesuai kebutuhan: Input, Slider, Select, Textarea, Spinner, dll.
