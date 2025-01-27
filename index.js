require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const corsOptions = {
  origin: [
    'https://burly-voyage.surge.sh',
    'http://localhost:5173',
    'https://b10-a11.web.app',
    'https://b10-a11.firebaseapp.com',
    
  ],
  credentials: true, 
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())

// verifyToken
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  console.log("capture by midleware",token);
  if (!token) {
      return res.status(401).send({ message: 'Unauthorized access' });
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
          return res.status(401).send({ message: 'Unauthorized access' });
      }
      req.user = decoded;
      next();
  });
 
};


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
     const categoriesCollection = db.collection('categories');
    //Services routes
    
  //Get all services for the authenticated user
//   app.get('/api/services', async (req, res) => {
//     // const email = req.query.email
//     // const decodedEmail = req.user?.email
//     // // console.log('email from token-->', decodedEmail)
//     // // console.log('email from query-->', email)
//     // if (decodedEmail !== email)
//     //   return res.status(401).send({ message: 'unauthorized access' })
    
//     const userEmail = req.query.email;
//     const services = await servicesCollection.find({userEmail: userEmail}).toArray();
//     res.json(services);
//  });



 app.get('/api/services/:email',verifyToken,async (req, res) => {
  const email = req.params.email
  const decodedEmail = req.user?.email
  // console.log('email from token-->', decodedEmail)
  // console.log('email from params-->', email)
  if (decodedEmail !== email)
    return res.status(401).send({ message: 'unauthorized access' })
  const query = { 'userEmail': email }
  const result = await servicesCollection.find(query).toArray()
  res.send(result)
  })




app.get('/api/services', async (req, res) => {
  try {
   
    const limit = parseInt(req.query.limit) || 0;
    const services = await servicesCollection.find().limit(limit).toArray();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  
};

    //creating Token
app.post("/jwt", async (req, res) => {
  const user = req.body;
  console.log("user for token", user);
  const token = jwt.sign(user, process.env.SECRET_KEY, {
    expiresIn: '365d',
  })
  res.cookie("token", token, cookieOptions).send({ success: true });
});

//clearing Token
app.post("/logout", async (req, res) => {
  const user = req.body;
  console.log("logging out", user);
  res
    .clearCookie("token", { ...cookieOptions, maxAge: 0 })
    .send({ success: true });
});


    // Get a single service by ID
    app.get('/services/:id', async (req, res) => {
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
    app.post('/api/services',  async (req, res) => {
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
app.delete('/api/services/:id',  async (req, res) => {
try {
  await servicesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ message: 'Service deleted' });
} catch (error) {
  res.status(500).json({ message: error.message });
}
});








// Reviews routes
// Get all reviews
// app.get('/api/reviews', async (req, res) => {
//   try {
//     // const email = req.query.email
//     // const decodedEmail = req.user?.email
//     // // console.log('email from token-->', decodedEmail)
//     // // console.log('email from query-->', email)
//     // if (decodedEmail !== email)
//     //   return res.status(401).send({ message: 'unauthorized access' })
     
//       const userEmail = req.query.email;

    
//       const reviews = await reviewsCollection.find({ reviewerEmail: userEmail }).toArray();

//       res.json(reviews);
//   } catch (error) {
//       res.status(500).json({ message: error.message });
//   }
// });

app.get('/api/reviews/:email',verifyToken, async (req, res) => {
  const email = req.params.email
  const decodedEmail = req.user?.email
  // console.log('email from token-->', decodedEmail)
  // console.log('email from params-->', email)
  if (decodedEmail !== email)
    return res.status(401).send({ message: 'unauthorized access' })
  const query = { 'reviewerEmail': email }
  const result = await reviewsCollection.find(query).toArray()
  res.send(result)
  })




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
app.post('/api/reviews',  async (req, res) => {
  try {
    const newReview = await reviewsCollection.insertOne(req.body);
    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
     app.delete('/api/reviews/:id',  async (req, res) => {
      try {
  
          const result = await reviewsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
          
          // Check if a document was deleted
          if (result.deletedCount === 1) {
              return res.json({ message: 'Review deleted', deletedCount: result.deletedCount });
          } else {
              return res.status(404).json({ message: 'Review not found' });
          }
      } catch (error) {
         
          res.status(500).json({ message: error.message });
      }
      });
      
      app.get('/api/platform-stats', async (req, res) => {
        try {

          const services = await servicesCollection.find().toArray();
      
        
          const uniqueEmails = new Set(
            services
              .filter((service) => service.userEmail) 
              .map((service) => service.userEmail)   
          );
      
          const usersCount = uniqueEmails.size; // Count unique emails
          const reviewsCount = await reviewsCollection.countDocuments();
          const servicesCount = await servicesCollection.countDocuments();
      
          res.json({
            users: usersCount || 0, // Use 0 as fallback
            reviews: reviewsCount || 0,
            servicesCount: servicesCount || 0,
          });
        } catch (error) {
          console.error("Error fetching platform stats:", error);
          res.status(500).json({ message: 'Error fetching platform stats' });
        }
      });
      


      app.get('/api/categories', async (req, res) => {
        try {
          
            const categories = await categoriesCollection.find().toArray(); 
    
            res.json(categories);
        } catch (error) {
            console.error("Error fetching categories:", error);
            res.status(500).json({ message: 'Error fetching categories' });
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