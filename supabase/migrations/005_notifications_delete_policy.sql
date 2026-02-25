-- 계약 수정 시 기존 알림을 지우고 다시 넣을 수 있도록 DELETE 정책 추가
CREATE POLICY "Users can delete notifications for own contracts"
  ON notifications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.id = notifications.contract_id
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
  );
