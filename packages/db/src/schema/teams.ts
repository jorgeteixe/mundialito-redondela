import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("category", ["senior", "cadet"]);
export const groupStageEnum = pgEnum("group_stage", ["f1", "f2"]);
export const matchKindEnum = pgEnum("match_kind", [
  "group",
  "semifinal",
  "third_place",
  "final",
]);
export const matchStatusEnum = pgEnum("match_status", [
  "scheduled",
  "live",
  "finished",
  "postponed",
]);

export const tournamentGroup = pgTable("tournament_group", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  avatarLabel: text("avatar_label").default("A").notNull(),
  category: categoryEnum("category").default("senior").notNull(),
  stage: groupStageEnum("stage").default("f1").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

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

export const tournamentGroupTeam = pgTable(
  "tournament_group_team",
  {
    groupId: uuid("group_id")
      .notNull()
      .references(() => tournamentGroup.id, { onDelete: "cascade" }),
    teamId: uuid("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    stage: groupStageEnum("stage").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.groupId, table.teamId] }),
    uniqueIndex("tournament_group_team_team_stage_idx").on(
      table.teamId,
      table.stage,
    ),
    index("tournament_group_team_groupId_idx").on(table.groupId),
  ],
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
    category: categoryEnum("category").default("senior").notNull(),
    groupId: uuid("group_id").references(() => tournamentGroup.id, {
      onDelete: "cascade",
    }),
    kind: matchKindEnum("kind").default("group").notNull(),
    status: matchStatusEnum("status").default("scheduled").notNull(),
    homeTeamId: uuid("home_team_id").references(() => team.id, {
      onDelete: "set null",
    }),
    awayTeamId: uuid("away_team_id").references(() => team.id, {
      onDelete: "set null",
    }),
    homePlaceholder: text("home_placeholder"),
    awayPlaceholder: text("away_placeholder"),
    homeScore: integer("home_score"),
    awayScore: integer("away_score"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("match_groupId_scheduledAt_idx").on(table.groupId, table.scheduledAt),
    index("match_category_scheduledAt_idx").on(
      table.category,
      table.scheduledAt,
    ),
    index("match_kind_idx").on(table.kind),
    index("match_homeTeamId_idx").on(table.homeTeamId),
    index("match_awayTeamId_idx").on(table.awayTeamId),
  ],
);

export const tournamentGroupRelations = relations(
  tournamentGroup,
  ({ many }) => ({
    teamMemberships: many(tournamentGroupTeam),
    matches: many(match),
  }),
);

export const teamRelations = relations(team, ({ many }) => ({
  players: many(player),
  groupMemberships: many(tournamentGroupTeam),
  homeMatches: many(match, { relationName: "homeTeam" }),
  awayMatches: many(match, { relationName: "awayTeam" }),
}));

export const tournamentGroupTeamRelations = relations(
  tournamentGroupTeam,
  ({ one }) => ({
    group: one(tournamentGroup, {
      fields: [tournamentGroupTeam.groupId],
      references: [tournamentGroup.id],
    }),
    team: one(team, {
      fields: [tournamentGroupTeam.teamId],
      references: [team.id],
    }),
  }),
);

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
