const express = require('express')
const cors = require('cors')
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000;
require('dotenv').config()


// middleware-------------

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster.fhxucjr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster`;

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

    const lostCollection = client.db('lostFound').collection('lost');
    const applicationsCollection = client.db('lostFound').collection('applicationForms');
    const recoveredCollection = client.db("lostFound").collection("recoveredItems");

    // Lost and found API...

    app.get('/lost', async(req, res)=>{

      const email = req.query.email;
      const query = {};
      if(email){
        query.email = email;
      }
      const cursor = lostCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);

    })

    app.get('/lost/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await lostCollection.findOne(query);
      res.send(result);
    })

    // sending data to the db
    app.post('/lost', async(req, res)=>{
      const lostFound = req.body;
      const result = await lostCollection.insertOne(lostFound);
      res.send(result);
    })

    app.post('/recovered', async(req, res)=>{
      const recoveredItems = req.body;
      const result = await recoveredCollection.insertOne(recoveredItems);
      res.send(result);
    })

    app.put('/lost/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true };
      const updatedItems = req.body;
      const updatedDoc = {
        $set: updatedItems
      }

      const result = await lostCollection.updateOne(filter, updatedDoc, options);
      res.send(result);

    })

    // ----Lost Application related API

    app.post('/applicationForms', async(req, res)=>{
      const applicationForm = req.body;
      console.log(applicationForm);
      const result = await applicationsCollection.insertOne(applicationForm);
      res.send(result);
    })

    //  ----deleting API from lost collection---------

    app.delete('/lost/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await lostCollection.deleteOne(query);
      res.send(result);
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



app.get('/', (req, res)=>{
    res.send(('Lost & Found Server is warmer'))
})

app.listen(port, ()=>{
    console.log(`Lost & Found server is running in the port is, ${port}` )
})