-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_status" TEXT NOT NULL DEFAULT 'INACTIVE',
    "stock_page_published" BOOLEAN NOT NULL DEFAULT true,
    "last_reset" DATETIME,
    "country" TEXT NOT NULL DEFAULT 'Malaysia',
    "country_code" TEXT NOT NULL DEFAULT 'MY',
    "country_emoji" TEXT NOT NULL DEFAULT '🇲🇾',
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "locale" TEXT NOT NULL DEFAULT 'ms-MY',
    "tier_colors" TEXT NOT NULL DEFAULT '{}',
    "next_session_number" INTEGER NOT NULL DEFAULT 1,
    "weight_mode" TEXT NOT NULL DEFAULT 'basic',
    "subscription_plan" TEXT NOT NULL DEFAULT 'free',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_settings" ("country", "country_code", "country_emoji", "created_at", "currency", "id", "last_reset", "locale", "next_session_number", "session_status", "subscription_plan", "tier_colors", "updated_at", "user_id", "weight_mode") SELECT "country", "country_code", "country_emoji", "created_at", "currency", "id", "last_reset", "locale", "next_session_number", "session_status", "subscription_plan", "tier_colors", "updated_at", "user_id", "weight_mode" FROM "user_settings";
DROP TABLE "user_settings";
ALTER TABLE "new_user_settings" RENAME TO "user_settings";
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
