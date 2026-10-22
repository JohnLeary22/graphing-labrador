-- Optional demo content for a fresh Supabase project. Contains no real student data.
insert into public.labs (id, name, description, mascot, sequence) values
  ('axis', 'Axis Lab', 'The Cartesian plane', 'Axis (Axel)', 1),
  ('slope', 'Slope Lab', 'Gradient and linear relationships', 'Slope (Slobber)', 2),
  ('vertex', 'Vertex Lab', 'Important graph features', 'Vertex (Tex)', 3),
  ('curve', 'Curve Lab', 'Non-linear relationships', 'Curve (Kirby)', 4),
  ('vector', 'Vector Lab', 'Applying graphing to problems', 'Vector (Hector)', 5)
on conflict do nothing;

insert into public.shop_items (id, name, category, price, asset, rarity) values
  ('neck-bandana', 'Grid Bandana', 'neckwear', 25, 'neck-bandana', 'common'),
  ('hat-beanie', 'Navy Beanie', 'hat', 40, 'hat-beanie', 'common'),
  ('hat-crown', 'Gradient Crown', 'hat', 300, 'hat-crown', 'epic')
on conflict do nothing;
