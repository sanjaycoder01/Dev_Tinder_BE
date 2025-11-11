# API Documentation

## Overview
This documentation describes the User and Request routes for the Dev Tinder Backend API. All routes require user authentication via JWT token stored in cookies.

---

## Authentication
All routes in this documentation require authentication using the `userauth` middleware. The authentication token should be sent as a cookie named `token`.

**Authentication Flow:**
- JWT token is extracted from `req.cookies.token`
- Token is verified using the secret key
- User is fetched from the database and attached to `req.user`

---

## User Routes

### 1. Get Received Connection Requests

**Endpoint:** `GET /user/requests/received`

**Description:** Retrieves all connection requests that have been sent to the logged-in user with status "interested" (pending requests).

**Authentication:** Required (`userauth` middleware)

**URL Parameters:** None

**Request Body:** None

**Response:**
- **Success (200):**
```json
{
  "success": true,
  "message": "Requests fetched successfully",
  "data": [
    {
      "_id": "request_id",
      "fromUserId": {
        "_id": "user_id",
        "name": "John Doe",
        "age": 28,
        "gender": "Male",
        "location": "New York",
        "skills": ["JavaScript", "Node.js"],
        "about": "Software developer"
      },
      "toUserId": "logged_in_user_id",
      "status": "interested",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

- **Error (400):**
```json
{
  "success": false,
  "message": "Error message"
}
```

**Notes:**
- Only returns requests with status "interested"
- The `fromUserId` field is populated with user details (name, age, gender, location, skills, about)
- Returns an empty array if no requests are found

---

### 2. Get Accepted Connections

**Endpoint:** `GET /user/requests/sent`

**Description:** Retrieves all accepted connection requests where the logged-in user is either the sender or receiver. This endpoint returns the list of users the logged-in user has successfully connected with.

**Authentication:** Required (`userauth` middleware)

**URL Parameters:** None

**Request Body:** None

**Response:**
- **Success (200):**
```json
{
  "success": true,
  "message": "Requests sent fetched successfully",
  "data": [
    {
      "_id": "user_id",
      "name": "Jane Doe",
      "age": 25,
      "gender": "Female",
      "location": "San Francisco",
      "skills": ["Python", "Django"],
      "about": "Backend developer"
    }
  ]
}
```

- **Error (400):**
```json
{
  "success": false,
  "message": "Error message"
}
```

**Notes:**
- Returns only connections with status "accepted"
- Includes connections where the logged-in user is either the sender or receiver
- Returns an array of user objects (not request objects)
- The `fromUserId` field is populated with user details

---

## Request Routes

### 3. Send Connection Request

**Endpoint:** `POST /request/send/:status/:toUserId`

**Description:** Sends a connection request from the logged-in user to another user. The request can be sent with status "ignore" or "interested".

**Authentication:** Required (`userauth` middleware)

**URL Parameters:**
- `status` (required): The status of the request. Must be either:
  - `"ignore"`: User is not interested
  - `"interested"`: User is interested in connecting
- `toUserId` (required): The MongoDB ObjectId of the user to send the request to

**Request Body:** None

**Response:**
- **Success (201):**
```json
{
  "success": true,
  "message": "John Doe has sent you a request to connect with you,\"interested\"",
  "data": {
    "_id": "request_id",
    "fromUserId": "logged_in_user_id",
    "toUserId": "target_user_id",
    "status": "interested",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

- **Error (400):**
```json
{
  "success": false,
  "message": "Error message"
}
```

**Possible Error Messages:**
- `"Invalid status: status must be 'ignored' or 'interested'"` - Invalid status parameter
- `"Request already sent by you to this user"` - A request already exists from the logged-in user to the target user
- `"You cannot send request to yourself"` - Attempting to send a request to yourself
- `"User has already sent a request to you!"` - A bidirectional request already exists
- `"User not found"` - The target user doesn't exist in the database

**Validation Rules:**
1. Status must be either "ignore" or "interested"
2. Cannot send a request to yourself
3. Cannot send a duplicate request (fromUserId → toUserId combination must be unique)
4. Cannot send a request if a bidirectional request already exists
5. Target user must exist in the database

---

### 4. Review Connection Request

**Endpoint:** `POST /request/review/:status/:requestId`

**Description:** Allows the logged-in user (who received the request) to review and respond to a connection request. The request must have status "interested" and must be sent to the logged-in user.

**Authentication:** Required (`userauth` middleware)

**URL Parameters:**
- `status` (required): The review status. Must be either:
  - `"accepted"`: Accept the connection request
  - `"rejected"`: Reject the connection request
- `requestId` (required): The MongoDB ObjectId of the connection request to review

**Request Body:** None

**Response:**
- **Success (200):**
```json
{
  "success": true,
  "message": "Request reviewed successfully",
  "data": {
    "_id": "request_id",
    "fromUserId": "sender_user_id",
    "toUserId": "logged_in_user_id",
    "status": "accepted",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

- **Error (400):**
```json
{
  "success": false,
  "message": "Error message"
}
```

**Possible Error Messages:**
- `"Invalid status: status must be 'accepted' or 'rejected'"` - Invalid status parameter
- `"Request not found"` - The request doesn't exist, doesn't belong to the logged-in user, or doesn't have status "interested"

**Validation Rules:**
1. Status must be either "accepted" or "rejected"
2. The request must exist in the database
3. The request must have `toUserId` matching the logged-in user
4. The request must have status "interested" (can only review pending requests)

**Notes:**
- Only requests with status "interested" can be reviewed
- The request must be sent to the logged-in user (toUserId must match)
- After review, the request status is updated to either "accepted" or "rejected"

---

## Connection Request Status Flow

The connection request system uses the following status flow:

1. **Initial Request:**
   - `"ignore"` - User is not interested (one-way, no response expected)
   - `"interested"` - User is interested in connecting (pending, awaiting response)

2. **Review Response:**
   - `"accepted"` - The recipient accepted the connection request
   - `"rejected"` - The recipient rejected the connection request

**Status Transitions:**
- `"interested"` → `"accepted"` (via review endpoint)
- `"interested"` → `"rejected"` (via review endpoint)
- `"ignore"` - Terminal status (no further action)

---

## Data Models

### ConnectRequest Model
```javascript
{
  fromUserId: ObjectId (ref: User),  // User who sent the request
  toUserId: ObjectId (ref: User),    // User who received the request
  status: String,                     // 'ignore', 'interested', 'accepted', 'rejected'
  createdAt: Date,
  updatedAt: Date
}
```

### User Model (Populated Fields)
```javascript
{
  _id: ObjectId,
  name: String,
  age: Number,
  gender: String,        // 'Male', 'Female', or 'Other'
  location: String,
  skills: [String],      // Array of skill strings
  about: String
}
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

**Common HTTP Status Codes:**
- `200` - Success (GET requests)
- `201` - Created (POST requests that create resources)
- `400` - Bad Request (validation errors, invalid parameters)
- `401` - Unauthorized (missing or invalid authentication token)

---

## Example Usage

### Example 1: Send an "interested" request
```bash
POST /request/send/interested/507f1f77bcf86cd799439011
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example 2: Review and accept a request
```bash
POST /request/review/accepted/507f1f77bcf86cd799439022
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example 3: Get received requests
```bash
GET /user/requests/received
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example 4: Get accepted connections
```bash
GET /user/requests/sent
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Notes

1. **Authentication:** All endpoints require a valid JWT token in the `token` cookie
2. **ObjectId Format:** All user IDs and request IDs must be valid MongoDB ObjectIds
3. **Unique Constraint:** There is a compound unique index on `fromUserId` and `toUserId` to prevent duplicate requests
4. **Bidirectional Check:** The system prevents bidirectional requests between the same two users
5. **Status Enum:** The ConnectRequest model enforces valid status values: 'ignore', 'interested', 'accepted', 'rejected'

