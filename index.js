const express = require('express');
const bodyparser = require('body-parser');
const ejs = require('ejs');
const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');
const {connect, close,createDocument,readDocument,updateDocument,deleteDocument,}=require('./database');

const app = express();
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:true}));

//setting ejs engine
app.set('view engine','ejs');

// configur mail sender
const transporter = nodemailer.createTransport({
    service: process.env.mailService,
    host:process.env.host,
    port:process.env.port,
    secure:true,

    auth: {
        user:process.env.user,
        pass:process.env.pass,
    }
})

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

            const emailContent = {
                from: process.env.user,
                to:'chibkennedy@gmail.com',
                subject: 'New Contact Form Submission',
                text:subject,
            }

            transporter.sendMail(emailContent,(err,info)=>{
                if (err){
                    console.log(err)
                } else {
                    console.log('Email sent successfully: ',info)
                }
            })

        } finally {
            await close();
        }

    
    res.redirect('/home')
})

app.listen(3000,()=>{
    console.log('server is running on port 3000');
})
