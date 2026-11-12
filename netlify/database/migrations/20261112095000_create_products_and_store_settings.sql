CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  description TEXT NOT NULL DEFAULT '',
  materials JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(materials) = 'array'),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold')),
  weight_grams INTEGER CHECK (weight_grams IS NULL OR weight_grams >= 0),
  image_path TEXT NOT NULL,
  image_alt TEXT NOT NULL DEFAULT '',
  rotation TEXT NOT NULL DEFAULT '0deg',
  extra_images JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(extra_images) = 'array'),
  video_path TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE store_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  pix_key TEXT NOT NULL DEFAULT '',
  pix_recipient TEXT NOT NULL DEFAULT '',
  origin_cep VARCHAR(9) NOT NULL DEFAULT '',
  box_length_cm NUMERIC(5, 1) NOT NULL DEFAULT 30,
  box_width_cm NUMERIC(5, 1) NOT NULL DEFAULT 28,
  box_height_cm NUMERIC(5, 1) NOT NULL DEFAULT 5,
  box_weight_grams INTEGER NOT NULL DEFAULT 35 CHECK (box_weight_grams >= 0),
  bags_per_box INTEGER NOT NULL DEFAULT 2 CHECK (bags_per_box >= 1),
  free_pac_item_threshold INTEGER NOT NULL DEFAULT 2 CHECK (free_pac_item_threshold >= 1),
  delivery_min_business_days INTEGER NOT NULL DEFAULT 7 CHECK (delivery_min_business_days >= 1),
  delivery_max_business_days INTEGER NOT NULL DEFAULT 15,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (delivery_max_business_days >= delivery_min_business_days)
);

INSERT INTO products (
  id, name, price, description, materials, image_path, image_alt, rotation, extra_images, video_path, sort_order
) VALUES
  ('bag-01', 'Bolsa Afrodite', 325, 'Bolsa de cetim, estruturada e forrada, com flores de tecido aplicadas e detalhes em crochê. Medidas: 32 cm × 27 cm.', '["Crochê","Bordado"]', '/images/bolsa-afrodite/frente.jpg', 'Bolsa Afrodite', '-2.5deg', '[{"src":"/images/bolsa-afrodite/dentro.jpg","label":"Parte interna"}]', NULL, 1),
  ('bag-02', 'Bolsa Anfitrite', 780, 'Bolsa de couro ecológico com tecido de feltro queimado, forrada e estruturada. Bordada com pedrarias, aplicações de metal e madeira e detalhes em crochê. Medidas: 48 cm × 52 cm.', '["Couro","Tecido pintado","Crochê","Bordado","Pedrarias","Metal","Madeira"]', '/images/bolsa-amfitrite/frente.jpg', 'Bolsa Anfitrite', '1.8deg', '[]', NULL, 2),
  ('bag-03', 'Bolsa Astraea', 385, 'Bolsa de crochê feita com barbante sustentável, forrada e estruturada. Bordada com miçangas, pedrarias e paetês, com fecho de pressão. Medidas: 38 cm × 32 cm.', '["Crochê","Bordado","Miçangas","Pedrarias","Paetês"]', '/images/bolsa-astraea/frente-uma-face.jpg', 'Bolsa Astraea', '-1.2deg', '[{"src":"/images/bolsa-astraea/frente-outra-face.jpg","label":"Outro lado da frente"},{"src":"/images/bolsa-astraea/lateral-esquerda.jpg","label":"Lateral esquerda"},{"src":"/images/bolsa-astraea/lateral-direita.jpg","label":"Lateral direita"},{"src":"/images/bolsa-astraea/dentro.jpg","label":"Parte interna"}]', NULL, 3),
  ('bag-04', 'Bolsa Atena', 285, 'Bolsa de renda guipir, forrada e estruturada, com alça de crochê e lenço de oncinha. Medidas: 30 cm × 38 cm.', '["Renda","Crochê"]', '/images/bolsa-atena/frente.jpg', 'Bolsa Atena', '2.6deg', '[]', NULL, 4),
  ('bag-05', 'Bolsa Demeter', 530, 'Bolsa de brim, forrada e estruturada, bordada com miçangas e paetês. Tem detalhes em crochê e alça de metal. Medidas: 48 cm × 56 cm.', '["Crochê","Brim","Miçangas","Paetês","Metal"]', '/images/bolsa-demeter/frente.jpg', 'Bolsa Demeter', '-2deg', '[{"src":"/images/bolsa-demeter/alca.jpg","label":"Detalhe da alça"}]', '/images/bolsa-demeter/video.mp4', 5),
  ('bag-06', 'Bolsa Eos', 285, 'Bolsa de renda fúcsia, forrada com cetim, com detalhes em crochê e alça de metal. Medidas: 43 cm × 40 cm.', '["Renda","Cetim","Crochê"]', '/images/bolsa-eos/frente.jpg', 'Bolsa Eos', '1.4deg', '[{"src":"/images/bolsa-eos/detalhe.jpg","label":"Detalhe"}]', '/images/bolsa-eos/video.mp4', 6),
  ('bag-07', 'Bolsa Eris', 245, 'Bolsa de seda pura, forrada com cetim e estruturada, com aplicação e alça em crochê e fecho de pressão. Medidas: 38 cm × 37 cm.', '["Seda","Cetim","Crochê"]', '/images/bolsa-eris/frente.jpg', 'Bolsa Eris', '-2.5deg', '[{"src":"/images/bolsa-eris/dentro.jpg","label":"Parte interna"}]', NULL, 7),
  ('bag-08', 'Bolsa Gaia', 415, 'Bolsa de linho pintada à mão e bordada, estruturada e forrada com cetim, com alça e aplicação em crochê e fecho de pressão. Medidas: 57 cm × 48 cm.', '["Linho","Cetim","Crochê"]', '/images/bolsa-gaia/frente.jpg', 'Bolsa Gaia', '1.8deg', '[{"src":"/images/bolsa-gaia/dentro.jpg","label":"Parte interna"}]', NULL, 8),
  ('bag-09', 'Bolsa Hebe', 315, 'Bolsa feita com uma mistura de tecidos de seda pura, forrada com cetim, com detalhe em crochê e alça de metal. Medidas: 37 cm × 38 cm.', '["Seda","Cetim","Crochê"]', '/images/bolsa-hebe/frente.jpg', 'Bolsa Hebe', '-1.2deg', '[]', '/images/bolsa-hebe/video.mp4', 9),
  ('bag-10', 'Bolsa Hecate', 265, 'Carteira de brim bordada com paetês, miçangas e pedrarias, forrada e estruturada, com fecho de pressão, detalhe em crochê e alça de metal. Medidas: 37 cm × 26 cm.', '["Brim","Paetês","Miçangas","Pedrarias","Crochê","Metal"]', '/images/bolsa-hecate/frente.jpg', 'Bolsa Hecate', '2.6deg', '[{"src":"/images/bolsa-hecate/atras.jpg","label":"Parte traseira"}]', NULL, 10),
  ('bag-11', 'Bolsa Hera', 385, 'Bolsa feita com uma mistura de crochê e tricô em fio náutico, forrada com cetim e com alça de bambu. Acompanha uma carteira de crochê para documentos. Medidas: 43 cm × 46 cm.', '["Crochê","Tricô","Cetim","Bambu"]', '/images/bolsa-hera/frente.jpg', 'Bolsa Hera', '-2deg', '[{"src":"/images/bolsa-hera/09cb73b7-2da8-4c66-bd7b-1b546d652e24.jpg","label":"Outra vista"}]', '/images/bolsa-hera/video.mp4', 11),
  ('bag-12', 'Bolsa Hestia', 175, 'Bolsa de cetim bordada, forrada com seda pura e estruturada, com fecho de pressão e alça de metal. Medidas: 23 cm × 22 cm.', '["Cetim","Seda","Metal"]', '/images/bolsa-hestia/frente.jpg', 'Bolsa Hestia', '1.4deg', '[]', '/images/bolsa-hestia/video.mp4', 12),
  ('bag-13', 'Bolsa Iris', 315, 'Bolsa de crochê feita com fios de malha e barbante sustentáveis, forrada e com fecho de pressão. Medidas: 40 cm × 48 cm.', '["Crochê","Barbante sustentável","Fios de malha sustentável"]', '/images/bolsa-iris/frente.jpg', 'Bolsa Iris', '-2.5deg', '[]', '/images/bolsa-iris/video.mp4', 13),
  ('bag-14', 'Bolsa Némesis', 215, 'Bolsa de cetim bordada, com aplicações de flores de tecido e alça de crochê. Medidas: 32 cm × 28 cm.', '["Cetim","Crochê","Aplicações de tecido"]', '/images/bolsa-nemesis/frente.jpg', 'Bolsa Némesis', '1.8deg', '[]', NULL, 14),
  ('bag-15', 'Bolsa Nyx', 315, 'Bolsa de crochê para usar atravessada (crossbody), bordada e forrada, com fecho de pressão. Medidas: 40 cm × 32 cm.', '["Crochê","Bordado","Fecho de pressão"]', '/images/bolsa-nyx/frente.jpg', 'Bolsa Nyx', '-1.2deg', '[]', NULL, 15),
  ('bag-16', 'Bolsa Perséfone', 365, 'Bolsa de algodão macio com estampa do mapa-múndi, bordada com orientações de navegação, forrada e estruturada. Tem detalhes em crochê, fecho de pressão e peixes feitos de miçangas. Medidas: 48 cm × 43 cm.', '["Algodão","Crochê","Bordado","Miçangas"]', '/images/bolsa-persefone/frente.jpg', 'Bolsa Perséfone', '2.6deg', '[{"src":"/images/bolsa-persefone/atras.jpg","label":"Parte traseira"},{"src":"/images/bolsa-persefone/lateral.jpg","label":"Vista lateral"}]', '/images/bolsa-persefone/video.mp4', 16),
  ('bag-17', 'Bolsa Selene', 285, 'Bolsa de brim pintada à mão e bordada, com aplicação de tecido estampado. Forrada e estruturada, tem detalhes e alça em crochê. Medidas: 40 cm × 38 cm.', '["Brim","Crochê","Bordado"]', '/images/bolsa-selene/frente.jpg', 'Bolsa Selene', '-2deg', '[]', '/images/bolsa-selene/video.mp4', 17),
  ('bag-18', 'Bolsa Têmis', 165, 'Bolsa de crochê feita com fios de malha e barbante sustentáveis, forrada e com fecho de pressão. Medidas: 30 cm × 27 cm.', '["Crochê","Barbante sustentável","Fios de malha sustentável"]', '/images/bolsa-temis/frente.jpg', 'Bolsa Têmis', '1.4deg', '[]', '/images/bolsa-temis/video.mp4', 18);

INSERT INTO store_settings (
  id, pix_key, pix_recipient, origin_cep, box_length_cm, box_width_cm, box_height_cm,
  box_weight_grams, bags_per_box, free_pac_item_threshold, delivery_min_business_days,
  delivery_max_business_days
) VALUES (
  1, 'francitacollistet@hotmail.com', '', '29090-030', 30, 28, 5, 35, 2, 2, 7, 15
);
