import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("category", ["senior", "cadet"]);

export const team = pgTable("team", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: categoryEnum("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const player = pgTable(
  "player",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("player_teamId_idx").on(table.teamId)],
);

export const teamRelations = relations(team, ({ many }) => ({
  players: many(player),
}));

export const playerRelations = relations(player, ({ one }) => ({
  team: one(team, {
    fields: [player.teamId],
    references: [team.id],
  }),
}));
