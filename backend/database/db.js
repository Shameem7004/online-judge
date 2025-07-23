const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

let retryCount = 0;
const maxRetries = 3;

/**
 * Establishes connection to MongoDB database
 * Uses mongoose to connect to the database with proper error handling
 */

const DBConnection = async () => {
    // Get MongoDB connection string from environment variables
    const MONGO_URI = process.env.MONGODB_URI;
    
    // Validate that MongoDB URI is provided
    if (!MONGO_URI) {
        console.error("Error: MONGODB_URL environment variable is not set");
        process.exit(1);
    }
    
    try {
        // Connect to MongoDB with recommended options
        await mongoose.connect(MONGO_URI);
        // await mongoose.connect(MONGO_URI, { 
        //     useNewUrlParser: true, 
        //     useUnifiedTopology: true
        //     // useUnifiedTopology & useNewUrlParser is a deprecated option.
        //     // These will ha no effect since Node.js Driver version 4.0.0 and will be removed in the next major version
        // });
        console.log("Database connected successfully");
    } catch (error) {
        retryCount++;
        // console.error("Database connection failed, retrying in 5 seconds...", error.message);
        
        if(retryCount < maxRetries){
           console.log("Database connection failed, retrying in 5 seconds...");
           setTimeout(DBConnection, 5000); // retry after 5 seconds
        } else{
            console.error('Error while connecting to the database');
            process.exit(1); // Exit process if database connection fails
        }  
    }
};

// Export the connection function for use in other modules
module.exports = { DBConnection };

// if (require.main === module) {
//   DBConnection();
// }