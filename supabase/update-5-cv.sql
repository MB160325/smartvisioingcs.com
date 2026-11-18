-- شغّل مرة واحدة في Supabase → SQL Editor (بعد الملفات السابقة)
-- يضيف رفع السيرة الذاتية (CV) لطلبات التوظيف، في مخزن خاص لا يراه إلا فريق العمل.

alter table requests add column if not exists attachment_path text check (char_length(attachment_path) <= 300);
alter table requests add column if not exists attachment_name text check (char_length(attachment_name) <= 200);

-- مخزن خاص (غير عام) للسير الذاتية: PDF أو Word حتى 5 ميغابايت
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cvs', 'cvs', false, 5242880,
  array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update
  set public = false, file_size_limit = 5242880,
      allowed_mime_types = array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

drop policy if exists "cvs public upload" on storage.objects;
drop policy if exists "cvs staff read" on storage.objects;
drop policy if exists "cvs admin delete" on storage.objects;
-- أي زائر يستطيع رفع ملف داخل مجلد cv/ فقط (لا يستطيع القراءة ولا الحذف)
create policy "cvs public upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'cvs' and name like 'cv/%');
-- يقرأها فريق العمل فقط
create policy "cvs staff read" on storage.objects for select to authenticated
  using (bucket_id = 'cvs' and is_staff());
create policy "cvs admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'cvs' and is_admin());
