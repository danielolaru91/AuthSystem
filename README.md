# AuthSystem

A complete authentication and user management system built with ASP.NET Core 9, MySQL, and Angular 21.

The backend implements a secure, modern authentication flow using short‑lived JWT access tokens, rotating refresh tokens, HttpOnly cookies, and server‑side session invalidation through tokenVersion. The frontend integrates seamlessly using Angular’s HttpClient with credentials enabled.

# Features

User registration with email confirmation  
Login with JWT access tokens and rotating refresh tokens  
HttpOnly cookie storage for both tokens  
Short‑lived access tokens (15 minutes)  
Refresh token rotation and server‑side validation  
TokenVersion mechanism for instant session invalidation  
Password reset via email  
Full user management (create, update, delete, bulk delete)  
Automatic session restoration and refresh handling in Angular  
MySQL database integration through Entity Framework Core  
Secure password hashing using BCrypt

# Tech Stack

Backend: ASP.NET Core 9 with Entity Framework Core and Pomelo MySQL provider  
Frontend: Angular 21 with TypeScript and SCSS, using the new control flow syntax and the experimental Signal Forms API  
Database: MySQL 8+  

Authentication: JWT access tokens and refresh tokens stored in HttpOnly cookies. The backend generates both tokens at login and sets them as HttpOnly cookies. The browser automatically sends these cookies with each request, and Angular does not have direct access to them. This prevents token theft through JavaScript and improves overall security.

# Authentication Architecture


## 1. User Registration Flow

- User submits registration form (email + password).  
- Backend hashes the password with BCrypt and creates the user in MySQL.  
- Backend generates an email confirmation token and sends a confirmation link.  
- When the user clicks the link, the backend validates the token and marks the user as email confirmed.

## 2. Login Flow (Access + Refresh Tokens)

- User logs in with email and password.  
- Backend validates credentials and generates:
  - A short‑lived JWT access token (userId, email, role, tokenVersion, ~15 minutes).  
  - A long‑lived refresh token stored in the database.  
- Both tokens are sent as HttpOnly cookies (`accessToken`, `refreshToken`).  
- Angular never reads the tokens directly; the browser sends cookies automatically with each request.

## 3. Access Token Expiration & Refresh Flow

- When the access token expires, API calls fail authorization.  
- Backend reads the refresh token from the HttpOnly cookie and validates it against the database.  
- If valid, the backend:
  - Issues a new access token.  
  - Rotates the refresh token (creates a new one, invalidates the old one).  
- New tokens are again set as HttpOnly cookies.

## 4. Logout Flow

- User triggers logout.  
- Backend deletes the refresh token record from the database.  
- Backend clears both access and refresh token cookies.  
- Without a valid refresh token, no new access tokens can be issued.

## 5. Token Versioning (Instant Session Invalidation)

- Each user has a `tokenVersion` stored in the database.  
- The access token also contains `tokenVersion`.  
- When a user or admin performs a security‑sensitive update (e.g., password change, role change), `tokenVersion` is incremented.  
- All existing access tokens with the old version become invalid immediately.

## 6. Automatic Session Restoration (Frontend)

- On app load, Angular calls an endpoint like `/auth/refresh` with `withCredentials: true`.  
- If the refresh token is valid, the backend issues a new access token and rotated refresh token.  
- The user stays logged in without manually handling tokens in the frontend.  
- If the refresh token is invalid or missing, the user is treated as logged out.

## 7. Password Reset Flow

- User requests a password reset.  
- Backend generates a time‑limited reset token and sends it via email.  
- User opens the link, submits a new password.  
- Backend hashes the new password, increments `tokenVersion`, and invalidates all refresh tokens for that user.  
- All existing sessions are effectively terminated.

## 8. Admin User Management Flow

- Admins can create, update, delete, and bulk delete users.  
- When an admin updates a user (e.g., role, status), the system:
  - Increments `tokenVersion` for that user.  
  - Invalidates their refresh tokens.  
- This ensures role or status changes take effect immediately across all sessions.

## 9. Database Structure (Simplified)

- **Users table** (created via EF Core migrations) typically includes:  
  - `Id`, `Email`, `PasswordHash`, `TokenVersion`, `EmailConfirmed`, timestamps, etc.  
- **RefreshTokens table** includes:  
  - `Id`, `UserId`, `Token`, `ExpiresAt`, timestamps.  
- Refresh tokens are always validated against this table and rotated on use.

## 10. Frontend Integration (Angular 21)

- Angular uses HttpClient with `withCredentials: true` so cookies are sent automatically.  
- No tokens are stored in localStorage or sessionStorage.  
- The app relies on backend endpoints for:
  - Login  
  - Refresh  
  - Logout  
  - User management  
- This design minimizes exposure of tokens to JavaScript and aligns with modern security best practices.

# Setup Instructions

## Backend

Go to the backend folder:  
`cd backend`

Restore NuGet packages:  
`dotnet restore`

Update the connection string in `appsettings.Development.json` (or via environment variables) to match your MySQL credentials:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "server=localhost;port=3306;user=root;password=rootroot;database=auth"
  },
  "Jwt": {
    "Key": "YOUR_SECRET_KEY",
    "Issuer": "backend",
    "Audience": "frontend"
  }
}
```

Apply EF Core migrations (the database will be created automatically):  
`dotnet ef database update`

Run the backend API:  
`dotnet run`

The API listens on: `http://localhost:5121`

## Frontend

Go to the frontend folder:  
`cd frontend`

Install dependencies:  
`npm install`

Update the API URL in `src/environments/environment.ts` if needed:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5121'
};
```

Run the Angular app:  
`ng serve`

The frontend runs on: `http://localhost:4200`

# Database

The MySQL database stores users. The `Users` table is created automatically by EF Core migrations.  
Columns: Id (int), Email (string), PasswordHash (string)  
Ensure your MySQL server is running locally or update the connection string accordingly.

# Environment Variables

Keep secrets out of GitHub. Use environment variables or `appsettings.Development.json` for the JWT secret key (`Jwt:Key`) and MySQL connection string.

# Running the App

Start the backend:  
`dotnet run` from the backend folder  
Start the frontend:  
`ng serve` from the frontend folder  
Open the app in your browser at `http://localhost:4200` and test API endpoints via Postman or Swagger.
