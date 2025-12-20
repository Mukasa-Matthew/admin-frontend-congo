# Congo News Admin Dashboard

A beautiful, modern admin dashboard for managing the Congo News platform.

## Features

- 🎨 Modern, responsive UI with Tailwind CSS
- 📊 Dashboard with statistics and analytics
- 📝 Full article management (CRUD)
- 📁 Category and tag management
- 💬 Comment moderation
- 📧 Newsletter subscriber management
- 🔐 Secure authentication with JWT
- ⚡ Fast and optimized with React Query

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **Lucide React** - Icons

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```
VITE_API_URL=http://localhost:9000/api
```

4. Start development server:
```bash
npm run dev
```

## Default Login

Use the admin credentials from your backend setup:
- Email: Check your backend `.env` file (ADMIN_EMAIL)
- Password: Check your backend `.env` file (ADMIN_PASSWORD)

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.
