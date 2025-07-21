# AI Optimizer API

The AI Optimizer provides intelligent insights and recommendations to optimize user workflows, tasks, and productivity patterns.

## Features

- **AI Suggestions**: Generate intelligent optimization recommendations based on user data
- **Pattern Analysis**: Detect work patterns and identify optimization opportunities
- **Statistics**: Track optimization performance and application rates
- **Real-time Updates**: Apply suggestions and track their impact

## API Endpoints

### GET /api/ai-optimizer
Get all AI optimizations for the authenticated user.

**Query Parameters:**
- `type` (optional): Filter by optimization type
- `category` (optional): Filter by category
- `status` (optional): Filter by status
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

### GET /api/ai-optimizer/stats
Get optimization statistics and metrics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "byStatus": [...],
    "byType": [...],
    "byImpact": [...],
    "total": 10,
    "applied": 5,
    "applicationRate": "50.0",
    "totalSavings": {
      "time": 12.5,
      "efficiency": 25.0
    }
  }
}
```

### GET /api/ai-optimizer/patterns
Get pattern analysis based on user's work data.

**Response:**
```json
{
  "success": true,
  "patterns": [
    {
      "pattern": "Late Friday Deliveries",
      "frequency": "3 out of 15 tasks",
      "impact": "Client satisfaction risk",
      "recommendation": "Shift deadline to Thursday",
      "confidence": 85,
      "category": "time_management"
    }
  ],
  "summary": {
    "totalPatterns": 3,
    "highImpactPatterns": 2,
    "averageConfidence": "83.3"
  }
}
```

### POST /api/ai-optimizer/generate
Generate new AI optimizations.

**Body:**
```json
{
  "type": "general",
  "data": {}
}
```

**Types:**
- `workflow`: Analyze workflow efficiency
- `task`: Analyze task patterns
- `schedule`: Analyze schedule efficiency
- `general`: Generate general optimizations

### PATCH /api/ai-optimizer/:id/status
Update optimization status.

**Body:**
```json
{
  "status": "applied"
}
```

**Statuses:**
- `pending`: New optimizati 