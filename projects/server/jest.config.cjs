module.exports = {
    rootDir: '../..',
    roots: ['<rootDir>/projects/server'],
    testEnvironment: 'node',
    silent: true,
    testMatch: ['<rootDir>/projects/server/test/**/*.spec.ts'],
    moduleNameMapper: {
        '^@shared$': '<rootDir>/projects/shared/src/public-api.ts',
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: '<rootDir>/projects/server/tsconfig.jest.json',
        }],
    },
    collectCoverageFrom: [
        'projects/server/src/lib/index.ts',
        'projects/server/src/lib/handlers/current-entry.ts',
        'projects/server/src/lib/authentication.ts',
        'projects/server/src/lib/filesystem/filesystem.ts',
        'projects/server/src/lib/handlers/**/*.ts',
    ],
    coverageDirectory: '<rootDir>/coverage/server',
    coverageReporters: ['text', 'lcov'],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
};
