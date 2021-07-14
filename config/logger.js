const { createLogger, transports, format } = require('winston')
const { splat, combine, timestamp, label, printf, simple } = format;


require('winston-mongodb');

const myLevels = {
	superImportant: 0,
	mediocre: 1,
	whoCares: 2
}

const myFormat = printf( ({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
})

const logger = createLogger({
    transports: [
        // Server Logger
        new transports.File({
            filename: 'log/server/info.log',
            level: 'error',
            format: format.combine(format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss'}), format.json())
        }),
        new transports.MongoDB({
            level: 'error',
            db: process.env.MONGODB,
            options: {
                useUnifiedTopology: true
            },
            collection: 'server_logger',
            format: format.combine(format.timestamp(), format.json())
        }),
        // Users login logger
        new transports.File({
            filename: 'log/auth/login.log',
            level: 'info',
            format: format.combine(format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss'}), format.json())
        }),
        new transports.MongoDB({
            level: 'info',
            db: process.env.MONGODB,
            options: {
                useUnifiedTopology: true
            },
            collection: 'user_auth_logger',
            format: format.combine(format.timestamp(), format.json())
        }),
        // User registration logger
        new transports.File({
            filename: 'log/userCreate/newUsers.log',
            level: 'verbose',
            format: format.combine(format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss'}), format.json())
        }),
        new transports.MongoDB({
            level: 'verbose',
            db: process.env.MONGODB,
            options: {
                useUnifiedTopology: true
            },
            collection: 'user_create_logger',
            format: format.combine(format.timestamp(), format.json())
        })
    ]
})

module.exports = logger;