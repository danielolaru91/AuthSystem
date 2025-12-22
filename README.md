# AuthSystem

A simple authentication system built with ASP.NET Core 9 (Backend), MySQL, and Angular 21 (Frontend).
This project provides login, registration, and user management with a MySQL database.

# Features

User registration and login  
JWT-based authentication  
Password hashing  
MySQL database integration  
API testing support via Postman or Swagger  
Frontend built with Angular for UI

# Tech Stack

Backend: ASP.NET Core 9 with Entity Framework Core and Pomelo MySQL provider  
Frontend: Angular 21 with TypeScript and SCSS. Uses the new control flow syntax in templates and the experimental Signal Forms API for reactive forms. 
Database: MySQL 8+  
Authentication: JWT (JSON Web Tokens) implemented with HttpOnly cookies. Upon login, the backend generates a JWT and sets it in a secure, HttpOnly cookie. The frontend automatically sends this cookie with each request to protected API endpoints. This approach improves security by preventing client-side scripts from accessing the token.

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
