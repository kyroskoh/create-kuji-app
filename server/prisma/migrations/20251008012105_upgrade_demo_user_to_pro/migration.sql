-- Upgrade demo user to Pro plan
-- This migration updates the demo user's subscription plan to 'pro' if the user exists

-- Update user_settings for demo user to set subscription_plan to 'pro'
UPDATE user_settings 
SET subscription_plan = 'pro'
WHERE user_id = (
  SELECT id FROM users WHERE username = 'demo'
);

-- If the demo user exists but doesn't have settings yet, create them
INSERT OR IGNORE INTO user_settings (
  id,
  user_id,
  session_status,
  stock_page_published,
  country,
  country_code,
  country_emoji,
  currency,
  locale,
  tier_colors,
  next_session_number,
  weight_mode,
  subscription_plan,
  created_at,
  updated_at
)
SELECT 
  lower(hex(randomblob(16))),
  id,
  'INACTIVE',
  1,
  'Malaysia',
  'MY',
  '🇲🇾',
  'MYR',
  'ms-MY',
  '{}',
  1,
  'basic',
  'pro',
  datetime('now'),
  datetime('now')
FROM users 
WHERE username = 'demo' 
  AND NOT EXISTS (
    SELECT 1 FROM user_settings WHERE user_id = users.id
  );
