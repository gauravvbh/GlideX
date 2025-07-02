import { pgTable, serial, varchar, uniqueIndex, doublePrecision, integer, timestamp, uuid, real } from "drizzle-orm/pg-core";

export const users = pgTable(
    "users",
    {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
        email: varchar("email", { length: 255 }).notNull(),
        clerk_id: varchar("clerk_id", { length: 255 }).notNull().unique(),
        number: varchar("number", { length: 20 }).notNull(),
        role: varchar("role", { length: 50 }).notNull(),
        profile_image_url: varchar("profile_image_url", { length: 500 }).notNull(),
    },
    (table) => [
        uniqueIndex("email_unique").on(table.email),
        uniqueIndex("number_unique").on(table.number)
    ]
);


export const rides = pgTable("rides", {
    id: uuid("id").primaryKey().defaultRandom(),
    origin_address: varchar("origin_address", { length: 255 }).notNull(),
    destination_address: varchar("destination_address", { length: 255 }).notNull(),

    origin_latitude: doublePrecision("origin_latitude").notNull(),
    origin_longitude: doublePrecision("origin_longitude").notNull(),

    destination_latitude: doublePrecision("destination_latitude").notNull(),
    destination_longitude: doublePrecision("destination_longitude").notNull(),

    fare_price: doublePrecision("fare_price").notNull(),
    payment_status: varchar("payment_status", { length: 50 }).notNull(), // e.g., "paid"

    driver_id: varchar("driver_id").notNull().references(() => users.clerk_id),
    user_id: varchar("user_id").notNull().references(() => users.clerk_id), // Customer

    created_at: timestamp("created_at").defaultNow(),
});



export const drivers = pgTable("drivers", {
    id: serial("id").primaryKey(),

    user_id: varchar("user_id").notNull().references(() => users.clerk_id).unique(),

    car_image_url: varchar("car_image_url", { length: 500 }).notNull(),

    car_seats: integer("car_seats").notNull(),
    rating: real("rating").notNull(),
});
