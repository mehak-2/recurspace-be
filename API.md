# RecurSpace API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### JWT Middleware Features

The JWT middleware provides comprehensive authentication with the following features:

- **Token Verification**: Validates JWT tokens from Authorization header
- **User Attachment**: Attaches decoded user object to request (`req.user`)
- **Error Handling**: Detailed error responses with specific error codes
- **Security Checks**: Validates user existence and account status
- **Configuration Validation**: Ensures JWT_SECRET is properly configured

### Error Responses

The middleware returns structured error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

**Common Error Codes:**
- `MISSING_TOKEN`: No token provided in Authorization header
- `INVALID_TOKEN`: Token is malformed or invalid
- `TOKEN_EXPIRED`: Token has expired
- `USER_NOT_FOUND`: User ID in token doesn't exist
- `ACCOUNT_DEACTIVATED`: User account is deactivated
- `INVALID_TOKEN_FORMAT`: Token payload is malformed
- `INVALID_USER_ID`: User ID format is invalid
- `JWT_CONFIG_ERROR`: Server JWT configuration error

## Endpoints

### User Management

#### 1. User Registration
**POST** `/users/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### 2. User Login
**POST** `/users/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### 3. Get User Profile
**GET** `/users/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "lastLogin": "2024-01-10T10:30:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-10T10:30:00.000Z"
  }
}
```

#### 4. Update User Profile
**PUT** `/users/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

#### 5. Change Password
**PUT** `/users/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Task Management

#### 1. Create Task
**POST** `/tasks`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
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

**Response:**
```json
{
  "success": true,
  "task": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the API",
    "status": "pending",
    "priority": "high",
    "dueDate": "2024-01-15T00:00:00.000Z",
    "tags": ["documentation", "api"],
    "isRecurring": false,
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-10T10:30:00.000Z",
    "updatedAt": "2024-01-10T10:30:00.000Z"
  }
}
```

#### 2. Get All Tasks
**GET** `/tasks`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Filter by status (pending, in-progress, completed, cancelled)
- `priority`: Filter by priority (low, medium, high, urgent)
- `search`: Search in title and description
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Example:**
```
GET /tasks?status=pending&priority=high&page=1&limit=5
```

**Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "Complete project documentation",
      "description": "Write comprehensive documentation for the API",
      "status": "pending",
      "priority": "high",
      "dueDate": "2024-01-15T00:00:00.000Z",
      "tags": ["documentation", "api"],
      "isRecurring": false,
      "user": {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-10T10:30:00.000Z",
      "updatedAt": "2024-01-10T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### 3. Get Task by ID
**GET** `/tasks/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "task": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the API",
    "status": "pending",
    "priority": "high",
    "dueDate": "2024-01-15T00:00:00.000Z",
    "tags": ["documentation", "api"],
    "isRecurring": false,
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-10T10:30:00.000Z",
    "updatedAt": "2024-01-10T10:30:00.000Z"
  }
}
```

#### 4. Update Task
**PUT** `/tasks/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "priority": "medium",
  "status": "in-progress"
}
```

#### 5. Update Task Status
**PATCH** `/tasks/:id/status`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "completed"
}
```

#### 6. Delete Task
**DELETE** `/tasks/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

#### 7. Get Task Statistics
**GET** `/tasks/stats`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "byStatus": [
      { "_id": "pending", "count": 5 },
      { "_id": "in-progress", "count": 3 },
      { "_id": "completed", "count": 12 },
      { "_id": "cancelled", "count": 1 }
    ],
    "byPriority": [
      { "_id": "low", "count": 2 },
      { "_id": "medium", "count": 8 },
      { "_id": "high", "count": 7 },
      { "_id": "urgent", "count": 4 }
    ],
    "total": 21,
    "completed": 12,
    "completionRate": "57.1"
  }
}
```

### AI-Powered Suggestions

#### 8. Get Task Analysis and Suggestions
**POST** `/suggestions`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "tasks": [
    {
      "title": "Check emails",
      "frequency": "daily",
      "dueDate": "2024-01-10T09:00:00.000Z",
      "completed": true
    },
    {
      "title": "Weekly review",
      "frequency": "weekly",
      "dueDate": "2024-01-15T17:00:00.000Z",
      "completed": false
    },
    {
      "title": "Monthly planning",
      "frequency": "monthly",
      "dueDate": "2024-01-30T10:00:00.000Z",
      "completed": false
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "suggestions": {
    "summary": {
      "totalTasks": 3,
      "completionRate": "33.3",
      "overdueCount": 0,
      "frequencyBreakdown": {
        "daily": 1,
        "weekly": 1,
        "monthly": 1
      }
    },
    "recommendations": [
      {
        "type": "task_batching",
        "title": "Batch daily Tasks",
        "description": "You have 1 daily tasks. Consider grouping them together to reduce context switching and improve efficiency.",
        "suggestedBatch": ["Check emails"],
        "priority": "medium"
      },
      {
        "type": "overdue_patterns",
        "title": "Optimal Completion Day",
        "description": "Mondays are your most productive day for completing tasks (1 completed). Consider scheduling important tasks on this day.",
        "priority": "medium",
        "pattern": "optimal_day"
      }
    ],
    "insights": {
      "mostProductiveDay": "Monday",
      "recommendedBatchSize": 3,
      "suggestedTimeBlocks": {
        "morning": ["daily", "weekly"],
        "afternoon": ["monthly"],
        "evening": ["review", "planning"]
      }
    }
  },
  "analysis": {
    "patterns": {
      "totalTasks": 3,
      "completedTasks": 1,
      "overdueTasks": 0,
      "frequencyBreakdown": {
        "daily": 1,
        "weekly": 1,
        "monthly": 1
      },
      "completionRates": {
        "daily": { "completed": 1, "total": 1 },
        "weekly": { "completed": 0, "total": 1 },
        "monthly": { "completed": 0, "total": 1 }
      }
    },
    "generatedAt": "2024-01-10T12:00:00.000Z"
  }
}
```

### Health Check

#### 1. API Health
**GET** `/health`

**Response:**
```json
{
  "status": "OK",
  "message": "RecurSpace API is running"
}
```

## Error Responses

### Validation Error (400)
```json
{
  "message": "Name must be between 2 and 50 characters, Please provide a valid email"
}
```

### Authentication Error (401)
```json
{
  "message": "Access denied. No token provided."
}
```

### Not Found Error (404)
```json
{
  "message": "Task not found"
}
```

### Server Error (500)
```json
{
  "message": "Something went wrong!"
}
```

## Data Models

### Task Status Values
- `pending`: Task is waiting to be started
- `in-progress`: Task is currently being worked on
- `completed`: Task has been finished
- `cancelled`: Task has been cancelled

### Task Priority Values
- `low`: Low priority task
- `medium`: Medium priority task (default)
- `high`: High priority task
- `urgent`: Urgent task requiring immediate attention

### Recurrence Patterns
- `daily`: Task repeats every day
- `weekly`: Task repeats every week
- `monthly`: Task repeats every month
- `yearly`: Task repeats every year 