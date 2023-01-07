const express = require('express')
const dotenv = require('dotenv');
const dbConnect = require('./dbConnect');
dotenv.config('./.env')
const authRouter = require('./routers/authRouter');
const morgan = require('morgan');
const postRouter = require('./routers/postsRouter')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express();

const PORT = process.env.PORT

//middlewear
app.use(express.json())
app.use(morgan('common'))
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))

app.use('/posts', postRouter)
app.use('/auth',authRouter)

app.get('/', (req, res) => {
    res.status(200).send();
})

dbConnect();
app.listen(PORT,() => {
    console.log("listening to port: " + PORT)
})