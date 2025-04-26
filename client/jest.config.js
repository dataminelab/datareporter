const path = require('path');

module.exports = {
    displayName: 'settings',
    rootDir: ".",
    moduleFileExtensions: [
        "js",
        "json",
        "jsx",
        "ts",
        "tsx",
        "node",
        "less",
        "cjs"
    ],
    setupFiles: [
        path.resolve(__dirname, './app/__tests__/enzyme_setup.js'),
        path.resolve(__dirname, './app/__tests__/mocks.js'),
    ],
    snapshotSerializers: [
        "enzyme-to-json/serializer"
    ],
    moduleDirectories: [
        "node_modules",
        path.resolve(__dirname, './app/node_modules'),
        path.resolve(__dirname, 'app'),
        path.resolve(__dirname, './viz-lib/src'),
    ],
    transformIgnorePatterns: [
        "/node_modules/(?!(viz-lib)/)"
    ],
    moduleNameMapper: {
        "^@redash/viz(.*)$": "<rootDir>/../viz-lib$1",
        "^react$": "<rootDir>/../client/node_modules/react",
        "^@/(.*)": "<rootDir>/app/$1",
        "\\.(css|less)$": "identity-obj-proxy"
    },
    transform: {
        "^.+\\.[jt]sx?$": "babel-jest"
    },
    testPathIgnorePatterns: [
        "<rootDir>/app/__tests__/"
    ],
    testEnvironment: 'jsdom',
    
};
