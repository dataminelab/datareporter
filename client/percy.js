// Percy stub module for Cypress tests
module.exports = {
    exec: (command, options = {}) => {
        console.log(`Percy exec: ${command}`);
        return Promise.resolve();
    },

    snapshot: (name, options = {}) => {
        if (process.env.PERCY_TOKEN) {
            console.log(`Percy snapshot: ${name}`);
        } else {
            console.log(`Percy not configured, skipping snapshot: ${name}`);
        }
        return Promise.resolve();
    },

    isRunning: () => {
        return !!process.env.PERCY_TOKEN;
    },

    finalize: () => {
        console.log('Percy finalize');
        return Promise.resolve();
    }
};