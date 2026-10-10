const { createCjsPreset } = require('jest-preset-angular/presets');

module.exports = {
    ...createCjsPreset({
        tsconfig: '<rootDir>/projects/client/tsconfig.jest.json',
    }),
    rootDir: '../..',
    roots: ['<rootDir>/projects/client', '<rootDir>/projects/shared'],
    silent: true,
    coveragePathIgnorePatterns: ['[/\\\\]projects[/\\\\]server[/\\\\]src[/\\\\]'],
    moduleNameMapper: {
        '^@shared$': '<rootDir>/projects/shared/src/public-api.ts',
    },
    setupFilesAfterEnv: ['<rootDir>/projects/client/setup-jest.ts'],
    testMatch: [
        '<rootDir>/projects/client/src/**/*.spec.ts',
        '<rootDir>/projects/shared/src/**/*.spec.ts',
    ],
};
