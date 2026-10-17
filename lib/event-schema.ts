import { index, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const eventRegistrations = pgTable(
  "event_registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventSlug: text("event_slug").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    whatsapp: text("whatsapp").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("event_registrations_event_email_key").on(t.eventSlug, t.email),
    index("event_registrations_event_created_idx").on(t.eventSlug, t.createdAt),
  ],
);
