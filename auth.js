const basicAuth = require('basic-auth');


// route auth, this auth was only to get event status route (consider sentitive)
const authenticate = (req, res, next)=>{
    const user = basicAuth(req)

    if(!user || user.name !== 'admin' || user.pass !== 'greatbrands' ){
        res.set('WWW-Authenticate', 'Basic realm="Event Booking System"')
        return res.status(401).json({message: 'Athentication required!'})
    }

    next();
}

module.exports = authenticate;