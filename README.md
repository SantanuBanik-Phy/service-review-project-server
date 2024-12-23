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


## License

This project is licensed under the Santanu License.