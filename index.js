const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Welcome to Toy Car")
})


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.u2hpa9s.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const carCollection = client.db('toy-car').collection('cars')
        const usersCollection = client.db('toy-car').collection('users')

        app.get('/cars', async(req, res) => {
            const result = await carCollection.find().toArray();
            res.send(result);
        })

        app.post('/cars', async(req, res) => {
            const newCar = req.body;
            const result = await carCollection.insertOne(newCar);
            res.send(result);
        })

        app.get('/cars/:category', async(req, res) => {
            const category = req.params.category;
            const result = await carCollection.find().toArray();
            const car = result.filter(data => data.category === category);
            res.send(car);
            
        })

        app.get('/car/:id', async(req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = {_id: new ObjectId(id)};
            const result = await carCollection.find(query).toArray();
            res.send(result)
        })
        
        // Users
        app.get('/users', async(req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result)
        })
        
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Server is running on PORT: ${port}`)
})
