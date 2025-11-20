// server.js - Express API for Vinyl Collection Database
const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, '..', 'vinyl_collection.db');

// Initialize SQLite database with auto-setup
function initializeDatabase() {
  const dbPath = DB_PATH;
  const dbExists = fs.existsSync(dbPath);

  if (!dbExists) {
    console.log('📦 Database not found. Creating new database...');
  }

  const db = new Database(dbPath);

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

// Add ThumbURL column if it doesn't exist (for backward compatibility)
try {
  db.exec('ALTER TABLE Releases ADD COLUMN ThumbURL TEXT;');
} catch (error) {
  // Column might already exist, ignore
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// ============================================================
// DISCOGS CACHE POPULATION SYSTEM
// ============================================================

// Queue for cache population to handle rate limiting
let cacheQueue = [];
let isProcessingQueue = false;

// Helper: Download image from URL and return as Buffer
async function downloadImage(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': process.env.DISCOGS_USER_AGENT || 'SpinHub/1.0'
      }
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error(`Failed to download image from ${url}:`, error.message);
    return null;
  }
}

// Helper: Fetch release or master data from Discogs API
async function fetchDiscogsRelease(discogsId, queryType = 'release') {
  try {
    const endpoint = queryType === 'master' 
      ? `https://api.discogs.com/masters/${discogsId}`
      : `https://api.discogs.com/releases/${discogsId}`;
    
    const response = await axios.get(endpoint, {
      params: {
        key: process.env.DISCOGS_KEY,
        secret: process.env.DISCOGS_SECRET
      },
      headers: {
        'User-Agent': process.env.DISCOGS_USER_AGENT || 'SpinHub/1.0'
      },
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch Discogs ${queryType} ${discogsId}:`, error.message);
    return null;
  }
}

// Helper: Search Discogs for album by title and artist
async function searchDiscogsForAlbum(albumTitle, artistName) {
  try {
    const query = artistName ? `${artistName} ${albumTitle}` : albumTitle;
    
    const response = await axios.get('https://api.discogs.com/database/search', {
      params: {
        q: query,
        type: 'release',
        per_page: 5,
        key: process.env.DISCOGS_KEY,
        secret: process.env.DISCOGS_SECRET
      },
      headers: {
        'User-Agent': process.env.DISCOGS_USER_AGENT || 'SpinHub/1.0'
      },
      timeout: 10000
    });

    if (response.data.results && response.data.results.length > 0) {
      // Return the first match
      return {
        id: response.data.results[0].id,
        type: response.data.results[0].type || 'release'
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to search Discogs for "${albumTitle}":`, error.message);
    return null;
  }
}

// Main: Populate cache for a single release
async function populateCacheForRelease(releaseId) {
  try {
    // Get release with album and artist info
    const release = db.prepare(`
      SELECT r.*, a.Title as AlbumTitle, ar.Name as ArtistName
      FROM Releases r
      JOIN Albums a ON r.AlbumID = a.AlbumID
      JOIN Artists ar ON a.ArtistID = ar.ArtistID
      WHERE r.ReleaseID = ?
    `).get(releaseId);

    if (!release) {
      console.log(`Release ${releaseId} not found`);
      return false;
    }

    let discogsId = release.DiscogsID;
    let queryType = 'release';

    // If no DiscogsID, search for it
    if (!discogsId) {
      console.log(`No DiscogsID for "${release.AlbumTitle}", searching...`);
      const searchResult = await searchDiscogsForAlbum(release.AlbumTitle, release.ArtistName);
      
      if (searchResult) {
        discogsId = searchResult.id;
        queryType = searchResult.type;
        
        // Update the Releases table with found DiscogsID
        db.prepare('UPDATE Releases SET DiscogsID = ? WHERE ReleaseID = ?')
          .run(discogsId, releaseId);
        console.log(`✅ Found and saved DiscogsID ${discogsId} for "${release.AlbumTitle}"`);
      } else {
        console.log(`❌ No Discogs match found for "${release.AlbumTitle}"`);
        return false;
      }
    }

    // Check if already cached
    const existing = db.prepare('SELECT CacheID FROM DiscogsCache WHERE DiscogsID = ? AND QueryType = ?')
      .get(discogsId, queryType);
    
    if (existing) {
      console.log(`Cache already exists for DiscogsID ${discogsId}`);
      return true;
    }

    // Fetch data from Discogs
    console.log(`Fetching ${queryType} ${discogsId}...`);
    const discogsData = await fetchDiscogsRelease(discogsId, queryType);
    
    if (!discogsData) {
      return false;
    }

    // Download primary image
    let imageBlob = null;
    const imageUrl = release.ThumbURL || discogsData.images?.[0]?.uri || discogsData.thumb;
    
    if (imageUrl) {
      console.log(`Downloading image for ${discogsId}...`);
      imageBlob = await downloadImage(imageUrl);
    }

    // Store in cache (no expiration - permanent)
    db.prepare(`
      INSERT INTO DiscogsCache (DiscogsID, QueryType, Data, ImageBlob, ExpiresAt)
      VALUES (?, ?, ?, ?, NULL)
    `).run(
      discogsId,
      queryType,
      JSON.stringify(discogsData),
      imageBlob
    );

    console.log(`✅ Cached ${queryType} ${discogsId} for "${release.AlbumTitle}"`);
    return true;

  } catch (error) {
    console.error(`Error populating cache for release ${releaseId}:`, error.message);
    return false;
  }
}

// Process cache queue with rate limiting
async function processCacheQueue() {
  if (isProcessingQueue || cacheQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;
  console.log(`\n📦 Processing cache queue (${cacheQueue.length} items)...`);

  while (cacheQueue.length > 0) {
    const releaseId = cacheQueue.shift();
    await populateCacheForRelease(releaseId);
    
    // Rate limiting: wait 1 second between requests
    if (cacheQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  isProcessingQueue = false;
  console.log(`✅ Cache queue processing complete\n`);
}

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
    const { AlbumID, LabelID, CatalogNumber, CountryOfRelease, ReleaseYear, AlternateTitle, FormatVariant, ColorOrEdition, Notes, DiscogsID, ThumbURL } = req.body;
    const stmt = db.prepare(
      'INSERT INTO Releases (AlbumID, LabelID, CatalogNumber, CountryOfRelease, ReleaseYear, AlternateTitle, FormatVariant, ColorOrEdition, Notes, DiscogsID, ThumbURL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(AlbumID, LabelID, CatalogNumber, CountryOfRelease, ReleaseYear, AlternateTitle, FormatVariant, ColorOrEdition, Notes, DiscogsID, ThumbURL);
    const releaseId = result.lastInsertRowid;
    
    // If DiscogsID provided, populate cache immediately
    if (DiscogsID) {
      populateCacheForRelease(releaseId);
    }
    
    res.status(201).json({ ReleaseID: releaseId });
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
             l.Name as LabelName,
             dc.CacheID
      FROM Collection c
      JOIN Releases r ON c.ReleaseID = r.ReleaseID
      JOIN Albums a ON r.AlbumID = a.AlbumID
      JOIN Artists ar ON a.ArtistID = ar.ArtistID
      LEFT JOIN Labels l ON r.LabelID = l.LabelID
      LEFT JOIN DiscogsCache dc ON r.DiscogsID = dc.DiscogsID
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
             COALESCE(a.Title, ra.Title) as AlbumTitle,
             COALESCE(a.Format, ra.Format) as Format,
             COALESCE(ar.Name, rar.Name) as ArtistName,
             r.CatalogNumber, r.ColorOrEdition, r.ReleaseYear,
             l.Name as LabelName,
             dc.CacheID
      FROM Wishlist w
      LEFT JOIN Albums a ON w.AlbumID = a.AlbumID
      LEFT JOIN Releases r ON w.ReleaseID = r.ReleaseID
      LEFT JOIN Albums ra ON r.AlbumID = ra.AlbumID
      LEFT JOIN Artists ar ON a.ArtistID = ar.ArtistID
      LEFT JOIN Artists rar ON ra.ArtistID = rar.ArtistID
      LEFT JOIN Labels l ON r.LabelID = l.LabelID
      LEFT JOIN DiscogsCache dc ON r.DiscogsID = dc.DiscogsID
      ORDER BY w.Priority, COALESCE(ar.Name, rar.Name)
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
      SELECT DISTINCT c.*, r.CatalogNumber, a.Title as AlbumTitle, ar.Name as ArtistName, dc.CacheID
      FROM Collection c
      JOIN Releases r ON c.ReleaseID = r.ReleaseID
      JOIN Albums a ON r.AlbumID = a.AlbumID
      JOIN Artists ar ON a.ArtistID = ar.ArtistID
      LEFT JOIN DiscogsCache dc ON r.DiscogsID = dc.DiscogsID
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
// DISCOGS API ENDPOINTS
// ============================================================

// Search Discogs for releases
app.get('/api/discogs/search', async (req, res) => {
  try {
    const { q, type = 'release' } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const response = await axios.get('https://api.discogs.com/database/search', {
      params: {
        q,
        type,
        per_page: 10,
        key: process.env.DISCOGS_KEY,
        secret: process.env.DISCOGS_SECRET
      },
      headers: {
        'User-Agent': process.env.DISCOGS_USER_AGENT || 'SpinHub/1.0 +https://github.com/chappey/spinhub'
      },
      timeout: 5000 // 5 second timeout
    });

    // Transform the response to include only relevant fields
    const results = response.data.results.map(result => ({
      id: result.id,
      title: result.title,
      year: result.year,
      genre: result.genre?.[0] || '',
      style: result.style?.[0] || '',
      country: result.country,
      format: result.format,
      label: result.label?.[0] || '',
      catno: result.catno,
      thumb: result.thumb,
      cover_image: result.cover_image,
      // Extract artist from title if not provided separately
      artist: result.title.split(' - ')[0] || ''
    }));

    res.json({
      query: q,
      results,
      pagination: response.data.pagination
    });

  } catch (error) {
    console.error('Discogs API error:', error.message);

    if (error.response) {
      // Discogs API returned an error
      if (error.response.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      return res.status(error.response.status).json({ error: 'Discogs API error' });
    } else if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ error: 'Request timeout. Please try again.' });
    } else {
      return res.status(500).json({ error: 'Failed to search Discogs' });
    }
  }
});

// Cache Management: Manually populate cache
app.post('/api/cache/populate', async (req, res) => {
  try {
    const releases = db.prepare('SELECT ReleaseID FROM Releases').all();
    
    releases.forEach(rel => {
      cacheQueue.push(rel.ReleaseID);
    });

    // Start processing in background
    processCacheQueue();

    res.json({ 
      message: `Cache population started for ${releases.length} releases`,
      queued: releases.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cache Management: Clear all cache
app.delete('/api/cache/clear', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM DiscogsCache').run();
    res.json({ 
      message: 'Cache cleared',
      deletedCount: result.changes 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cache Management: Get cache status
app.get('/api/cache/status', (req, res) => {
  try {
    const totalReleases = db.prepare('SELECT COUNT(*) as count FROM Releases').get().count;
    const cachedCount = db.prepare(`
      SELECT COUNT(DISTINCT r.ReleaseID) as count 
      FROM Releases r
      JOIN DiscogsCache dc ON r.DiscogsID = dc.DiscogsID
      WHERE r.DiscogsID IS NOT NULL
    `).get().count;
    
    res.json({
      totalReleases,
      cachedReleases: cachedCount,
      uncachedReleases: totalReleases - cachedCount,
      queueLength: cacheQueue.length,
      isProcessing: isProcessingQueue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cached image by CacheID
app.get('/api/images/:cacheId', (req, res) => {
  try {
    const cacheId = req.params.cacheId;
    const cached = db.prepare('SELECT ImageBlob FROM DiscogsCache WHERE CacheID = ?').get(cacheId);
    if (!cached || !cached.ImageBlob) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.set('Content-Type', 'image/jpeg'); // Assuming JPEG, adjust if needed
    res.send(cached.ImageBlob);
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
  console.log(`📊 Database: ${path.relative(process.cwd(), DB_PATH)}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET    /api/artists`);
  console.log(`  GET    /api/albums`);
  console.log(`  GET    /api/collection`);
  console.log(`  GET    /api/wishlist`);
  console.log(`  GET    /api/search?query=...`);
  console.log(`  GET    /api/discogs/search?q=...`);
  console.log(`  GET    /api/stats`);
  console.log(`  POST   /api/cache/populate`);
  console.log(`  GET    /api/cache/status`);
  console.log(`  DELETE /api/cache/clear`);
  
  // Startup cache check - populate missing cache entries after 5 seconds
  setTimeout(() => {
    try {
      console.log('\n🔍 Checking for missing cache entries...');
      const releases = db.prepare('SELECT ReleaseID, DiscogsID FROM Releases').all();
      
      let queuedCount = 0;
      for (const rel of releases) {
        if (rel.DiscogsID) {
          const cached = db.prepare('SELECT CacheID FROM DiscogsCache WHERE DiscogsID = ?').get(rel.DiscogsID);
          if (!cached) {
            cacheQueue.push(rel.ReleaseID);
            queuedCount++;
          }
        } else {
          cacheQueue.push(rel.ReleaseID);
          queuedCount++;
        }
      }
      
      if (queuedCount > 0) {
        console.log(`📦 Found ${queuedCount} releases needing cache. Starting...`);
        processCacheQueue();
      } else {
        console.log('✅ All releases cached.');
      }
    } catch (err) {
      console.error('Error during cache check:', err.message);
    }
  }, 5000);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  console.log('\n👋 Database closed. Server shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  db.close();
  console.log('\n👋 Database closed. Server shutting down...');
  process.exit(0);
});
