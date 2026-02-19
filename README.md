# Backend Prep

A Node.js/Express backend application providing user management and file upload capabilities, backed by MongoDB.

## Features

- **User Management**: Create, read, update, delete, and search users.
- **Authentication**: Simple header-based authentication for API routes.
- **File Uploads**: Support for uploading files using Multer.
- **Error Handling**: Global error handling middleware.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (running instance)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend-prep
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Create a `.env` file in the root directory based on the example:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and configure your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/backend-prep
   ```

## Running the Server

To start the server in development mode (with watch mode):

```bash
npm start
```

The server will start on `http://localhost:3000`.

## API Documentation

**Note:** All routes under `/api` require an `Authorization` header. The value can be anything for now, as it checks for presence only.

### Users

#### Get All Users
- **URL**: `/api/users`
- **Method**: `GET`
- **Success Response**: `200 OK` (Array of users)

#### Create User
- **URL**: `/api/users`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```
- **Success Response**: `201 Created`

#### Get User by ID
- **URL**: `/api/users/:id`
- **Method**: `GET`
- **Success Response**: `200 OK`

#### Update User
- **URL**: `/api/users/:id`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
  ```
- **Success Response**: `200 OK`

#### Delete User
- **URL**: `/api/users/:id`
- **Method**: `DELETE`
- **Success Response**: `200 OK`

#### Search Users
- **URL**: `/api/search`
- **Method**: `GET`
- **Query Params**:
  - `q`: Search query (name)
  - `limit`: (Optional) Limit results (default 10, max 50)
- **Example**: `/api/search?q=John`
- **Success Response**: `200 OK`

### Authentication / Registration

#### Register User
- **URL**: `/api/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "Alice",
    "email": "alice@example.com",
    "password": "password123"
  }
  ```
- **Success Response**: `201 Created`

### File Upload

#### Upload File
- **URL**: `/api/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `file`: The file to upload (Max 5MB)
- **Success Response**: `200 OK` with filename.

## Project Structure

- `src/server.js`: Application entry point and route definitions.
- `src/models/`: Mongoose schemas (User).
- `src/middleware/`: Custom middleware (Logger, Error Handler, Auth).
- `src/uploads/`: File upload routes and storage directory.
- `src/utils/`: Utility functions (Database connection).
