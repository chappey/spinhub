// server.js - Express API for Vinyl Collection Database
const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = 'vinyl_collection.db';

// Initialize SQLite database with auto-setup
function initializeDatabase() {
  const dbExists = fs.existsSync(DB_PATH);
  
  if (!dbExists) {
    console.log('📦 Database not found. Creating new database...');
  }
  
  const db = new Database(DB_PATH, { verbose: console.log });
  
  if (!dbExists) {
    try {
      // Check if schema.sql exists
      const schemaPath = path.join(__dirname, 'schema.sql');
      const seedPath = path.join(__dirname, 'seed.sql');
      
      if (!fs.existsSync(schemaPath)) {
        console.error('❌ Error: schema.sql not found in project directory');
        console.log('Please create schema.sql with your database structure');
        process.exit(1);
      }
      
      console.log('📋 Running schema.sql...');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      db.exec(schema);
      console.log('✅ Database schema created successfully');
      
      // Run seed.sql if it exists
      if (fs.existsSync(seedPath)) {
        console.log('🌱 Running seed.sql...');
        const seed = fs.readFileSync(seedPath, 'utf8');
        db.exec(seed);
        console.log('✅ Sample data inserted successfully');
      } else {
        console.log('ℹ️  seed.sql not found - skipping sample data (this is optional)');
      }
      
      console.log('🎉 Database initialization complete!\n');
    } catch (error) {
      console.error('❌ Error initializing database:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Using existing database: vinyl_collection.db\n');
  }
  
  return db;
}

// Initialize the database
const db = initializeDatabase();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Serve static files from 'public' directory
app.use(express.static('public'));

// ============================================================
// ARTISTS ENDPOINTS
// ============================================================

// Get all artists
app.get('/api/artists', (req, res) => {
  try {
    const artists = db.prepare('SELECT * FROM Artists ORDER BY Name').all();
    res.json(artists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single artist by ID
app.get('/api/artists/:id', (req, res) => {
  try {
    const artist = db.prepare('SELECT * FROM Artists WHERE ArtistID = ?').get(req.params.id);
    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    res.json(artist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new artist
app.post('/api/artists', (req, res) => {
  try {
    const { Name, CountryOfOrigin, PrimaryGenre, Description } = req.body;
    const stmt = db.prepare(
      'INSERT INTO Artists (Name, CountryOfOrigin, PrimaryGenre, Description) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(Name, CountryOfOrigin, PrimaryGenre, Description);
    res.status(201).json({ ArtistID: result.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update artist
app.put('/api/artists/:id', (req, res) => {
  try {
    const { Name, CountryOfOrigin, PrimaryGenre, Description } = req.body;
    const stmt = db.prepare(
      'UPDATE Artists SET Name = ?, CountryOfOrigin = ?, PrimaryGenre = ?, Description = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE ArtistID = ?'
    );
    const result = stmt.run(Name, CountryOfOrigin, PrimaryGenre, Description, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    res.json({ message: 'Artist updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete artist
app.delete('/api/artists/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM Artists WHERE ArtistID = ?');
    const result = stmt.run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    res.json({ message: 'Artist deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================
// LABELS ENDPOINTS
// ============================================================

// Get all labels
app.get('/api/labels', (req, res) => {
  try {
    const labels = db.prepare('SELECT * FROM Labels ORDER BY Name').all();
    res.json(labels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single label
app.get('/api/labels/:id', (req, res) => {
  try {
    const label = db.prepare('SELECT * FROM Labels WHERE LabelID = ?').get(req.params.id);
    if (!label) {
      return res.status(404).json({ error: 'Label not found' });
    }
    res.json(label);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new label
app.post('/api/labels', (req, res) => {
  try {
    const { Name, Country, FoundedYear, Description } = req.body;
    const stmt = db.prepare(
      'INSERT INTO Labels (Name, Country, FoundedYear, Description) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(Name, Country, FoundedYear, Description);
    res.status(201).json({ LabelID: result.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update label
app.put('/api/labels/:id', (req, res) => {
  try {
    const { Name, Country, FoundedYear, Description } = req.body;
    const stmt = db.prepare(
      'UPDATE Labels SET Name = ?, Country = ?, FoundedYear = ?, Description = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE LabelID = ?'
    );
    const result = stmt.run(Name, Country, FoundedYear, Description, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Label not found' });
    }
    res.json({ message: 'Label updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete label
app.delete('/api/labels/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM Labels WHERE LabelID = ?');
    const result = stmt.run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Label not found' });
    }
    res.json({ message: 'Label deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================
// ALBUMS ENDPOINTS
// ============================================================

// Get all albums with artist info
app.get('/api/albums', (req, res) => {
  try {
    const albums = db.prepare(`
      SELECT a.*, ar.Name as ArtistName 
      FROM Albums a
      JOIN Artists ar ON a.ArtistID = ar.ArtistID
      ORDER BY a.Title
    `).all();
    res.json(albums);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single album with all details
app.get('/api/albums/:id', (req, res) => {
  try {
    const album = db.prepare(`
      SELECT a.*, ar.Name as ArtistName 
      FROM Albums a
      JOIN Artists ar ON a.ArtistID = ar.ArtistID
      WHERE a.AlbumID = ?
    `).get(req.params.id);
    
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }
    res.json(album);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new album
app.post('/api/albums', (req, res) => {
  try {
    const { Title, ArtistID, Genre, OriginalReleaseYear, Format } = req.body;
    const stmt = db.prepare(
      'INSERT INTO Albums (Title, ArtistID, Genre, OriginalReleaseYear, Format) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(Title, ArtistID, Genre, OriginalReleaseYear, Format);
    res.status(201).json({ AlbumID: result.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update album
app.put('/api/albums/:id', (req, res) => {
  try {
    const { Title, ArtistID, Genre, OriginalReleaseYear, Format } = req.body;
    const stmt = db.prepare(
      'UPDATE Albums SET Title = ?, ArtistID = ?, Genre = ?, OriginalReleaseYear = ?, Format = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE AlbumID = ?'
    );
    const result = stmt.run(Title, ArtistID, Genre, OriginalReleaseYear, Format, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Album not found' });
    }
    res.json({ message: 'Album updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete album
app.delete('/api/albums/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM Albums WHERE AlbumID = ?');
    const result = stmt.run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Album not found' });
    }
    res.json({ message: 'Album deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================
// RELEASES ENDPOINTS
// ============================================================

// Get all releases for an album
app.get('/api/albums/:albumId/releases', (req, res) => {
  try {
    const releases = db.prepare(`
      SELECT r.*, l.Name as LabelName
      FROM Releases r
      LEFT JOIN Labels l ON r.LabelID = l.LabelID
      WHERE r.AlbumID = ?
      ORDER BY r.ReleaseYear
    `).all(req.params.albumId);
    res.json(releases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single release with all details
app.get('/api/releases/:id', (req, res) => {
  try {
    const release = db.prepare(`
      SELECT r.*, l.Name as LabelName, a.Title as AlbumTitle, ar.Name as ArtistName
      FROM Releases r
      LEFT JOIN Labels l ON r.LabelID = l.LabelID
      JOIN Albums a ON r.AlbumID = a.AlbumID
      JOIN Artists ar ON a.ArtistID = ar.ArtistID
      WHERE r.ReleaseID = ?
    `).get(req.params.id);
    
    if (!release) {
      return res.status(404).json({ error: 'Release not found' });
    }
    
    // Get tracks for this release
    const tracks = db.prepare('SELECT * FROM Tracks WHERE ReleaseID = ? ORDER BY Side, TrackNumber').all(req.params.id);
    release.tracks = tracks;
    
    res.json(release);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new release
app.post('/api/releases', (req, res) => {
  try {
    const { AlbumID, LabelID, CatalogNumber, CountryOfRelease, ReleaseYear, AlternateTitle, FormatVariant, ColorOrEdition, Notes } = req.body;
    const stmt = db.prepare(
      'INSERT INTO Releases (AlbumID, LabelID, CatalogNumber, CountryOfRelease, ReleaseYear, AlternateTitle, FormatVariant, ColorOrEdition, Notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(AlbumID, LabelID, CatalogNumber, CountryOfRelease, ReleaseYear, AlternateTitle, FormatVariant, ColorOrEdition, Notes);
    res.status(201).json({ ReleaseID: result.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update release
app.put('/api/releases/:id', (req, res) => {
  try {
    const { AlbumID, LabelID, CatalogNumber, CountryOfRelease, ReleaseYear, AlternateTitle, FormatVariant, ColorOrEdition, Notes } = req.body;
    const stmt = db.prepare(
      'UPDATE Releases SET AlbumID = ?, LabelID = ?, CatalogNumber = ?, CountryOfRelease = ?, ReleaseYear = ?, AlternateTitle = ?, FormatVariant = ?, ColorOrEdition = ?, Notes = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE ReleaseID = ?'
    );
    const result = stmt.run(AlbumID, LabelID, CatalogNumber, CountryOfRelease, ReleaseYear, AlternateTitle, FormatVariant, ColorOrEdition, Notes, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Release not found' });
    }
    res.json({ message: 'Release updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete release
app.delete('/api/releases/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM Releases WHERE ReleaseID = ?');
    const result = stmt.run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Release not found' });
    }
    res.json({ message: 'Release deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================
// COLLECTION ENDPOINTS
// ============================================================

// Get all items in collection
app.get('/api/collection', (req, res) => {
  try {
    const collection = db.prepare(`
      SELECT c.*, r.CatalogNumber, r.ColorOrEdition, r.ReleaseYear,
             a.Title as AlbumTitle, a.Format,
             ar.Name as ArtistName,
             l.Name as LabelName
      FROM Collection c
      JOIN Releases r ON c.ReleaseID = r.ReleaseID
      JOIN Albums a ON r.AlbumID = a.AlbumID
      JOIN Artists ar ON a.ArtistID = ar.ArtistID
      LEFT JOIN Labels l ON r.LabelID = l.LabelID
      ORDER BY ar.Name, a.Title
    `).all();
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single collection item
app.get('/api/collection/:id', (req, res) => {
  try {
    const item = db.prepare(`
      SELECT c.*, r.*, a.Title as AlbumTitle, ar.Name as ArtistName, l.Name as LabelName
      FROM Collection c
      JOIN Releases r ON c.ReleaseID = r.ReleaseID
      JOIN Albums a ON r.AlbumID = a.AlbumID
      JOIN Artists ar ON a.ArtistID = ar.ArtistID
      LEFT JOIN Labels l ON r.LabelID = l.LabelID
      WHERE c.CollectionID = ?
    `).get(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Collection item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add item to collection
app.post('/api/collection', (req, res) => {
  try {
    const { ReleaseID, PurchaseDate, PurchasePrice, Condition, SleeveCondition, StorageLocation, Notes, AcquiredFrom } = req.body;
    const stmt = db.prepare(
      'INSERT INTO Collection (ReleaseID, PurchaseDate, PurchasePrice, Condition, SleeveCondition, StorageLocation, Notes, AcquiredFrom) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(ReleaseID, PurchaseDate, PurchasePrice, Condition, SleeveCondition, StorageLocation, Notes, AcquiredFrom);
    res.status(201).json({ CollectionID: result.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update collection item
app.put('/api/collection/:id', (req, res) => {
  try {
    const { PurchaseDate, PurchasePrice, Condition, SleeveCondition, StorageLocation, Notes, AcquiredFrom } = req.body;
    const stmt = db.prepare(
      'UPDATE Collection SET PurchaseDate = ?, PurchasePrice = ?, Condition = ?, SleeveCondition = ?, StorageLocation = ?, Notes = ?, AcquiredFrom = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE CollectionID = ?'
    );
    const result = stmt.run(PurchaseDate, PurchasePrice, Condition, SleeveCondition, StorageLocation, Notes, AcquiredFrom, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Collection item not found' });
    }
    res.json({ message: 'Collection item updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete from collection
app.delete('/api/collection/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM Collection WHERE CollectionID = ?');
    const result = stmt.run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Collection item not found' });
    }
    res.json({ message: 'Collection item deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================
// WISHLIST ENDPOINTS
// ============================================================

// Get all wishlist items
app.get('/api/wishlist', (req, res) => {
  try {
    const wishlist = db.prepare(`
      SELECT w.*,
             a.Title as AlbumTitle, a.Format,
             ar.Name as ArtistName,
             r.CatalogNumber, r.ColorOrEdition, r.ReleaseYear,
             l.Name as LabelName
      FROM Wishlist w
      LEFT JOIN Albums a ON w.AlbumID = a.AlbumID
      LEFT JOIN Releases r ON w.ReleaseID = r.ReleaseID
      LEFT JOIN Artists ar ON a.ArtistID = ar.ArtistID
      LEFT JOIN Labels l ON r.LabelID = l.LabelID
      ORDER BY w.Priority, ar.Name
    `).all();
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add to wishlist
app.post('/api/wishlist', (req, res) => {
  try {
    const { AlbumID, ReleaseID, Priority, MaxPrice, Notes } = req.body;
    const stmt = db.prepare(
      'INSERT INTO Wishlist (AlbumID, ReleaseID, Priority, MaxPrice, Notes) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(AlbumID, ReleaseID, Priority, MaxPrice, Notes);
    res.status(201).json({ WishlistID: result.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update wishlist item
app.put('/api/wishlist/:id', (req, res) => {
  try {
    const { Priority, MaxPrice, Notes } = req.body;
    const stmt = db.prepare(
      'UPDATE Wishlist SET Priority = ?, MaxPrice = ?, Notes = ? WHERE WishlistID = ?'
    );
    const result = stmt.run(Priority, MaxPrice, Notes, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }
    res.json({ message: 'Wishlist item updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete from wishlist
app.delete('/api/wishlist/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM Wishlist WHERE WishlistID = ?');
    const result = stmt.run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }
    res.json({ message: 'Wishlist item deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================
// SEARCH & FILTER ENDPOINTS
// ============================================================

// Search across collection
app.get('/api/search', (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const searchTerm = `%${query}%`;
    const results = db.prepare(`
      SELECT DISTINCT c.*, r.CatalogNumber, a.Title as AlbumTitle, ar.Name as ArtistName
      FROM Collection c
      JOIN Releases r ON c.ReleaseID = r.ReleaseID
      JOIN Albums a ON r.AlbumID = a.AlbumID
      JOIN Artists ar ON a.ArtistID = ar.ArtistID
      WHERE ar.Name LIKE ? OR a.Title LIKE ? OR r.CatalogNumber LIKE ?
      ORDER BY ar.Name, a.Title
    `).all(searchTerm, searchTerm, searchTerm);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get collection statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = {
      totalRecords: db.prepare('SELECT COUNT(*) as count FROM Collection').get().count,
      totalArtists: db.prepare('SELECT COUNT(DISTINCT ar.ArtistID) as count FROM Collection c JOIN Releases r ON c.ReleaseID = r.ReleaseID JOIN Albums a ON r.AlbumID = a.AlbumID JOIN Artists ar ON a.ArtistID = ar.ArtistID').get().count,
      totalValue: db.prepare('SELECT SUM(PurchasePrice) as total FROM Collection WHERE PurchasePrice IS NOT NULL').get().total || 0,
      wishlistItems: db.prepare('SELECT COUNT(*) as count FROM Wishlist').get().count,
      conditionBreakdown: db.prepare('SELECT Condition, COUNT(*) as count FROM Collection GROUP BY Condition').all()
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// SERVER STARTUP
// ============================================================

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎵 Vinyl Collection API running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${DB_PATH}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET    /api/artists`);
  console.log(`  GET    /api/albums`);
  console.log(`  GET    /api/collection`);
  console.log(`  GET    /api/wishlist`);
  console.log(`  GET    /api/search?query=...`);
  console.log(`  GET    /api/stats`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  console.log('\n👋 Database closed. Server shutting down...');
  process.exit(0);
});