const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');
const dotenv = require('dotenv').config();

const uri = process.env.URI; 

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connect() {
  await client.connect().then(()=>{
    console.log('connected to mongodb......')
  });
}

async function close() {
  await client.close();
}

async function createDocument(dbName, collectionName, data) {
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const result = await collection.insertOne(data);
  return result;
}

async function readDocument(dbName, collectionName, filter) {
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const documents = await collection.find(filter).toArray();
  return documents;
}

async function updateDocument(dbName, collectionName, filter, update) {
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const result = await collection.updateOne(filter, { $set: update });
  return result;
}

async function deleteDocument(dbName, collectionName, filter) {
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const result = await collection.deleteOne(filter);
  return result;
}

// file upload schema
const Schema = mongoose.Schema;

const uploadSchema = new Schema({
  name:String,
  date:String
})

const File = mongoose.model('File',uploadSchema)

module.exports = {
  connect,
  File,
  close,
  createDocument,
  readDocument,
  updateDocument,
  deleteDocument,
};

