-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_prizes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prize_name" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total_quantity" INTEGER NOT NULL DEFAULT 0,
    "remaining_quantity" INTEGER NOT NULL DEFAULT 0,
    "weight" REAL NOT NULL DEFAULT 1.0,
    "sku" TEXT,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "prizes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
DROP TABLE "prizes";
ALTER TABLE "new_prizes" RENAME TO "prizes";
CREATE INDEX "prizes_user_id_tier_idx" ON "prizes"("user_id", "tier");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
