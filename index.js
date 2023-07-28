const express = require('express');
const bodyparser = require('body-parser');
const ejs = require('ejs');

const app = express();
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:true}));

//setting ejs engine
app.set('view engine','ejs');

app.get('/',(req,res)=>{
    res.render('home')
})

app.listen(3000,()=>{
    console.log('server is running on port 3000');
})
