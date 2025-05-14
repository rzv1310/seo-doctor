import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

import * as schemaUsers from './schema/users';



const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
});

const database = drizzle(client, {
    schema: {
        ...schemaUsers,
    },
});


export default database;
