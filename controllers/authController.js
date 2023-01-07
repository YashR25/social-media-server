const User = require("../models/User")
const bcrypt = require('bcrypt')
const { use } = require("../routers/authRouter")
const jwt = require('jsonwebtoken')
const { error, success } = require("../utils/responseWrapper")

const signupController = async (req, res) => {
    try {
        
        const {email, password} = req.body

        if(!email || !password){
            // res.status(400).send('All fields are required')
            return res.send(error(400,'All fields are required'))
        }

        const oldUser = await User.findOne({ email })
        if(oldUser){
            // res.status(409).send('User already registered')
            return res.send(error(409, 'User already registered'))
        }

        const hashedPassword = await bcrypt.hash(password,10)

        const user = await User.create({
            email,
            password: hashedPassword,
        })

        // res.status(201).json({
        //     user
        // });

        return res.send(success(201, {user}))

    } catch (error) {
        console.log(error);
    }
}

const loginController = async (req, res) => {
    try {
        const {email, password} = req.body

        if(!email || !password){
            // res.status(400).send('All fields are required')
            return res.send(error(400,'All fields are required'))
        }

        const user = await User.findOne({ email })
        if(!user){
            // res.status(404).send('User not registered')
            return res.send(error(404,'User not registered'))
        }

        const matched = await bcrypt.compare(password, user.password)
        if(!matched){
            // res.status(403).send("Incorrect password")
            return res.send(error(403,'Incorrect password'))
        }

        const accessToken = generateAccessToken({ 
            _id: user._id, 
        })

        const refreshToken = generateRefreshToken({ 
            _id: user._id, 
        })

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true
        })

        // res.status(200).json({
        //     accessToken,
        // })

        return res.send(success(200, {accessToken}))
    } catch (error) {
        
    }
}

const refreshAccessTokenController = async (req, res) => {
    
    const cookies = req.cookies

    if(!cookies.jwt){
        // res.status(401).send('Refresh token in cookie is required')
        return res.send(error(401,'Refresh token in cookie is required'))
    }

    const refreshToken = cookies.jwt

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_PRIVATE_KEY)
        const _id = decoded._id
        const accessToken = generateAccessToken({ _id })
        // return res.status(201).send({ accessToken })
        return res.send(success(201,{accessToken}))

    } catch (error) {
        console.log(error)
        // return res.status(401).send("Invalid refresh key") 
        return res.send(error(401,"Invalid refresh key"))  
    }
}

//internal functions
const generateAccessToken = (data) => {
    try {
        const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY,{
            expiresIn: '15m'
        })
        console.log(token)
        return token;
    } catch (error) {
        console.log(error)
    }

}

const generateRefreshToken = (data) => {
    try {
        const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY,{
            expiresIn: '1y'
        })
        console.log(token)
        return token;
    } catch (error) {
        console.log(error)
    }

}

module.exports = {loginController, signupController, refreshAccessTokenController}