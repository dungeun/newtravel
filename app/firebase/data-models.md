# Optimized Firestore Data Models for Travel Application

This document outlines the optimized data models for the core collections in our travel booking application.

## Design Principles

1. **Data Denormalization Strategy**
   - Denormalize frequently accessed data to minimize reads
   - Store computed values for quick access (e.g., averageRating)
   - Create data duplicates strategically to optimize for read-heavy operations

2. **Composite Key Strategy**
   - Use composite keys for related data (`userId_productId` patterns)
   - Use consistent ID generation for predictable access patterns

3. **Subcollections Strategy**
   - Use subcollections for one-to-many relationships
   - Avoid deeply nested subcollections (limit to 1-2 levels)

4. **Indexing Strategy**
   - Create composite indexes for common query patterns
   - Be mindful of index limits (max 200 composite indexes per database)
   - Use careful denormalization to avoid complex queries requiring many indexes

5. **Batch Size Limitations**
   - Keep arrays under 20KB limit (typically < 1000 items)
   - Ensure document sizes stay under 1MB limit

## Core Collection Structures

### 1. Products Collection (`products`)

```typescript
interface Product {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  price: {
    adult: number;
    child: number;
    infant: number;
    currency: string;
  };
  discountPercentage: number; // Flattened for easier querying
  discountActive: boolean;    // Flag for active discounts
  discountEndDate: Timestamp; // For time-based discounts
  
  // Flattened main image for quick access in listings
  mainImage: {
    url: string;
    alt: string;
  };
  
  // Other images in subcollection (products/{productId}/images)
  
  region: string;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Basic availability info
  availableFrom: Timestamp;
  availableTo: Timestamp;
  availableDays: string[]; // ['monday', 'tuesday', ...]
  
  // Duration info
  duration: {
    days: number;
    nights: number;
  };
  
  // Important flags for filtering
  includesTransportation: boolean;
  includesAccommodation: boolean;
  transportationType: string;
  accommodationType: string;
  accommodationGrade: number;
  
  // Arrays with reasonable size limitations
  includedServices: string[]; // Limited to important services
  excludedServices: string[]; // Limited to important exclusions
  
  // Categories and tags as arrays for filtering
  categoryIds: string[];
  tags: string[];
  
  // Aggregated values (denormalized)
  averageRating: number;
  reviewCount: number;
  
  // Status flags
  status: 'draft' | 'published' | 'archived';
  isTimeDeal: boolean;
  isBestSeller: boolean;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Subcollections:**

1. **Product Images**: `products/{productId}/images`
```typescript
interface ProductImage {
  id: string;
  url: string;
  alt: string;
  order: number;
  createdAt: Timestamp;
}
```

2. **Product Reviews**: `products/{productId}/reviews`
```typescript
interface ProductReview {
  id: string;
  userId: string;
  userName: string; // Denormalized for displaying with less queries
  userAvatar: string; // Denormalized for displaying with less queries
  rating: number;
  comment: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

3. **Product Itinerary**: `products/{productId}/itinerary`
```typescript
interface ItineraryItem {
  id: string;
  day: number;
  title: string;
  description: string;
  activities: string[];
  createdAt: Timestamp;
}
```

4. **Inventory**: `products/{productId}/inventory`
```typescript
interface InventoryEntry {
  id: string;           // Usually date in YYYY-MM-DD format
  date: Timestamp;
  totalCapacity: number;
  remainingCapacity: number;
  updatedAt: Timestamp;
}
```

### 2. Users Collection (`users`)

```typescript
interface User {
  id: string;          // UID from Firebase Auth
  email: string;
  displayName: string;
  photoURL: string;
  phoneNumber: string;
  
  // User metadata
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  
  // User preferences
  preferences: {
    currency: string;
    language: string;
    notifications: boolean;
  };
  
  // User stats
  orderCount: number;   // Denormalized count of orders
  totalSpent: number;   // Denormalized for VIP calculations
  
  // Role-based access
  role: 'user' | 'admin' | 'editor';
  
  // GDPR consent
  marketingConsent: boolean;
  consentTimestamp: Timestamp;
}
```

**Subcollections:**

1. **Saved/Favorited Products**: `users/{userId}/favorites`
```typescript
interface FavoriteProduct {
  id: string;          // Product ID
  createdAt: Timestamp;
}
```

2. **User Profiles** (extended data): `users/{userId}/profile`
```typescript
interface UserProfile {
  id: string;          // Same as userId
  fullName: string;
  dateOfBirth: Timestamp;
  gender: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  passportNumber: string;
  passportExpiry: Timestamp;
}
```

### 3. Carts Collection (`carts`)

```typescript
interface Cart {
  id: string;          // User ID
  lastUpdated: Timestamp;
  itemCount: number;    // Total count of items
  subtotal: number;     // Cart subtotal (pre-discount)
  discountAmount: number; // Applied discount amount
  total: number;        // Final total after discounts
}
```

**Subcollections:**

1. **Cart Items**: `carts/{userId}/items`
```typescript
interface CartItem {
  id: string;          // Product ID or unique ID if multiple same products
  productId: string;   // Reference to product
  title: string;       // Denormalized product data (prevents UI issues if product changes)
  mainImage: string;   // Denormalized to show in cart without fetching product
  price: number;       // Price at time of adding to cart
  quantity: number;
  options: {
    adult: number;
    child: number;
    infant: number;
  };
  dates: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
  addedAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 4. Orders Collection (`orders`)

```typescript
interface Order {
  id: string;
  userId: string;
  orderNumber: string;  // Human-readable order number
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  
  // Payment information
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentId: string;    // Reference to payment processor ID
  
  // Order totals
  subtotal: number;
  discountAmount: number;
  tax: number;
  total: number;
  
  // Customer information (denormalized at time of order)
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    }
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt: Timestamp;
}
```

**Subcollections:**

1. **Order Items**: `orders/{orderId}/items`
```typescript
interface OrderItem {
  id: string;
  productId: string;
  title: string;        // Denormalized product data
  description: string;  // Denormalized product data
  mainImage: string;    // Denormalized product data
  price: number;        // Price at time of order
  quantity: number;
  options: {
    adult: number;
    child: number;
    infant: number;
  };
  dates: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
}
```

2. **Order History**: `orders/{orderId}/history`
```typescript
interface OrderHistory {
  id: string;
  status: string;
  timestamp: Timestamp;
  note: string;
  performedBy: string;  // User ID of admin/system
}
```

## Additional Collections

### 1. Categories (`categories`)

```typescript
interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  parentId: string;     // For hierarchical categories
  order: number;        // For display order
  isActive: boolean;    // For toggling visibility
  productCount: number; // Denormalized for UI display
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2. Promotions (`promotions`)

```typescript
interface Promotion {
  id: string;
  code: string;         // Promo code
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumPurchase: number;
  maximumDiscount: number;
  startDate: Timestamp;
  endDate: Timestamp;
  isActive: boolean;
  usageLimit: number;   // Max number of uses
  currentUsage: number; // Current usage count
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Query Patterns and Efficiency

### Common Product Queries

1. **List all published products (paginated)**
   ```javascript
   const q = query(
     collection(db, 'products'),
     where('status', '==', 'published'),
     orderBy('createdAt', 'desc'),
     limit(20)
   );
   ```

2. **Filter products by category**
   ```javascript
   const q = query(
     collection(db, 'products'),
     where('status', '==', 'published'),
     where('categoryIds', 'array-contains', categoryId),
     orderBy('createdAt', 'desc'),
     limit(20)
   );
   ```

3. **Filter products by region and date range**
   ```javascript
   const q = query(
     collection(db, 'products'),
     where('status', '==', 'published'),
     where('region', '==', region),
     where('availableFrom', '<=', targetDate),
     where('availableTo', '>=', targetDate),
     orderBy('price.adult', 'asc'),
     limit(20)
   );
   ```

### Common User Queries

1. **Get user by ID**
   ```javascript
   const userDoc = await getDoc(doc(db, 'users', userId));
   ```

2. **Get user's cart**
   ```javascript
   const cartDoc = await getDoc(doc(db, 'carts', userId));
   const cartItemsQuery = query(collection(db, 'carts', userId, 'items'));
   const cartItemsSnapshot = await getDocs(cartItemsQuery);
   ```

### Common Order Queries

1. **Get user's orders**
   ```javascript
   const q = query(
     collection(db, 'orders'),
     where('userId', '==', userId),
     orderBy('createdAt', 'desc'),
     limit(10)
   );
   ```

2. **Get order details with items**
   ```javascript
   const orderDoc = await getDoc(doc(db, 'orders', orderId));
   const orderItemsQuery = query(collection(db, 'orders', orderId, 'items'));
   const orderItemsSnapshot = await getDocs(orderItemsQuery);
   ```

## Required Indexes

1. **Product indexes**
   - Composite index on `products` for `status`, `categoryIds` (array-contains), `createdAt` (desc)
   - Composite index on `products` for `status`, `region`, `availableFrom`, `availableTo`, `price.adult` (asc)
   - Composite index on `products` for `status`, `isTimeDeal`, `createdAt` (desc)
   - Composite index on `products` for `status`, `isBestSeller`, `createdAt` (desc)

2. **Order indexes**
   - Composite index on `orders` for `userId`, `createdAt` (desc)
   - Composite index on `orders` for `status`, `createdAt` (desc)

3. **Cart indexes**
   - No complex queries requiring composite indexes

## Data Integrity and Security Considerations

1. **Security Rules**
   - Products: Admin write, public read for published only
   - Users: Personal read/write for own data
   - Carts: Personal read/write for own cart only
   - Orders: Admin write, personal read for own orders

2. **Data Validation**
   - Client-side validation using Zod schemas
   - Server-side validation through Firestore rules
   - API validation for admin operations

3. **Data Consistency**
   - Use batch writes for multi-document updates
   - Consider triggers for keeping denormalized data in sync

4. **Performance Considerations**
   - Keep documents under 1MB size limit
   - Limit array fields to a reasonable size
   - Use pagination for all list queries
   - Cache frequently accessed data client-side with React Query 