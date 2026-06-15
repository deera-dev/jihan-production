-- ============================================================================
-- 0016 — Self-registration: username, nama_panggilan, status pending/active
-- ============================================================================

-- 1. Buat role nullable (pending user belum punya role)
ALTER TABLE public.users ALTER COLUMN role DROP NOT NULL;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IS NULL OR role IN ('deera', 'jihan', 'master'));

-- 2. Tambah kolom baru
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS username      TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS nama_panggilan TEXT,
  ADD COLUMN IF NOT EXISTS status        TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('pending', 'active'));

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- 3. Update trigger: self-register → pending + role null
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role   TEXT;
  v_status TEXT;
BEGIN
  v_role   := NULLIF(new.raw_user_meta_data ->> 'role', '');
  v_status := CASE WHEN v_role IS NOT NULL THEN 'active' ELSE 'pending' END;

  INSERT INTO public.users (id, role, nama_lengkap, username, nama_panggilan, status)
  VALUES (
    new.id,
    v_role,
    new.raw_user_meta_data ->> 'nama_lengkap',
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'nama_panggilan',
    v_status
  );
  RETURN new;
END;
$$;

-- 4. RPC: cari email berdasarkan username (untuk login pakai username)
CREATE OR REPLACE FUNCTION public.cari_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT au.email
  FROM auth.users au
  JOIN public.users pu ON pu.id = au.id
  WHERE LOWER(pu.username) = LOWER(p_username)
  LIMIT 1;
$$;

-- 5. RPC: setujui user (set role + aktifkan) — hanya Master
CREATE OR REPLACE FUNCTION public.setujui_user(p_user_id UUID, p_role TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_master() THEN
    RAISE EXCEPTION 'Hanya Master yang bisa menyetujui user';
  END IF;
  IF p_role NOT IN ('deera', 'jihan') THEN
    RAISE EXCEPTION 'Role tidak valid';
  END IF;
  UPDATE public.users
  SET role = p_role, status = 'active'
  WHERE id = p_user_id AND status = 'pending';
END;
$$;

-- 6. Pending user boleh baca row-nya sendiri (untuk cek status setelah login)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_read_own ON public.users;
CREATE POLICY users_read_own ON public.users
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS users_deera_read_all ON public.users;
CREATE POLICY users_deera_read_all ON public.users
  FOR SELECT
  USING (public.is_deera() OR public.is_master());

DROP POLICY IF EXISTS users_master_write ON public.users;
CREATE POLICY users_master_write ON public.users
  FOR UPDATE
  USING (public.is_master());
