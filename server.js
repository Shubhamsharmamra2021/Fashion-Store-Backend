const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const errorHandler = require('./middleware/error');
 
const connectDB = require('./config/db')
 

//load env vars
dotenv.config({ path : './config/config.env' });

// connect DB
connectDB();

// Route files
const shops = require('./routes/shops');
const products = require('./routes/products');
const auth = require('./routes/auth');
const users = require("./routes/users");
const subscription = require("./routes/subscription");
const sales =require("./routes/sales")
 
const app = express();

app.use(express.json())

// File Uploading
app.use(fileUpload())

 

// cookie parser
app.use(cookieParser());

// cors middleware
app.use(cors())

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Dev logging moddleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

// mount routes
app.use('/api/v1/shops', shops)
app.use('/api/v1/products', products)
app.use('/api/v1/auth', auth)
app.use("/api/v1/users", users);
app.use("/api/v1/sales", sales);
app.use("/api/v1/subscription", subscription); 
 

app.use(errorHandler);






const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, (req, res) => {
    console.log(`Server is ${process.env.NODE_ENV} mode and running on ${process.env.PORT} port`)
})

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error : ${err.message}`);
    // closeserver & exit process
    server.close(() => process.exit(1))
})