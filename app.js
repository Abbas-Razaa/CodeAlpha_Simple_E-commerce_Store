const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://127.0.0.1:27017/ecommerce-store')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

app.use('/products', require('./routes/product-route'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
