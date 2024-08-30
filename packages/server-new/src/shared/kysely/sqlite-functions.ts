import { sql } from 'kysely';

export const unixEpochNow = sql`(unixepoch())`;
