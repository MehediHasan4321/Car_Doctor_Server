const express = require('express')
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const cors = require('cors')
require('dotenv').config()
//Middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mzevrg2.mongodb.net/?retryWrites=true&w=majority`;

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
    const toyThamnailCollection = client.db('Car-Doctor-website').collection('Car-Doctor-Services')
    const allToyCollection = client.db('Car-Doctor-website').collection('All-Toy-Collection')
    const userReviewCollection = client.db('Car-Doctor-website').collection('userReview')
    //All Get Methods are here 

    const indexKey = { name: 1 }
    const indexOption = { name: "name" }
    await allToyCollection.createIndex(indexKey, indexOption)

    app.get('/searchToy/:text', async (req, res) => {
      const searchText = req.params.text;
      const result = await allToyCollection.find({
        $or: [
          { name: { $regex: searchText, $options: "i" } }
        ]
      }).toArray()
      res.send(result)

    })

    app.get('/banners', async (req, res) => {
      const result = await toyThamnailCollection.find().toArray()
      res.send(result)
    })

    app.get('/allToy', async (req, res) => {
      const page = parseInt(req.query.page) || 0
      const limit = parseInt(req.query.limit) || 10
      const skip = page * limit
      const result = await allToyCollection.find().skip(skip).limit(limit).toArray()
      res.send(result)
    })

   

    app.get('/userReview', async (req, res) => {
      const result = await userReviewCollection.find().toArray()
      res.send(result)
    })

    app.get('/allToy/:category', async (req, res) => {
      const query = req.params.category
      const result = await allToyCollection.find({ category: query }).toArray()
      res.send(result)


    })

    app.get('/myToys/:email', async (req, res) => {
      const email = req.params.email
      const sortValue=req.query.sort
      const result = await allToyCollection.find({ seller: email }).sort({ price: sortValue }).toArray()
      res.send(result)

    })
    app.get('/toyDetails/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await allToyCollection.findOne(query)
      res.send(result)
    })
    app.get('/totalToy', async (req, res) => {
      const result = await allToyCollection.estimatedDocumentCount()
      res.send({ totalProduct: result })
    })
    //PUT Function is Here
    app.put('/allToy/:id', async (req, res) => {
      const toy = req.body
      const query = { _id: new ObjectId(req.params.id) }
      const option = { upsert: true }
      const update = {
        $set: {
          name: toy.name,
          img: toy.img,
          price: toy.price,
          rating: toy.rating,
          category: toy.category,
          subCategory: toy.subCategory,
          details: toy.details,
          quantity: toy.quantity
        }
      }
      const result = await allToyCollection.updateOne(query, update, option)
      res.send(result)
    })
    //Post Function is here
    app.post('/addToy', async (req, res) => {
      const toy = req.body
      const result = await allToyCollection.insertOne(toy)
      res.send(result)
    })

    //Delete function is here
    app.delete('/allToy/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await allToyCollection.deleteOne(query)
      res.send(result)
    })

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Toy Server successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Car Doctor Server is Connect successfully')
})


app.listen(port, () => {
  console.log(`Car Server is runnig  on port ${port}`)
})