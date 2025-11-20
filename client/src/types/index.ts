export interface Artist {
  ArtistID: number;
  Name: string;
  CountryOfOrigin?: string;
  PrimaryGenre?: string;
  Description?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface Label {
  LabelID: number;
  Name: string;
  Country?: string;
  FoundedYear?: number;
  Description?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface Album {
  AlbumID: number;
  Title: string;
  ArtistID: number;
  Genre?: string;
  OriginalReleaseYear?: number;
  Format?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  ArtistName?: string; // Joined field
}

export interface Release {
  ReleaseID: number;
  AlbumID: number;
  LabelID?: number;
  CatalogNumber?: string;
  CountryOfRelease?: string;
  ReleaseYear?: number;
  AlternateTitle?: string;
  FormatVariant?: string;
  ColorOrEdition?: string;
  Notes?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  LabelName?: string; // Joined field
  AlbumTitle?: string; // Joined field
  ArtistName?: string; // Joined field
  ThumbURL?: string;
}

export interface Track {
  TrackID: number;
  ReleaseID: number;
  TrackNumber: number;
  Side?: string;
  Title: string;
  Duration?: string;
}

export interface CollectionItem {
  CollectionID: number;
  ReleaseID: number;
  PurchaseDate?: string;
  PurchasePrice?: number;
  Condition?: string;
  SleeveCondition?: string;
  StorageLocation?: string;
  Notes?: string;
  AcquiredFrom?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  
  // Joined fields
  CatalogNumber?: string;
  ColorOrEdition?: string;
  ReleaseYear?: number;
  AlbumTitle?: string;
  Format?: string;
  ArtistName?: string;
  LabelName?: string;
  CacheID?: number;
}

export interface WishlistItem {
  WishlistID: number;
  AlbumID?: number;
  ReleaseID?: number;
  Priority: 'High' | 'Medium' | 'Low';
  MaxPrice?: number;
  Notes?: string;
  DateAdded?: string;

  // Joined fields
  AlbumTitle?: string;
  Format?: string;
  ArtistName?: string;
  CatalogNumber?: string;
  ColorOrEdition?: string;
  ReleaseYear?: number;
  LabelName?: string;
  CacheID?: number;
}

export interface Stats {
  totalRecords: number;
  totalArtists: number;
  totalValue: number;
  wishlistItems: number;
  conditionBreakdown: { Condition: string; count: number }[];
}

export interface DiscogsResult {
  id: number;
  title: string;
  year?: string;
  genre?: string;
  style?: string;
  country?: string;
  format?: string[];
  label?: string;
  catno?: string;
  thumb?: string;
  cover_image?: string;
  artist?: string;
}
