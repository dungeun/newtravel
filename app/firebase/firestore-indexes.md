# Firestore 인덱싱 전략

이 문서는 여행 애플리케이션의 Firestore 데이터베이스에 필요한 인덱스 전략을 상세히 설명합니다.

## 인덱스 기본 사항

Firebase Firestore는 두 가지 유형의 인덱스를 제공합니다:

1. **단일 필드 인덱스** - 기본적으로 모든 필드에 자동 생성됨
2. **복합 인덱스** - 여러 필드를 포함하는 쿼리에 필요함 (개발자가 수동으로 정의)

## 인덱스 제한사항

- 최대 200개의 복합 인덱스를 데이터베이스당 생성 가능
- 복합 인덱스는 최대 100개의 필드를 포함 가능
- 복합 인덱스는 최대 1개의 `array-contains` 또는 `array-contains-any` 연산자만 사용 가능
- 쿼리당 최대 10개의 `in` 또는 `array-contains-any` 절 사용 가능
- `!=` 및 `not-in` 연산자는 인덱스를 효율적으로 활용하지 못함

## 컬렉션별 필수 인덱스

### 1. 상품(Products) 컬렉션 인덱스

#### 1.1 기본 상품 목록 인덱스
```javascript
// 공개된 상품 목록을 최신순으로 정렬
{
  collectionGroup: 'products',
  queryScope: 'COLLECTION',
  fields: [
    { fieldPath: 'status', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}
```

#### 1.2 카테고리별 상품 필터링
```javascript
// 특정 카테고리에 속한 공개된 상품 목록
{
  collectionGroup: 'products',
  queryScope: 'COLLECTION',
  fields: [
    { fieldPath: 'status', order: 'ASCENDING' },
    { fieldPath: 'categoryIds', arrayConfig: 'CONTAINS' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}
```

#### 1.3 지역별 상품 필터링 + 날짜 범위
```javascript
// 특정 지역 및 날짜 범위 내의 공개된 상품 목록
{
  collectionGroup: 'products',
  queryScope: 'COLLECTION',
  fields: [
    { fieldPath: 'status', order: 'ASCENDING' },
    { fieldPath: 'region', order: 'ASCENDING' },
    { fieldPath: 'availableFrom', order: 'ASCENDING' }
  ]
}

{
  collectionGroup: 'products',
  queryScope: 'COLLECTION',
  fields: [
    { fieldPath: 'status', order: 'ASCENDING' },
    { fieldPath: 'region', order: 'ASCENDING' },
    { fieldPath: 'availableTo', order: 'ASCENDING' }
  ]
}
```

#### 1.4 지역별 상품 필터링 + 가격순 정렬
```javascript
// 특정 지역 상품을 성인 가격 기준 오름차순 정렬
{
  collectionGroup: 'products',
  queryScope: 'COLLECTION',
  fields: [
    { fieldPath: 'status', order: 'ASCENDING' },
    { fieldPath: 'region', order: 'ASCENDING' },
    { fieldPath: 'price.adult', order: 'ASCENDING' }
  ]
}
```

#### 1.5 타임딜 상품 필터링
```javascript
// 타임딜 상품 목록을 최신순으로 정렬
{
  collectionGroup: 'products',
  queryScope: 'COLLECTION',
  fields: [
    { fieldPath: 'status', order: 'ASCENDING' },
    { fieldPath: 'isTimeDeal', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}
```

#### 1.6 베스트셀러 상품 필터링
```javascript
// 베스트셀러 상품 목록을 최신순으로 정렬
{
  collectionGroup: 'products',
  queryScope: 'COLLECTION',
  fields: [
    { fieldPath: 'status', order: 'ASCENDING' },
    { fieldPath: 'isBestSeller', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}
```

#### 1.7 교통 및 숙박 포함 여부에 따른 필터링
```javascript
// 교통 포함 상품 목록
{
  collectionGroup: 'products',
  queryScope: 'COLLECTION',
  fields: [
    { fieldPath: 'status', order: 'ASCENDING' },
    { fieldPath: 'includesTransportation', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}

// 숙박 포함 상품 목록
{
  collectionGroup: 'products',
  queryScope: 'COLLECTION',
  fields: [
    { fieldPath: 'status', order: 'ASCENDING' },
    { fieldPath: 'includesAccommodation', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}
```

#### 1.8 태그별 상품 필터링
```javascript
// 특정 태그가 포함된 상품 목록
{
  collectionGroup: 'products',
  queryScope: 'COLLECTION',
  fields: [
    { fieldPath: 'status', order: 'ASCENDING' },
    { fieldPath: 'tags', arrayConfig: 'CONTAINS' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}
```

### 2. 리뷰(Reviews) 서브컬렉션 인덱스

#### 2.1 리뷰 정렬 (최신순)
```javascript
// 최신 리뷰순 정렬
{
  collectionGroup: 'reviews',
  queryScope: 'COLLECTION_GROUP',
  fields: [
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}
```

#### 2.2 사용자별 리뷰 조회
```javascript
// 특정 사용자가 작성한 모든 리뷰
{
  collectionGroup: 'reviews',
  queryScope: 'COLLECTION_GROUP',
  fields: [
    { fieldPath: 'userId', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}
```

### 3. 주문(Orders) 컬렉션 인덱스

#### 3.1 사용자별 주문 조회
```javascript
// 특정 사용자의 주문 목록 (최신순)
{
  collectionGroup: 'orders',
  queryScope: 'COLLECTION',
  fields: [
    { fieldPath: 'userId', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}
```

#### 3.2 상태별 주문 조회
```javascript
// 특정 상태의 주문 목록 (최신순)
{
  collectionGroup: 'orders',
  queryScope: 'COLLECTION',
  fields: [
    { fieldPath: 'status', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}
```

#### 3.3 결제 상태별 주문 조회
```javascript
// 특정 결제 상태의 주문 목록 (최신순)
{
  collectionGroup: 'orders',
  queryScope: 'COLLECTION',
  fields: [
    { fieldPath: 'paymentStatus', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}
```

### 4. 주문 항목(Order Items) 서브컬렉션 인덱스

#### 4.1 상품별 주문 항목 조회
```javascript
// 특정 상품이 포함된 모든 주문 항목
{
  collectionGroup: 'items',
  queryScope: 'COLLECTION_GROUP',
  fields: [
    { fieldPath: 'productId', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}
```

### 5. 카트 항목(Cart Items) 서브컬렉션 인덱스

특별한 복합 인덱스 필요 없음. 카트 항목은 일반적으로 단일 사용자 ID로만 쿼리함.

### 6. 카테고리(Categories) 컬렉션 인덱스

#### 6.1 정렬 순서별 카테고리 조회
```javascript
// 표시 순서대로 정렬된 활성 카테고리
{
  collectionGroup: 'categories',
  queryScope: 'COLLECTION',
  fields: [
    { fieldPath: 'isActive', order: 'ASCENDING' },
    { fieldPath: 'order', order: 'ASCENDING' }
  ]
}
```

#### 6.2 부모 카테고리별 하위 카테고리 조회
```javascript
// 특정 부모 카테고리에 속한 하위 카테고리
{
  collectionGroup: 'categories',
  queryScope: 'COLLECTION',
  fields: [
    { fieldPath: 'parentId', order: 'ASCENDING' },
    { fieldPath: 'order', order: 'ASCENDING' }
  ]
}
```

### 7. 프로모션(Promotions) 컬렉션 인덱스

#### 7.1 활성 프로모션 조회
```javascript
// 활성 상태이며 현재 날짜에 유효한 프로모션
{
  collectionGroup: 'promotions',
  queryScope: 'COLLECTION',
  fields: [
    { fieldPath: 'isActive', order: 'ASCENDING' },
    { fieldPath: 'startDate', order: 'ASCENDING' }
  ]
}

{
  collectionGroup: 'promotions',
  queryScope: 'COLLECTION',
  fields: [
    { fieldPath: 'isActive', order: 'ASCENDING' },
    { fieldPath: 'endDate', order: 'DESCENDING' }
  ]
}
```

## 인덱스 최적화 팁

1. **불필요한 인덱스 제거**
   - 실제로 사용되지 않는 쿼리에 대한 인덱스는 제거하여 스토리지 및 쓰기 성능 최적화

2. **복합 인덱스의 필드 순서**
   - 동등 연산자(`==`, `in`)를 사용하는 필드를 먼저 배치
   - 그 다음 범위 연산자(`>`, `<`, `>=`, `<=`) 필드 배치
   - 정렬을 위한 `orderBy` 필드를 마지막에 배치

3. **쿼리 패턴 단순화**
   - 너무 많은 필터 조건보다는 데이터를 적절히 비정규화하여 쿼리 단순화
   - `OR` 조건 대신 여러 쿼리 실행 후 클라이언트에서 결합 고려

4. **인덱스 모니터링**
   - Firebase 콘솔에서 누락된 인덱스를 정기적으로 확인
   - 불필요한 인덱스를 식별하고 제거

## 인덱스 배포 방법

Firebase Console 또는 Firebase CLI를 통해 인덱스를 배포할 수 있습니다.

### Firebase CLI 사용 방법

1. `firestore.indexes.json` 파일 작성:

```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "categoryIds", "arrayConfig": "CONTAINS" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    // 추가 인덱스...
  ]
}
```

2. CLI로 인덱스 배포:

```bash
firebase deploy --only firestore:indexes
```

## 인덱스 요구사항 확인

개발 과정에서 필요한 인덱스를 자동으로 확인하는 가장 좋은 방법은:

1. 쿼리를 실행하고 발생하는 인덱스 오류 메시지를 확인
2. 오류 메시지에 제안된 인덱스를 추가
3. Firebase 콘솔에서 '인덱스' 탭을 통해 필요한 인덱스 확인

```javascript
// 인덱스가 없는 쿼리 예시
try {
  const result = await db.collection('products')
    .where('status', '==', 'published')
    .where('region', '==', 'Jeju')
    .orderBy('price.adult', 'asc')
    .get();
} catch (error) {
  // 에러 메시지에 필요한 인덱스 정보가 포함됨
  console.error('Index required:', error);
}
``` 