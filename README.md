# Node.js Express User CRUD API

A RESTful User CRUD API built with Node.js and Express.js.
The project demonstrates routing, controllers, middleware, request validation, error handling, and Git-based development.

## Features

- Create, read, update, patch, and delete users
- Express Router architecture
- Controller-based request handling
- Request body validation with express-validator
- User ID parameter validation
- Centralized validation error responses
- Custom logger middleware
- 404 Not Found middleware
- Centralized error-handling middleware
- Development server with Nodemon

## Technologies

- Node.js
- Express.js
- express-validator
- Nodemon
- Git and GitHub

## Installation

Clone the repository:
    git clone https://github.com/dogusakyuzzzzz-design/node-express-dersleri.git


Open the project directory:

    cd node-express-dersleri


Install the dependencies:

    npm install


Start the development server:

bash
npm run dev


The API will run at:

text
http://localhost:3000


## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /users | Get all users |
| GET | /users/:id | Get a user by ID |
| POST | /users | Create a new user |
| PUT | /users/:id | Replace a user |
| PATCH | /users/:id | Partially update a user |
| DELETE | /users/:id | Delete a user |

## Example Request Body

    {
    "isim": "Dogus",
    "yas": 28
    }


## Validation Rules

### Name (isim)

- Required for POST and PUT requests
- Must contain between 2 and 50 characters

### Age (yas)

- Required for POST and PUT requests
- Must be an integer between 1 and 120

### User ID (id)

- Must be a positive integer

## Project Structure

    node-express-dersleri/
    ├── controllers/
    │   └── usersController.js
    ├── data/
    │   └── users.json
    ├── middlewares/
    │   ├── errorHandler.js
    │   ├── logger.js
    │   ├── notFound.js
    │   └── validateRequest.js
    ├── routes/
    │   └── users.js
    ├── validators/
    │   └── usersValidator.js
    ├── index.js
    ├── package.json
    └── README.md


## Important Note

User data is currently persisted to a local JSON file (`data/users.json`) instead of a database. Changes made through the API (create, update, patch, delete) are written to this file, so data survives server restarts. This file is excluded from version control via `.gitignore`. Database integration will be added in a future development stage.

## Author

*Doğuş Akyüz*

GitHub: [dogusakyuzzzzz-design](https://github.com/dogusakyuzzzzz-design)