import mongoose from 'mongoose';

const connectDB = async(MONGO_URL) =>{
    try{
        await mongoose.connect(MONGO_URL);
        console.log('Connected to MongoDB Database');
    }catch(error){
        console.log(`Error in Mongodb ${error.message}`);
    };
};

export default connectDB;