# 🏆 Mayur Sports - Catalog & Admin Management System

A full-stack, high-performance web application designed for **Mayur Sports**. It provides a live, interactive product showcase for customers, instant WhatsApp inquiry and ordering, and a secure admin management portal to control items, prices, stock levels, and store announcements.

Built with **Next.js 14 (App Router)**, **React**, **Tailwind CSS**, and **Lucide Icons** — 100% optimized for deployment on **Vercel**.

---

## 🌟 Key Features

### 1. 🛍️ Customer Storefront (`/`)
- **Live Stock Showcase**: High-resolution catalog of sports gear (Cricket, Badminton, Football, Fitness & Gym, Shoes & Apparel, Table Tennis, Accessories).
- **Real-Time Search & Filters**: Instant search by sport, equipment name, brand (SS, SG, Yonex, Cosco, Nivia, MRF, DSC, etc.), and stock availability.
- **Shop Special Pricing**: Displays direct in-store discounts, MRP comparisons, and percentage savings.
- **WhatsApp Direct Order / Hold**: 1-Click WhatsApp booking button on every product card and detail modal with pre-formatted inquiry text.
- **Product Modal**: Full specifications, material details, brand certifications, and store guarantees.
- **Store Location & Hours**: Integrated Pune store address, opening timings, and customer support contact.

### 2. 🔐 Admin Control Portal (`/admin`)
- **Secure Access**: Protected admin session with passcode/PIN (`mayur2026`).
- **Live Metrics**: Overview of total products, in-stock count, low stock warnings, out-of-stock items, and total catalog valuation.
- **Store Banner Editor**: Update top announcement banner in real-time (e.g. tournament discounts, special holiday offers).
- **Product CRUD**:
  - Add new sports equipment with custom images, tags, price, and specs.
  - Edit pricing and descriptions anytime without redeploying.
  - Quick 1-click stock status toggle (`In Stock` ➔ `Limited Stock` ➔ `Out of Stock`).
  - Delete items with confirmation modal.

---

## 🚀 Quick Start (Local Development)

1. **Navigate to the project**:
   ```bash
   cd /Users/apple/.gemini/antigravity/scratch/mayur-sports
   ```

2. **Install dependencies** (already completed):
   ```bash
   npm install
   ```

3. **Start the local server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the storefront, and [http://localhost:3000/admin](http://localhost:3000/admin) to manage products.

---

## 🔑 Default Admin Credentials

- **Admin Portal URL**: `/admin` (or `/admin/login`)
- **Default Passcode**: `mayur2026`
- *(To customize, set `ADMIN_PASSWORD` in your `.env.local` or Vercel Environment Variables).*

---

## 🌐 Deploying to Vercel (Get Your Live Public Link)

You can easily get a public link like `https://mayur-sports.vercel.app` accessible to all your customers:

### Method 1: Deploy via GitHub (Recommended & Easiest)
1. Initialize a git repository and commit the project:
   ```bash
   git init
   git add .
   git commit -m "Initial Mayur Sports website"
   ```
2. Create a new repository on [GitHub](https://github.com/new) named `mayur-sports`.
3. Push your code to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/mayur-sports.git
   git branch -M main
   git push -u origin main
   ```
4. Go to [Vercel](https://vercel.com) and click **"Add New..." ➔ "Project"**.
5. Select the `mayur-sports` repository and click **"Deploy"**.
6. In ~60 seconds, Vercel gives you your live public link (e.g. `https://mayur-sports-xyz.vercel.app`)!

---

### Method 2: Deploy via Vercel CLI (Direct from Terminal)
1. Run:
   ```bash
   npx vercel
   ```
2. Follow the 3 short prompts (accept defaults).
3. For production deployment:
   ```bash
   npx vercel --prod
   ```
4. Your live link will be printed directly in the terminal!

---

## 🗄️ Database & Cloud Persistence on Vercel

The application includes sample sports inventory and an adaptable data layer in `src/lib/store.ts`.

- **Local Development**: Products are saved in `data/products.json` and persist across restarts.
- **Production on Vercel**: Because Vercel functions are serverless, to persist admin updates permanently across all visiting devices, you can optionally connect a free cloud database like [Supabase](https://supabase.com) (PostgreSQL) or [Neon](https://neon.tech) in 1 click from the Vercel Integrations marketplace.
