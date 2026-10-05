import { startServer } from '../../dist/server/fesm2022/server.mjs';

startServer()
    .then((server) => {
        const address = server.address();
        if (!address || typeof address === 'string') {
            throw new Error('Server started without a TCP address');
        }
        console.log(`serving "./" on port ${address.port}`);
    })
    .catch((error) => {
        console.error(error);
        process.exitCode = 178;
    });
