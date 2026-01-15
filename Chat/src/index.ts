import 'dotenv/config';

import connectDB from './db/index.js';
// import { app } from './app.js';
// import connectDB from './db/index.js';
import http from "http";
import {app} from "./app.js";
import { initSocketServer } from "./sockets/socket.server.js";

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
    try {
        await connectDB();   
        initSocketServer(server);
        server.listen(PORT, () => {
            console.log(`Chat Server running on port ${PORT}`);
        });
        // app.listen(PORT, () => {
        //     console.log(`Chat Server running on port ${PORT}`);
        // });
    } catch (error) {
        console.error('Chat Server startup failed', error);
        process.exit(1);
    }   
};
startServer();