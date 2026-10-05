import { startServer } from './src/public-api';

startServer()
    .then((server) => {
        const address = server.address();
        if (!address || typeof address === 'string') {
            throw new Error('Server did not bind to a TCP port');
        }
        console.log(`Server listening on http://localhost:${address.port}`);
    })
    .catch((error: unknown) => {
        console.error('Failed to start server:', error);
        process.exitCode = 88;
    });
