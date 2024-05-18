const mongodbStore = require("connect-mongodb-session");

function createSessionStore(session) {
    const mongoDBStore = mongodbStore(session);
    const sessionStore = new mongoDBStore({
        uri: "mongodb://localhost:27017",
        databaseName: "final-blog",
        collection: "sessions",
    });
    return sessionStore;
}

function createSessionConfig(sessionStore) {
    return {
        secret: "super-secret",
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
            maxAge: 30 * 24 * 60 * 68 * 1000,
            sameSite: "lax",
        },
    };
}

module.exports = {
    createSessionStore : createSessionStore,
    createSessionConfig : createSessionConfig
};
