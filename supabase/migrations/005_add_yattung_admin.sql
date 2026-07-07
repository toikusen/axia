insert into admin_whitelist (email) values ('yattung1222@gmail.com')
on conflict (email) do nothing;
