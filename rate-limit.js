const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15min
    max: 5,
    message: 'Too many request from this IP, try again later.',
    headers: true  
})

module.exports = limiter