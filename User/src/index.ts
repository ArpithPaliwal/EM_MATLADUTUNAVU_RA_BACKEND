// import dotenv from 'dotenv';
import 'dotenv/config';
// import path from 'path';

// dotenv.config({
//   path: path.resolve(process.cwd(), ".env"),
// });
//this doesnt work becz nodenext first resolves all the imports and then runs the code , but when imports are resolved dotenv is not loaded


import { app } from './app.js';
import connectDB from './db/index.js';
import { connectRedis } from './redis/index.js';
import { connectRabbitMQ } from './rabbitmq/connection.rabbitmq.js';

const PORT = process.env.PORT || 8000;

const startServer = async (): Promise<void> => {
    try {
        await connectDB();
        await connectRedis();
        await connectRabbitMQ();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server startup failed', error);
        process.exit(1);
    }
};
startServer();
