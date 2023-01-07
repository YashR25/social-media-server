const mongoose = require('mongoose')

module.exports = async () => {
    const mongoUri = 'mongodb+srv://yashR25:fYNihWazxXr7WiMV@cluster0.01vmb6j.mongodb.net/?retryWrites=true&w=majority'
    try {
        const connect = await mongoose.connect(mongoUri, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true
        })
        console.log('Database Connected: ' + connect.connection.host)
    } catch (error) {
        console.log(error)
        process.exit(1);
    }
    
    
}