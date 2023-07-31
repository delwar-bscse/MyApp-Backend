// import dotenv from 'dotenv';
import cloudinary from 'cloudinary';

import app from './app.js'
import connectDB from './config/database.js';

// Config dotenv
// dotenv.config({path:"config/config.env"});
// dotenv.config();

// Config Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});


const {PORT, MONGO_URL} = process.env;
app.listen(PORT, async()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
    await connectDB(MONGO_URL);
});