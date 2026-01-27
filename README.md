# Range Status

A production-ready MVP SaaS that helps golf driving ranges show live traffic-light status (Quiet/Moderate/Busy) that staff can update in seconds, and golfers can view on a public page + directory.

## Features

### 🎯 Range Portal (Range Staff)
- **Quick Status Updates**: Large mobile-friendly buttons for Quiet/Moderate/Busy
- **Optional Notes**: Add context with 60-character notes
- **Opening Hours Management**: Set weekly hours with validation
- **QR Code & Poster**: Generate QR codes and printable posters for customers
- **Real-time Updates**: Status changes reflect immediately on public pages

### 🌐 Public Directory & Range Pages
- **Range Directory**: Browse and search ranges by location
- **Live Status Display**: See current busyness with timestamps
- **Opening Hours**: Clear display of daily hours with "Open now" status
- **Typical Busy Times**: Historical data analysis (after 7 days of updates)
- **Mobile-first Design**: Optimized for on-the-go checking

### 👨‍💼 Super Admin (Range Management)
- **Range Management**: Create, edit, and manage ranges
- **User Management**: Create portal logins for range staff
- **Health Monitoring**: Track stale status updates (>90 minutes)
- **Statistics Dashboard**: Overview of range activity

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Session-based auth with secure cookies
- **Validation**: Zod for type-safe validation
- **QR Codes**: qrcode library for generating poster graphics

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/range_status?schema=public"

# Admin setup (used during seeding)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"

# Auth (generate a secure random string)
NEXTAUTH_SECRET="your-secure-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup

Initialize the database schema:

```bash
# Generate Prisma client
npm run db:generate

# Run migrations to create tables
npm run db:migrate

# Seed initial data (admin user + sample range)
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Default Login Credentials

After seeding, you can use these credentials:

**Admin Dashboard** (`/admin/ranges`)
- Email: `admin@example.com` (or your ADMIN_EMAIL)
- Password: `your-secure-password` (or your ADMIN_PASSWORD)

**Sample Range Portal** (`/portal`)
- Email: `testrange@example.com`
- Password: `range123`

## Database Commands

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create and apply new migration
npm run db:migrate

# Seed the database with initial data
npm run db:seed

# Open Prisma Studio to view/edit data
npm run db:studio

# Reset database (careful - this deletes all data)
npx prisma migrate reset
```

## Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Seed script
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── admin/           # Admin panel
│   │   ├── portal/          # Range staff portal
│   │   ├── ranges/          # Public directory
│   │   ├── r/[slug]/        # Public range pages
│   │   └── api/             # API routes
│   ├── components/          # Reusable React components
│   └── lib/                 # Utilities and database
├── tailwind.config.ts       # Tailwind CSS configuration
└── README.md
```

## Key Routes

### Public Routes (No Login Required)
- `/ranges` - Range directory with search and filtering
- `/ranges/[area]` - Ranges filtered by area (redirects to main directory)
- `/r/[slug]` - Individual range page with live status

### Portal Routes (Range Staff)
- `/portal` - Main control panel for status updates
- `/portal/hours` - Manage opening hours
- `/portal/qr` - View QR code and print poster

### Admin Routes (Super Admin)
- `/admin/ranges` - Manage all ranges
- `/admin/ranges/new` - Create new range + portal user
- `/admin/ranges/[id]` - Edit range details

### Auth Routes
- `/login` - Unified login for admin and range users

## Creating New Ranges

1. **Admin Login**: Sign in at `/login` with admin credentials
2. **Navigate**: Go to Admin → "Add New Range"
3. **Fill Details**:
   - Range name, area, and optional town
   - URL slug (auto-generated but editable)
   - Portal user email and password
4. **Create**: The system creates both the range and its portal login
5. **Share Credentials**: Provide the portal login to range staff

## Range Portal Usage

Range staff can:
1. **Update Status**: Tap large Quiet/Moderate/Busy buttons
2. **Add Notes**: Optional context (e.g., "Lesson in progress")
3. **Manage Hours**: Set opening hours for each day
4. **Get QR Code**: Generate and print customer posters
5. **View Public Link**: See how customers view their range

## Public Page Features

Customers can:
- **Check Status**: See live Quiet/Moderate/Busy indicator
- **View Hours**: Current opening hours with "Open now" status
- **Read Notes**: Any additional context from staff
- **See Updates**: Timestamp of last status update
- **Browse Directory**: Find ranges by location or search

## Data Model

- **Range**: Core range info, status, and settings
- **User**: Admin and range portal users with role-based access
- **StatusEvent**: Historical log of all status changes

## Phase 2: Typical Busy Times

After 7 days of status updates, ranges show:
- **Weekly Heatmap**: Visual pattern of busy times by day/hour
- **Top 3 Busiest Windows**: Most consistently busy 2-hour periods
- **Historical Analysis**: Based on QUIET(1), MODERATE(2), BUSY(3) scoring

## Security Features

- **Session-based Authentication**: Secure HTTP-only cookies
- **Role-based Access**: Admin vs Range user permissions
- **Input Validation**: Zod validation on all forms and APIs
- **Route Protection**: Middleware prevents unauthorized access
- **CSRF Protection**: Built-in Next.js CSRF protection

## Production Deployment

### Environment Variables
Ensure all required environment variables are set:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secure random string (use `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your production domain

### Database
1. Set up production PostgreSQL database
2. Run migrations: `npx prisma migrate deploy`
3. Seed initial admin user: `npm run db:seed`

### Build & Deploy
```bash
npm run build
npm start
```

## Common Tasks

### Reset a Range's Password
1. Admin login → Edit range
2. Generate new password
3. Share with range staff

### Deactivate a Range
1. Admin login → Edit range
2. Toggle "Deactivate Range"
3. Range disappears from public directory

### Monitor Stale Ranges
1. Admin dashboard shows ranges with stale status (>90 min)
2. Filter view to show only stale ranges
3. Contact ranges to update status

## Support

For issues or questions:
1. Check existing GitHub issues
2. Create new issue with reproduction steps
3. Include relevant logs and environment details

## License

MIT License - see LICENSE file for details.