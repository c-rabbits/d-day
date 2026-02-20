-- D-Day 앱 MVP 스키마
-- Supabase 대시보드 > SQL Editor에서 실행하세요.

-- 계약 카테고리 enum
CREATE TYPE contract_category AS ENUM (
  'RENT',
  'PHONE',
  'CAR_INSURANCE',
  'GYM',
  'RENTAL',
  'STREAMING',
  'OTHER'
);

-- contracts 테이블 (soft delete: deleted_at)
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category contract_category NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount NUMERIC(12, 2),
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 만료일 오름차순 인덱스 (목록 조회용)
CREATE INDEX idx_contracts_user_end_date ON contracts (user_id, end_date ASC)
  WHERE deleted_at IS NULL;

-- notifications 테이블 (알림 스케줄: D-30, D-7, D-1)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  notify_days_before INTEGER NOT NULL CHECK (notify_days_before IN (30, 7, 1)),
  is_sent BOOLEAN NOT NULL DEFAULT false,
  scheduled_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (contract_id, notify_days_before)
);

CREATE INDEX idx_notifications_scheduled_sent ON notifications (scheduled_date, is_sent)
  WHERE is_sent = false;

-- RLS 활성화
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- contracts: 본인만 조회/삽입/수정 (soft delete만 허용)
CREATE POLICY "Users can view own contracts"
  ON contracts FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own contracts"
  ON contracts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contracts"
  ON contracts FOR UPDATE
  USING (auth.uid() = user_id);

-- notifications: contract 소유자만 접근 (contracts 조인으로 보장)
CREATE POLICY "Users can view notifications for own contracts"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.id = notifications.contract_id
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
  );

CREATE POLICY "Users can insert notifications for own contracts"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.id = notifications.contract_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update notifications for own contracts"
  ON notifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.id = notifications.contract_id
        AND c.user_id = auth.uid()
    )
  );

-- updated_at 자동 갱신 (contracts)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
