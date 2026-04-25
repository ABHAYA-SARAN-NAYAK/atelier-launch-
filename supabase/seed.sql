-- ============================================================================
-- ATELIER LAUNCH — Seed Data
-- ============================================================================
-- Sample data for development & testing
-- NOTE: In production, users should be created via Supabase Auth (signup API).
--       These inserts use static UUIDs for cross-referencing.
-- ============================================================================

-- =============================================
-- DESIGNERS (5 verified designers)
-- =============================================
INSERT INTO users (id, email, password_hash, user_type, full_name, profile_image_url) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'elena.rivers@parsons.edu',     '$2a$10$placeholder_hash_1', 'student',      'Elena Rivers',    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'),
  ('d0000002-0000-0000-0000-000000000002', 'james.okonkwo@csm.arts.ac.uk', '$2a$10$placeholder_hash_2', 'pro_designer',  'James Okonkwo',   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'),
  ('d0000003-0000-0000-0000-000000000003', 'sofia.chen@fitnyc.edu',        '$2a$10$placeholder_hash_3', 'student',      'Sofia Chen',      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'),
  ('d0000004-0000-0000-0000-000000000004', 'marcus.lane@risd.edu',         '$2a$10$placeholder_hash_4', 'student',      'Marcus Lane',     'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200'),
  ('d0000005-0000-0000-0000-000000000005', 'yuki.tanaka@bunka.ac.jp',      '$2a$10$placeholder_hash_5', 'pro_designer',  'Yuki Tanaka',     'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200');

-- =============================================
-- DESIGNER PROFILES
-- =============================================
INSERT INTO designer_profiles (id, user_id, school_name, graduation_year, verification_status, specialization, bio, instagram_handle, portfolio_images) VALUES
  ('p0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'Parsons School of Design',  2025, 'verified', 'womenswear',   'Exploring the intersection of architecture and draping. Every silhouette tells a story of structure meeting fluidity.', '@elena.rivers.design', '["https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600","https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600"]'),
  ('p0000002-0000-0000-0000-000000000002', 'd0000002-0000-0000-0000-000000000002', 'Central Saint Martins',     2024, 'verified', 'menswear',     'London-based menswear designer blending West African textiles with contemporary British tailoring.', '@jamesokonkwo', '["https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=600","https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"]'),
  ('p0000003-0000-0000-0000-000000000003', 'd0000003-0000-0000-0000-000000000003', 'FIT New York',              2026, 'verified', 'accessories',   'Handcrafted jewelry and accessories inspired by Chinese calligraphy and modern minimalism.', '@sofiaachendesign', '["https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600"]'),
  ('p0000004-0000-0000-0000-000000000004', 'd0000004-0000-0000-0000-000000000004', 'RISD',                      2025, 'verified', 'streetwear',    'Redefining streetwear through sustainable materials and graphic storytelling. Art meets the sidewalk.', '@marcus.lane.strt', '["https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600","https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600"]'),
  ('p0000005-0000-0000-0000-000000000005', 'd0000005-0000-0000-0000-000000000005', 'Bunka Fashion College',     2024, 'verified', 'avant_garde',   'Pushing boundaries between fashion and sculpture. Tokyo-born, world-inspired.', '@yukitanaka_avantgarde', '["https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600"]');

-- =============================================
-- BUYERS (3 sample buyers)
-- =============================================
INSERT INTO users (id, email, password_hash, user_type, full_name, profile_image_url) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'alex.buyer@gmail.com',   '$2a$10$placeholder_hash_b1', 'buyer', 'Alex Johnson',    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200'),
  ('b0000002-0000-0000-0000-000000000002', 'maya.shopper@gmail.com', '$2a$10$placeholder_hash_b2', 'buyer', 'Maya Washington', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200'),
  ('b0000003-0000-0000-0000-000000000003', 'lucas.style@gmail.com',  '$2a$10$placeholder_hash_b3', 'buyer', 'Lucas Herrera',   'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200');

-- =============================================
-- COLLECTIONS (10 total: 2 per designer, mixed statuses)
-- =============================================
INSERT INTO collections (id, designer_id, title, description, drop_start_date, drop_end_date, status) VALUES
  -- Elena Rivers (Parsons) — 2 collections
  ('c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'Metamorphosis SS25', 'A transformative collection exploring the boundary between structured tailoring and organic forms. Each piece deconstructs traditional silhouettes.', now() - INTERVAL '12 hours', now() + INTERVAL '60 hours', 'live'),
  ('c0000002-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000001', 'Urban Chrysalis', 'Pre-fall collection inspired by the architecture of chrysalis cocoons. Cocoon-wrap coats meet angular dresses in a palette of muted earth tones.', now() + INTERVAL '7 days', now() + INTERVAL '10 days', 'draft'),

  -- James Okonkwo (CSM) — 2 collections
  ('c0000003-0000-0000-0000-000000000003', 'd0000002-0000-0000-0000-000000000002', 'Heritage Modern', 'West African adinkra symbols reimagined through contemporary menswear. Hand-printed fabrics meet sharp London tailoring.', now() - INTERVAL '24 hours', now() + INTERVAL '48 hours', 'live'),
  ('c0000004-0000-0000-0000-000000000004', 'd0000002-0000-0000-0000-000000000002', 'Midnight Lagos', 'An evening wear collection inspired by the vibrant nightlife of Lagos. Deep indigo dyes, metallic accents, and fluid forms.', now() - INTERVAL '5 days', now() - INTERVAL '2 days', 'ended'),

  -- Sofia Chen (FIT) — 2 collections
  ('c0000005-0000-0000-0000-000000000005', 'd0000003-0000-0000-0000-000000000003', 'Ink & Gold', 'Jewelry collection where each piece is a wearable poem — gold-plated brass meets hand-engraved Chinese calligraphy.', now() - INTERVAL '6 hours', now() + INTERVAL '66 hours', 'live'),
  ('c0000006-0000-0000-0000-000000000006', 'd0000003-0000-0000-0000-000000000003', 'Paper Garden', 'Origami-inspired accessories crafted from recycled silver. Delicate, geometric, and zero-waste.', now() + INTERVAL '14 days', now() + INTERVAL '17 days', 'draft'),

  -- Marcus Lane (RISD) — 2 collections
  ('c0000007-0000-0000-0000-000000000007', 'd0000004-0000-0000-0000-000000000004', 'Concrete Jungle 01', 'Streetwear capsule made entirely from organic cotton and recycled polyester. Bold graphics inspired by urban murals.', now() - INTERVAL '36 hours', now() + INTERVAL '36 hours', 'live'),
  ('c0000008-0000-0000-0000-000000000008', 'd0000004-0000-0000-0000-000000000004', 'Neon Archive', 'A retrospective streetwear drop exploring 90s rave culture through sustainable production methods.', now() - INTERVAL '8 days', now() - INTERVAL '5 days', 'ended'),

  -- Yuki Tanaka (Bunka) — 2 collections
  ('c0000009-0000-0000-0000-000000000009', 'd0000005-0000-0000-0000-000000000005', 'Void / Form', 'Sculptural garments exploring negative space. Architectural pieces that challenge the relationship between body and fabric.', now() - INTERVAL '1 hour', now() + INTERVAL '71 hours', 'live'),
  ('c0000010-0000-0000-0000-000000000010', 'd0000005-0000-0000-0000-000000000005', 'Digital Kimono', 'Traditional kimono construction meets 3D-printed components. A conversation between ancient craft and future technology.', now() - INTERVAL '10 days', now() - INTERVAL '7 days', 'ended');

-- =============================================
-- PRODUCTS (30 total: 3 per collection)
-- =============================================

-- Elena Rivers — Metamorphosis SS25 (live)
INSERT INTO products (id, collection_id, name, description, price, quantity_available, sizes_available, primary_image_url, materials_used, care_instructions, status) VALUES
  ('pr000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Chrysalis Wrap Dress', 'Flowing silk wrap dress with asymmetric hem and sculptural shoulder detail.', 285.00, 8, '["XS","S","M","L"]', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', '100% Mulberry Silk', 'Dry clean only', 'available'),
  ('pr000002-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'Architect Blazer', 'Structured blazer with exaggerated lapels and origami-fold pockets. Unlined for a deconstructed feel.', 350.00, 5, '["S","M","L","XL"]', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600', 'Italian Wool Blend', 'Dry clean recommended', 'available'),
  ('pr000003-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', 'Pleated Column Skirt', 'Floor-length pleated skirt in heavyweight crepe. Movement-driven design.', 195.00, 12, '["XS","S","M","L","XL"]', 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600', 'Japanese Crepe', 'Hand wash cold, hang dry', 'available');

-- Elena Rivers — Urban Chrysalis (draft)
INSERT INTO products (id, collection_id, name, description, price, quantity_available, sizes_available, primary_image_url, materials_used, care_instructions, status) VALUES
  ('pr000004-0000-0000-0000-000000000004', 'c0000002-0000-0000-0000-000000000002', 'Cocoon Overcoat', 'Oversized cocoon-silhouette coat in undyed organic wool. Statement piece.', 450.00, 6, '["S","M","L"]', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600', 'Undyed Organic Wool', 'Professional clean only', 'available'),
  ('pr000005-0000-0000-0000-000000000005', 'c0000002-0000-0000-0000-000000000002', 'Angular Midi Dress', 'Geometric panel dress with contrasting seam details in earth tones.', 275.00, 10, '["XS","S","M","L"]', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600', 'Organic Cotton Twill', 'Machine wash cold', 'available'),
  ('pr000006-0000-0000-0000-000000000006', 'c0000002-0000-0000-0000-000000000002', 'Terra Knit Top', 'Ribbed knit top in terracotta with asymmetric neckline.', 120.00, 15, '["XS","S","M","L","XL"]', 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a10?w=600', 'Merino Wool Blend', 'Hand wash, lay flat to dry', 'available');

-- James Okonkwo — Heritage Modern (live)
INSERT INTO products (id, collection_id, name, description, price, quantity_available, sizes_available, primary_image_url, materials_used, care_instructions, status) VALUES
  ('pr000007-0000-0000-0000-000000000007', 'c0000003-0000-0000-0000-000000000003', 'Adinkra Print Shirt', 'Relaxed-fit shirt with hand-stamped adinkra symbols on organic cotton.', 165.00, 10, '["S","M","L","XL","XXL"]', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600', 'Hand-Printed Organic Cotton', 'Machine wash cold, inside out', 'available'),
  ('pr000008-0000-0000-0000-000000000008', 'c0000003-0000-0000-0000-000000000003', 'Savile Row Trouser', 'Slim-fit trouser in navy with subtle adinkra embroidery on the pocket.', 225.00, 7, '["28","30","32","34","36"]', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600', 'English Worsted Wool', 'Dry clean only', 'available'),
  ('pr000009-0000-0000-0000-000000000009', 'c0000003-0000-0000-0000-000000000003', 'Kente-Lined Bomber', 'Minimalist black bomber jacket with Kente cloth interior lining. Secret heritage.', 395.00, 4, '["S","M","L","XL"]', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600', 'Japanese Nylon (exterior), Kente Cloth (lining)', 'Spot clean exterior, dry clean if needed', 'available');

-- James Okonkwo — Midnight Lagos (ended)
INSERT INTO products (id, collection_id, name, description, price, quantity_available, sizes_available, primary_image_url, materials_used, care_instructions, status) VALUES
  ('pr000010-0000-0000-0000-000000000010', 'c0000004-0000-0000-0000-000000000004', 'Indigo Agbada Set', 'Three-piece agbada set in hand-dyed indigo. Modern proportions meet traditional grandeur.', 500.00, 0, '["M","L","XL"]', 'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=600', 'Hand-Dyed Indigo Cotton', 'Dry clean only', 'sold_out'),
  ('pr000011-0000-0000-0000-000000000011', 'c0000004-0000-0000-0000-000000000004', 'Lagos Night Jacket', 'Metallic-thread embroidered evening jacket in deep midnight blue.', 380.00, 2, '["S","M","L"]', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600', 'Silk Blend with Metallic Thread', 'Professional clean only', 'available'),
  ('pr000012-0000-0000-0000-000000000012', 'c0000004-0000-0000-0000-000000000004', 'Velvet Dress Shirt', 'Rich velvet dress shirt in deep wine with mother-of-pearl buttons.', 195.00, 0, '["S","M","L","XL"]', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600', 'Italian Velvet', 'Dry clean only', 'sold_out');

-- Sofia Chen — Ink & Gold (live)
INSERT INTO products (id, collection_id, name, description, price, quantity_available, sizes_available, primary_image_url, materials_used, care_instructions, status) VALUES
  ('pr000013-0000-0000-0000-000000000013', 'c0000005-0000-0000-0000-000000000005', 'Calligraphy Cuff', 'Gold-plated brass cuff with hand-engraved poem excerpt in running script.', 85.00, 20, '["One Size"]', 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600', 'Gold-Plated Brass', 'Avoid water, polish with soft cloth', 'available'),
  ('pr000014-0000-0000-0000-000000000014', 'c0000005-0000-0000-0000-000000000005', 'Ink Drop Earrings', 'Asymmetric drop earrings shaped like ink drops. Sterling silver with gold wash.', 65.00, 15, '["One Size"]', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600', 'Sterling Silver, 18K Gold Wash', 'Store in jewelry box, avoid chemicals', 'available'),
  ('pr000015-0000-0000-0000-000000000015', 'c0000005-0000-0000-0000-000000000005', 'Scroll Pendant Necklace', 'Delicate chain necklace with rolled scroll pendant containing a hidden poem.', 120.00, 10, '["16 inch","18 inch","20 inch"]', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600', '14K Gold Fill', 'Clean with mild soap and water', 'available');

-- Sofia Chen — Paper Garden (draft)
INSERT INTO products (id, collection_id, name, description, price, quantity_available, sizes_available, primary_image_url, materials_used, care_instructions, status) VALUES
  ('pr000016-0000-0000-0000-000000000016', 'c0000006-0000-0000-0000-000000000006', 'Origami Rose Ring', 'Sculptural ring featuring a miniature origami rose in recycled silver.', 95.00, 18, '["5","6","7","8","9"]', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600', 'Recycled Sterling Silver', 'Polish regularly, avoid harsh chemicals', 'available'),
  ('pr000017-0000-0000-0000-000000000017', 'c0000006-0000-0000-0000-000000000006', 'Crane Brooch', 'Origami crane brooch with articulated wings. Each one slightly unique.', 55.00, 25, '["One Size"]', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600', 'Recycled Silver', 'Handle with care, store flat', 'available'),
  ('pr000018-0000-0000-0000-000000000018', 'c0000006-0000-0000-0000-000000000006', 'Fold Bangle Set', 'Set of 3 geometric bangles with folded geometric facets.', 140.00, 12, '["S/M","M/L"]', 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600', 'Recycled Sterling Silver', 'Wipe clean with soft cloth', 'available');

-- Marcus Lane — Concrete Jungle 01 (live)
INSERT INTO products (id, collection_id, name, description, price, quantity_available, sizes_available, primary_image_url, materials_used, care_instructions, status) VALUES
  ('pr000019-0000-0000-0000-000000000019', 'c0000007-0000-0000-0000-000000000007', 'Mural Graphic Hoodie', 'Oversized hoodie with all-over print inspired by Providence street art. Heavy 380gsm cotton.', 135.00, 15, '["S","M","L","XL","XXL"]', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', '100% Organic Cotton 380gsm', 'Machine wash cold, tumble dry low', 'available'),
  ('pr000020-0000-0000-0000-000000000020', 'c0000007-0000-0000-0000-000000000007', 'Recycled Cargo Pants', 'Wide-leg cargo pants made from recycled polyester. 6 utility pockets, adjustable hem.', 165.00, 10, '["28","30","32","34","36"]', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600', '100% Recycled Polyester', 'Machine wash cold', 'available'),
  ('pr000021-0000-0000-0000-000000000021', 'c0000007-0000-0000-0000-000000000007', 'Block Print Tee', 'Boxy-fit tee with hand-carved block print graphic. Limited to 20 pieces.', 75.00, 20, '["S","M","L","XL"]', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600', 'Organic Cotton', 'Machine wash cold, inside out', 'available');

-- Marcus Lane — Neon Archive (ended)
INSERT INTO products (id, collection_id, name, description, price, quantity_available, sizes_available, primary_image_url, materials_used, care_instructions, status) VALUES
  ('pr000022-0000-0000-0000-000000000022', 'c0000008-0000-0000-0000-000000000008', 'Rave Revival Jacket', 'Reflective jacket with removable hood. Neon orange accents. Y2K meets sustainability.', 220.00, 0, '["S","M","L","XL"]', 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600', 'Recycled Nylon, Reflective Tape', 'Spot clean, no machine wash', 'sold_out'),
  ('pr000023-0000-0000-0000-000000000023', 'c0000008-0000-0000-0000-000000000008', 'Glow Shorts', 'UV-reactive drawstring shorts. Glow under blacklight for festival season.', 85.00, 3, '["S","M","L"]', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600', 'UV-Reactive Cotton Blend', 'Hand wash cold', 'available'),
  ('pr000024-0000-0000-0000-000000000024', 'c0000008-0000-0000-0000-000000000008', 'Acid Graphic Longsleeve', 'Acid-wash longsleeve with vintage rave flyer collage print.', 95.00, 0, '["S","M","L","XL"]', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600', 'Organic Cotton, Acid Wash', 'Machine wash cold, inside out', 'sold_out');

-- Yuki Tanaka — Void / Form (live)
INSERT INTO products (id, collection_id, name, description, price, quantity_available, sizes_available, primary_image_url, materials_used, care_instructions, status) VALUES
  ('pr000025-0000-0000-0000-000000000025', 'c0000009-0000-0000-0000-000000000009', 'Negative Space Cape', 'Sculptural cape with strategic cutouts creating a play of light and shadow.', 480.00, 3, '["One Size"]', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600', 'Bonded Neoprene, Silk Lining', 'Professional clean only', 'available'),
  ('pr000026-0000-0000-0000-000000000026', 'c0000009-0000-0000-0000-000000000009', 'Void Corset Top', 'Architectural corset with 3D-molded panels. Boneless construction uses fabric tension.', 320.00, 5, '["XS","S","M","L"]', 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600', 'Structured Duchesse Satin', 'Dry clean only', 'available'),
  ('pr000027-0000-0000-0000-000000000027', 'c0000009-0000-0000-0000-000000000009', 'Form Trousers', 'Wide-leg trousers with sculptural pleating that creates a volumetric silhouette.', 260.00, 7, '["XS","S","M","L","XL"]', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600', 'Japanese Wool Crepe', 'Dry clean recommended', 'available');

-- Yuki Tanaka — Digital Kimono (ended)
INSERT INTO products (id, collection_id, name, description, price, quantity_available, sizes_available, primary_image_url, materials_used, care_instructions, status) VALUES
  ('pr000028-0000-0000-0000-000000000028', 'c0000010-0000-0000-0000-000000000010', 'Neo-Kimono Jacket', 'Traditional kimono proportions with 3D-printed resin closures. Future-craft.', 420.00, 0, '["S/M","L/XL"]', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600', 'Silk Kimono Fabric, 3D-Printed PLA Resin', 'Professional clean only, remove resin pieces', 'sold_out'),
  ('pr000029-0000-0000-0000-000000000029', 'c0000010-0000-0000-0000-000000000010', 'Circuit Obi Belt', 'Wide obi-style belt with embedded LED circuit pattern (non-functional art piece).', 180.00, 2, '["One Size"]', 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600', 'Brocade Fabric, PCB Art Panels', 'Handle with care, spot clean only', 'available'),
  ('pr000030-0000-0000-0000-000000000030', 'c0000010-0000-0000-0000-000000000010', 'Pixel Haori', 'Short haori jacket with pixelated traditional pattern created using jacquard weaving.', 290.00, 0, '["One Size"]', 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600', 'Jacquard-Woven Silk Blend', 'Dry clean only', 'sold_out');

-- =============================================
-- FOLLOWS
-- =============================================
INSERT INTO follows (follower_id, designer_id) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001'),
  ('b0000001-0000-0000-0000-000000000001', 'd0000002-0000-0000-0000-000000000002'),
  ('b0000001-0000-0000-0000-000000000001', 'd0000005-0000-0000-0000-000000000005'),
  ('b0000002-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000001'),
  ('b0000002-0000-0000-0000-000000000002', 'd0000003-0000-0000-0000-000000000003'),
  ('b0000002-0000-0000-0000-000000000002', 'd0000004-0000-0000-0000-000000000004'),
  ('b0000003-0000-0000-0000-000000000003', 'd0000002-0000-0000-0000-000000000002'),
  ('b0000003-0000-0000-0000-000000000003', 'd0000005-0000-0000-0000-000000000005'),
  ('b0000003-0000-0000-0000-000000000003', 'd0000003-0000-0000-0000-000000000003');

-- =============================================
-- ORDERS (sample order history)
-- =============================================
INSERT INTO orders (id, buyer_id, product_id, designer_id, quantity, total_amount, platform_commission, designer_payout, stripe_payment_id, shipping_address, status) VALUES
  -- Alex bought from Elena (student: 15% commission)
  ('o0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'pr000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 1, 285.00, 42.75, 242.25, 'pi_test_001', '{"street":"123 Fashion Ave","city":"New York","state":"NY","zip":"10001","country":"US"}', 'delivered'),

  -- Alex bought from James (pro: 10% commission)
  ('o0000002-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', 'pr000009-0000-0000-0000-000000000009', 'd0000002-0000-0000-0000-000000000002', 1, 395.00, 39.50, 355.50, 'pi_test_002', '{"street":"123 Fashion Ave","city":"New York","state":"NY","zip":"10001","country":"US"}', 'shipped'),

  -- Maya bought from Sofia (student: 15%)
  ('o0000003-0000-0000-0000-000000000003', 'b0000002-0000-0000-0000-000000000002', 'pr000013-0000-0000-0000-000000000013', 'd0000003-0000-0000-0000-000000000003', 2, 170.00, 25.50, 144.50, 'pi_test_003', '{"street":"456 Style St","city":"Los Angeles","state":"CA","zip":"90001","country":"US"}', 'paid'),

  -- Maya bought from Marcus (student: 15%)
  ('o0000004-0000-0000-0000-000000000004', 'b0000002-0000-0000-0000-000000000002', 'pr000019-0000-0000-0000-000000000019', 'd0000004-0000-0000-0000-000000000004', 1, 135.00, 20.25, 114.75, 'pi_test_004', '{"street":"456 Style St","city":"Los Angeles","state":"CA","zip":"90001","country":"US"}', 'delivered'),

  -- Lucas bought from Yuki (pro: 10%)
  ('o0000005-0000-0000-0000-000000000005', 'b0000003-0000-0000-0000-000000000003', 'pr000025-0000-0000-0000-000000000025', 'd0000005-0000-0000-0000-000000000005', 1, 480.00, 48.00, 432.00, 'pi_test_005', '{"street":"789 Couture Blvd","city":"Chicago","state":"IL","zip":"60601","country":"US"}', 'paid'),

  -- Lucas bought from James (ended collection - pro: 10%)
  ('o0000006-0000-0000-0000-000000000006', 'b0000003-0000-0000-0000-000000000003', 'pr000010-0000-0000-0000-000000000010', 'd0000002-0000-0000-0000-000000000002', 1, 500.00, 50.00, 450.00, 'pi_test_006', '{"street":"789 Couture Blvd","city":"Chicago","state":"IL","zip":"60601","country":"US"}', 'delivered');

-- =============================================
-- CART ITEMS (sample active carts)
-- =============================================
INSERT INTO cart_items (user_id, product_id, quantity, selected_size) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'pr000015-0000-0000-0000-000000000015', 1, '18 inch'),
  ('b0000001-0000-0000-0000-000000000001', 'pr000025-0000-0000-0000-000000000025', 1, 'One Size'),
  ('b0000002-0000-0000-0000-000000000002', 'pr000007-0000-0000-0000-000000000007', 1, 'L'),
  ('b0000003-0000-0000-0000-000000000003', 'pr000002-0000-0000-0000-000000000002', 1, 'M');
