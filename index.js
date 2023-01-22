const express = require('express')
const dotenv = require('dotenv');
const dbConnect = require('./dbConnect');
dotenv.config('./.env')
const authRouter = require('./routers/authRouter');
const morgan = require('morgan');
const postRouter = require('./routers/postsRouter')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const userRouter = require('./routers/userRouter')
const cloudinary = require('cloudinary').v2;

const app = express();

const PORT = process.env.PORT

//cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET,
    secure: true 
  });

//middlewear
app.use(express.json({limit: '10mb'}))
app.use(morgan('common'))
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))

app.use('/posts', postRouter)
app.use('/auth',authRouter)
app.use('/user', userRouter)

app.get('/', (req, res) => {
    res.status(200).send();
})

dbConnect();
app.listen(PORT,() => {
    console.log("listening to port: " + PORT)
})