import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log("Database Connected");
    });
    
    // Just pass the URI directly. Let the .env file dictate the database name.
    try {
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
        console.error(" Database connection failed:", error.message);
    }
}

export default connectDB;