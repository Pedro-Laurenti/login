# Generic Login System

A simple and secure login system built with Next.js 15, TypeScript, and MySQL.

## Features

- 🔐 Secure JWT-based authentication
- 🍪 HTTP-only cookies for session management
- 🎨 Modern UI with Tailwind CSS and DaisyUI
- 🔒 Password hashing with SHA-256
- 📱 Responsive design
- ⚡ Next.js App Router support
- 🛡️ CSRF protection with SameSite cookies

## Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd login
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables by creating a `.env.local` file:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=login_system

# JWT Secret (use a strong random string in production)
JWT_SECRET=your_super_secret_jwt_key_here
```

4. Set up the database:
```sql
CREATE DATABASE login_system;
USE login_system;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Optional: Password reset tokens table
CREATE TABLE password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    hash_url VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

5. Create a test user (password will be hashed):
```sql
-- Example user with password "123456" (SHA-256 hashed)
INSERT INTO users (name, email, password_hash, role) VALUES 
('Test User', 'test@example.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'user');
```

## Usage

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:3000`

3. Login with:
   - Email: `test@example.com`
   - Password: `123456`

## Project Structure

```
src/
├── app/
│   ├── api/auth/          # Authentication API routes
│   │   ├── login/         # Login endpoint
│   │   ├── logout/        # Logout endpoint
│   │   └── validate/      # Token validation endpoint
│   ├── dashboard/         # Protected dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Login page
├── components/
│   └── Alert.tsx         # Alert component
└── lib/
    └── db.ts            # Database connection
```

## API Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/validate` - Token validation

## Security Features

- JWT tokens with 2-hour expiration
- HTTP-only cookies prevent XSS attacks
- SameSite cookies prevent CSRF attacks
- Password hashing with SHA-256
- Secure headers in production

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT License - feel free to use this as a base for your projects.

## Contributing

Feel free to submit issues and enhancement requests!
