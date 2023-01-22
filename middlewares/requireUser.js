
const jwt = require('jsonwebtoken')
const { error } = require('../utils/responseWrapper')

const requireUser = (req, res, next) => {
    if(!req.headers || !req.headers.authorization || !req.headers.authorization.startsWith("Bearer") ){
        // return res.status(401).send('authorization header is required')
        return res.send(error(401, 'authorization header is required'))
    }


    const accessToken = req.headers.authorization.split(" ")[1]
    
    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_PRIVATE_KEY)
        if(decoded){
            req._id = decoded._id
            next()
        }else{
            return res.send(error(401, 'Invalid access key'))
        }
        
    } catch (e) {
        console.log(e)
        // res.status(400).send('Invalid access key')
        return res.send(error(401, 'Invalid access key'))
    }
    
}

module.exports = {requireUser}