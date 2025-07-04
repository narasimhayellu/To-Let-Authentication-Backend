const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const mongoDBConnection = require("./dbConfig/config");

const url = process.env.DB_CONNECTION_URL;

// Validate required environment variables
if (!url) {
  console.error("Error: DB_CONNECTION_URL is not defined in environment variables");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("Error: JWT_SECRET is not defined in environment variables");
  process.exit(1);
}

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("Error: Email configuration (EMAIL_USER, EMAIL_PASS) is not defined in environment variables");
  process.exit(1);
}

if (!process.env.FRONTEND_URL) {
  console.error("Error: FRONTEND_URL is not defined in environment variables");
  process.exit(1);
}

mongoDBConnection(url); 

const app = express();
app.use(express.json());
app.use(cors()); 
app.use(express.urlencoded({extended:true}));

const userRoutes = require("./routes/user");

app.use("/users",userRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on ${PORT} `));

