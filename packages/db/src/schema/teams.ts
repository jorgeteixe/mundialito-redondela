import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("category", ["senior", "cadet"]);

export const tournamentGroup = pgTable("tournament_group", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  avatarLabel: text("avatar_label").default("A").notNull(),
  category: categoryEnum("category").default("senior").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const team = pgTable(
  "team",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    category: categoryEnum("category").notNull(),
    groupId: uuid("group_id").references(() => tournamentGroup.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("team_groupId_idx").on(table.groupId)],
);

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

export const tournamentGroupRelations = relations(
  tournamentGroup,
  ({ many }) => ({
    teams: many(team),
  }),
);

export const teamRelations = relations(team, ({ many, one }) => ({
  players: many(player),
  group: one(tournamentGroup, {
    fields: [team.groupId],
    references: [tournamentGroup.id],
  }),
}));

export const playerRelations = relations(player, ({ one }) => ({
  team: one(team, {
    fields: [player.teamId],
    references: [team.id],
  }),
}));
