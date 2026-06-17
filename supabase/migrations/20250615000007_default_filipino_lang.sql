alter table public.profiles alter column preferred_lang set default 'tl';

update public.profiles
set preferred_lang = 'tl'
where preferred_lang = 'en';
