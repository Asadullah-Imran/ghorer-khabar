# Chef Menu Management - Complete Flow Documentation

## Overview
Complete implementation of create, read, update, and delete (CRUD) menu items for chef sellers with image management.

## Architecture

### Frontend Stack
- **Framework:** Next.js 16.1.0 with Turbopack
- **State Management:** React Hooks (useState)
- **Form Library:** React Hook Form (custom implementation)
- **Styling:** Tailwind CSS

### Backend Stack
- **Runtime:** Node.js with Next.js API Routes
- **Database:** PostgreSQL via Prisma ORM
- **Authentication:** Supabase Auth (JWT)
- **File Storage:** Supabase Storage (S3-compatible)

### Database Schema

```typescript
MenuItem {
  id: UUID
  chefId: String (FK -> User.id)
  name: String
  description: String?
  category: String
  price: Float
  prepTime: Int?
  calories: Int?
  spiciness: String?
  isVegetarian: Boolean
  isAvailable: Boolean
  rating: Float?
  reviewCount: Int
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  ingredients: Ingredient[]
  images: MenuItemImage[]
  chef: User
}

MenuItemImage {
  id: UUID
  menuItemId: String (FK)
  imageUrl: String (Supabase URL)
  order: Int
  createdAt: DateTime
}

Ingredient {
  id: UUID
  menuItemId: String (FK)
  name: String
  quantity: Float
  unit: String
  cost: Float?
  createdAt: DateTime
}
```

---

## API Endpoints

### 1. GET /api/chef/menu
**Get all menu items for authenticated chef**

**Request:**
- Method: GET
- Auth: Supabase JWT (required)
- Headers: None

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "chefId": "user-id",
      "name": "Biryani",
      "description": "Fragrant rice dish",
      "category": "Rice",
      "price": 450,
      "prepTime": 30,
      "calories": 650,
      "spiciness": "Medium",
      "isVegetarian": false,
      "isAvailable": true,
      "rating": 4.5,
      "reviewCount": 42,
      "ingredients": [
        {
          "id": "ing-1",
          "name": "Basmati Rice",
          "quantity": 250,
          "unit": "gm",
          "cost": 80
        }
      ],
      "images": [
        {
          "id": "img-1",
          "imageUrl": "https://xxxx.supabase.co/...",
          "order": 0
        }
      ]
    }
  ]
}
```

**Error Responses:**
- 401: Unauthorized (not logged in)
- 403: Forbidden (not a SELLER)
- 500: Server error

---

### 2. POST /api/chef/menu
**Create a new menu item with images**

**Request:**
- Method: POST
- Auth: Supabase JWT (required)
- Content-Type: multipart/form-data

**Body (FormData):**
```
name: "Biryani"
description: "Fragrant rice dish"
category: "Rice"
price: "450"
prepTime: "30"
calories: "650"
spiciness: "Medium"
isVegetarian: "false"
ingredients: '[{"name":"Basmati Rice","quantity":"250","unit":"gm","cost":"80"}]'
images: [File, File, ...]
```

**Response:**
```json
{
  "success": true,
  "message": "Menu item created successfully",
  "data": {
    "id": "uuid-1",
    "chefId": "user-id",
    "name": "Biryani",
    ...
    "images": [
      {
        "id": "img-1",
        "imageUrl": "https://xxxx.supabase.co/storage/v1/object/public/menu-image/chef-menu/...",
        "order": 0
      }
    ],
    "ingredients": [...]
  }
}
```

**Validation:**
- ✅ Name required
- ✅ Category required
- ✅ Price > 0
- ✅ Images: max 5MB each, only JPEG/PNG/WebP/GIF
- ✅ Quantity/Cost converted from string to Float

---

### 3. PUT /api/chef/menu/[id]
**Update menu item (toggle availability or full update)**

**Request:**
- Method: PUT
- Auth: Supabase JWT (required)
- Content-Type: application/json

**Body (for availability toggle):**
```json
{
  "isAvailable": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu item updated successfully",
  "data": { ...updated item... }
}
```

---

### 4. DELETE /api/chef/menu/[id]
**Delete menu item and all its images**

**Request:**
- Method: DELETE
- Auth: Supabase JWT (required)

**Response:**
```json
{
  "success": true,
  "message": "Menu item deleted successfully"
}
```

**Cascade Behavior:**
- ✅ Deletes MenuItemImage records from database
- ✅ Deletes image files from Supabase Storage
- ✅ Deletes Ingredient records from database

---

## Frontend Flow

### File: `/src/app/(chef)/chef/menu/page.tsx`

#### 1. Component Lifecycle
```typescript
useEffect(() => {
  fetchMenuItems(); // Load on mount
}, []);
```

#### 2. Fetch Menu Items
```typescript
const fetchMenuItems = async () => {
  // GET /api/chef/menu
  // Updates state: menuItems[]
}
```

#### 3. Create/Update Flow
```typescript
const handleSave = async (formItem: MenuItem) => {
  // 1. Create FormData from dish data
  // 2. Handle image files (convert previews to File objects)
  // 3. POST to /api/chef/menu (create) or PUT to /api/chef/menu/[id] (update)
  // 4. On success: refresh list, close form, reset editing state
  // 5. On error: display error message
}
```

#### 4. Delete Flow
```typescript
const confirmDelete = async () => {
  // DELETE /api/chef/menu/[id]
  // On success: refresh list
  // On error: display error message
}
```

#### 5. Toggle Availability
```typescript
const handleToggleAvailability = async (id: string) => {
  // PUT /api/chef/menu/[id] with { isAvailable: !current }
  // On success: refresh list
}
```

### File: `/src/components/chef/Menu/MenuItemForm.tsx`

#### Form Inputs
- **Basic Info:** name, description, category, price
- **Details:** prepTime, calories, spiciness, isVegetarian
- **Images:** Multi-file upload with preview and drag-drop
- **Ingredients:** Dynamic list (add/remove) with name, quantity, unit, cost

#### Image Handling
1. User uploads image → stored as blob with preview
2. Form submits → convert blobs to File objects
3. Add to FormData → send to backend
4. Backend uploads to Supabase → get public URL
5. Store URL in MenuItemImage database table
6. Return with response

#### Validation
- Name required
- Category required
- Price > 0
- Shows error messages if validation fails

---

## Backend Flow

### File: `/src/app/api/chef/menu/route.ts`

#### Authorization Check
```typescript
1. Get Supabase user from JWT
2. Find user in database
3. Check if role === "SELLER"
4. Return 403 if not seller
```

#### POST Handler
```typescript
1. Validate input (name, category, price)
2. Upload images to Supabase:
   - Generate unique filename
   - Upload to bucket: menu-image/chef-menu/
   - Get public URL
3. Create MenuItem with nested relations:
   - Ingredients (parseFloat for quantity/cost)
   - MenuItemImage records with order
4. Return created item with all relations
```

#### Image Upload Details
```typescript
Service: imageService.uploadImage(file, "chef-menu")

Returns:
{
  success: true,
  url: "https://xxxx.supabase.co/storage/v1/object/public/menu-image/chef-menu/1704629000000-abc123.png"
}

Validation:
- File type: JPEG, PNG, WebP, GIF only
- File size: max 5MB
- Filename: timestamp-random.ext (collision-resistant)
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  User (SELLER Role)                     │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
    ┌─────────────┐
    │ Menu Page   │ ← React component with form state
    │             │
    │ - menuItems │
    │ - isFormOpen│
    │ - editing   │
    └────┬────────┘
         │
         ▼
    ┌──────────────────┐
    │ MenuItemForm     │ ← Modal form with image upload
    │                  │
    │ - Collect data   │
    │ - Upload images  │ ──┐
    │ - Format inputs  │   │
    └────┬─────────────┘   │
         │                 │
         ▼                 │
    ┌────────────────┐     │
    │ FormData       │     │
    │                │     │
    │ - name         │     │
    │ - category     │     │
    │ - price        │     │ File preview
    │ - images: File │ ◄───┘
    │ - ingredients  │
    └────┬───────────┘
         │
         ▼ POST /api/chef/menu
    ┌─────────────────────────────────────────┐
    │     Next.js API Route                   │
    │                                          │
    │ 1. Auth: Supabase JWT + SELLER check   │
    │ 2. Parse FormData                       │
    │ 3. Validate inputs                      │
    │ 4. Upload images to Supabase ──────┐    │
    └─────────────────────────────────────┼───┘
                                          │
                                          ▼
                            ┌──────────────────────────┐
                            │ Supabase Storage         │
                            │                          │
                            │ menu-image/              │
                            │   chef-menu/             │
                            │     timestamp-id.jpg     │
                            │                          │
                            │ Returns public URL       │
                            └──────────────────────────┘
         │ (URL + metadata)
         ▼
    ┌──────────────────────────┐
    │ Prisma.menuItem.create() │
    │                           │
    │ - MenuItem record         │
    │ - Ingredient records      │
    │ - MenuItemImage records   │
    └────┬─────────────────────┘
         │
         ▼
    ┌──────────────────┐
    │ PostgreSQL DB    │
    │                  │
    │ ✅ Stored        │
    └────┬─────────────┘
         │
         ▼ Response
    ┌──────────────────────────────┐
    │ { success, data, message }   │
    │                              │
    │ data includes:               │
    │ - id, name, category, price  │
    │ - images with Supabase URLs  │
    │ - ingredients with IDs       │
    └────┬───────────────────────┘
         │
         ▼
    ┌────────────────┐
    │ Menu Page      │
    │ - Call GET     │ ← Refresh menu list
    │ - Update state │
    │ - Close form   │
    └────────────────┘
```

---

## Data Entry Complete Example

### Input: Create Biryani Dish

**Frontend Form Data:**
```
Name: "Biryani"
Description: "Fragrant rice cooked with meat and spices"
Category: "Rice"
Price: 450
PrepTime: 30
Calories: 650
Spiciness: "Medium"
IsVegetarian: false
Images: [user_photo1.jpg, user_photo2.jpg]
Ingredients: [
  { name: "Basmati Rice", quantity: "250", unit: "gm", cost: "80" },
  { name: "Mutton", quantity: "300", unit: "gm", cost: "200" }
]
```

### Processing:

1. **Image Upload to Supabase**
   ```
   user_photo1.jpg → 1704629000000-abc123.jpg
   user_photo2.jpg → 1704629000001-def456.jpg
   
   URLs:
   https://xxxx.supabase.co/.../1704629000000-abc123.jpg
   https://xxxx.supabase.co/.../1704629000001-def456.jpg
   ```

2. **Type Conversion**
   ```
   price: "450" → 450 (Float)
   prepTime: "30" → 30 (Int)
   calories: "650" → 650 (Int)
   quantity: "250" → 250 (Float)
   cost: "80" → 80 (Float)
   ```

3. **Database Creation**
   ```sql
   INSERT INTO menu_items (
     id, chef_id, name, description, category, price, 
     prep_time, calories, spiciness, is_vegetarian, created_at, updated_at
   ) VALUES (
     'uuid-1', 'chef-id', 'Biryani', '...', 'Rice', 450,
     30, 650, 'Medium', false, now(), now()
   );
   
   INSERT INTO ingredients (id, menu_item_id, name, quantity, unit, cost)
   VALUES
     ('ing-1', 'uuid-1', 'Basmati Rice', 250, 'gm', 80),
     ('ing-2', 'uuid-1', 'Mutton', 300, 'gm', 200);
   
   INSERT INTO menu_item_images (id, menu_item_id, image_url, order, created_at)
   VALUES
     ('img-1', 'uuid-1', 'https://.../1704629000000-abc123.jpg', 0, now()),
     ('img-2', 'uuid-1', 'https://.../1704629000001-def456.jpg', 1, now());
   ```

4. **Response to Frontend**
   ```json
   {
     "success": true,
     "data": {
       "id": "uuid-1",
       "chefId": "chef-id",
       "name": "Biryani",
       "price": 450,
       "ingredients": [
         { "id": "ing-1", "name": "Basmati Rice", "quantity": 250, "unit": "gm", "cost": 80 },
         { "id": "ing-2", "name": "Mutton", "quantity": 300, "unit": "gm", "cost": 200 }
       ],
       "images": [
         { "id": "img-1", "imageUrl": "https://.../1704629000000-abc123.jpg", "order": 0 },
         { "id": "img-2", "imageUrl": "https://.../1704629000001-def456.jpg", "order": 1 }
       ]
     }
   }
   ```

5. **Frontend Updates UI**
   - Closes form modal
   - Refreshes menu list
   - Displays new dish in grid with images and details

---

## Error Handling

### Frontend
- Try-catch around fetch calls
- Display error messages in UI
- Prevent form submission if validation fails
- Show loading states during API calls

### Backend
- Role-based access control (403)
- Authentication checks (401)
- Input validation (400)
- Image upload validation (type, size)
- Type conversion with fallbacks
- Comprehensive error logging

---

## Testing Checklist

- [ ] Login as SELLER user
- [ ] Navigate to /chef/menu
- [ ] Click "+ Add New Item"
- [ ] Fill form with all required fields
- [ ] Upload 1-2 images
- [ ] Add 2-3 ingredients
- [ ] Click "Add Menu Item"
- [ ] Verify success message
- [ ] Check menu list updated with new dish
- [ ] Verify images display correctly
- [ ] Check database for all records created
- [ ] Test edit functionality
- [ ] Test delete functionality
- [ ] Test availability toggle

---

## Security Notes

✅ **Implemented:**
- Supabase JWT authentication required for all endpoints
- SELLER role verification on backend
- User ownership check (chefId === user.id)
- File type validation (images only)
- File size limits (5MB max)
- SQL injection protected (Prisma ORM)

⚠️ **In Production:**
- Enable HTTPS only
- Set Supabase Row Level Security (RLS) policies
- Validate all inputs server-side
- Rate limit API endpoints
- Log all modifications for audit trail
- Regular backups of PostgreSQL database
