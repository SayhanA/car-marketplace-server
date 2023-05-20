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
        client.connect();

        const carCollection = client.db('toy-car').collection('cars')
        const usersCollection = client.db('toy-car').collection('users')


        const indexKeys = {
            seller: 1,
            category: 1,
            brand: 1,
            title: 1
        };

        const indexOptions = { name: "search" };
        
        const result = await carCollection.createIndex(indexKeys, indexOptions);
        
        app.get('/search/:item', async(req, res) => {
            const item = req.params.item;
            // console.log(item)

            const result = await carCollection.find({
                $or: [
                    { title: { $regex: item, $options: "i" } },
                    { seller: { $regex: item, $options: "i" } },
                    { brand: { $regex: item, $options: "i" } },
                    { category: { $regex: item, $options: "i" } },
                ],
            }).toArray();

            res.send(result);
            
        })

        app.get('/cars', async(req, res) => {
            // console.log(req.query);
            let query = {};
            if(req.query?.email){
                query = {sellerEmail: req.query.email}
            }
            const result = await carCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/cars', async(req, res) => {
            const newCar = req.body;
            const result = await carCollection.insertOne(newCar);
            res.send(result);
        })

        app.put('/cars/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const options = {update: true};
            const updateCar = req.body;
            console.log(updateCar)
            const car = {
                $set:{
                    title: updateCar.title,
                    price: updateCar.price,
                    quantity: updateCar.quantity,
                    description: updateCar.description,
                }
            };
            const result = await carCollection.updateOne(filter,car,options);
            res.send(result)
        })

        app.get('/cars/:category', async(req, res) => {
            const category = req.params.category;
            const result = await carCollection.find().toArray();
            const car = result.filter(data => data.category === category);
            res.send(car);
            
        })

        app.get('/car/:id', async(req, res) => {
            const id = req.params.id;
            // console.log(id)
            const query = {_id: new ObjectId(id)};
            const result = await carCollection.find(query).toArray();
            res.send(result)
        })

        app.delete('/cars/:id', async(req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = {_id: new ObjectId(id)};
            const result = await carCollection.deleteOne(query);
            res.send(result)
        })


        app.get('/paginate', async(req, res) => {
            console.log(req.query);
              const page = parseInt(req.query.pages) || 0;
              console.log(page)
              const limit = parseInt(req.query.limit) || 10;
              const skip = page * limit;
      
              const results = await carCollection.find().skip(skip).limit(limit).sort({ price: req.query.sort }).toArray();
              res.send(results)
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
