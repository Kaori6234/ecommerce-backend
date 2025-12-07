const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet'); 
const rateLimit = require('express-rate-limit'); 
const errorHandler = require('./middleware/error');
require('dotenv').config();


const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory'); 
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.get('/force-error', (req, res, next) => {
    const error = new Error("This is a test error to create the logs folder!");
    next(error); // This sends it to your Error Middleware
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: "Too many requests from this IP, please try again later."
});
app.use(limiter);
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(errorHandler);

app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
    res.send('Ecommerce Backend is running!');
});

app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});