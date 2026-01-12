# Gloosy Backend API Documentation

## Base URL

**Production:** `https://gloosy-backend.vercel.app`

## Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are returned from authentication endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/google-login`).

---

## Endpoints

### 1. Root Endpoint

**GET** `/`

Returns a simple hello message.

#### Request

```bash
curl https://gloosy-backend.vercel.app/
```

#### Response

```
200 OK
hello
```

---

### 2. Authentication Endpoints

#### 2.1 Register User

**POST** `/api/auth/register`

Register a new user account.

##### Request Body

```json
{
  "role": "customer" | "creator",
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

##### Request Example (cURL)

```bash
curl -X POST https://gloosy-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "customer",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

##### Request Example (JavaScript)

```javascript
const response = await fetch(
  "https://gloosy-backend.vercel.app/api/auth/register",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      role: "customer",
      email: "john@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    }),
  }
);

const data = await response.json();
console.log(data);
```

##### Response (Success)

```json
{
  "message": "user created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Code:** `201 Created`

##### Response (Error)

```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Status Codes:**

- `400 Bad Request` - Validation error
- `409 Conflict` - Duplicate email
- `500 Internal Server Error` - Server error

---

#### 2.2 Login

**POST** `/api/auth/login`

Login with email and password.

##### Request Body

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

##### Request Example (cURL)

```bash
curl -X POST https://gloosy-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

##### Request Example (JavaScript)

```javascript
const response = await fetch(
  "https://gloosy-backend.vercel.app/api/auth/login",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "john@example.com",
      password: "password123",
    }),
  }
);

const data = await response.json();
console.log(data);
```

##### Response (Success)

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Code:** `200 OK`

##### Response (Error)

```json
{
  "message": "Invalid user credentials"
}
```

**Status Codes:**

- `401 Unauthorized` - Invalid credentials
- `500 Internal Server Error` - Server error

---

#### 2.3 Google Sign-In

**POST** `/api/auth/google-login`

Sign in or register using Google OAuth.

##### Request Body

```json
{
  "name": "John Doe",
  "email": "user@gmail.com",
  "role": "customer" | "creator"
}
```

##### Request Example (cURL)

```bash
curl -X POST https://gloosy-backend.vercel.app/api/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@gmail.com",
    "role": "customer"
  }'
```

##### Request Example (JavaScript)

```javascript
const response = await fetch(
  "https://gloosy-backend.vercel.app/api/auth/google-login",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "John Doe",
      email: "john@gmail.com",
      role: "customer",
    }),
  }
);

const data = await response.json();
console.log(data);
```

##### Response (Success - New User)

```json
{
  "message": "User created successfully via Google sign-in",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Code:** `201 Created`

##### Response (Success - Existing User)

```json
{
  "message": "Google sign-in successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Code:** `200 OK`

##### Response (Error)

**Status Codes:**

- `400 Bad Request` - Validation error
- `409 Conflict` - Duplicate email
- `500 Internal Server Error` - Server error

---

### 3. Profile Endpoints

#### 3.1 Update User Profile

**POST** `/profile/updateProfile`

Update user profile information. Requires authentication.

##### Headers

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

##### Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "description": "I am a creative professional",
  "profilePicture": "https://example.com/image.jpg",  // Optional: URL string
  "primarySkill": "Video creation" | "Photo Creation",
  "experience": 5
}
```

**Note:** `userName` is auto-generated from `firstName` + `lastName`. You can also upload an image file using `multipart/form-data` (see below).

##### Request Example (cURL - JSON)

```bash
curl -X POST https://gloosy-backend.vercel.app/profile/updateProfile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "description": "I am a creative professional",
    "primarySkill": "Video creation",
    "experience": 5
  }'
```

##### Request Example (cURL - Multipart with Image)

```bash
curl -X POST https://gloosy-backend.vercel.app/profile/updateProfile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "dateOfBirth=1990-01-01" \
  -F "description=I am a creative professional" \
  -F "primarySkill=Video creation" \
  -F "experience=5" \
  -F "profilePicture=@/path/to/image.jpg"
```

##### Request Example (JavaScript - JSON)

```javascript
const response = await fetch(
  "https://gloosy-backend.vercel.app/profile/updateProfile",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1990-01-01",
      description: "I am a creative professional",
      primarySkill: "Video creation",
      experience: 5,
    }),
  }
);

const data = await response.json();
console.log(data);
```

##### Request Example (JavaScript - FormData with Image)

```javascript
const formData = new FormData();
formData.append("firstName", "John");
formData.append("lastName", "Doe");
formData.append("dateOfBirth", "1990-01-01");
formData.append("description", "I am a creative professional");
formData.append("primarySkill", "Video creation");
formData.append("experience", "5");

// If uploading an image file
const fileInput = document.querySelector('input[type="file"]');
if (fileInput.files[0]) {
  formData.append("profilePicture", fileInput.files[0]);
}

const response = await fetch(
  "https://gloosy-backend.vercel.app/profile/updateProfile",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type header when using FormData - browser sets it automatically
    },
    body: formData,
  }
);

const data = await response.json();
console.log(data);
```

##### Response (Success)

```json
{
  "message": "User profile updated successfully",
  "userProfile": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "userName": "John Doe",
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "description": "I am a creative professional",
    "profilePicture": "https://res.cloudinary.com/.../user_507f1f77bcf86cd799439011.jpg",
    "primarySkill": "Video creation",
    "experience": 5
  }
}
```

**Status Code:** `200 OK`

##### Response (Error)

```json
{
  "error": "bad request not authrozed"
}
```

**Status Codes:**

- `400 Bad Request` - Validation error or no fields provided
- `401 Unauthorized` - Missing or invalid token
- `500 Internal Server Error` - Server error

---

## Error Responses

All endpoints may return the following error responses:

### 404 Not Found

```json
{
  "message": "route not found"
}
```

### 500 Internal Server Error

```json
{
  "message": "server error"
}
```

or

```json
{
  "error": "Internal server error",
  "message": "Error details"
}
```

---

## Field Validation Rules

### Register/Login

- **email**: Valid email format
- **password**: Minimum 8 characters
- **role**: Must be either `"customer"` or `"creator"`
- **firstName**: Required, minimum 1 character
- **lastName**: Required, minimum 1 character

### Profile Update

- **firstName**: Required, minimum 1 character
- **lastName**: Required, minimum 1 character
- **dateOfBirth**: Valid date (ISO format or parseable date string)
- **description**: Required, minimum 1 character
- **primarySkill**: Must be either `"Video creation"` or `"Photo Creation"`
- **experience**: Required, minimum 1 (number)
- **profilePicture**: Optional - URL string or image file (JPEG, PNG, WebP, max 5MB)

---

## CORS

The API currently allows requests from all origins. CORS is configured to accept:

- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization
- **Credentials**: Allowed

---

## Notes

1. **JWT Tokens**: Tokens are returned from authentication endpoints and should be stored securely. Include them in the `Authorization` header for protected routes.

2. **Profile Picture Upload**: You can provide a profile picture either as:

   - A URL string in the `profilePicture` field (JSON request)
   - An image file using `multipart/form-data` (the file will be uploaded to Cloudinary)

3. **Database Connection**: The API uses MongoDB. Ensure your database connection string is properly configured in environment variables.

4. **Environment Variables**: Required environment variables:
   - `DB_URL` - MongoDB connection string
   - `JWT_SECRET` - Secret key for JWT (minimum 32 characters)
   - `JWT_EXPIRES_IN` - Token expiration (default: "7d")
   - `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Cloudinary API secret
   - Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

---

## Testing Endpoints

### Quick Test with cURL

```bash
# Test root endpoint
curl https://gloosy-backend.vercel.app/

# Register a user
curl -X POST https://gloosy-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"role":"customer","email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST https://gloosy-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Update profile (replace YOUR_TOKEN with actual token)
curl -X POST https://gloosy-backend.vercel.app/profile/updateProfile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Updated","lastName":"Name","dateOfBirth":"1990-01-01","description":"Updated description","primarySkill":"Video creation","experience":3}'
```

---

## Support

For issues or questions, please check the deployment logs in your Vercel dashboard or review the server logs.
