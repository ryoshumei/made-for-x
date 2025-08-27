-- Fix shipping option height data
-- 宅急便コンパクト (薄型BOX): A4コピー用紙100枚程度の収納に最適 = 9mm = 0.9cm
UPDATE "shipping_options" 
SET "maxHeightCm" = 0.9 
WHERE "optionName" = '宅急便コンパクト (薄型BOX)';

-- ゆうパケットポストmini: 郵便ポストに投かん可能な厚さの目安は3cmです = 3.0cm
UPDATE "shipping_options" 
SET "maxHeightCm" = 3.0 
WHERE "optionName" = 'ゆうパケットポストmini';