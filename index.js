require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const corsOptions = {
  origin: ['http://localhost:5173'],
  credentials: true,
  optionalSuccessStatus: 200,
}
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())

// verifyToken
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).send({ message: 'unauthorized access' })
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.user = decoded
  })

  next()
}


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
    const reviewsCollection = db.collection('reviews');
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

     // generate jwt
     app.post('/jwt', async (req, res) => {
      const email = req.body
      // create token
      const token = jwt.sign(email, process.env.SECRET_KEY, {
        expiresIn: '365d',
      })
      console.log(token)
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true })
    })

    // logout || clear cookie from browser
    app.get('/logout', async (req, res) => {
      res
        .clearCookie('token', {
          maxAge: 0,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true })
    })


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

    // Create a new service
    app.post('/api/services', async (req, res) => {
        try {
          const newService = await servicesCollection.insertOne(req.body);
          res.status(201).json(newService);
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
      });

     // get all services for search and filter
app.get('/api/allServices', async (req, res) => {
  const filter = req.query.filter
  const search = req.query.search
 
  
  let query = {
    title: {
      $regex: search,
      $options: 'i',
    },
  }
  if (filter) query.category = filter
  const result = await servicesCollection.find(query).toArray()
  res.send(result)
})




// Reviews routes
// Get all reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await reviewsCollection.find().toArray();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for a specific service
app.get('/api/reviews/service/:serviceId', async (req, res) => {
  try {
    const reviews = await reviewsCollection.find({ serviceId: req.params.serviceId }).toArray();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new review
app.post('/api/reviews', async (req, res) => {
  try {
    const newReview = await reviewsCollection.insertOne(req.body);
    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//update service
app.put('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    // Validate required fields in updateData
    if (!updateData.title || !updateData.companyName || !updateData.price || !updateData.category || !updateData.website) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await servicesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 1) {
      res.json({ message: 'Service updated successfully' });
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Failed to update service' });
  }
});


// Delete a service
app.delete('/api/services/:id', async (req, res) => {
try {
  await servicesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ message: 'Service deleted' });
} catch (error) {
  res.status(500).json({ message: error.message });
}
});





// Update a review
app.patch('/api/reviews/:id', async (req, res) => {
  try {
    const updatedReview = await reviewsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.json(updatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
  });
  
  // Delete a review
  app.delete('/api/reviews/:id', async (req, res) => {
  try {
      // Attempt to delete the review from the database
      const result = await reviewsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      
      // Check if a document was deleted
      if (result.deletedCount === 1) {
          return res.json({ message: 'Review deleted', deletedCount: result.deletedCount });
      } else {
          return res.status(404).json({ message: 'Review not found' });
      }
  } catch (error) {
      // Handle any errors
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