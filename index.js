var express = require('express');
var app = express();
var ejs = require('ejs')
var bodyParser = require('body-parser')
var mysql = require('mysql');
var session = require('express-session')

mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "node_project"
});

app.use(express.static('public'));
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret:"secret"}))

function isProductInCart(cart,id){
    for(let i=0; i<cart.length; i++){
        if(cart[i].id == id){
            return true;
        }
    }
    return false;
}

function calulateTotal(cart,req){
    total = 0;
    for(let i=0; i<cart.length; i++){
        if(cart[i].sale_price){
            total = total + (cart[i].sale_price*cart[i].quantity);
        } else{
            total = total + (cart[i].price*cart[i].quantity);
        }
    } 
    req.session.total = total;
    return total;
}

app.get('/', (req, res) => {
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "node_project"
    });

    con.query("SELECT * FROM products", (err,result)=>{
        if (err) {
            console.error('Error fetching data: ', err);
            res.render('pages/index', { result: [] }); // Handle error, send an empty array
          } else {
            res.render('pages/index', { result: result });
          }
    })
});

app.post('/add_to_cart', function(req,res){
    var id = req.body.id;
    var name = req.body.name;
    var price = req.body.price;
    var sale_price = req.body.sale_price;
    var quantity = req.body.quantity;
    var image = req.body.image;
    var product = {id: id, name: name, price: price, sale_price: sale_price, quantity: quantity, image: image}

    if(req.session.cart){
        var cart = req.session.cart;
        if(!isProductInCart(cart,id)){
            cart.push(product);
        }
    }else{
        req.session.cart = [product];
        var cart = req.session.cart;
    }

    //calculate total
    calulateTotal(cart,req)

    //return to cart page
    res.redirect('/cart');

});

app.get('/cart', function(req, res) {
    if (!req.session.cart) {
        req.session.cart = []; // Initialize as an empty array if not already set
    }

    var cart = req.session.cart;
    var total = req.session.total;

    res.render('pages/cart', { cart: cart, total: total });
});

app.post('/remove_product', function(req,res){
    var id = req.body.id;
    var cart = req.session.cart;
    for(let i=0; i<cart.length; i++){
        if(cart[i].id == id){
            cart.splice(cart.indexOf(i),1);
        }
    }

    calulateTotal(cart,req);
    res.redirect('/cart');
});

app.post('/edit_product_quantity', function(req,res){

    var id = req.body.id;
    var quantity = req.body.quantity;
    var increase_btn = req.body.increase_product_quantity;
    var decrease_btn = req.body.decrease_product_quantity;
    var cart = req.session.cart;

    if(increase_btn){
        for(let i=0; i<cart.length; i++){
            if(cart[i].id == id){
                if(cart[i].quantity > 0){

                    cart[i].quantity = parseInt(cart[i].quantity) + 1;
                }
            }
        }
    }

    if(decrease_btn){
        for(let i=0; i<cart.length; i++){
            if(cart[i].id == id){
                if(cart[i].quantity > 1){
                    cart[i].quantity = parseInt(cart[i].quantity) - 1;
                }
            }
        }
    }


    calulateTotal(cart,req);

    res.redirect('/cart');

});


app.get('/checkout', function(req, res) {

    var total = req.session.total;
    res.render('pages/checkout', {total: total});
});

app.post('/place_order', function(req,res){
    var total = req.session.total;

    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var city = req.body.city;
    var address = req.body.address;
    var cost = req.session.total;
    var status = 'not paid';
    var date = new Date();
    var product_ids = '';

    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "node_project"
    });

    var cart = req.session.cart;

    for(let i=0; i<cart.length; i++){
        product_ids = product_ids + ',' + cart[i].id; 
    }

    con.connect((err)=>{
        if(err){
            console.log(err)
        } else {
            var query = "INSERT INTO orders (cost,name,email,status,city,address,phone,date,product_ids) VALUES ?"

            var values = [[cost,name,email,status,city,address,phone,date,product_ids]];

            con.query(query,[values],(err,result)=>{
                res.redirect('/payment');
            })
        }
        
    })
    
});

app.get('/payment', function(req, res) {
    var total = req.session.total;
    res.render('pages/payment',{total: total});
});



const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
