const express = require('express');
const bodyparser = require('body-parser');
const ejs = require('ejs');
const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose')
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {connect, File,close,createDocument,readDocument,DownloadDocument,updateDocument,deleteDocument,}=require('./database');
const { MIMEType } = require('util');

const app = express();
app.use(express.static('public'));
app.use(express.static(__dirname));
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

// rendering home page
app.get('/home',(req,res)=>{
    res.render('home')
})

// upload file to mongoDB
app.get('/upload',(req,res)=>{
    res.render('upload',{success:''})
})

app.post('/upload',upload.single('file'),async (req,res)=>{
    console.log(req.file)
    const filename = req.file.originalname;
    const filepath = req.file.path;
    const filedata = fs.readFileSync(filepath);
    const dbName = process.env.dbName;
    const collectionName = process.env.uploadCollection;
    const message = 'Successfully uploaded....';

    try{
        await connect();
        const file = {
            name:filename,
            data:filepath,
            contentType:req.file.mimetype,
            created_Date:Date(),
        }

        const upload = await createDocument(dbName,collectionName,file).then(()=>{
            res.render('upload',{success:message})
        }).catch(err=>{
            console.log(err)
        });
        console.log('uploaded: ',upload)

    } finally{
        await close();
    }
})


//download cv file
app.get('/home/downloadcv/:id', async (req,res)=>{

    const fileID = req.params.id;
    const dbName = process.env.dbName;
    const collectionName = process.env.uploadCollection;

    try{
        await connect();

        const file = await DownloadDocument(dbName,collectionName,fileID)
        console.log(file)
        res.setHeader('Content-Disposition', `attachment; filename=${file.name}`);
        res.setHeader('Content-Type', file.contentType);
        res.sendFile(path.join(__dirname,file.data));

    } finally{
        await close();
    }

});

// review card form
app.get('/review',(req,res)=>{
    res.render('review',{success:false});
});

app.post('/review',async (req,res)=>{
    const rate = {firstname,
        lastname,
        company,
        title,
        email,
        rating,
        message,
        facebook,
        twitter,
        github,
    } = req.body;
    var success = false;
    console.log(rate);
    try{
        await connect();
        const dbName = process.env.RWDB;
        const collectionName = process.env.RWCN

        const result = await createDocument(dbName,collectionName,rate).then(()=>{
            success = true;
            console.log('submitted review........!')
            res.render('review',{success});
        }).catch(err=>{
            console.log(err);
            success = false;
        })

        if(success){
            const emailContent = {
                from: process.env.user,
                to:'chibkennedy@gmail.com',
                subject: `${rate.firstname} ${rate.lastname} rate you`,
                text:`from: ${rate.email} message: ${rate.message}`,
            }

            transporter.sendMail(emailContent,(err,info)=>{
                if (err){
                    console.log(err)
                } else {
                    console.log('Email sent successfully: ',info)
                }
            })
        }

    } finally{
        await close();
    }
})

// sending email notification for contact form
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

app.listen(process.env.PORT || 3000,()=>{
    console.log('server is running .........');
})
