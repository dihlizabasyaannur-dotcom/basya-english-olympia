-- Run ONCE in Supabase Dashboard → SQL Editor, after Ma'am Basya has registered
-- on the website with her own email. Replace the email below first.
-- Every new account is a student; this promotes one account to Super Admin.
-- After this, all other role changes are done in the app (Admin → Users).
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'REPLACE-WITH-MAAM-BASYA-EMAIL@example.com');

-- Check: should return one row with role = admin
select p.full_name, p.role, u.email
from public.profiles p join auth.users u on u.id = p.id
where p.role = 'admin';
