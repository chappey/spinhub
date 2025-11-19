# SpinHub 📀


```sh
npm install
npm start
```

## 📁 Project Structure

```
spinhub/
├── server.js            # Express API server
├── schema.sql           # Database structure
├── seed.sql             # Sample data
├── package.json         # Node dependencies
├── vinyl_collection.db  # SQLite database (auto-generated)
├── public/              # Frontend files
│   ├── index.html       # Main HTML
│   ├── styles.css       # Styling
│   └── app.js           # Frontend logic
└── README.md            # This file
```

New structure
```
spinhub/
├── client/                  ← Vite + React SPA
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── ...
│   ├── public/              ← only truly static files (favicon, robots.txt, etc.)
│   ├── vite.config.js
│   ├── index.html
│   └── package.json
│
├── server/                  ← All backend code
│   ├── server.js            ← or index.js
│   ├── schema.sql           # Database structure
│   └── seed.sql             # Sample data
│
├── public/                  # Built production frontend (auto-generated)
│   ├── index.html           # output from Vite build
│   └── assets/
│
├── package.json             # Root package (for scripts & shared deps)
├── .gitignore
└── README.md                # This file
```



