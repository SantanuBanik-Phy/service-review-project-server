require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

//MongoDB connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xd8qc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, { serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('service_review'); 
    const servicesCollection = db.collection('services'); 

    //Services routes
    //Get all services (with optional limit)
    app.get('/api/services', async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 0;
        const services = await servicesCollection.find().limit(limit).toArray();
        res.json(services);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // Get a single service by ID
    app.get('/api/services/:id', async (req, res) => {
      try {
        const service = await servicesCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (service == null) {
          return res.status(404).json({ message: 'Cannot find service' });
        }
        res.json(service);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

   

  } finally {
   
    // await client.close();
  }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('portal server is running!');
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});