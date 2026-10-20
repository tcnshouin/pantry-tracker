delete from grocery_list_item;
delete from batch;
delete from item;
delete from location_group;

alter table location_group drop constraint if exists location_group_user_id_fkey;
alter table item drop constraint if exists item_user_id_fkey;
alter table grocery_list_item drop constraint if exists grocery_list_item_user_id_fkey;

alter table location_group alter column user_id type uuid using null;
alter table item alter column user_id type uuid using null;
alter table grocery_list_item alter column user_id type uuid using null;

alter table grocery_list_item drop column purchased;

drop table app_user;

alter table category enable row level security;
alter table category_expiry_reference enable row level security;
alter table location_group enable row level security;
alter table item enable row level security;
alter table batch enable row level security;
alter table grocery_list_item enable row level security;
