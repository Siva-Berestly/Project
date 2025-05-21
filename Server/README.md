# Server Application (Accessible Study Platform for People with Disabilities)

This is the back-end application for the Accessible Study Platform for People with Disabilities. It is built using Node.js and likely Express.js.

## Overview

The server application handles the business logic, API endpoints, database interactions, and user authentication for the platform. It serves data to the client application and processes requests.

## Features

*   **API Endpoints:** Provides RESTful APIs for:
    *   Fetching course content.
    *   User authentication (including admin login with JWT).
    *   Course management (uploading, updating, deleting courses by admin).
*   **Database Management:** Interacts with a MongoDB database to store and retrieve user data and course materials.
*   **Authentication:** Implements JWT-based authentication for secure access to admin functionalities.

## Getting Started

### Prerequisites

*   Node.js and npm (or yarn) installed.
*   MongoDB instance running and accessible.
*   A `.env` file configured with necessary environment variables (e.g., database connection string, JWT secret). See `.env.example` if available (if not, you might need to create one based on `Server/Database/db.js` and `Server/jwtSecretKey.txt`).

### Installation

1.  Navigate to the `Server` directory:
    ```bash
    cd Server
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    # yarn install
    ```

### Running the Server

1.  Start the server:
    ```bash
    npm start 
    # or if a start script is not defined in package.json, usually:
    # node index.js 
    ```
2.  The server will typically run on a port specified in your environment variables or code (e.g., `http://localhost:3000` or `http://localhost:5000`).

## Environment Configuration

Properly configuring environment variables is crucial for the server to run correctly. It is highly recommended to use a `.env` file in the `Server/` directory to manage these variables. Create a `.env` file if it doesn't exist and add the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<yourclusteraddress>/<database_name>?retryWrites=true&w=majority
# Example: MONGODB_URI=mongodb+srv://myuser:mypassword@mycluster.mongodb.net/study_platform?retryWrites=true&w=majority

# JWT Secret
# Generate a strong secret key. You can use the command in `jwtSecretKey.txt` or another method.
# Example: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=<your_generated_jwt_secret>

# Nodemailer Configuration (for email functionalities, if any)
ADMIN_EMAIL=<your_admin_email_address>
ADMIN_EMAIL_APP_PASSWORD=<your_admin_email_app_password_for_nodemailer>
```

**Important Security Note on Database Credentials:**

The current `Server/Database/db.js` file appears to have **hardcoded MongoDB credentials**:
```javascript
const userName = "enter your username";
const Password = "enter your password";
const database = "enter your database name";
const mongoURI = `mongodb+srv://${userName}:${Password}@study-platform.rto1i.mongodb.net/${database}?retryWrites=true&w=majority`;
```
It is **strongly recommended** to modify `Server/Database/db.js` to read these values (`userName`, `Password`, `database`, or the entire `mongoURI`) from environment variables (e.g., `process.env.MONGODB_URI`) instead of hardcoding them. This improves security and flexibility. For example:

```javascript
// In Server/Database/db.js
// const mongoURI = process.env.MONGODB_URI; 
// Ensure you have MONGODB_URI set in your .env file
```

**JWT Secret Key:**

The file `Server/jwtSecretKey.txt` contains a command to generate a suitable JWT secret:
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
Run this command in your terminal to generate a new secret, and then set it as the `JWT_SECRET` environment variable in your `.env` file. **Do not commit your actual JWT secret to version control.**

## Database Setup (MongoDB)

This application uses MongoDB as its database.

1.  **Set up a MongoDB instance:**
    *   You can use MongoDB Atlas for a cloud-hosted solution (recommended for ease of use and scalability).
    *   Alternatively, you can install and run a local MongoDB server.
2.  **Obtain your Connection String:**
    *   Once your MongoDB instance is running (either locally or on Atlas), get your MongoDB connection string (URI). This string will look something like `mongodb+srv://<username>:<password>@<yourclusteraddress>/<database_name>?retryWrites=true&w=majority` or `mongodb://localhost:27017/<database_name>` for local instances.
3.  **Configure `MONGODB_URI`:**
    *   Set this connection string as the `MONGODB_URI` environment variable in your `.env` file in the `Server/` directory.
    *   **Important:** As noted above, ensure that `Server/Database/db.js` is modified to use this environment variable rather than hardcoded credentials.
4.  **Database and Collections:**
    *   The necessary database and collections will typically be created automatically by the application when it first connects and performs operations, based on the Mongoose models defined in `Server/Models/`. Ensure the user specified in your `MONGODB_URI` has permissions to create databases and collections if they don't already exist.

## Initial Admin User Setup

To create an initial administrator account for the platform, you need to run a script from the `Server/scripts/` directory.

1.  **Navigate to the server directory:**
    ```bash
    cd Server
    ```
2.  **Ensure your environment is configured:**
    Make sure your `.env` file is correctly set up with the `MONGODB_URI` and `JWT_SECRET` as described in the "Environment Configuration" section. The script will need to connect to the database and may use JWT functionalities.
3.  **Run the admin creation script:**
    ```bash
    node scripts/createAdminUser.js
    ```
4.  **Default Credentials / Access:**
    Once the script completes successfully, you can use the **"admin"** as username and **"Admin@123"** as password.
    
5.  **Password Management:**
    After your initial login, it is recommended to change your admin password through the settings available in the admin dashboard.

**Note on `verifyAdmin.js`:**
The `Server/scripts/` directory also contains a `verifyAdmin.js` script. This script might be used for checking the status or details of an existing admin user, or for other verification purposes. Consult the script's contents for its specific functionality if needed.

## API Endpoints

Details of the API endpoints can be found by examining the route files in `Server/routes/`. Key route files include:
*   `authRoutes.js`: Handles user registration and login.
*   `adminRoutes.js`: Handles course management by admin users.

## Key Technologies

*   **Node.js:** A JavaScript runtime environment.
*   **Express.js (assumed):** A popular Node.js web application framework.
*   **MongoDB:** A NoSQL document database.
*   **JWT (JSON Web Tokens):** Used for securing authentication.
