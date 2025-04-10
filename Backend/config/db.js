const mongoose = require('mongoose')

mongoose.connect(process.env.ENVIRONMENT == "production" ? process.env.MONGODB_PROD_URL : process.env.MONGODB_DEV_URL).then(() =>{
    console.log(process.env.ENVIRONMENT == "production" ? 'Connected to MongoDB Atlas' : 'Connected to MongoDB Compass')
}).catch(() =>{
    console.log('Failed to connect to MongoDB')
})

module.exports = mongoose.connection;