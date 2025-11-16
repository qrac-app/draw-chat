# Chat Application

A modern real-time chat application built with React, TypeScript, and Convex. Features drawing capabilities, file attachments, and both private and group messaging.

## Features

- **Real-time Messaging** - Instant message delivery with Convex backend
- **Drawing Canvas** - Draw and share sketches directly in chat
- **File Attachments** - Upload images, videos, audio, and documents with compression
- **Private & Group Chats** - Create both one-on-one and group conversations
- **User Profiles** - Customizable profiles with usernames and avatars
- **Authentication** - Secure Google OAuth integration
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Input Method Settings** - Choose between keyboard and canvas as default input

## Tech Stack

### Frontend

- **React 19** - UI framework with hooks
- **TypeScript** - Type safety and better DX
- **TanStack Router** - File-based routing with SSR support
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Backend

- **Convex** - Real-time database and serverless functions
- **Convex Auth** - Authentication with Google OAuth

### Development Tools

- **Vite** - Fast build tool and dev server
- **Vitest** - Testing framework
- **ESLint** - Code linting with TanStack config
- **Prettier** - Code formatting

## Convex Features Used

### Database Schema

- **Authentication Tables** - User management with `@convex-dev/auth`
- **Chat System** - Tables for chats, members, and messages
- **File Storage** - Attachment handling with Convex storage
- **User Profiles** - Extended user information
- **Settings** - User preferences storage

### Real-time Features

- **Live Queries** - Real-time message updates
- **Mutations** - Server-side message sending and file uploads
- **Indexes** - Optimized queries for chat performance
- **Storage Integration** - File upload and retrieval

### Authentication

- **Google OAuth** - Secure user authentication
- **Session Management** - Automatic token handling
- **Profile System** - User data management

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm package manager
- Google OAuth credentials (for authentication)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd chat
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up Convex**

   ```bash
   npx convex dev
   ```

   This will create a new Convex project and set up the required environment variables.

4. **Configure Authentication**
   - Create a Google OAuth application in Google Cloud Console
   - Set the redirect URI to your Convex deployment URL
   - Add the Google Client ID to your Convex environment variables

5. **Environment Variables**
   Create a `.env.local` file with:
   ```env
   VITE_CONVEX_URL=your-convex-url
   CONVEX_DEPLOYMENT=your-convex-deployment
   ```

### Running the Application

1. **Start Convex backend**

   ```bash
   npx convex dev
   ```

2. **Start the development server**

   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

## Available Scripts

- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build for production
- `pnpm test` - Run all tests with Vitest
- `pnpm test <filename>` - Run single test file
- `pnpm lint` - Run ESLint
- `pnpm format` - Run Prettier
- `pnpm check` - Format and fix linting issues

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   └── ui/             # Base UI components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── routes/             # File-based routing
└── integrations/       # Third-party integrations

convex/
├── auth/              # Authentication configuration
├── *.ts              # Database functions and schema
└── _generated/       # Generated type definitions
```

## Key Components

### Chat System

- **ChatContainer** - Main chat interface with message list
- **MessageBubble** - Individual message display
- **MessageInput** - Input component with drawing/file support
- **ChatsList** - List of user conversations

### Media Features

- **DrawingCanvas** - Touch-enabled drawing with colors and tools
- **FileUpload** - Drag-and-drop file upload with compression
- **AttachmentPreview** - File preview and display

### Authentication

- **SignInWithGoogle** - Google OAuth integration
- **AuthContext** - Authentication state management

## Code Style

This project follows these conventions:

- **Prettier**: No semicolons, single quotes, trailing commas
- **ESLint**: TanStack config with strict TypeScript
- **Imports**: React components with PascalCase, `@/*` path aliases
- **Components**: Functional components with hooks, default exports
- **Styling**: Tailwind CSS with clsx/tailwind-merge for conditional classes
- **Error Handling**: Try/catch blocks, console.error for logging

## Testing

The project uses Vitest with React Testing Library. Test files should be named `*.test.ts` or `*.test.tsx`.

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test ChatContainer.test.tsx
```

## Deployment

### Production Build

```bash
pnpm build
```

### Deploying Convex

```bash
npx convex deploy
```

The application is ready for deployment on platforms like Vercel, Netlify, or any static hosting service.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm check` to ensure code quality
5. Submit a pull request

## License

This project is licensed under the MIT License.
