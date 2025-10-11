-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_draw_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_number" INTEGER NOT NULL,
    "fan_name" TEXT NOT NULL,
    "queue_number" TEXT,
    "label" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fan_revealed" BOOLEAN NOT NULL DEFAULT false,
    "fan_revealed_at" DATETIME,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "draw_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_draw_sessions" ("fan_name", "id", "label", "queue_number", "session_number", "timestamp", "user_id") SELECT "fan_name", "id", "label", "queue_number", "session_number", "timestamp", "user_id" FROM "draw_sessions";
DROP TABLE "draw_sessions";
ALTER TABLE "new_draw_sessions" RENAME TO "draw_sessions";
CREATE INDEX "draw_sessions_user_id_session_number_idx" ON "draw_sessions"("user_id", "session_number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
