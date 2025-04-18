# Simple Marketplace

A web application for listing and managing items for sale, built with React and Supabase.

## Features

- User authentication using Supabase.
- Create, read, and manage items for sale.
- Upload and display item images using Supabase Storage.
- Real-time messaging between users.

## Tech Stack

- **Frontend**: React, TypeScript
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/simple-marketplace.git
   cd simple-marketplace
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Supabase credentials:

   ```properties
   VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

## Environment Variables

The following environment variables are required:

- `VITE_SUPABASE_URL`: Your Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key.

## Project Structure

```plaintext
simple-marketplace/
├── src/
│   ├── components/       # Reusable components
│   ├── pages/            # Application pages (e.g., Messages, NewItem)
│   ├── styles/           # Global styles
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── .env                  # Environment variables
├── package.json          # Project dependencies and scripts
└── README.md             # Project documentation
```

## Key Features

### 1. User Authentication
- Users can sign in and manage their items using Supabase's authentication system.

### 2. Item Management
- Users can create, update, and delete items for sale.
- Images are uploaded to Supabase Storage.

### 3. Messaging
- Real-time messaging between users using Supabase's `postgres_changes` subscription.

## Deployment

To deploy the application:

1. Build the project:

   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to your hosting provider (e.g., Vercel, Netlify).

## Troubleshooting

### Common Issues

1. **Row-Level Security (RLS) Errors**:
   - Ensure you have configured the correct RLS policies in Supabase for your tables.

2. **Storage Upload Errors**:
   - Verify that your Supabase storage bucket has the correct permissions.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments

- [Supabase](https://supabase.com) for the backend services.
- [React](https://reactjs.org) for the frontend framework.
- [Tailwind CSS](https://tailwindcss.com) for styling.
