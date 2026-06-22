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

export const match = pgTable(
  "match",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => tournamentGroup.id, { onDelete: "cascade" }),
    homeTeamId: uuid("home_team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    awayTeamId: uuid("away_team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("match_groupId_scheduledAt_idx").on(table.groupId, table.scheduledAt),
    index("match_homeTeamId_idx").on(table.homeTeamId),
    index("match_awayTeamId_idx").on(table.awayTeamId),
  ],
);

export const tournamentGroupRelations = relations(
  tournamentGroup,
  ({ many }) => ({
    teams: many(team),
    matches: many(match),
  }),
);

export const teamRelations = relations(team, ({ many, one }) => ({
  players: many(player),
  homeMatches: many(match, { relationName: "homeTeam" }),
  awayMatches: many(match, { relationName: "awayTeam" }),
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

export const matchRelations = relations(match, ({ one }) => ({
  group: one(tournamentGroup, {
    fields: [match.groupId],
    references: [tournamentGroup.id],
  }),
  homeTeam: one(team, {
    fields: [match.homeTeamId],
    references: [team.id],
    relationName: "homeTeam",
  }),
  awayTeam: one(team, {
    fields: [match.awayTeamId],
    references: [team.id],
    relationName: "awayTeam",
  }),
}));
