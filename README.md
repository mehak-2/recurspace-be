# RecurSpace Backend

A Node.js + Express backend for the RecurSpace SaaS application with task management and user authentication.

## Features

- **User Authentication**: JWT-based authentication with signup, login, and profile management
- **Task Management**: Full CRUD operations for tasks with status tracking and priority levels
- **AI-Powered Suggestions**: Intelligent analysis of recurring tasks with optimization tips
- **MongoDB Integration**: Mongoose ODM for database operations
- **Security**: Password hashing, rate limiting, CORS, and helmet security headers
- **Validation**: Input validation using express-validator
- **MVC Architecture**: Clean separation of concerns with Models, Views (API responses), and Controllers

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit

## Database Connection

The application uses MongoDB with Mongoose ODM. The server will not start until a successful database connection is established. The connection includes:

- **Connection Options**: Optimized for production with proper timeouts
- **Error Handling**: Graceful error handling and process termination
- **Event Monitoring**: Connection status monitoring and graceful shutdown
- **Environment Support**: Uses `MONGO_URI` environment variable

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd recurspace-be
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/recurspace
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12
```

5. Start the development server:
```bash
npm run dev
```

**Note:** If you get a "port already in use" error, you can:
- Use the smart development script: `npm run dev:smart` (automatically finds available port)
- Change the port in your `.env` file: `PORT=5001`
- Kill the process using port 5000: `lsof -ti:5000 | xargs kill -9`

## API Endpoints

### Authentication

#### POST /api/users/signup
Create a new user account
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /api/users/login
Authenticate user and get JWT token
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET /api/users/profile
Get user profile (requires authentication)

#### PUT /api/users/profile
Update user profile (requires authentication)
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

#### PUT /api/users/change-password
Change user password (requires authentication)
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Tasks

#### POST /api/tasks
Create a new task (requires authentication)
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation for the API",
  "priority": "high",
  "dueDate": "2024-01-15T00:00:00.000Z",
  "tags": ["documentation", "api"],
  "isRecurring": false
}
```

#### GET /api/tasks
Get all tasks with filtering and pagination (requires authentication)
```
Query parameters:
- status: pending, in-progress, completed, cancelled
- priority: low, medium, high, urgent
- search: search in title and description
- page: page number (default: 1)
- limit: items per page (default: 10)
```

#### GET /api/tasks/:id
Get a specific task (requires authentication)

#### PUT /api/tasks/:id
Update a task (requires authentication)

#### PATCH /api/tasks/:id/status
Update task status (requires authentication)
```json
{
  "status": "completed"
}
```

#### DELETE /api/tasks/:id
Delete a task (requires authentication)

#### GET /api/tasks/stats
Get task statistics (requires authentication)

### AI-Powered Suggestions

#### POST /api/suggestions
Get intelligent suggestions for recurring tasks (requires authentication)
```json
{
  "tasks": [
    {
      "title": "Check emails",
      "frequency": "daily",
      "dueDate": "2024-01-10T09:00:00.000Z",
      "completed": true
    }
  ]
}
```

### Health Check

#### GET /api/health
Check API health status

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Task Model

```javascript
{
  title: String (required, max 100 chars),
  description: String (optional, max 500 chars),
  status: String (pending, in-progress, completed, cancelled),
  priority: String (low, medium, high, urgent),
  dueDate: Date (optional),
  completedAt: Date (auto-set when status = completed),
  tags: [String],
  user: ObjectId (required, ref to User),
  isRecurring: Boolean,
  recurrencePattern: String (daily, weekly, monthly, yearly),
  parentTask: ObjectId (ref to Task, for recurring tasks),
  createdAt: Date,
  updatedAt: Date
}
```

## User Model

```javascript
{
  name: String (required, max 50 chars),
  email: String (required, unique, validated),
  password: String (required, min 6 chars, hashed),
  role: String (user, admin),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Development

### Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm test`: Run tests

### Project Structure

```
recurspace-be/
├── controllers/          # Business logic
│   ├── userController.js
│   └── taskController.js
├── middleware/           # Custom middleware
│   └── authMiddleware.js
├── models/              # Database models
│   ├── User.js
│   └── Task.js
├── routes/              # API routes
│   ├── userRoutes.js
│   └── taskRoutes.js
├── server.js            # Main application file
├── package.json
├── env.example
└── README.md
```

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- CORS enabled
- Helmet security headers
- Input validation and sanitization
- MongoDB injection protection via Mongoose

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong, unique `JWT_SECRET`
3. Configure MongoDB connection string for production
4. Set up proper logging
5. Use HTTPS in production
6. Configure proper CORS origins
7. Set up monitoring and error tracking

## License

MIT 