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
    const bannerCollection = client.db('Car-Doctor-website').collection('Car-Doctor-bannerContent')
    const serviceCollection = client.db('Car-Doctor-website').collection('Car-Doctor-Services')
    const orderCollection = client.db('Car-Doctor-website').collection('Car-Doctor-Orders')
    const productCollection = client.db('Car-Doctor-website').collection('Car-Doctor-Products')

    app.get('/bannerContent', async (req, res) => {
      const cursore = bannerCollection.find()
      const result = await cursore.toArray()
      res.send(result)
    })

    app.get('/services', async (req, res) => {
      const cursore = serviceCollection.find()
      const result = await cursore.toArray()
      res.send(result)
    })

    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) }
      const result = await serviceCollection.findOne(quary)
      res.send(result)
    })

    app.get('/orders', async (req, res) => {

      let query = {}
      if (req.query?.email) {
        query = { customerEmail: req.query.email }
      }
      const result = await orderCollection.find(query).toArray()
      res.send(result)
    })

    app.get('/products',async(req,res)=>{
      const result = await productCollection.find().toArray()
      res.send(result)
    })

    app.put('/products/:id',async(req,res)=>{
       id = req.params.id;
      const updateProduct = req.body
      const filter = {_id : new ObjectId(id)}
      const option = {upsert:true}
      const product = {
        $set:{
          name:updateProduct.name,
          price:updateProduct.proPrice,
          rating:updateProduct.rating,
          img_url:updateProduct.imgUrl
        }
      }
      result = await productCollection.updateOne(filter,product,option)
      res.send(result)
    })
    //POST sections
    app.post('/services',async(req,res)=>{
      const service = req.body;
      const result = await serviceCollection.insertOne(service)
      res.send(result)
    })

    app.post('/orders', async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order)
      res.send(result)
    })
    app.post('/products',async(req,res)=>{
      const product = req.body
      const result = await productCollection.insertOne(product);
      res.send(result)
    })
    //Delete Order
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await orderCollection.deleteOne(query)
      res.send(result)
    })

    //Delete product 
    app.delete('/products/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await productCollection.deleteOne(query)
      res.send(result)
    })
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Car Doctor Server successfully connected to MongoDB!");
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