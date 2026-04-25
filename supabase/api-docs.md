# Atelier Launch — API Documentation

## Base URL
```
https://your-project-id.supabase.co/functions/v1
```

## Authentication
Most endpoints require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

Public endpoints (no auth required):
- `GET /collections`
- `GET /collections/:id`
- `GET /designers`
- `GET /designers/:id`

---

## Auth

### POST /auth-signup
Create a new user account.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass1",
  "full_name": "Jane Doe",
  "user_type": "student",
  "school_name": "Parsons School of Design",
  "graduation_year": 2025,
  "specialization": "womenswear"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "Jane Doe",
    "user_type": "student"
  },
  "message": "Account created successfully"
}
```

**Validation:**
- Password: 8+ chars, 1 uppercase, 1 lowercase, 1 number
- `user_type`: `buyer`, `student`, or `pro_designer`
- Designers must provide `school_name` and `graduation_year`
- `specialization`: `womenswear`, `menswear`, `accessories`, `streetwear`, `avant_garde`, `sustainable`, `other`

---

### POST /auth-login
Authenticate and get session token.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass1"
}
```

**Response (200):**
```json
{
  "user": { "id": "uuid", "email": "...", "full_name": "...", "user_type": "...", "designer_profiles": [...] },
  "session": {
    "access_token": "eyJ...",
    "refresh_token": "...",
    "expires_in": 3600,
    "token_type": "bearer"
  }
}
```

---

## Collections

### GET /collections
List collections with filtering and sorting.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | `live`, `draft`, `ended` |
| `designer_id` | uuid | Filter by designer |
| `sort` | string | `recent` (default), `ending_soon` |
| `limit` | integer | Default: 20 |
| `offset` | integer | Default: 0 |

**Response (200):**
```json
{
  "collections": [
    {
      "id": "uuid",
      "title": "Metamorphosis SS25",
      "description": "...",
      "drop_start_date": "2025-01-15T18:00:00Z",
      "drop_end_date": "2025-01-18T18:00:00Z",
      "status": "live",
      "designer": { "id": "uuid", "full_name": "Elena Rivers", ... },
      "products": [{ "count": 3 }]
    }
  ],
  "total": 10
}
```

### GET /collections/:id
Get collection with full details including products and designer profile.

**Response (200):** Collection object with nested `products`, `designer`, `designer_profiles`, `follower_count`.

### POST /collections 🔒
Create a new collection. (Designer only)

**Body:**
```json
{
  "title": "My Collection",
  "description": "Collection description",
  "drop_start_date": "2025-02-01T18:00:00Z",
  "drop_end_date": "2025-02-04T18:00:00Z"
}
```
**Validation:** Drop window must be between 1 and 72 hours.

### PUT /collections/:id 🔒
Update a collection. (Designer, own collection only)

### DELETE /collections/:id 🔒
Delete a collection and all its products. (Designer, own collection only)

---

## Products

### POST /products 🔒
Create a product in a collection. (Designer only)

**Body:**
```json
{
  "collection_id": "uuid",
  "name": "Chrysalis Wrap Dress",
  "description": "Flowing silk wrap dress...",
  "price": 285.00,
  "quantity_available": 8,
  "sizes_available": ["XS", "S", "M", "L"],
  "primary_image_url": "https://...",
  "gallery_images": ["https://..."],
  "materials_used": "100% Mulberry Silk",
  "care_instructions": "Dry clean only"
}
```

### PUT /products/:id 🔒
Update a product. (Designer, own product only)

**Note:** `status` is managed automatically by triggers based on `quantity_available`.

---

## Designers

### GET /designers
List verified designers.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `school_name` | string | Partial match search |
| `specialization` | string | Exact match |
| `limit` | integer | Default: 20 |
| `offset` | integer | Default: 0 |

### GET /designers/:id
Get full designer profile with portfolio, collections, and follower count.

---

## Follows

### POST /follows 🔒
Follow a designer.

**Body:**
```json
{ "designer_id": "uuid" }
```

### DELETE /follows/:designer_id 🔒
Unfollow a designer.

---

## Cart

### GET /cart 🔒
Get cart items with product details and availability check.

### POST /cart 🔒
Add item to cart (upserts if same product + size exists).

**Body:**
```json
{
  "product_id": "uuid",
  "quantity": 1,
  "selected_size": "M"
}
```
**Validation:** Checks product availability, stock, and valid size.

### PUT /cart/:item_id 🔒
Update cart item quantity.

### DELETE /cart/:item_id 🔒
Remove item from cart.

---

## Checkout

### POST /checkout 🔒
Create a Stripe Checkout Session.

**Body:**
```json
{
  "cart_item_ids": ["uuid1", "uuid2"],
  "shipping_address": {
    "street": "123 Fashion Ave",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US"
  }
}
```

**Response (200):**
```json
{
  "session_id": "cs_test_...",
  "session_url": "https://checkout.stripe.com/..."
}
```

**Commission calculation:**
- Student designers: 15% platform fee
- Pro designers: 10% platform fee

---

## Stripe Webhook

### POST /stripe-webhook
Handles `checkout.session.completed` events.

**Actions:**
1. Creates order records with status `paid`
2. Decrements product inventory (trigger)
3. Clears purchased cart items
4. Sends confirmation emails to buyer and designer

**Note:** Deploy with `--no-verify-jwt`.

---

## Orders

### GET /orders 🔒
Get orders. Response varies by user type:
- **Buyers:** See their purchases with designer info
- **Designers:** See orders for their products with buyer info

### PUT /orders/:id/status 🔒
Update order status. (Designer only)

**Body:**
```json
{ "status": "shipped" }
```
**Allowed values:** `shipped`, `delivered`

**Side effects:** Sends notification email to buyer.

---

## Analytics

### GET /analytics 🔒
Get designer dashboard analytics. (Designer only)

**Response (200):**
```json
{
  "analytics": {
    "total_revenue": 1250.00,
    "total_orders": 8,
    "products_sold": 12,
    "active_collections": 2,
    "followers_count": 45
  },
  "recent_orders": [...],
  "top_products": [...]
}
```

---

## File Uploads

### POST /upload/profile-image 🔒
Upload profile image. Max 5MB. JPEG, PNG, WebP.

**Body:** `FormData` with `file` field.

### POST /upload/portfolio-images 🔒
Upload up to 5 portfolio images. Max 10MB each. (Designer only)

**Body:** `FormData` with `files` field (multiple).

### POST /upload/product-images 🔒
Upload product images. Max 10MB each. (Designer only)

**Body:** `FormData` with `files` (multiple), `collection_id`, optional `product_id`.

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Human-readable error message"
}
```

Common HTTP status codes:
| Code | Meaning |
|------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 405 | Method not allowed |
| 409 | Conflict (duplicate resource) |
| 500 | Internal server error |

---

## Real-time Subscriptions

Use the Supabase JS client to subscribe to real-time changes:

```typescript
import { realtime } from "@/lib/api";

// Subscribe to collection updates (countdown timer)
const channel = realtime.subscribeToCollection(collectionId, (payload) => {
  console.log("Collection updated:", payload);
});

// Subscribe to product inventory changes
realtime.subscribeToProduct(productId, (payload) => {
  console.log("Product updated:", payload);
});

// Subscribe to order status changes
realtime.subscribeToOrders(buyerId, (payload) => {
  console.log("Order updated:", payload);
});

// Cleanup
realtime.unsubscribe(channel);
```
