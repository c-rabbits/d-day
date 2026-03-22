-- XP 및 미션 완료 테이블
-- Supabase 대시보드 > SQL Editor에서 실행하세요.

-- ────────────────────────────────────────
-- 1. user_xp: 유저별 누적 XP (1 row per user)
-- ────────────────────────────────────────
CREATE TABLE user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0 AND total_xp <= 999999),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at 자동 갱신 (기존 set_updated_at 함수 재사용)
CREATE TRIGGER user_xp_updated_at
  BEFORE UPDATE ON user_xp
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ────────────────────────────────────────
-- 2. mission_completions: 미션 완료 기록
-- ────────────────────────────────────────
CREATE TABLE mission_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 데일리 미션: 같은 날 중복 방지
CREATE UNIQUE INDEX idx_mission_daily_unique
  ON mission_completions (user_id, mission_id, completed_date)
  WHERE mission_id = 'daily_check';

-- 1회성 미션: 영구 중복 방지
CREATE UNIQUE INDEX idx_mission_onetime_unique
  ON mission_completions (user_id, mission_id)
  WHERE mission_id != 'daily_check';

-- ────────────────────────────────────────
-- 3. RLS
-- ────────────────────────────────────────
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own xp"
  ON user_xp FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own mission completions"
  ON mission_completions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────
-- 4. 원자적 XP 추가 함수
-- ────────────────────────────────────────
CREATE OR REPLACE FUNCTION add_user_xp(p_user_id UUID, p_delta INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_xp INTEGER;
BEGIN
  INSERT INTO user_xp (user_id, total_xp)
  VALUES (p_user_id, LEAST(p_delta, 999999))
  ON CONFLICT (user_id)
  DO UPDATE SET total_xp = LEAST(user_xp.total_xp + p_delta, 999999)
  RETURNING total_xp INTO new_xp;
  RETURN new_xp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
