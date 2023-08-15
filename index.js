const express = require('express');
const bodyparser = require('body-parser');
const ejs = require('ejs');
const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose')
const multer = require('multer');
const path = require('path');
const {connect, File,close,createDocument,readDocument,updateDocument,deleteDocument,}=require('./database');

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

// configure multer
const multerStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, 'public');
    },
    filename:(req,file,cb)=>{
        const ext = file.mimetype.split('/')[1]
        cb(null, file.originalname)
    }
});

// multer filter
const multerFilter = (req,file,cb)=>{
    if (file.mimetype.split('/')[1] === 'pdf') {
        cb(null, true)
    } else {
        cb(new Error('Not a pdf File!!'), false)
    }
};

const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
});

app.get('/home',(req,res)=>{
    res.render('home')
})

app.get('/upload',(req,res)=>{
    res.render('upload')
})

app.post('/upload',upload.single('file'),async (req,res)=>{
    console.log(req.file)
    const filename = req.file.originalname;
    const dbName = process.env.dbName;
    const collectionName = 'Files';

    try{
        await connect();
        const file = {
            name:filename,
            created_Date:Date.now()
        }

        const upload = await createDocument(dbName,collectionName,file).then(()=>{
            res.render('upload',{message:'Successfully uploaded....'})
        }).catch(err=>{
            console.log(err)
        })

    } finally{
        await close();
    }
})

app.get('/contact',(req,res)=>{
    res.render('home')
})

app.get('/home/downloadcv', async (req,res)=>{
    res.send('hello the link is working')
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
