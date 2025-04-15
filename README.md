# Elebud, a financial visualization tool

## Description

Elebud is a financial visualization tool that helps users easily transform their budgets into comprehensible charts and diagrams.

## Live demo

- [Link](https://elebud-client.onrender.com/)

**Demo Note:** _Only a username and password is needed to demo the website. No verification is required._

## Features

### Account Management

- User registration and authentication
- Secure login/logout functionality

### Project Organization

- Create, edit, and delete folders
- Organize multiple visualization projects

### Sankey Diagram Support

- Add and delete nodes
- Edit node properties:
  - Custom colors
  - Origin/destination names
  - Amount values
- Chart customization:
  - Font size adjustments
  - Background color options
  - Link and font color customization
- Multiple data display options
- Percentage display option (share diagrams without revealing actual income)

### Export Capabilities

- Download charts as PNG images

## Technology Stack

### Core Stack (PERN)

- **PostgreSQL** - Database
- **Express** - Backend framework
- **React** - Frontend library
- **Node.js** - Runtime environment
- **React Google Charts** - Visualization library

### Frontend Packages

- **html-to-image** - Converts DOM elements to downloadable images
- **react-colorful** - Color picker for chart customization
- **react-router-dom** - Route management
- **react-google-charts** - Chart generation
- **vite** - Frontend bundler

### Backend Packages

- **bcryptjs** - Password hashing
- **cookie-parser** - JWT token parsing
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **express** - Server framework
- **jsonwebtoken** - User authentication
- **nodemailer** - Email functionality (for contact form)
- **prisma/client** - Database ORM

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository

```bash
git clone https://github.com/juscao/elebud.git
cd elebud
```

2. Install backend dependencies

```bash
cd server
npm install
```

3. Configure environment variables
   Create a `.env` file in the server directory with:

```
DATABASE_URL=postgresql://username:password@localhost:5432/elebud
ACCESS_TOKEN_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
# Add other necessary environment variables
```

4. Set up the database

```bash
npx prisma migrate dev
```

5. Install frontend dependencies

```bash
cd ../client
npm install
```

6. Start the development servers

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

7. Open your browser and navigate to `http://localhost:5000`

## Usage

1. Create an account or log in
2. Create a new project
3. Add nodes to your Sankey diagram:
   - Define sources and destinations
   - Set values
   - Customize colors
4. Customize chart appearance using the settings panel
5. Export your visualization as a PNG when finished
