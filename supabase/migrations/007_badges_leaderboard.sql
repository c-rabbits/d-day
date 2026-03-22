-- 뱃지 및 리더보드 테이블
-- Supabase 대시보드 > SQL Editor에서 실행하세요.

-- ────────────────────────────────────────
-- 1. user_badges: 유저가 해금한 뱃지 기록
-- ────────────────────────────────────────
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────
-- 2. weekly_xp: 주간 XP 추적 (리더보드용)
-- ────────────────────────────────────────
CREATE TABLE weekly_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, week_start)
);

ALTER TABLE weekly_xp ENABLE ROW LEVEL SECURITY;

-- 리더보드: 전체 공개 읽기
CREATE POLICY "Anyone can view weekly xp"
  ON weekly_xp FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own weekly xp"
  ON weekly_xp FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly xp"
  ON weekly_xp FOR UPDATE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────
-- 3. user_xp도 리더보드용으로 SELECT 공개
-- ────────────────────────────────────────
CREATE POLICY "Anyone can view user xp for leaderboard"
  ON user_xp FOR SELECT
  USING (true);

-- 기존 "Users can manage own xp" 정책이 INSERT/UPDATE를 커버함

-- ────────────────────────────────────────
-- 4. add_user_xp 수정: weekly_xp도 함께 갱신
-- ────────────────────────────────────────
CREATE OR REPLACE FUNCTION add_user_xp(p_user_id UUID, p_delta INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_xp INTEGER;
  v_week_start DATE;
BEGIN
  -- XP 추가
  INSERT INTO user_xp (user_id, total_xp)
  VALUES (p_user_id, LEAST(p_delta, 999999))
  ON CONFLICT (user_id)
  DO UPDATE SET total_xp = LEAST(user_xp.total_xp + p_delta, 999999)
  RETURNING total_xp INTO new_xp;

  -- 주간 XP 기록 (월요일 기준)
  v_week_start := date_trunc('week', now())::DATE;
  INSERT INTO weekly_xp (user_id, week_start, xp_earned)
  VALUES (p_user_id, v_week_start, p_delta)
  ON CONFLICT (user_id, week_start)
  DO UPDATE SET xp_earned = weekly_xp.xp_earned + p_delta;

  RETURN new_xp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────
-- 5. 뱃지 자동 해금 함수
-- 레벨 기반 티어: bronze(20), silver(40), gold(60), platinum(80), diamond(100)
-- ────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_and_unlock_badges(p_user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
  v_xp INTEGER;
  v_level INTEGER;
  v_unlocked TEXT[] := '{}';
  v_badge RECORD;
BEGIN
  -- 현재 XP 조회
  SELECT total_xp INTO v_xp FROM user_xp WHERE user_id = p_user_id;
  IF v_xp IS NULL THEN RETURN v_unlocked; END IF;

  -- 레벨 계산 (level.ts의 공식 재현: xp = 999999 * ((L-1)/99)^1.8)
  v_level := 1;
  FOR i IN REVERSE 100..1 LOOP
    IF v_xp >= ROUND(999999.0 * POWER((i - 1)::NUMERIC / 99.0, 1.8)) THEN
      v_level := i;
      EXIT;
    END IF;
  END LOOP;

  -- 티어별 뱃지 체크
  FOR v_badge IN
    SELECT * FROM (VALUES
      ('bronze', 20),
      ('silver', 40),
      ('gold', 60),
      ('platinum', 80),
      ('diamond', 100)
    ) AS t(badge_id, required_level)
  LOOP
    IF v_level >= v_badge.required_level THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.badge_id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;

      IF FOUND THEN
        v_unlocked := array_append(v_unlocked, v_badge.badge_id);
      END IF;
    END IF;
  END LOOP;

  RETURN v_unlocked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────
-- 6. 리더보드 조회 함수
-- ────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_leaderboard(p_type TEXT, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
  rank BIGINT,
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  xp INTEGER
) AS $$
BEGIN
  IF p_type = 'weekly' THEN
    RETURN QUERY
    SELECT
      ROW_NUMBER() OVER (ORDER BY w.xp_earned DESC) AS rank,
      w.user_id,
      COALESCE(
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'name',
        '익명'
      ) AS display_name,
      COALESCE(
        u.raw_user_meta_data->>'avatar_url',
        u.raw_user_meta_data->>'picture',
        ''
      ) AS avatar_url,
      w.xp_earned AS xp
    FROM weekly_xp w
    JOIN auth.users u ON u.id = w.user_id
    WHERE w.week_start = date_trunc('week', now())::DATE
    ORDER BY w.xp_earned DESC
    LIMIT p_limit;
  ELSE
    RETURN QUERY
    SELECT
      ROW_NUMBER() OVER (ORDER BY ux.total_xp DESC) AS rank,
      ux.user_id,
      COALESCE(
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'name',
        '익명'
      ) AS display_name,
      COALESCE(
        u.raw_user_meta_data->>'avatar_url',
        u.raw_user_meta_data->>'picture',
        ''
      ) AS avatar_url,
      ux.total_xp AS xp
    FROM user_xp ux
    JOIN auth.users u ON u.id = ux.user_id
    ORDER BY ux.total_xp DESC
    LIMIT p_limit;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 내 순위 조회 함수
CREATE OR REPLACE FUNCTION get_my_rank(p_user_id UUID, p_type TEXT)
RETURNS TABLE(rank BIGINT, xp INTEGER) AS $$
BEGIN
  IF p_type = 'weekly' THEN
    RETURN QUERY
    SELECT r.rank, r.xp FROM (
      SELECT
        ROW_NUMBER() OVER (ORDER BY w.xp_earned DESC) AS rank,
        w.user_id,
        w.xp_earned AS xp
      FROM weekly_xp w
      WHERE w.week_start = date_trunc('week', now())::DATE
    ) r WHERE r.user_id = p_user_id;
  ELSE
    RETURN QUERY
    SELECT r.rank, r.xp FROM (
      SELECT
        ROW_NUMBER() OVER (ORDER BY ux.total_xp DESC) AS rank,
        ux.user_id,
        ux.total_xp AS xp
      FROM user_xp ux
    ) r WHERE r.user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
