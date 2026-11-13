-- شغّل مرة واحدة في Supabase → SQL Editor
-- 1) يُصلح تلقائياً حسابات الأدمن التي أُنشئت قبل تشغيل schema.sql (لا يكون لها سجل صلاحيات)
insert into profiles(id, email, role)
select u.id, u.email, 'admin'
from auth.users u join admin_emails a on lower(a.email) = lower(u.email)
on conflict (id) do update set role = 'admin', email = excluded.email;

-- 2) دالة تُصلح الصلاحية تلقائياً لحظة تسجيل الدخول إذا كان البريد ضمن قائمة الأدمن
create or replace function claim_profile() returns text
language plpgsql security definer set search_path = public as $$
declare e text; r text;
begin
  select email into e from auth.users where id = auth.uid();
  if e is null then return null; end if;
  insert into profiles(id, email, role)
  values (auth.uid(), e, case when exists (select 1 from admin_emails a where lower(a.email) = lower(e)) then 'admin' else 'pending' end)
  on conflict (id) do update
    set email = e,
        role = case when exists (select 1 from admin_emails a where lower(a.email) = lower(e)) then 'admin' else profiles.role end;
  select role into r from profiles where id = auth.uid();
  return r;
end $$;
revoke all on function claim_profile() from public, anon;
grant execute on function claim_profile() to authenticated;
