// app.js - Vinyl Collection Manager Frontend Logic

const API_BASE = 'http://localhost:3000/api';

// State Management
let currentCollection = [];
let currentWishlist = [];
let allArtists = [];
let allLabels = [];
let allAlbums = [];

// DOM Elements
const collectionGrid = document.getElementById('collectionGrid');
const wishlistGrid = document.getElementById('wishlistGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const sortBy = document.getElementById('sortBy');
const tabButtons = document.querySelectorAll('.tab-btn');
const detailModal = document.getElementById('detailModal');
const closeModal = document.querySelector('.close');
const loadingSpinner = document.getElementById('loadingSpinner');
const toast = document.getElementById('toast');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

async function initializeApp() {
    showLoading();
    try {
        await Promise.all([
            loadStats(),
            loadCollection(),
            loadWishlist(),
            loadArtists(),
            loadLabels()
        ]);
        populateArtistSelect();
        populateLabelSelect();
    } catch (error) {
        showToast('Failed to load data: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Search
    searchBtn.addEventListener('click', performSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Sorting
    sortBy.addEventListener('change', sortCollection);

    // Modal
    closeModal.addEventListener('click', () => detailModal.classList.add('hidden'));
    window.addEventListener('click', (e) => {
        if (e.target === detailModal) detailModal.classList.add('hidden');
    });

    // Add form buttons
    document.getElementById('newArtistBtn').addEventListener('click', toggleNewArtistForm);
    document.getElementById('saveArtistBtn').addEventListener('click', saveNewArtist);
    document.getElementById('cancelArtistBtn').addEventListener('click', () => {
        document.getElementById('newArtistForm').classList.add('hidden');
    });

    document.getElementById('newAlbumBtn').addEventListener('click', toggleNewAlbumForm);
    document.getElementById('saveAlbumBtn').addEventListener('click', saveNewAlbum);
    document.getElementById('cancelAlbumBtn').addEventListener('click', () => {
        document.getElementById('newAlbumForm').classList.add('hidden');
    });

    document.getElementById('artistSelect').addEventListener('change', (e) => {
        if (e.target.value) {
            loadAlbumsForArtist(e.target.value);
        }
    });

    document.getElementById('addToCollectionBtn').addEventListener('click', addToCollection);
}

// Tab Switching
function switchTab(tabName) {
    // Update buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');

    // Load data if needed
    if (tabName === 'collection') {
        renderCollection();
    } else if (tabName === 'wishlist') {
        renderWishlist();
    }
}

// API Calls
async function apiCall(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
    }

    return response.json();
}

async function loadStats() {
    const stats = await apiCall('/stats');
    document.getElementById('totalRecords').textContent = stats.totalRecords;
    document.getElementById('totalArtists').textContent = stats.totalArtists;
    document.getElementById('totalValue').textContent = `$${stats.totalValue.toFixed(2)}`;
    document.getElementById('wishlistCount').textContent = stats.wishlistItems;
}

async function loadCollection() {
    currentCollection = await apiCall('/collection');
    renderCollection();
}

async function loadWishlist() {
    currentWishlist = await apiCall('/wishlist');
    renderWishlist();
}

async function loadArtists() {
    allArtists = await apiCall('/artists');
}

async function loadLabels() {
    allLabels = await apiCall('/labels');
}

async function loadAlbumsForArtist(artistId) {
    const albums = await apiCall('/albums');
    allAlbums = albums.filter(album => album.ArtistID == artistId);
    populateAlbumSelect();
}

// Render Functions
function renderCollection() {
    if (currentCollection.length === 0) {
        collectionGrid.innerHTML = `
            <div class="empty-state">
                <h3>No records in your collection yet</h3>
                <p>Start adding records using the "Add New" tab</p>
            </div>
        `;
        return;
    }

    collectionGrid.innerHTML = currentCollection.map(item => `
        <div class="record-card" onclick="viewCollectionDetails(${item.CollectionID})">
            <h3>${item.AlbumTitle}</h3>
            <p class="artist">${item.ArtistName}</p>
            <div class="record-info">
                <div class="info-row">
                    <span class="info-label">Year:</span>
                    <span>${item.ReleaseYear || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Label:</span>
                    <span>${item.LabelName || 'Unknown'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Catalog #:</span>
                    <span>${item.CatalogNumber || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Condition:</span>
                    <span class="condition-badge ${getConditionClass(item.Condition)}">
                        ${item.Condition}
                    </span>
                </div>
                ${item.PurchasePrice ? `
                <div class="info-row">
                    <span class="info-label">Price:</span>
                    <span>$${parseFloat(item.PurchasePrice).toFixed(2)}</span>
                </div>
                ` : ''}
                ${item.StorageLocation ? `
                <div class="info-row">
                    <span class="info-label">Location:</span>
                    <span>${item.StorageLocation}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function renderWishlist() {
    if (currentWishlist.length === 0) {
        wishlistGrid.innerHTML = `
            <div class="empty-state">
                <h3>Your wishlist is empty</h3>
                <p>Add records you want to acquire</p>
            </div>
        `;
        return;
    }

    wishlistGrid.innerHTML = currentWishlist.map(item => `
        <div class="record-card" onclick="viewWishlistDetails(${item.WishlistID})">
            <h3>${item.AlbumTitle || 'Unknown Album'}</h3>
            <p class="artist">${item.ArtistName || 'Unknown Artist'}</p>
            <div class="record-info">
                <div class="info-row">
                    <span class="info-label">Priority:</span>
                    <span class="priority-badge ${item.Priority.toLowerCase()}">
                        ${item.Priority}
                    </span>
                </div>
                ${item.MaxPrice ? `
                <div class="info-row">
                    <span class="info-label">Max Price:</span>
                    <span>$${parseFloat(item.MaxPrice).toFixed(2)}</span>
                </div>
                ` : ''}
                ${item.ReleaseYear ? `
                <div class="info-row">
                    <span class="info-label">Year:</span>
                    <span>${item.ReleaseYear}</span>
                </div>
                ` : ''}
                ${item.CatalogNumber ? `
                <div class="info-row">
                    <span class="info-label">Catalog #:</span>
                    <span>${item.CatalogNumber}</span>
                </div>
                ` : ''}
                ${item.Notes ? `
                <div class="info-row">
                    <span class="info-label">Notes:</span>
                    <span>${item.Notes}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Search and Sort
async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        showToast('Please enter a search term', 'error');
        return;
    }

    showLoading();
    try {
        const results = await apiCall(`/search?query=${encodeURIComponent(query)}`);
        currentCollection = results;
        renderCollection();
        showToast(`Found ${results.length} records`);
    } catch (error) {
        showToast('Search failed: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function clearSearch() {
    searchInput.value = '';
    loadCollection();
}

function sortCollection() {
    const sortField = sortBy.value;
    
    currentCollection.sort((a, b) => {
        switch(sortField) {
            case 'artist':
                return a.ArtistName.localeCompare(b.ArtistName);
            case 'album':
                return a.AlbumTitle.localeCompare(b.AlbumTitle);
            case 'year':
                return (b.ReleaseYear || 0) - (a.ReleaseYear || 0);
            case 'condition':
                return getConditionValue(b.Condition) - getConditionValue(a.Condition);
            case 'price':
                return (b.PurchasePrice || 0) - (a.PurchasePrice || 0);
            default:
                return 0;
        }
    });
    
    renderCollection();
}

// Form Functions
function populateArtistSelect() {
    const select = document.getElementById('artistSelect');
    select.innerHTML = '<option value="">-- Select Artist --</option>' +
        allArtists.map(artist => 
            `<option value="${artist.ArtistID}">${artist.Name}</option>`
        ).join('');
}

function populateLabelSelect() {
    const select = document.getElementById('labelSelect');
    select.innerHTML = '<option value="">-- Select Label (Optional) --</option>' +
        allLabels.map(label => 
            `<option value="${label.LabelID}">${label.Name}</option>`
        ).join('');
}

function populateAlbumSelect() {
    const select = document.getElementById('albumSelect');
    select.innerHTML = '<option value="">-- Select Album --</option>' +
        allAlbums.map(album => 
            `<option value="${album.AlbumID}">${album.Title} (${album.OriginalReleaseYear || 'N/A'})</option>`
        ).join('');
}

function toggleNewArtistForm() {
    const form = document.getElementById('newArtistForm');
    form.classList.toggle('hidden');
}

function toggleNewAlbumForm() {
    const artistId = document.getElementById('artistSelect').value;
    if (!artistId) {
        showToast('Please select an artist first', 'error');
        return;
    }
    const form = document.getElementById('newAlbumForm');
    form.classList.toggle('hidden');
}

async function saveNewArtist() {
    const name = document.getElementById('artistName').value.trim();
    if (!name) {
        showToast('Artist name is required', 'error');
        return;
    }

    showLoading();
    try {
        const result = await apiCall('/artists', {
            method: 'POST',
            body: JSON.stringify({
                Name: name,
                CountryOfOrigin: document.getElementById('artistCountry').value,
                PrimaryGenre: document.getElementById('artistGenre').value
            })
        });

        await loadArtists();
        populateArtistSelect();
        document.getElementById('artistSelect').value = result.ArtistID;
        document.getElementById('newArtistForm').classList.add('hidden');
        document.getElementById('artistName').value = '';
        document.getElementById('artistCountry').value = '';
        document.getElementById('artistGenre').value = '';
        showToast('Artist added successfully');
    } catch (error) {
        showToast('Failed to add artist: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function saveNewAlbum() {
    const title = document.getElementById('albumTitle').value.trim();
    const artistId = document.getElementById('artistSelect').value;
    
    if (!title || !artistId) {
        showToast('Album title and artist are required', 'error');
        return;
    }

    showLoading();
    try {
        const result = await apiCall('/albums', {
            method: 'POST',
            body: JSON.stringify({
                Title: title,
                ArtistID: artistId,
                Genre: document.getElementById('albumGenre').value,
                OriginalReleaseYear: document.getElementById('albumYear').value || null,
                Format: document.getElementById('albumFormat').value
            })
        });

        await loadAlbumsForArtist(artistId);
        document.getElementById('albumSelect').value = result.AlbumID;
        document.getElementById('newAlbumForm').classList.add('hidden');
        document.getElementById('albumTitle').value = '';
        document.getElementById('albumGenre').value = '';
        document.getElementById('albumYear').value = '';
        showToast('Album added successfully');
    } catch (error) {
        showToast('Failed to add album: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function addToCollection() {
    const albumId = document.getElementById('albumSelect').value;
    
    if (!albumId) {
        showToast('Please select an album', 'error');
        return;
    }

    showLoading();
    try {
        // First create the release
        const releaseData = {
            AlbumID: albumId,
            LabelID: document.getElementById('labelSelect').value || null,
            CatalogNumber: document.getElementById('catalogNumber').value || null,
            CountryOfRelease: document.getElementById('countryOfRelease').value || null,
            ReleaseYear: document.getElementById('releaseYear').value || null,
            FormatVariant: document.getElementById('formatVariant').value || null,
            ColorOrEdition: document.getElementById('colorEdition').value || null
        };

        const release = await apiCall('/releases', {
            method: 'POST',
            body: JSON.stringify(releaseData)
        });

        // Then add to collection
        const collectionData = {
            ReleaseID: release.ReleaseID,
            PurchaseDate: document.getElementById('purchaseDate').value || null,
            PurchasePrice: document.getElementById('purchasePrice').value || null,
            Condition: document.getElementById('condition').value,
            SleeveCondition: document.getElementById('sleeveCondition').value,
            StorageLocation: document.getElementById('storageLocation').value || null,
            AcquiredFrom: document.getElementById('acquiredFrom').value || null,
            Notes: document.getElementById('notes').value || null
        };

        await apiCall('/collection', {
            method: 'POST',
            body: JSON.stringify(collectionData)
        });

        // Reset form
        resetAddForm();
        
        // Reload data
        await Promise.all([loadCollection(), loadStats()]);
        
        showToast('Record added to collection successfully!');
        switchTab('collection');
    } catch (error) {
        showToast('Failed to add record: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function resetAddForm() {
    document.getElementById('artistSelect').value = '';
    document.getElementById('albumSelect').value = '';
    document.getElementById('labelSelect').value = '';
    document.querySelectorAll('#addTab input, #addTab textarea').forEach(input => {
        input.value = '';
    });
    document.getElementById('condition').value = 'Very Good';
    document.getElementById('sleeveCondition').value = 'Very Good';
}

// Detail Views
async function viewCollectionDetails(collectionId) {
    showLoading();
    try {
        const item = await apiCall(`/collection/${collectionId}`);
        const release = await apiCall(`/releases/${item.ReleaseID}`);
        
        document.getElementById('modalBody').innerHTML = `
            <h2>${item.AlbumTitle}</h2>
            <h3>${item.ArtistName}</h3>
            <hr style="margin: 20px 0;">
            <p><strong>Label:</strong> ${item.LabelName || 'Unknown'}</p>
            <p><strong>Catalog Number:</strong> ${item.CatalogNumber || 'N/A'}</p>
            <p><strong>Release Year:</strong> ${item.ReleaseYear || 'N/A'}</p>
            <p><strong>Format:</strong> ${release.FormatVariant || item.Format || 'N/A'}</p>
            <p><strong>Color/Edition:</strong> ${release.ColorOrEdition || 'N/A'}</p>
            <hr style="margin: 20px 0;">
            <p><strong>Condition:</strong> ${item.Condition}</p>
            <p><strong>Sleeve Condition:</strong> ${item.SleeveCondition || 'N/A'}</p>
            <p><strong>Purchase Date:</strong> ${item.PurchaseDate || 'N/A'}</p>
            <p><strong>Purchase Price:</strong> ${item.PurchasePrice ? '$' + parseFloat(item.PurchasePrice).toFixed(2) : 'N/A'}</p>
            <p><strong>Storage Location:</strong> ${item.StorageLocation || 'N/A'}</p>
            <p><strong>Acquired From:</strong> ${item.AcquiredFrom || 'N/A'}</p>
            ${item.Notes ? `<p><strong>Notes:</strong> ${item.Notes}</p>` : ''}
            ${release.tracks && release.tracks.length > 0 ? `
                <hr style="margin: 20px 0;">
                <h4>Track List:</h4>
                <ol>
                    ${release.tracks.map(track => 
                        `<li>${track.Title} (${track.Duration || 'N/A'})</li>`
                    ).join('')}
                </ol>
            ` : ''}
        `;
        
        detailModal.classList.remove('hidden');
    } catch (error) {
        showToast('Failed to load details: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function viewWishlistDetails(wishlistId) {
    const item = currentWishlist.find(w => w.WishlistID === wishlistId);
    
    document.getElementById('modalBody').innerHTML = `
        <h2>${item.AlbumTitle || 'Unknown Album'}</h2>
        <h3>${item.ArtistName || 'Unknown Artist'}</h3>
        <hr style="margin: 20px 0;">
        <p><strong>Priority:</strong> <span class="priority-badge ${item.Priority.toLowerCase()}">${item.Priority}</span></p>
        <p><strong>Max Price:</strong> ${item.MaxPrice ? '$' + parseFloat(item.MaxPrice).toFixed(2) : 'Not set'}</p>
        ${item.ReleaseYear ? `<p><strong>Year:</strong> ${item.ReleaseYear}</p>` : ''}
        ${item.CatalogNumber ? `<p><strong>Catalog Number:</strong> ${item.CatalogNumber}</p>` : ''}
        ${item.LabelName ? `<p><strong>Label:</strong> ${item.LabelName}</p>` : ''}
        ${item.Notes ? `<p><strong>Notes:</strong> ${item.Notes}</p>` : ''}
    `;
    
    detailModal.classList.remove('hidden');
}

// Utility Functions
function getConditionClass(condition) {
    if (['Mint', 'Near Mint'].includes(condition)) return 'mint';
    if (['Very Good Plus', 'Very Good'].includes(condition)) return 'vg';
    return 'good';
}

function getConditionValue(condition) {
    const values = {
        'Mint': 8,
        'Near Mint': 7,
        'Very Good Plus': 6,
        'Very Good': 5,
        'Good Plus': 4,
        'Good': 3,
        'Fair': 2,
        'Poor': 1
    };
    return values[condition] || 0;
}

function showLoading() {
    loadingSpinner.classList.remove('hidden');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}