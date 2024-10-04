const express = require('express');
const sequelize = require('./config');
const eventRoutes = require('./routes/eventRoutes');
const morgan = require('morgan');
const { logStream } = require('./loggers');
// const limiter = require('./rate-limit');




const app = express();
const PORT = 3000



// middlewares
app.use(express.json());
app.use('/api/events', eventRoutes);

// morgan to log all req
app.use(morgan ('combined', {stream: logStream }));

// Optionally, log to console as well
app.use(morgan('dev'));

// rate limiter
// app.use(limiter)



sequelize.sync()
.then(()=>{  
    app.listen(PORT, ()=>{
        console.log(`App listening to port ${PORT}`)
    })
}).catch((error)=>{
    console.error('Unable to connect to the database:', error);
});


module.exports = app;