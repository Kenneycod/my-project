const express = require('express');
const bodyparser = require('body-parser');
const ejs = require('ejs');
const dotenv = require('dotenv').config();
const {connect, close,createDocument,readDocument,updateDocument,deleteDocument,}=require('./database');

const app = express();
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:true}));

//setting ejs engine
app.set('view engine','ejs');

app.get('/home',(req,res)=>{
    res.render('home')
})

app.get('/contact',(req,res)=>{
    res.render('home')
})

app.post('/home',async (req,res)=>{
    const {firstname,lastname,email,subject} = req.body;

        try{
            await connect();
            const dbName = process.env.dbName;
            const collectionName = process.env.collectionName;

            const newData = {firstname,lastname,email,subject};
            const createData = await createDocument(dbName,collectionName,newData);
            console.log('created: ',createData);
        }finally{
            await close();
        }

    
    res.redirect('/home')
})

app.listen(3000,()=>{
    console.log('server is running on port 3000');
})
