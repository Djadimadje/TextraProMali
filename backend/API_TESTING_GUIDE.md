# TexPro AI - Users API Testing Guide

## 🚀 **API Endpoints Overview**

### **Base URL**: `http://127.0.0.1:8000/api/v1/`

## 🔐 **Authentication Endpoints**

### 1. **Login** - `POST /auth/login/`
```json
{
    "username": "Bah",
    "password": "your_password"
}
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "user": {
            "id": 1,
            "username": "Bah",
            "email": "djoudjinamadjechristian@gmail.com",
            "role": "admin",
            "first_name": "",
            "last_name": ""
        }
    }
}
```

### 2. **Get Current User** - `GET /auth/me/`
**Headers**: `Authorization: Bearer {access_token}`

### 3. **Logout** - `POST /auth/logout/`
**Headers**: `Authorization: Bearer {access_token}`
```json
{
    "refresh": "your_refresh_token"
}
```

### 4. **Refresh Token** - `POST /auth/refresh/`
```json
{
    "refresh": "your_refresh_token"
}
```

### 5. **Change Password** - `POST /auth/change-password/`
**Headers**: `Authorization: Bearer {access_token}`
```json
{
    "current_password": "old_password",
    "new_password": "new_password",
    "confirm_password": "new_password"
}
```

### 6. **Forgot Password** - `POST /auth/forgot-password/`
```json
{
    "email": "user@example.com"
}
```

### 7. **Reset Password** - `POST /auth/reset-password/`
```json
{
    "token": "reset_token_from_email",
    "new_password": "new_password",
    "confirm_password": "new_password"
}
```

## 👥 **User Management Endpoints** (Admin Only)

### 1. **Create User** - `POST /users/`
**Headers**: `Authorization: Bearer {admin_access_token}`
```json
{
    "username": "john_doe",
    "email": "john@cmdt.com",
    "password": "secure_password123",
    "role": "technician",
    "first_name": "John",
    "last_name": "Doe",
    "employee_id": "TE0001",
    "department": "Production",
    "site_location": "Bamako"
}
```

### 2. **List Users** - `GET /users/`
**Headers**: `Authorization: Bearer {admin_access_token}`

**Query Parameters:**
- `search`: Search by username, name, email, employee_id
- `role`: Filter by role (admin, supervisor, technician, inspector, analyst)
- `status`: Filter by status (active, inactive, pending, suspended)
- `department`: Filter by department
- `site`: Filter by site location
- `supervisor`: Filter by supervisor ID
- `ordering`: Sort by field (e.g., `-created_at`, `first_name`)

**Example:** `GET /users/?role=technician&status=active&search=john`

### 3. **Get User Details** - `GET /users/{id}/`
**Headers**: `Authorization: Bearer {admin_access_token}`

### 4. **Update User** - `PUT /users/{id}/`
**Headers**: `Authorization: Bearer {admin_access_token}`
```json
{
    "first_name": "John",
    "last_name": "Smith",
    "email": "john.smith@cmdt.com",
    "role": "supervisor",
    "department": "Quality Control"
}
```

### 5. **Delete User** - `DELETE /users/{id}/`
**Headers**: `Authorization: Bearer {admin_access_token}`

### 6. **Activate User** - `POST /users/{id}/activate/`
**Headers**: `Authorization: Bearer {admin_access_token}`

### 7. **Deactivate User** - `POST /users/{id}/deactivate/`
**Headers**: `Authorization: Bearer {admin_access_token}`

### 8. **Reset User Password** - `POST /users/{id}/reset_password/`
**Headers**: `Authorization: Bearer {admin_access_token}`
```json
{
    "new_password": "new_secure_password"
}
```

### 9. **Get User Statistics** - `GET /users/stats/`
**Headers**: `Authorization: Bearer {admin_access_token}`

## 🧪 **Testing Steps**

### Step 1: Test Authentication
1. **Login as Superuser**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Bah",
    "password": "your_password"
  }'
```

2. **Get Current User Profile**
```bash
curl -X GET http://127.0.0.1:8000/api/v1/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 2: Test User Management
1. **Create a New User**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/users/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "technician1",
    "email": "tech1@cmdt.com",
    "password": "password123",
    "role": "technician",
    "first_name": "Tech",
    "last_name": "User",
    "employee_id": "TE0001",
    "department": "Production"
  }'
```

2. **List All Users**
```bash
curl -X GET http://127.0.0.1:8000/api/v1/users/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

3. **Get User Statistics**
```bash
curl -X GET http://127.0.0.1:8000/api/v1/users/stats/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 3: Test Password Reset Flow
1. **Request Password Reset**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/forgot-password/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tech1@cmdt.com"
  }'
```

2. **Check Django Console** for the reset token, then:
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/reset-password/ \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN_FROM_CONSOLE",
    "new_password": "newpassword123",
    "confirm_password": "newpassword123"
  }'
```

## 🔍 **Expected Responses**

### Success Response Format:
```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": { /* response data */ }
}
```

### Error Response Format:
```json
{
    "success": false,
    "message": "Error description",
    "errors": { /* validation errors if any */ }
}
```

## 🚨 **Common Status Codes**
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## 🔧 **Admin Interface**
Access Django Admin at: `http://127.0.0.1:8000/admin/`

**Login Credentials:**
- Username: `Bah`
- Password: `your_password`

## 📝 **Notes**
1. **Console Email Backend**: Password reset emails will appear in the Django console output
2. **JWT Tokens**: Access tokens expire in 1 hour, refresh tokens in 7 days
3. **Role-Based Access**: Only admin users can access user management endpoints
4. **Account Locking**: After 5 failed login attempts, accounts are locked for 30 minutes
5. **Password Validation**: Passwords must meet Django's default validation rules
