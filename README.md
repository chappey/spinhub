# 📀 SpinHub 

A modern vinyl record collection manager built with React, Vite, TypeScript, Express, and SQLite.

## 🚀 Quick Start

```sh
# Install dependencies
npm install
cd client && npm install

# Start development servers
npm run dev               # runs both API server and Vite dev server
# OR, if you only need the backend:
npm run server            # starts the Express API alone
```

## 📁 Project Structure

```
spinhub/
├── client/                          # React + Vite frontend (TypeScript)
│   ├── components.json              # shadcn/ui configuration
│   ├── eslint.config.js
│   ├── index.html                   # Vite entry point
│   ├── package.json                 # Frontend dependencies
│   ├── postcss.config.js
│   ├── public/                      # Static assets
│   │   └── vite.svg
│   ├── src/                         # React source code
│   │   ├── App.tsx                  # Main application component with routing
│   │   ├── assets/                  # Imported assets
│   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── AddVinylForm.tsx
│   │   │   │   ├── CollectionList.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Statistics.tsx
│   │   │   │   └── Wishlist.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Layout.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── shared/
│   │   │   │   ├── SearchDialog.tsx
│   │   │   │   ├── SortControls.tsx
│   │   │   │   └── VinylModal.tsx
│   │   │   └── ui/
│   │   │       ├── button.tsx
│   │   │       ├── calendar.tsx
│   │   │       ├── card.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── input.tsx
│   │   │       ├── kbd.tsx
│   │   │       ├── label.tsx
│   │   │       ├── loading-spinner.tsx
│   │   │       ├── scroll-area.tsx
│   │   │       ├── skeleton.tsx
│   │   │       ├── tabs.tsx
│   │   │       └── toast.tsx
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useCollectionData.ts
│   │   │   ├── useDiscogs.ts
│   │   │   └── useSearch.ts
│   │   ├── lib/                     # Utility functions
│   │   │   └── utils.ts
│   │   ├── services/                # API service layer
│   │   │   └── api.ts
│   │   ├── types/                   # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── index.css                # Global styles (Tailwind)
│   │   └── main.tsx                 # React entry point
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── tsconfig.json                # TypeScript config
│   └── vite.config.ts               # Vite configuration
│
├── server/                          # Express backend
│   ├── schema.sql                   # SQLite database schema
│   ├── seed.sql                     # Sample data
│   └── server.js                    # Express API server
│
├── package.json                     # Root package (scripts & shared deps)
├── .gitignore
└── README.md                        # This file
```

## 📦 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui (Radix UI)
- **Backend**: Express, SQLite
- **Utilities**: clsx, tailwind-merge, date-fns, lucide-react

## 📚 Documentation

- **React Docs**: https://react.dev/
- **Vite Docs**: https://vitejs.dev/
- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **shadcn/ui Docs**: https://ui.shadcn.com/
- **Express Docs**: https://expressjs.com/
- **SQLite Docs**: https://www.sqlite.org/docs.html
- **Discogs API**: https://www.discogs.com/developers/

