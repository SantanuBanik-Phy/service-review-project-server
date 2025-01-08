# Service Review System - Server

This repository contains the backend code for the Service Review System, a platform for users to review and interact with various services.

## Features

*   API endpoints for managing services (CRUD operations)
*   API endpoints for managing reviews (CRUD operations)
*   JWT authentication for securing API endpoints
*   MongoDB database for storing data

## Technologies Used

*   Node.js
*   Express.js
*   MongoDB
*   jsonwebtoken (for JWT authentication)

## Dependencies

```json
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mongodb": "^5.6.0"
  }
  ```
  ## API Endpoints

### Services

*   `GET /api/services`: Get all services
*   `GET /api/services/:id`: Get a single service by ID
*   `POST /api/services`: Create a new service
*   `PUT /api/services/:id`: Update a service
*   `DELETE /api/services/:id`: Delete a service

### Reviews

*   `GET /api/reviews`: Get all reviews
*   `GET /api/reviews/service/:serviceId`: Get reviews for a specific service
*   `POST /api/reviews`: Create a new review
*   `PATCH /api/reviews/:id`: Update a review
*   `DELETE /api/reviews/:id`: Delete a review

### Authentication

*   `POST /jwt`: Generate a JWT token


## Running the Project Locally

1.  **Clone the repository:** `git clone <repository-url>`
2.  **Install dependencies:** `npm install`
3.  **Set up environment variables:**
    *   Create a `.env` file in the root directory.
    *   Add your MongoDB connection string as `MONGODB_URI=<your_mongodb_connection_string>`
    *   Add your JWT secret key as `JWT_SECRET=<your_jwt_secret_key>`
4.  **Start the server:** `node index.js` (or `nodemon index.js` for automatic restarts on file changes)