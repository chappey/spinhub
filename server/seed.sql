-- seed.sql - Sample Data for Vinyl Collection Database
-- This file populates the database with example records

-- ============================================================
-- SAMPLE ARTISTS
-- ============================================================
-- SAMPLE ARTISTS
-- ============================================================
INSERT INTO Artists (Name, CountryOfOrigin, PrimaryGenre, Description) VALUES
('Miles Davis', 'United States', 'Jazz', 'Legendary jazz trumpeter and composer'),
('Pink Floyd', 'United Kingdom', 'Progressive Rock', 'Iconic progressive rock band'),
('The Beatles', 'United Kingdom', 'Rock', 'The most influential band in history'),
('John Coltrane', 'United States', 'Jazz', 'Pioneering jazz saxophonist'),
('Radiohead', 'United Kingdom', 'Alternative Rock', 'Innovative alternative rock band'),
('Bob Dylan', 'United States', 'Folk Rock', 'Nobel Prize-winning singer-songwriter'),
('Led Zeppelin', 'United Kingdom', 'Hard Rock', 'Legendary hard rock band'),
('Nina Simone', 'United States', 'Jazz/Soul', 'Iconic jazz and soul singer'),
('David Bowie', 'United Kingdom', 'Glam Rock', 'Innovative rock artist and actor'),
('The Rolling Stones', 'United Kingdom', 'Rock', 'One of the greatest rock bands ever'),
('Aretha Franklin', 'United States', 'Soul/R&B', 'Queen of Soul'),
('Jimi Hendrix', 'United States', 'Psychedelic Rock', 'Revolutionary guitarist'),
('Fleetwood Mac', 'United Kingdom', 'Rock', 'Classic rock band with multiple lineups'),
('Prince', 'United States', 'Funk/Rock', 'Prolific musician and performer'),
('Björk', 'Iceland', 'Experimental/Electronic', 'Innovative Icelandic artist');

-- ============================================================
-- SAMPLE LABELS
-- ============================================================
INSERT INTO Labels (Name, Country, FoundedYear, Description) VALUES
('Blue Note Records', 'United States', 1939, 'Historic jazz label'),
('Columbia Records', 'United States', 1887, 'Major American record label'),
('Harvest Records', 'United Kingdom', 1969, 'Progressive rock label'),
('Parlophone', 'United Kingdom', 1896, 'British record label'),
('Capitol Records', 'United States', 1942, 'Major American record label'),
('Impulse! Records', 'United States', 1960, 'Jazz label known for its distinctive design'),
('Atlantic Records', 'United States', 1947, 'Major American record label'),
('Warner Bros. Records', 'United States', 1958, 'Major American record label'),
('Island Records', 'United Kingdom', 1959, 'British record label'),
('Motown Records', 'United States', 1959, 'Legendary soul and R&B label'),
('RCA Records', 'United States', 1929, 'Major American record label'),
('Elektra Records', 'United States', 1950, 'American record label'),
('Virgin Records', 'United Kingdom', 1972, 'British record label'),
('Arista Records', 'United States', 1974, 'American record label'),
('One Little Indian Records', 'United Kingdom', 1985, 'Independent British label');

-- ============================================================
-- SAMPLE ALBUMS
-- ============================================================
INSERT INTO Albums (Title, ArtistID, Genre, OriginalReleaseYear, Format) VALUES
('Kind of Blue', 1, 'Jazz', 1959, 'LP'),
('The Dark Side of the Moon', 2, 'Progressive Rock', 1973, 'LP'),
('Abbey Road', 3, 'Rock', 1969, 'LP'),
('A Love Supreme', 4, 'Jazz', 1965, 'LP'),
('OK Computer', 5, 'Alternative Rock', 1997, 'LP'),
('Highway 61 Revisited', 6, 'Folk Rock', 1965, 'LP'),
('Led Zeppelin IV', 7, 'Hard Rock', 1971, 'LP'),
('Little Girl Blue', 8, 'Jazz', 1958, 'LP'),
('The Rise and Fall of Ziggy Stardust', 9, 'Glam Rock', 1972, 'LP'),
('Exile on Main St.', 10, 'Rock', 1972, '2LP'),
('I Never Loved a Man the Way I Love You', 11, 'Soul', 1967, 'LP'),
('Are You Experienced', 12, 'Psychedelic Rock', 1967, 'LP'),
('Rumours', 13, 'Rock', 1977, 'LP'),
('Purple Rain', 14, 'Funk/Rock', 1984, 'LP'),
('Homogenic', 15, 'Experimental', 1997, 'LP');

-- ============================================================
-- SAMPLE RELEASES
-- ============================================================
INSERT INTO Releases (AlbumID, LabelID, CatalogNumber, CountryOfRelease, ReleaseYear, FormatVariant, ColorOrEdition, Notes) VALUES
(1, 1, 'BST-1595', 'United States', 1959, '12-inch LP', 'Original Mono Pressing', 'First pressing with 6-eye label'),
(1, 1, 'BST-1595-RE', 'United States', 2015, '12-inch LP', '180g Reissue', 'Music Matters reissue'),
(2, 3, 'SHVL 804', 'United Kingdom', 1973, '12-inch LP', 'Original Gatefold', 'First UK pressing with solid blue triangle and posters'),
(3, 4, 'PCS 7088', 'United Kingdom', 1969, '12-inch LP', 'Original Pressing', 'First UK pressing with "Her Majesty"'),
(4, 6, 'AS-77', 'United States', 1965, '12-inch LP', 'Original Gatefold', 'First pressing with orange and black label'),
(5, 4, 'NODATA 03', 'United Kingdom', 1997, '12-inch LP', 'Original 2LP', 'First pressing double album'),
(6, 2, 'CS 9189', 'United States', 1965, '12-inch LP', 'Original Mono', 'First pressing with red label'),
(7, 5, 'SD 7208', 'United States', 1971, '12-inch LP', 'Original Gatefold', 'First pressing with no text on inner sleeve'),
(8, 1, 'BLP 1570', 'United States', 1958, '12-inch LP', 'Original Mono', 'First pressing'),
(9, 7, 'RCA LSP 4702', 'United Kingdom', 1972, '12-inch LP', 'Original Gatefold', 'First UK pressing'),
(10, 10, 'COC 69100', 'United Kingdom', 1972, '12-inch 2LP', 'Original Gatefold', 'First UK pressing with zipper cover'),
(11, 5, 'ST-910', 'United States', 1967, '12-inch LP', 'Original Mono', 'First pressing'),
(12, 11, 'RS-6261', 'United States', 1967, '12-inch LP', 'Original Stereo', 'First pressing with Track Records label'),
(13, 12, 'SW-37011', 'United States', 1977, '12-inch LP', 'Original Gatefold', 'First pressing with inner sleeve'),
(14, 13, '1-25157', 'United States', 1984, '12-inch LP', 'Original Gatefold', 'First pressing with purple vinyl'),
(15, 14, 'TPLP 81', 'United Kingdom', 1997, '12-inch LP', 'Original', 'First pressing');

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
(4, '2024-01-08', 35.00, 'Very Good', 'Good Plus', 'Shelf B, Position 3', 'Plays well, some cover wear', 'Estate Sale'),
(6, '2024-02-14', 75.00, 'Near Mint', 'Mint', 'Shelf A, Position 8', 'Sealed copy, never played', 'Record Fair'),
(7, '2023-09-10', 95.00, 'Very Good Plus', 'Very Good Plus', 'Shelf B, Position 1', 'Classic album in great condition', 'Online Store'),
(8, '2024-04-22', 120.00, 'Mint', 'Near Mint', 'Shelf A, Position 15', 'Rare jazz classic, pristine condition', 'Private Collection'),
(9, '2023-12-05', 55.00, 'Very Good', 'Very Good', 'Shelf C, Position 2', 'Iconic glam rock album', 'Vintage Shop'),
(11, '2024-05-18', 85.00, 'Near Mint', 'Very Good Plus', 'Shelf B, Position 7', 'Soul music masterpiece', 'Record Store'),
(12, '2023-08-30', 150.00, 'Very Good Plus', 'Very Good', 'Shelf A, Position 3', 'Legendary psychedelic rock', 'Auction House'),
(13, '2024-06-12', 65.00, 'Near Mint', 'Mint', 'Shelf C, Position 5', 'Fleetwood Mac classic', 'Online Marketplace'),
(14, '2023-10-25', 40.00, 'Very Good', 'Good Plus', 'Shelf B, Position 10', 'Prince masterpiece', 'Local Dealer'),
(15, '2024-07-03', 70.00, 'Mint', 'Mint', 'Shelf A, Position 20', 'Experimental electronic album', 'Import Store');

-- ============================================================
-- SAMPLE WISHLIST ITEMS
-- ============================================================
INSERT INTO Wishlist (ReleaseID, Priority, MaxPrice, Notes) VALUES
(2, 'High', 150.00, 'Looking for mint condition Music Matters reissue'),
(5, 'Medium', 200.00, 'Want original pressing with gatefold in VG+ or better'),
(6, 'High', 100.00, 'Looking for first pressing of OK Computer in excellent condition'),
(10, 'High', 300.00, 'Exile on Main St. original pressing with zipper cover'),
(14, 'Medium', 80.00, 'Purple Rain on purple vinyl'),
(15, 'Low', 120.00, 'Björk experimental album in good condition');