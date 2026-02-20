-- 매일 새벽에 send-daily-notifications Edge Function 호출
-- Supabase 대시보드 > SQL Editor에서 실행 전, 아래 YOUR_ANON_OR_SERVICE_KEY를
-- 프로젝트 설정 > API > anon key(또는 service_role key)로 바꾸세요.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'dday-daily-notifications',
  '10 15 * * *',  -- 매일 00:10 KST (UTC 15:10)
  $$
  select net.http_post(
    url := 'https://dndeetveclyakyhmkcbt.supabase.co/functions/v1/send-daily-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_OR_SERVICE_KEY'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- 등록된 작업 확인: select * from cron.job;
-- 삭제: select cron.unschedule('dday-daily-notifications');
