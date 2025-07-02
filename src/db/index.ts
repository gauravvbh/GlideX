import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import Constants from 'expo-constants';

const DATABASE_URL = Constants.expoConfig?.extra?.databaseUrl;

if (!DATABASE_URL) {
    console.log('No DATABASE_URL provided')
}

const sql = neon(DATABASE_URL);
export const db = drizzle(sql);