-- seed.sql - Sample Data for Vinyl Collection Database
-- This file populates the database with example records

-- ============================================================
-- SAMPLE ARTISTS
-- ============================================================
INSERT INTO Artists (Name, CountryOfOrigin, PrimaryGenre, Description) VALUES
('Miles Davis', 'United States', 'Jazz', 'Legendary jazz trumpeter and composer'),
('Pink Floyd', 'United Kingdom', 'Progressive Rock', 'Iconic progressive rock band'),
('The Beatles', 'United Kingdom', 'Rock', 'The most influential band in history'),
('John Coltrane', 'United States', 'Jazz', 'Pioneering jazz saxophonist'),
('Radiohead', 'United Kingdom', 'Alternative Rock', 'Innovative alternative rock band');

-- ============================================================
-- SAMPLE LABELS
-- ============================================================
INSERT INTO Labels (Name, Country, FoundedYear, Description) VALUES
('Blue Note Records', 'United States', 1939, 'Historic jazz label'),
('Columbia Records', 'United States', 1887, 'Major American record label'),
('Harvest Records', 'United Kingdom', 1969, 'Progressive rock label'),
('Parlophone', 'United Kingdom', 1896, 'British record label'),
('Capitol Records', 'United States', 1942, 'Major American record label'),
('Impulse! Records', 'United States', 1960, 'Jazz label known for its distinctive design');

-- ============================================================
-- SAMPLE ALBUMS
-- ============================================================
INSERT INTO Albums (Title, ArtistID, Genre, OriginalReleaseYear, Format) VALUES
('Kind of Blue', 1, 'Jazz', 1959, 'LP'),
('The Dark Side of the Moon', 2, 'Progressive Rock', 1973, 'LP'),
('Abbey Road', 3, 'Rock', 1969, 'LP'),
('A Love Supreme', 4, 'Jazz', 1965, 'LP'),
('OK Computer', 5, 'Alternative Rock', 1997, 'LP');

-- ============================================================
-- SAMPLE RELEASES
-- ============================================================
INSERT INTO Releases (AlbumID, LabelID, CatalogNumber, CountryOfRelease, ReleaseYear, FormatVariant, ColorOrEdition, Notes) VALUES
(1, 1, 'BST-1595', 'United States', 1959, '12-inch LP', 'Original Mono Pressing', 'First pressing with 6-eye label'),
(1, 1, 'BST-1595-RE', 'United States', 2015, '12-inch LP', '180g Reissue', 'Music Matters reissue'),
(2, 3, 'SHVL 804', 'United Kingdom', 1973, '12-inch LP', 'Original Gatefold', 'First UK pressing with solid blue triangle and posters'),
(3, 4, 'PCS 7088', 'United Kingdom', 1969, '12-inch LP', 'Original Pressing', 'First UK pressing with "Her Majesty"'),
(4, 6, 'AS-77', 'United States', 1965, '12-inch LP', 'Original Gatefold', 'First pressing with orange and black label'),
(5, 4, 'NODATA 03', 'United Kingdom', 1997, '12-inch LP', 'Original 2LP', 'First pressing double album');

-- ============================================================
-- SAMPLE TRACKS (for Kind of Blue)
-- ============================================================
INSERT INTO Tracks (ReleaseID, TrackNumber, Side, Title, Duration) VALUES
(1, 1, 'A', 'So What', '09:04'),
(1, 2, 'A', 'Freddie Freeloader', '09:33'),
(1, 3, 'B', 'Blue in Green', '05:27'),
(1, 4, 'B', 'All Blues', '11:33'),
(1, 5, 'B', 'Flamenco Sketches', '09:26');

-- Sample tracks for Dark Side of the Moon
INSERT INTO Tracks (ReleaseID, TrackNumber, Side, Title, Duration) VALUES
(3, 1, 'A', 'Speak to Me', '01:13'),
(3, 2, 'A', 'Breathe', '02:43'),
(3, 3, 'A', 'On the Run', '03:36'),
(3, 4, 'A', 'Time', '06:53'),
(3, 5, 'A', 'The Great Gig in the Sky', '04:36'),
(3, 6, 'B', 'Money', '06:23'),
(3, 7, 'B', 'Us and Them', '07:49'),
(3, 8, 'B', 'Any Colour You Like', '03:26'),
(3, 9, 'B', 'Brain Damage', '03:49'),
(3, 10, 'B', 'Eclipse', '02:03');

-- ============================================================
-- SAMPLE COLLECTION ITEMS
-- ============================================================
INSERT INTO Collection (ReleaseID, PurchaseDate, PurchasePrice, Condition, SleeveCondition, StorageLocation, Notes, AcquiredFrom) VALUES
(1, '2024-03-15', 45.00, 'Very Good Plus', 'Very Good', 'Shelf A, Position 12', 'Clean original pressing, minor surface wear', 'Local Record Store'),
(3, '2023-11-20', 125.00, 'Near Mint', 'Very Good Plus', 'Shelf A, Position 5', 'Excellent condition with original posters', 'Online Auction'),
(4, '2024-01-08', 35.00, 'Very Good', 'Good Plus', 'Shelf B, Position 3', 'Plays well, some cover wear', 'Estate Sale');

-- ============================================================
-- SAMPLE WISHLIST ITEMS
-- ============================================================
INSERT INTO Wishlist (ReleaseID, Priority, MaxPrice, Notes) VALUES
(2, 'High', 150.00, 'Looking for mint condition Music Matters reissue'),
(5, 'Medium', 200.00, 'Want original pressing with gatefold in VG+ or better'),
(6, 'High', 100.00, 'Looking for first pressing of OK Computer in excellent condition');