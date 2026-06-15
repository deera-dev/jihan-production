#!/usr/bin/env python3
"""
fw.py — NTFS-safe file writer untuk jihan-production.
Gunakan ini setiap kali nulis file .jsx/.js di project ini,
untuk menghindari NTFS page cache menyajikan data stale/truncated.

Usage:
  python3 fw.py <path-relatif> << 'EOF'
  <isi file>
  EOF

Atau dari Python:
  from fw import write
  write('src/features/foo/Bar.jsx', content)
"""
import os, sys

BASE = os.path.dirname(os.path.abspath(__file__))

def write(rel_path: str, content: str) -> None:
    """Tulis content ke rel_path menggunakan fsync+replace untuk flush NTFS cache."""
    path = os.path.join(BASE, rel_path.replace('\\', '/'))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + '.fw_tmp'
    with open(tmp, 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(content)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, path)
    print(f'[fw] {rel_path} ({len(content):,} chars)')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python3 fw.py <path-relatif> < file_content.txt')
        sys.exit(1)
    content = sys.stdin.read()
    write(sys.argv[1], content)
