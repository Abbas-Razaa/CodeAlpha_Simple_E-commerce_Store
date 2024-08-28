var express = require('express');
var app = express();
var ejs = require('ejs')
var bodyParser = require('body-parser')
var mysql = require('mysql');

mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "node_project"
});

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "node_project"
    });

    con.query("SELECT * FROM products", (err,result)=>{
        res.render('pages/index', {result:result});
    })
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
