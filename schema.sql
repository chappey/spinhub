-- schema.sql - Database Structure for Vinyl Collection
-- This file creates all tables and indexes

-- ============================================================
-- ARTISTS TABLE
-- ============================================================
CREATE TABLE Artists (
    ArtistID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL UNIQUE,
    CountryOfOrigin TEXT,
    PrimaryGenre TEXT,
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_artist_name ON Artists(Name);

-- ============================================================
-- LABELS (Publishers/Record Labels) TABLE
-- ============================================================
CREATE TABLE Labels (
    LabelID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL UNIQUE,
    Country TEXT,
    FoundedYear INTEGER CHECK (FoundedYear >= 1850 AND FoundedYear <= 2100),
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_label_name ON Labels(Name);

-- ============================================================
-- ALBUMS (Master Release Information) TABLE
-- ============================================================
CREATE TABLE Albums (
    AlbumID INTEGER PRIMARY KEY AUTOINCREMENT,
    Title TEXT NOT NULL,
    ArtistID INTEGER NOT NULL,
    Genre TEXT,
    OriginalReleaseYear INTEGER CHECK (OriginalReleaseYear >= 1850 AND OriginalReleaseYear <= 2100),
    Format TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ArtistID) REFERENCES Artists(ArtistID) ON DELETE RESTRICT
);

CREATE INDEX idx_album_title ON Albums(Title);
CREATE INDEX idx_album_artist ON Albums(ArtistID);
CREATE INDEX idx_album_genre ON Albums(Genre);

-- ============================================================
-- RELEASES (Specific Pressings/Variants) TABLE
-- ============================================================
CREATE TABLE Releases (
    ReleaseID INTEGER PRIMARY KEY AUTOINCREMENT,
    AlbumID INTEGER NOT NULL,
    LabelID INTEGER,
    CatalogNumber TEXT,
    CountryOfRelease TEXT,
    ReleaseYear INTEGER CHECK (ReleaseYear >= 1850 AND ReleaseYear <= 2100),
    AlternateTitle TEXT,
    FormatVariant TEXT,
    ColorOrEdition TEXT,
    Notes TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AlbumID) REFERENCES Albums(AlbumID) ON DELETE CASCADE,
    FOREIGN KEY (LabelID) REFERENCES Labels(LabelID) ON DELETE SET NULL
);

CREATE INDEX idx_release_album ON Releases(AlbumID);
CREATE INDEX idx_release_label ON Releases(LabelID);
CREATE INDEX idx_catalog_number ON Releases(CatalogNumber);

-- ============================================================
-- TRACKS (Song List) TABLE
-- ============================================================
CREATE TABLE Tracks (
    TrackID INTEGER PRIMARY KEY AUTOINCREMENT,
    ReleaseID INTEGER NOT NULL,
    TrackNumber INTEGER NOT NULL,
    Side TEXT,
    Title TEXT NOT NULL,
    Duration TEXT,
    FOREIGN KEY (ReleaseID) REFERENCES Releases(ReleaseID) ON DELETE CASCADE,
    UNIQUE(ReleaseID, TrackNumber, Side)
);

CREATE INDEX idx_track_release ON Tracks(ReleaseID);

-- ============================================================
-- COLLECTION (User-Owned Records) TABLE
-- ============================================================
CREATE TABLE Collection (
    CollectionID INTEGER PRIMARY KEY AUTOINCREMENT,
    ReleaseID INTEGER NOT NULL,
    PurchaseDate TEXT,
    PurchasePrice REAL,
    Condition TEXT CHECK (Condition IN ('Mint', 'Near Mint', 'Very Good Plus', 'Very Good', 'Good Plus', 'Good', 'Fair', 'Poor')) DEFAULT 'Very Good',
    SleeveCondition TEXT CHECK (SleeveCondition IN ('Mint', 'Near Mint', 'Very Good Plus', 'Very Good', 'Good Plus', 'Good', 'Fair', 'Poor')),
    StorageLocation TEXT,
    Notes TEXT,
    AcquiredFrom TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ReleaseID) REFERENCES Releases(ReleaseID) ON DELETE RESTRICT
);

CREATE INDEX idx_collection_release ON Collection(ReleaseID);
CREATE INDEX idx_storage_location ON Collection(StorageLocation);

-- ============================================================
-- WISHLIST TABLE
-- ============================================================
CREATE TABLE Wishlist (
    WishlistID INTEGER PRIMARY KEY AUTOINCREMENT,
    AlbumID INTEGER,
    ReleaseID INTEGER,
    Priority TEXT CHECK (Priority IN ('High', 'Medium', 'Low')) DEFAULT 'Medium',
    MaxPrice REAL,
    Notes TEXT,
    DateAdded DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AlbumID) REFERENCES Albums(AlbumID) ON DELETE CASCADE,
    FOREIGN KEY (ReleaseID) REFERENCES Releases(ReleaseID) ON DELETE CASCADE,
    CHECK ((AlbumID IS NOT NULL) OR (ReleaseID IS NOT NULL))
);

CREATE INDEX idx_wishlist_album ON Wishlist(AlbumID);
CREATE INDEX idx_wishlist_release ON Wishlist(ReleaseID);