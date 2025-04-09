// import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";

// export const usersTable = pgTable("users", {
//     // id: integer().primaryKey().generatedAlwaysAsIdentity(),
//     id: serial().primaryKey()
//     name: varchar({ length: 255 }).notNull(),
//     email: varchar({ length: 255 }).notNull().unique(),
//     clerk_id: varchar({ length: 255 }).notNull().unique(),
// },);


import { pgTable, serial, varchar, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable(
    "users",
    {
        id: serial("id").primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
        email: varchar("email", { length: 255 }).notNull(),
        clerk_id: varchar("clerk_id", { length: 255 }).notNull(),
    },
    (table) => [
        uniqueIndex("email_unique").on(table.email),
        uniqueIndex("clerk_id_unique").on(table.clerk_id),
    ]
);
