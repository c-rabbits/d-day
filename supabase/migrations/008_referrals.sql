-- 추천 코드 시스템
-- Supabase 대시보드 > SQL Editor에서 실행하세요.

-- ────────────────────────────────────────
-- 1. user_xp에 추천 코드 컬럼 추가
-- ────────────────────────────────────────
ALTER TABLE user_xp ADD COLUMN referral_code TEXT UNIQUE;

-- 기존 유저에게 추천 코드 생성
UPDATE user_xp
SET referral_code = UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6))
WHERE referral_code IS NULL;

-- NOT NULL 제약 추가
ALTER TABLE user_xp ALTER COLUMN referral_code SET NOT NULL;

-- 기본값: 새 유저 INSERT 시 자동 생성
ALTER TABLE user_xp ALTER COLUMN referral_code SET DEFAULT UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6));

-- ────────────────────────────────────────
-- 2. referrals 테이블: 추천 기록
-- ────────────────────────────────────────
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_awarded INTEGER NOT NULL DEFAULT 500,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (referred_id) -- 한 유저는 한 번만 추천 받을 수 있음
);

CREATE INDEX idx_referrals_referrer ON referrals (referrer_id);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- 본인이 초대한/초대받은 기록만 조회
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- ────────────────────────────────────────
-- 3. 추천 처리 함수
-- 검증: 코드 유효성, 자기 자신 불가, 이미 추천 받음, 30명 제한
-- 보상: 양쪽 +500 XP
-- ────────────────────────────────────────
CREATE OR REPLACE FUNCTION process_referral(p_referred_id UUID, p_referral_code TEXT)
RETURNS JSON AS $$
DECLARE
  v_referrer_id UUID;
  v_referral_count INTEGER;
  v_result JSON;
BEGIN
  -- 추천 코드로 초대한 사람 찾기
  SELECT user_id INTO v_referrer_id
  FROM user_xp
  WHERE referral_code = UPPER(p_referral_code);

  IF v_referrer_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'INVALID_CODE');
  END IF;

  -- 자기 자신 추천 불가
  IF v_referrer_id = p_referred_id THEN
    RETURN json_build_object('success', false, 'error', 'SELF_REFERRAL');
  END IF;

  -- 이미 추천 받은 유저인지 확인
  IF EXISTS (SELECT 1 FROM referrals WHERE referred_id = p_referred_id) THEN
    RETURN json_build_object('success', false, 'error', 'ALREADY_REFERRED');
  END IF;

  -- 초대한 사람의 추천 횟수 확인 (최대 30명)
  SELECT COUNT(*) INTO v_referral_count
  FROM referrals WHERE referrer_id = v_referrer_id;

  IF v_referral_count >= 30 THEN
    RETURN json_build_object('success', false, 'error', 'REFERRER_LIMIT');
  END IF;

  -- 추천 기록 삽입
  INSERT INTO referrals (referrer_id, referred_id, xp_awarded)
  VALUES (v_referrer_id, p_referred_id, 500);

  -- 양쪽 +500 XP
  PERFORM add_user_xp(v_referrer_id, 500);
  PERFORM add_user_xp(p_referred_id, 500);

  -- 뱃지 체크
  PERFORM check_and_unlock_badges(v_referrer_id);
  PERFORM check_and_unlock_badges(p_referred_id);

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
