-- تعيين كلمة مرور لمستخدم موجود (إذا كان قد دُعي بالإيميل ولم يُنشئ كلمة مرور، أو نسيها)
-- غيّر البريد وكلمة المرور ثم شغّله في Supabase → SQL Editor
update auth.users
set encrypted_password = extensions.crypt('ضع-كلمة-مرور-قوية-هنا-مثل-Sv@2026xYz', extensions.gen_salt('bf')),
    email_confirmed_at = coalesce(email_confirmed_at, now())
where lower(email) = lower('بريدك@smartvisiongcs.com');
-- يجب أن تظهر نتيجة: UPDATE 1   (إذا ظهر UPDATE 0 فالبريد غير موجود في هذا المشروع)
