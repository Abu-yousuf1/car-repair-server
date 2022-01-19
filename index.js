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
console.log(process.env.DB_PASS, process.env.DB_USER)
async function run() {
    try {
        await client.connect();

        const database = client.db('car_repair')
        const serviceCollection = database.collection('service_collection')
        const orderCollection = database.collection('orders')
        const userCollection = database.collection('users')
        const reviewCollection = database.collection('reviews')
        const newsCollection = database.collection('newses')

        // Find all services in home page .....
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        })

        // filter by id all services data for service details
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            // console.log(service)
            res.json(service)
        })
        // update services Collection for admin in dashboard............
        app.put('/service', async (req, res) => {
            const id = req.query.id
            const filter = { _id: ObjectId(id) }
            const editData = req.body;
            console.log(editData, id)
            const updateDoc = { $set: { name: editData.name, price: editData.price, description: editData.description, image: editData.image } }
            const result = await serviceCollection.updateOne(filter, updateDoc)
            console.log(result)
            res.json(result)
        })

        // Delete service in dashboard.....
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await serviceCollection.deleteOne(filter)
            res.json(result)
        })

        // insert service for admin in dashboard......... 
        app.post('/service', async (req, res) => {
            const cursor = req.body;
            const result = await serviceCollection.insertOne(cursor)
            res.json(result)
        })

        // insert orders................
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            res.json(result)
        })

        // Delete order form dashboard............
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const result = await orderCollection.deleteOne({ _id: ObjectId(id) })
            res.json(result)
        })



        // Find all orders for admin in dashboard.......... 
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({})
            const result = await cursor.toArray();
            console.log(result)
            res.send(result)
        })

        // orders filter by email for user in dashboard.........
        app.get('/orderbyEmail', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = orderCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        })

        // save user in database............ 
        app.post('/user', async (req, res) => {
            const user = req.body
            const cursor = await userCollection.insertOne(user);
            console.log(cursor)
            res.json(cursor)
        })

        // update image for user collection...................
        app.put('/user', async (req, res) => {
            const email = req.query.email;
            const filter = { email: email }
            const image = req.body.image;
            const updateDoc = { $set: { image: image } }
            const result = await userCollection.updateOne(filter, updateDoc)
            res.json(result)
        })

        // User find by email 
        app.get('/userByEmail', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await userCollection.findOne(query)
            // console.log(result)
            res.send(result)
        })

        // update user role....
        app.put('/admin', async (req, res) => {
            const email = req.query.email;
            const filter = { email: email };
            const updateDoc = { $set: { role: "admin" } };
            const result = await userCollection.updateOne(filter, updateDoc)
            res.json(result);
        })

        // admin validation...
        app.get('/isadmin/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email)
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === "admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        // insert review for user in dashboard......
        app.post('/review', async (req, res) => {
            const cursor = req.body;
            const result = await reviewCollection.insertOne(cursor)
            res.json(result)
        })

        // Find all reviews in home page.
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({})
            const result = await cursor.toArray()
            res.send(result)
        })

        // News  
        app.get('/newses', async (req, res) => {
            const cursor = newsCollection.find({})
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