# SpinHub 📀

A modern vinyl record collection manager built with React, Express, and SQLite.

## 🚀 Quick Start

```sh
# Install dependencies
npm install
cd client && npm install

# Start development servers
npm run dev
```

## 📁 Project Structure

```
spinhub/
├── client/                          # React + Vite frontend
│   ├── components.json              # shadcn/ui configuration
│   ├── eslint.config.js
│   ├── index.html                   # Vite entry point
│   ├── package.json                 # Frontend dependencies
│   ├── postcss.config.js
│   ├── public/                      # Static assets
│   │   └── vite.svg
│   ├── src/                         # React source code
│   │   ├── App.jsx                  # Main React component
│   │   ├── assets/                  # Imported assets
│   │   ├── components/              # React components
│   │   │   └── ui/                  # shadcn/ui components
│   │   │       ├── button.jsx/tsx
│   │   │       ├── calendar.tsx
│   │   │       ├── card.jsx
│   │   │       ├── dialog.jsx
│   │   │       ├── input.jsx
│   │   │       ├── popover.tsx
│   │   │       ├── select.tsx
│   │   │       ├── tabs.jsx
│   │   │       ├── textarea.tsx
│   │   │       ├── toast.tsx
│   │   │       └── toaster.tsx
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── use-toast.ts
│   │   ├── index.css                # Global styles (Tailwind)
│   │   ├── lib/                     # Utility functions
│   │   │   └── utils.js
│   │   └── main.jsx                 # React entry point
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── tsconfig.json                # TypeScript config
│   └── vite.config.js               # Vite configuration
│
├── server/                          # Express backend
│   ├── schema.sql                   # SQLite database schema
│   ├── seed.sql                     # Sample data
│   └── server.js                    # Express API server
│
├── public/                          # Built production frontend
│   ├── assets/                      # Compiled CSS/JS
│   ├── index.html                   # Production HTML
│   └── vite.svg
│
├── package.json                     # Root package (scripts & shared deps)
├── .gitignore
└── README.md                        # This file
```



