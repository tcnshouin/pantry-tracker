alter table category drop constraint if exists category_name_key;
alter table category add column user_id uuid;
alter table category add column group_name varchar(60);
alter table category add column shelf_life_days integer;

update category c set shelf_life_days = r.lower_bound_shelf_life_days
from category_expiry_reference r where r.category_id = c.id;

drop table category_expiry_reference;

update category c set name = v.new_name, group_name = v.group_name
from (values
    ('Canned goods (vegetables, beans, soup)', 'Canned vegetables & beans', 'Canned Goods'),
    ('Pasta, dry', 'Pasta, dry', 'Noodles & Pasta'),
    ('Rice, white', 'Rice', 'Rice & Grains'),
    ('Cereal, unopened', 'Cereal & oats', 'Rice & Grains'),
    ('Crackers / biscuits', 'Crackers & biscuits', 'Snacks'),
    ('Bread (pantry-stored)', 'Bread', 'Bread'),
    ('Flour, all-purpose', 'Flour', 'Baking'),
    ('Sugar, granulated', 'Sugar', 'Baking'),
    ('Cooking oil', 'Cooking oil', 'Cooking Essentials'),
    ('Peanut butter, unopened', 'Peanut butter', 'Spreads'),
    ('Coffee, ground, unopened', 'Coffee, ground', 'Beverages'),
    ('Dried beans / lentils', 'Dried beans & lentils', 'Rice & Grains'),
    ('Spices, ground', 'Spices, ground', 'Seasonings & Spices'),
    ('Instant noodles', 'Instant noodles', 'Noodles & Pasta'),
    ('Condiments / sauces, unopened', 'Condiments & sauces', 'Condiments & Sauces')
) as v (old_name, new_name, group_name)
where c.name = v.old_name;

insert into category (name, group_name, shelf_life_days) values
    ('Canned meat', 'Canned Goods', 1095),
    ('Canned fish', 'Canned Goods', 1095),
    ('Canned fruit', 'Canned Goods', 730),
    ('Canned soups', 'Canned Goods', 730),
    ('Canned ready meals', 'Canned Goods', 730),
    ('Canned coconut milk & cream', 'Canned Goods', 365),
    ('Cup noodles', 'Noodles & Pasta', 180),
    ('Dried egg noodles', 'Noodles & Pasta', 365),
    ('Rice & glass noodles', 'Noodles & Pasta', 365),
    ('Glutinous rice', 'Rice & Grains', 365),
    ('Corn & cornmeal', 'Rice & Grains', 365),
    ('Breadcrumbs & breading mixes', 'Rice & Grains', 180),
    ('Evaporated & condensed milk', 'Milk & Dairy', 365),
    ('Powdered milk', 'Milk & Dairy', 365),
    ('Boxed (UHT) milk', 'Milk & Dairy', 180),
    ('Coffee creamer', 'Milk & Dairy', 365),
    ('Processed cheese', 'Milk & Dairy', 180),
    ('All-purpose & cooking cream', 'Milk & Dairy', 365),
    ('Instant coffee & coffee mixes', 'Beverages', 365),
    ('Tea', 'Beverages', 730),
    ('Chocolate & malt drinks', 'Beverages', 365),
    ('Powdered juice drinks', 'Beverages', 365),
    ('Boxed & canned juices', 'Beverages', 365),
    ('Soft drinks', 'Beverages', 270),
    ('Energy & sports drinks', 'Beverages', 270),
    ('Bottled water', 'Beverages', 730),
    ('Soy sauce & vinegar', 'Condiments & Sauces', 730),
    ('Fish sauce & shrimp paste', 'Condiments & Sauces', 365),
    ('Ketchup & tomato sauce', 'Condiments & Sauces', 365),
    ('Oyster & stir-fry sauces', 'Condiments & Sauces', 365),
    ('Hot sauce & chili', 'Condiments & Sauces', 730),
    ('Mayonnaise & dressings', 'Condiments & Sauces', 180),
    ('Pickles & relish', 'Condiments & Sauces', 365),
    ('Salt', 'Seasonings & Spices', 1825),
    ('Pepper', 'Seasonings & Spices', 730),
    ('Seasoning mixes & soup bases', 'Seasonings & Spices', 365),
    ('Stock & bouillon cubes', 'Seasonings & Spices', 365),
    ('Seasoning granules', 'Seasonings & Spices', 730),
    ('Dried herbs & bay leaves', 'Seasonings & Spices', 730),
    ('Margarine & butter', 'Cooking Essentials', 180),
    ('Shortening & lard', 'Cooking Essentials', 365),
    ('Cooking wine & vinegar blends', 'Cooking Essentials', 730),
    ('Brown sugar', 'Baking', 730),
    ('Baking powder, soda & yeast', 'Baking', 365),
    ('Cornstarch & thickeners', 'Baking', 730),
    ('Cake & dessert mixes', 'Baking', 365),
    ('Gelatin & jelly powder', 'Baking', 730),
    ('Cocoa powder', 'Baking', 730),
    ('Syrups & honey', 'Baking', 730),
    ('Food coloring & flavoring', 'Baking', 730),
    ('Jams & fruit preserves', 'Spreads', 365),
    ('Sandwich spreads', 'Spreads', 365),
    ('Chocolate & hazelnut spreads', 'Spreads', 365),
    ('Coconut jam & local spreads', 'Spreads', 180),
    ('Cookies & wafers', 'Snacks', 180),
    ('Chips & junk food', 'Snacks', 60),
    ('Nuts & seeds', 'Snacks', 180),
    ('Dried fruit', 'Snacks', 180),
    ('Chocolates', 'Snacks', 365),
    ('Candies & sweets', 'Snacks', 365),
    ('Popcorn & corn snacks', 'Snacks', 180),
    ('Buns & rolls', 'Bread', 3),
    ('Tortillas & wraps', 'Bread', 14),
    ('Toasted bread & biscotti', 'Bread', 90),
    ('Dried fish', 'Dried & Preserved', 90),
    ('Dried squid & shrimp', 'Dried & Preserved', 90),
    ('Salted eggs', 'Dried & Preserved', 21),
    ('Preserved fruits & sweets', 'Dried & Preserved', 365),
    ('Eggs', 'Eggs & Produce', 21),
    ('Garlic & onions', 'Eggs & Produce', 30),
    ('Potatoes & root crops', 'Eggs & Produce', 14),
    ('Ginger', 'Eggs & Produce', 21),
    ('Infant formula', 'Baby & Special Diet', 365),
    ('Baby food & cereal', 'Baby & Special Diet', 365),
    ('Nutritional & protein drinks', 'Baby & Special Diet', 365),
    ('Others', 'Others', null);

create unique index ux_category_user_name on category (user_id, lower(name));

insert into category (user_id, name, group_name, shelf_life_days)
select u.user_id, t.name, t.group_name, t.shelf_life_days
from (select distinct user_id from location_group) u
cross join category t
where t.user_id is null;

update item i set category_id = mine.id
from category t
join category mine on mine.user_id is not null and mine.name = t.name
where i.category_id = t.id
  and t.user_id is null
  and mine.user_id = i.user_id;
