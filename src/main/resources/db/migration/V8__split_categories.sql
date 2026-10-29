create sequence shared_category_id_seq;
select setval('shared_category_id_seq', (select coalesce(max(id), 0) + 1 from category), false);

create table universal_category (
    id              bigint primary key default nextval('shared_category_id_seq'),
    name            varchar(120) not null,
    group_name      varchar(60),
    shelf_life_days integer
);

create unique index ux_universal_category_name on universal_category (lower(name));

insert into universal_category (id, name, group_name, shelf_life_days)
select id, name, group_name, shelf_life_days from category where user_id is null;

create table user_category (
    id              bigint primary key default nextval('shared_category_id_seq'),
    user_id         uuid not null,
    name            varchar(120) not null,
    group_name      varchar(60),
    shelf_life_days integer
);

create unique index ux_user_category_user_name on user_category (user_id, lower(name));

insert into user_category (id, user_id, name, group_name, shelf_life_days)
select c.id, c.user_id, c.name, c.group_name, c.shelf_life_days
from category c
where c.user_id is not null
  and not exists (select 1 from universal_category u where lower(u.name) = lower(c.name));

alter table item add column universal_category_id bigint references universal_category (id);
alter table item add column user_category_id bigint references user_category (id);

update item i set user_category_id = i.category_id
where exists (select 1 from user_category uc where uc.id = i.category_id);

update item i set universal_category_id = u.id
from category c
join universal_category u on lower(u.name) = lower(c.name)
where i.category_id = c.id
  and i.user_category_id is null;

alter table item drop column category_id;
alter table item add constraint item_one_category
    check (num_nonnulls(universal_category_id, user_category_id) = 1);

create index idx_item_universal_category on item (universal_category_id);
create index idx_item_user_category on item (user_category_id);

drop table category;

alter table universal_category enable row level security;
alter table user_category enable row level security;

create function refuse_universal_category_change() returns trigger language plpgsql as $$
begin
    raise exception 'Universal categories are read-only. Change them with a migration.';
end;
$$;

create trigger universal_category_read_only
    before update or delete or truncate on universal_category
    for each statement execute function refuse_universal_category_change();
