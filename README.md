# AuthSystem

A complete authentication and user management system built with ASP.NET Core 9, MySQL, and Angular 21. The backend implements a secure, modern authentication flow using short‑lived JWT access tokens, rotating refresh tokens, HttpOnly cookies, and server‑side session invalidation through tokenVersion. The frontend integrates seamlessly using Angular’s HttpClient with credentials enabled.

# Features

User registration with email confirmation
Login with JWT access tokens and rotating refresh tokens
HttpOnly cookie storage for both tokens
Short‑lived access tokens (15 minutes)
Refresh token rotation and server‑side validation
tokenVersion mechanism for instant session invalidation
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

Access Token: A short‑lived JWT containing userId, email, role, and tokenVersion. Used for authorization. Expires in about 15 minutes.

Refresh Token: A long‑lived, cryptographically secure token stored in the database. It is rotated on every refresh request. The old token becomes invalid immediately, preventing replay attacks.

HttpOnly Cookies: Both tokens are stored in HttpOnly cookies so they cannot be accessed by JavaScript. In production, cookies are marked Secure and use strict SameSite rules to reduce CSRF risks.

Token Versioning: Each user has a tokenVersion stored in the database. The access token also contains this value. When a user updates their account or an admin modifies them, tokenVersion is incremented. All existing access tokens become invalid instantly.

Email Confirmation: New users receive a confirmation link with a time‑limited token.

Password Reset: Users can request a password reset link, also using a time‑limited token.

User Management: Admins can create, update, delete, and bulk delete users. Updating a user invalidates their refresh token and increments tokenVersion.

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
