# Migration Guide: Firestore Data Model Optimization

This document outlines the step-by-step process for migrating from the current Firestore data models to the optimized structures defined in `data-models.md`.

## Migration Overview

1. **Preparation Phase**
   - Create backup of existing data
   - Set up migration environment
   - Create staging collections

2. **Products Migration**
   - Consolidate `travel_products` and `products` collections
   - Move review data to subcollections
   - Move itinerary data to subcollections

3. **User Data Migration**
   - Migrate user profiles
   - Create favorites subcollection
   - Migrate order history

4. **Carts Migration**
   - Convert embedded cart items to subcollections
   - Update reference patterns

5. **Orders Migration**
   - Move order items to subcollections
   - Create order history subcollection

6. **Index Creation**
   - Create required indexes for optimized queries

7. **Testing and Validation**
   - Verify data integrity
   - Test query performance
   - Validate security rules

## Detailed Migration Steps

### 1. Preparation Phase

#### 1.1 Create Backup

```javascript
const firestore = firebase.firestore();
const collections = ['travel_products', 'products', 'users', 'carts', 'orders', 'categories', 'promotions'];

// Export each collection to JSON
async function exportCollection(collectionName) {
  const snapshot = await firestore.collection(collectionName).get();
  const data = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  // Save to file or Cloud Storage
  console.log(`Exported ${data.length} documents from ${collectionName}`);
  return data;
}

// Run for each collection
for (const collection of collections) {
  exportCollection(collection);
}
```

#### 1.2 Set up Migration Environment

Create a separate Firebase project or use a staging environment to test the migration before applying it to production.

#### 1.3 Create Staging Collections

Create the target collection structure in the staging environment:

```javascript
// Example: Create products collection with new structure
const newProductsRef = stagingFirestore.collection('products');
```

### 2. Products Migration

#### 2.1 Consolidate Product Collections

```javascript
async function migrateProducts() {
  // Get all products from travel_products
  const travelProducts = await firestore.collection('travel_products').get();
  
  // Get all products from products
  const regularProducts = await firestore.collection('products').get();
  
  // Create a map to identify duplicates (by title or other unique identifier)
  const productMap = new Map();
  
  // Process travel products first
  for (const doc of travelProducts.docs) {
    const data = doc.data();
    
    // Create new product document with optimized structure
    const newProduct = {
      id: doc.id,
      title: data.title,
      shortDescription: data.shortDescription || data.description?.substring(0, 150) || '',
      description: data.description || '',
      price: {
        adult: data.price?.adult || 0,
        child: data.price?.child || 0,
        infant: data.price?.infant || 0,
        currency: data.price?.currency || 'KRW',
      },
      discountPercentage: data.discount?.type === 'percentage' ? data.discount.value : 0,
      discountActive: data.discount?.startDate && data.discount?.endDate ? 
        (data.discount.startDate.toDate() <= new Date() && data.discount.endDate.toDate() >= new Date()) : false,
      discountEndDate: data.discount?.endDate || null,
      
      // Extract main image
      mainImage: data.images && data.images.length > 0 ? {
        url: data.images[0].url,
        alt: data.images[0].alt || data.title,
      } : { url: '', alt: '' },
      
      region: data.region || '',
      location: data.location || { address: '', coordinates: { latitude: 0, longitude: 0 } },
      
      // Availability
      availableFrom: data.availability?.startDate || null,
      availableTo: data.availability?.endDate || null,
      availableDays: data.availability?.availableDays || [],
      
      // Duration
      duration: data.duration || { days: 0, nights: 0 },
      
      // Flags
      includesTransportation: data.includesTransportation || false,
      includesAccommodation: data.includesAccommodation || false,
      transportationType: data.transportationType || '',
      accommodationType: data.accommodationType || '',
      accommodationGrade: data.accommodationGrade || 0,
      
      // Services
      includedServices: data.includedServices || [],
      excludedServices: data.excludedServices || [],
      
      // Categories and tags
      categoryIds: data.categories || [],
      tags: data.tags || [],
      
      // Ratings
      averageRating: data.averageRating || 0,
      reviewCount: data.reviews?.length || 0,
      
      // Status
      status: data.status || 'draft',
      isTimeDeal: data.isTimeDeal || false,
      isBestSeller: data.isBestSeller || false,
      
      // Timestamps
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };
    
    // Add to map to detect duplicates
    productMap.set(doc.id, newProduct);
    
    // Now handle subcollections
    // 1. Images (excluding main image)
    if (data.images && data.images.length > 1) {
      const imagesRef = stagingFirestore.collection('products').doc(doc.id).collection('images');
      
      for (let i = 1; i < data.images.length; i++) {
        await imagesRef.add({
          id: `image_${i}`,
          url: data.images[i].url,
          alt: data.images[i].alt || `${data.title} - Image ${i+1}`,
          order: i,
          createdAt: new Date(),
        });
      }
    }
    
    // 2. Reviews
    if (data.reviews && data.reviews.length > 0) {
      const reviewsRef = stagingFirestore.collection('products').doc(doc.id).collection('reviews');
      
      for (const review of data.reviews) {
        await reviewsRef.add({
          id: review.id || firestore.collection('products').doc().id,
          userId: review.userId,
          userName: '', // Need to get from users collection
          userAvatar: '', // Need to get from users collection
          rating: review.rating,
          comment: review.comment || '',
          createdAt: review.date || new Date(),
          updatedAt: review.date || new Date(),
        });
      }
    }
    
    // 3. Itinerary
    if (data.itinerary && data.itinerary.length > 0) {
      const itineraryRef = stagingFirestore.collection('products').doc(doc.id).collection('itinerary');
      
      for (const item of data.itinerary) {
        await itineraryRef.add({
          id: `day_${item.day}`,
          day: item.day,
          title: `Day ${item.day}`,
          description: item.description,
          activities: item.activities || [],
          createdAt: new Date(),
        });
      }
    }
  }
  
  // Process regular products (similar to above but check for duplicates)
  for (const doc of regularProducts.docs) {
    // Similar processing as above, but check productMap first
    if (!productMap.has(doc.id)) {
      // Process if not a duplicate
      // ... (similar to above)
    }
  }
  
  // Write all products to new collection
  const batch = stagingFirestore.batch();
  let count = 0;
  let batchCount = 1;
  
  for (const [id, product] of productMap.entries()) {
    const docRef = stagingFirestore.collection('products').doc(id);
    batch.set(docRef, product);
    
    count++;
    
    // Firestore batches are limited to 500 operations
    if (count >= 499) {
      console.log(`Committing batch ${batchCount}`);
      await batch.commit();
      batch = stagingFirestore.batch();
      count = 0;
      batchCount++;
    }
  }
  
  if (count > 0) {
    console.log(`Committing final batch ${batchCount}`);
    await batch.commit();
  }
  
  console.log(`Migrated ${productMap.size} products`);
}
```

### 3. User Data Migration

```javascript
async function migrateUsers() {
  const users = await firestore.collection('users').get();
  
  for (const doc of users.docs) {
    const data = doc.data();
    
    // Create optimized user document
    const newUser = {
      id: doc.id,
      email: data.email || '',
      displayName: data.displayName || '',
      photoURL: data.photoURL || '',
      phoneNumber: data.phoneNumber || '',
      
      // Metadata
      createdAt: data.createdAt || new Date(),
      lastLoginAt: data.lastLoginAt || new Date(),
      
      // Preferences
      preferences: {
        currency: data.preferences?.currency || 'KRW',
        language: data.preferences?.language || 'ko',
        notifications: data.preferences?.notifications ?? true,
      },
      
      // Stats
      orderCount: 0, // Will be calculated during orders migration
      totalSpent: 0, // Will be calculated during orders migration
      
      // Role
      role: data.role || 'user',
      
      // GDPR
      marketingConsent: data.marketingConsent || false,
      consentTimestamp: data.consentTimestamp || null,
    };
    
    // Create user document
    await stagingFirestore.collection('users').doc(doc.id).set(newUser);
    
    // Create profile subcollection if we have extended data
    if (data.address || data.fullName) {
      await stagingFirestore.collection('users').doc(doc.id).collection('profile').doc(doc.id).set({
        id: doc.id,
        fullName: data.fullName || '',
        dateOfBirth: data.dateOfBirth || null,
        gender: data.gender || '',
        address: data.address || {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
        },
        passportNumber: data.passportNumber || '',
        passportExpiry: data.passportExpiry || null,
      });
    }
  }
  
  console.log(`Migrated ${users.size} users`);
}
```

### 4. Carts Migration

```javascript
async function migrateCarts() {
  const carts = await firestore.collection('carts').get();
  
  for (const doc of carts.docs) {
    const data = doc.data();
    const userId = doc.id;
    
    // Calculate cart totals
    let itemCount = 0;
    let subtotal = 0;
    
    if (data.items && Array.isArray(data.items)) {
      itemCount = data.items.reduce((total, item) => total + item.quantity, 0);
      subtotal = data.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    // Create optimized cart document
    const newCart = {
      id: userId,
      lastUpdated: data.lastUpdated || new Date(),
      itemCount: itemCount,
      subtotal: subtotal,
      discountAmount: 0, // To be calculated later with promotions
      total: subtotal, // To be updated with discounts
    };
    
    // Create cart document
    await stagingFirestore.collection('carts').doc(userId).set(newCart);
    
    // Create cart items subcollection
    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        await stagingFirestore.collection('carts').doc(userId).collection('items').add({
          id: item.id || stagingFirestore.collection('carts').doc(userId).collection('items').doc().id,
          productId: item.id,
          title: item.title,
          mainImage: item.image || '',
          price: item.price,
          quantity: item.quantity,
          options: item.options || {
            adult: 1,
            child: 0,
            infant: 0,
          },
          dates: item.dates || {
            startDate: null,
            endDate: null,
          },
          addedAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }
  
  console.log(`Migrated ${carts.size} carts`);
}
```

### 5. Orders Migration

```javascript
async function migrateOrders() {
  const orders = await firestore.collection('orders').get();
  const userOrderCounts = new Map();
  const userTotalSpent = new Map();
  
  for (const doc of orders.docs) {
    const data = doc.data();
    const userId = data.userId || data.customer?.id;
    
    if (!userId) {
      console.warn(`Order ${doc.id} has no user ID, skipping`);
      continue;
    }
    
    // Track order counts and spending by user
    userOrderCounts.set(userId, (userOrderCounts.get(userId) || 0) + 1);
    userTotalSpent.set(userId, (userTotalSpent.get(userId) || 0) + (data.total || 0));
    
    // Create optimized order document
    const newOrder = {
      id: doc.id,
      userId: userId,
      orderNumber: data.orderNumber || `ORD-${doc.id.substring(0, 8).toUpperCase()}`,
      status: data.status || 'pending',
      
      // Payment
      paymentStatus: data.paymentStatus || 'pending',
      paymentMethod: data.paymentMethod || '',
      paymentId: data.paymentId || '',
      
      // Totals
      subtotal: data.subtotal || 0,
      discountAmount: data.discountAmount || 0,
      tax: data.tax || 0,
      total: data.total || 0,
      
      // Customer
      customer: {
        id: userId,
        name: data.customer?.name || '',
        email: data.customer?.email || '',
        phone: data.customer?.phone || '',
        address: data.customer?.address || {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
        },
      },
      
      // Timestamps
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      completedAt: data.completedAt || null,
    };
    
    // Create order document
    await stagingFirestore.collection('orders').doc(doc.id).set(newOrder);
    
    // Create order items subcollection
    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        await stagingFirestore.collection('orders').doc(doc.id).collection('items').add({
          id: item.id || stagingFirestore.collection('orders').doc(doc.id).collection('items').doc().id,
          productId: item.productId,
          title: item.title || '',
          description: item.description || '',
          mainImage: item.image || '',
          price: item.price,
          quantity: item.quantity,
          options: item.options || {
            adult: 1,
            child: 0,
            infant: 0,
          },
          dates: item.dates || {
            startDate: null,
            endDate: null,
          },
        });
      }
    }
    
    // Create initial status history
    await stagingFirestore.collection('orders').doc(doc.id).collection('history').add({
      id: stagingFirestore.collection('orders').doc(doc.id).collection('history').doc().id,
      status: data.status || 'pending',
      timestamp: data.createdAt || new Date(),
      note: 'Order created',
      performedBy: 'system',
    });
  }
  
  // Update user documents with order stats
  for (const [userId, orderCount] of userOrderCounts.entries()) {
    await stagingFirestore.collection('users').doc(userId).update({
      orderCount: orderCount,
      totalSpent: userTotalSpent.get(userId) || 0,
    });
  }
  
  console.log(`Migrated ${orders.size} orders`);
}
```

### 6. Index Creation

After data migration, create the required indexes in the Firebase console or using the Firebase CLI:

```bash
# Example using Firebase CLI to deploy indexes
firebase deploy --only firestore:indexes
```

### 7. Testing and Validation

Perform test queries and validate data integrity:

```javascript
async function validateMigration() {
  // Test product query
  const productsQuery = await stagingFirestore.collection('products')
    .where('status', '==', 'published')
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();
  
  console.log(`Products query returned ${productsQuery.size} results`);
  
  // Test user+cart query
  const userId = '...'; // Sample user ID
  const userDoc = await stagingFirestore.collection('users').doc(userId).get();
  const cartDoc = await stagingFirestore.collection('carts').doc(userId).get();
  const cartItems = await stagingFirestore.collection('carts').doc(userId).collection('items').get();
  
  console.log(`User data: ${userDoc.exists}`);
  console.log(`Cart data: ${cartDoc.exists}`);
  console.log(`Cart items: ${cartItems.size}`);
  
  // Test order query
  const ordersQuery = await stagingFirestore.collection('orders')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();
  
  console.log(`Orders query returned ${ordersQuery.size} results`);
  
  if (ordersQuery.size > 0) {
    const orderDoc = ordersQuery.docs[0];
    const orderItems = await stagingFirestore.collection('orders').doc(orderDoc.id).collection('items').get();
    const orderHistory = await stagingFirestore.collection('orders').doc(orderDoc.id).collection('history').get();
    
    console.log(`Order items: ${orderItems.size}`);
    console.log(`Order history: ${orderHistory.size}`);
  }
}
```

## Deployment Process

1. **Backup Production Data**
   - Create a full backup of all Firestore collections

2. **Maintenance Mode**
   - Put application in maintenance mode to prevent writes during migration

3. **Run Migration Scripts**
   - Execute the migration scripts against the production environment

4. **Deploy New Security Rules**
   - Deploy the updated Firestore security rules

5. **Verify and Test**
   - Run validation tests against production data

6. **Deploy Updated Application**
   - Deploy application code that uses the new data models

7. **Monitor**
   - Closely monitor application performance and error rates

## Rollback Plan

If issues are detected after migration:

1. Restore from the backup created before migration
2. Roll back application code to the previous version
3. Roll back security rules to the previous version

---

This migration should be thoroughly tested in a staging environment before being applied to production. Consider a phased rollout approach for large-scale applications. 