const { createLogger, transports, format } = require('winston')
const { splat, combine, timestamp, label, printf, simple } = format;
require('winston-mongodb');

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
})

const userLoginLogger = createLogger({
    transports: [
        // Users login logger
        new transports.File({
            filename: 'log/auth/login.log',
            level: 'info',
            format: combine(timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), format.json(), myFormat)
        }),
        new transports.MongoDB({
            level: 'info',
            db: process.env.MONGODB,
            options: {
                useUnifiedTopology: true
            },
            collection: 'user_auth_logger',
            format: combine(timestamp(), format.json(), myFormat)
        })
    ]
})

const userCreateLogger = createLogger({
    transports: [
        // User registration logger
        new transports.File({
            filename: 'log/userCreate/newUsers.log',
            level: 'info',
            format: combine(timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), format.json(), myFormat)
        }),
        new transports.MongoDB({
            level: 'info',
            db: process.env.MONGODB,
            options: {
                useUnifiedTopology: true
            },
            collection: 'user_create_logger',
            format: combine(timestamp(), format.json(), myFormat)
        })

    ]
})

const serverLogger = createLogger({
    transports: [
        // Server Logger
        new transports.File({
            filename: 'log/server/info.log',
            level: 'info',
            format: combine(timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), format.json(), myFormat)
        }),
        new transports.MongoDB({
            level: 'error',
            db: process.env.MONGODB,
            options: {
                useUnifiedTopology: true
            },
            collection: 'server_logger',
            format: combine(timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), format.json(), myFormat)
        }),
        new transports.Console({
            level: 'info',
            format: combine(timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), format.json(), myFormat)
        }),
    ]
})

module.exports = {
    serverLogger,
    userCreateLogger,
    userLoginLogger
};
