/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Token warna — sumber kebenaran: design-system.md §2
      // Catatan dokumen: nilai ini rekomendasi awal (belum ada brand guideline
      // resmi Jihan). Jika kelak ada nilai resmi, perbarui di sini saja.
      colors: {
        navy: {
          900: '#101B2D', // header gelap, teks judul, tombol primary
          700: '#1B2A41', // varian aktif/hover, teks utama
        },
        charcoal: {
          600: '#3A3F47', // teks sekunder, label, ikon non-aktif
          300: '#9CA3AC', // teks tersier, placeholder, border input
        },
        gold: {
          500: '#C8A04D', // aksen utama: highlight harga, badge approved
          300: '#DCC07F', // hover, latar highlight tipis
        },
        champagne: {
          200: '#F0E6D2', // latar aksen lembut
          100: '#F8F3EA', // latar utama aplikasi
        },
        surface: '#FFFFFF',
        border: '#E6E0D4',
        success: '#3F7D5C',
        danger: '#B5483B',
        warning: '#C8893A',
        info: '#4A7296',
      },
      fontFamily: {
        // Heading — karakter editorial/fashion premium (design-system.md §3)
        heading: ['"Playfair Display"', 'serif'],
        // Body, label, UI, angka — jelas di layar kecil + angka tabular
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // [size, { lineHeight, fontWeight }] — selaras token tipografi design-system.md §3
        heading: ['22px', { lineHeight: '28px', fontWeight: '600' }],
        subheading: ['16px', { lineHeight: '24px', fontWeight: '600' }],
        body: ['15px', { lineHeight: '22px', fontWeight: '400' }],
        label: ['13px', { lineHeight: '18px', fontWeight: '500' }],
        price: ['16px', { lineHeight: '22px', fontWeight: '600' }],
        button: ['15px', { lineHeight: '20px', fontWeight: '600' }],
      },
      borderRadius: {
        input: '10px',
      },
    },
  },
  plugins: [],
}
