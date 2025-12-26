# Bimo Yacht For Sale

A production-ready, ultra-luxury yacht sales & charter platform built for a UAE-licensed company with heavy Instagram traffic (900K+ followers).

## 🛥️ Features

### Public Website
- **Home Page**: Fullscreen video hero, trust badges, featured yachts, services, Instagram section
- **Yachts Listing**: Filterable grid with brand, type, length, price sorting
- **Yacht Detail**: Gallery with lightbox, specifications, EN/AR descriptions, inquiry form
- **Charter Page**: Charter-focused layout with routes and fleet
- **Sell Your Yacht**: Owner submission form with process steps
- **About Page**: Founder story, DED license emphasis, company values
- **Contact Page**: Form, map, hours, WhatsApp integration

### Admin Dashboard
- **Dashboard**: Stats overview, recent inquiries, quick actions
- **Yachts CRUD**: Create, edit, delete yachts with media upload
- **Inquiries Management**: View, filter, update status, WhatsApp quick reply
- **Settings**: Site configuration, contact info, social links

### Technical Features
- 📱 Mobile-first responsive design
- 🌙 Dark luxury aesthetic (Jet Black + Gold)
- 🌐 English + Arabic (RTL ready)
- ⚡ Server Components for optimal performance
- 🔒 Clerk authentication for admin
- 📊 Prisma ORM with PostgreSQL
- 🖼️ Cloudinary image/video hosting
- 📧 WhatsApp-first lead capture
- 🔍 SEO optimized with JSON-LD schemas

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Clerk account
- Cloudinary account

### Installation

1. **Clone and install dependencies**
   ```bash
   cd bimo-yacht
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your credentials:
   ```env
   DATABASE_URL="postgresql://..."
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
   CLERK_SECRET_KEY="sk_..."
   CLOUDINARY_CLOUD_NAME="..."
   CLOUDINARY_API_KEY="..."
   CLOUDINARY_API_SECRET="..."
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Website: http://localhost:3000
   - Admin: http://localhost:3000/admin

## 📁 Project Structure

```
bimo-yacht/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Sample data
├── public/
│   └── images/            # Static images
├── src/
│   ├── app/
│   │   ├── (public)/      # Public pages
│   │   ├── admin/         # Admin dashboard
│   │   └── api/           # API routes
│   ├── components/
│   │   ├── admin/         # Admin components
│   │   ├── home/          # Home page sections
│   │   ├── layout/        # Header, Footer
│   │   ├── ui/            # Reusable UI components
│   │   └── yacht/         # Yacht-related components
│   └── lib/
│       ├── constants.ts   # Site configuration
│       ├── db.ts          # Prisma client
│       ├── utils.ts       # Utility functions
│       └── validations.ts # Zod schemas
├── tailwind.config.ts     # Tailwind configuration
└── package.json
```

## 🎨 Design System

### Colors
- **Jet Black**: `#0B0B0B` - Primary background
- **Deep Navy**: `#0E1A2B` - Secondary background
- **Gold**: `#C9A24D` - Accent color
- **White**: Various opacities for text

### Typography
- **Display Font**: Inter (headings)
- **Body Font**: Inter (text)
- **Arabic Font**: IBM Plex Arabic, Tajawal

## 🔧 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Database | PostgreSQL + Prisma |
| Auth | Clerk |
| Media | Cloudinary |
| Validation | Zod + React Hook Form |
| Icons | Lucide React |

## 📝 API Routes

### Public
- `GET /api/yachts` - List yachts with filters
- `POST /api/inquiries` - Submit inquiry

### Admin (Protected)
- `GET/POST /api/admin/yachts` - Yacht CRUD
- `GET/PUT/DELETE /api/admin/yachts/[id]` - Single yacht
- `POST/DELETE /api/admin/media` - Media upload
- `GET /api/admin/inquiries` - List inquiries
- `GET/PATCH/DELETE /api/admin/inquiries/[id]` - Single inquiry

## 🌍 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production
```env
DATABASE_URL="..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/admin"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
NEXT_PUBLIC_SITE_URL="https://bimoyacht.com"
```

## 📄 License

Private - All rights reserved.

---

Built with ❤️ for Bimo Yacht For Sale, Dubai
