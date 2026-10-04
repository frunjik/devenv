const { createCjsPreset } = require('jest-preset-angular/presets');

module.exports = {
    ...createCjsPreset({
        tsconfig: '<rootDir>/projects/client/tsconfig.jest.json',
    }),
    rootDir: '../..',
    roots: ['<rootDir>/projects/client'],
    silent: true,
    coveragePathIgnorePatterns: ['[/\\\\]projects[/\\\\]server[/\\\\]src[/\\\\]'],
    moduleNameMapper: {
        '^@ppt$': '<rootDir>/projects/ppt/src/public-api.ts',
    },
    setupFilesAfterEnv: ['<rootDir>/projects/client/setup-jest.ts'],
    testMatch: ['<rootDir>/projects/client/src/**/*.spec.ts'],
    testPathIgnorePatterns: [
        '<rootDir>/projects/client/src/app/system/file-browser/file-browser/file-browser.component.spec.ts',
        '<rootDir>/projects/client/src/app/system/ppt/workspaces/js/js.component.spec.ts',
    ],
};
