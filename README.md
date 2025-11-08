# GUS Marketplace — Frontend

GUS Marketplace is a modern e-commerce frontend built with NextJS that serves as the user-facing application for browsing, searching, and purchasing products in the GUS Marketplace ecosystem.

This repository contains the frontend application responsible for:
- Product listing and detail pages
- Search and filtering
- User authentication + profile UI (integrates with backend)
- Responsive UI for desktop 

If you're looking for the backend or integrations check : https://github.com/Abdulsz/gus-s-marketplace
---

## Table of contents
- [Key features](#key-features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Contact / Maintainers](#contact--maintainers)

---


## Key features
- Product catalog with categories, sorting and filters
- Product details with images, descriptions and reviews
- Responsive UI: mobile-first design
- Authentication flows: sign up, sign in, password reset (In development - Branch: Nitai-Auth)


---

## Tech stack
- React
- NextJS
- CSS: Tailwind
- Session Management / Auth: Supabase

---

## Prerequisites
- Node.js >= 18
- npm >= 8 or yarn >= 1.22
- A running backend API (or mocked API / stub) that this frontend talks to

---

## Getting started (development)

1. Clone the repository
   git clone https://github.com/Abdulsz/gusmarketplace-frontend.git
   cd gusmarketplace-frontend

2. Install dependencies
   npm install
   # or
   yarn install

3. Create your environment file
   cp .env.example .env.local
   Edit `.env.local` and set the required variables (see next section).

4. Run the development server
   npm run dev
   # or
   yarn dev


## Maintainers

- Maintainers: Abdulsz, NitaiMahat
- GitHub: https://github.com/Abdulsz, https://github.com/NitaiMahat 
- Repo: https://github.com/Abdulsz/gusmarketplace-frontend

