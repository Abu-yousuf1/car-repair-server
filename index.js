const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId
const fileUpload = require('express-fileupload')
require('dotenv').config()

const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors())
app.use(fileUpload())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o9fdd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db('car_repair')
        const serviceCollection = database.collection('service_collection')
        const orderCollection = database.collection('orders')
        const userCollection = database.collection('users')
        const reviewCollection = database.collection('reviews')

        // all services data
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        })

        // filter by id all services data
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            console.log(service)
            res.json(service)
        })
        // insert orders................
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            console.log(result)
            res.json(result)
        })
        // all order 
        // app.get('/orders', async (req, res) => {
        //     const cursor = orderCollection.find({})
        //     const result = await cursor.toArray();
        //     console.log(result)
        //     res.send(result)
        // })
        // orders filter by email
        app.get('/orderbyEmail', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = orderCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        })
        // save user in database
        app.post('/user', async (req, res) => {
            const user = req.body
            const cursor = await userCollection.insertOne(user);
            console.log(cursor)
            res.json(cursor)
        })
        // update image
        app.put('/user', async (req, res) => {
            const email = req.body.email;
            const filter = { email: email }
            const pic = req.files.image
            const picData = pic.data;
            const encodePic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodePic, 'base64')
            const updateDoc = { $set: { image: imageBuffer } }
            const result = await userCollection.updateOne(filter, updateDoc)
            res.json(result)
        })
        // find by email
        app.get('/userByEmail', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await userCollection.findOne(query)
            console.log(result)
            res.send(result)
        })
        // insert review
        app.post('/review', async (req, res) => {
            const cursor = req.body;
            const result = await reviewCollection.insertOne(cursor)
            res.json(result)
        })
        // fins all review
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({})
            const result = await cursor.toArray()
            res.send(result)
        })
    } finally {

    }
} run().catch(console.dir)

app.get('/', (req, res) => {
    console.log("hello world")
    res.send('hello world')
})

app.listen(port, () => {
    console.log('listening to ', port)
})