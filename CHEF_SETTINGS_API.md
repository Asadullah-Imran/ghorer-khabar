# Chef Settings API Documentation

## Overview
This document describes the APIs for managing chef settings including kitchen information, operating hours, and account deletion.

## Endpoints

### 1. GET /api/chef/settings
Fetch chef's kitchen settings and profile information.

**Authentication Required:** Yes (Seller role)

**Response:**
```json
{
  "success": true,
  "data": {
    "kitchenId": "ck...",
    "kitchenName": "Rahim's Curry House",
    "address": "House 42, Road 7, Dhanmondi, Dhaka - 1209",
    "ownerName": "Rahim Ahmed",
    "phoneNumber": "+880 1712-345678",
    "operatingDays": {
      "MONDAY": {
        "isOpen": true,
        "openTime": "10:00",
        "closeTime": "22:00"
      },
      "TUESDAY": {
        "isOpen": true,
        "openTime": "10:00",
        "closeTime": "22:00"
      },
      // ... other days
    },
    "nidNumber": "****-****-4321",
    "isVerified": true
  }
}
```

**Notes:**
- NID number is masked showing only last 4 digits for security
- Owner name and phone number are read-only (from User table)
- Address is combined from kitchen.location and kitchen.area

---

### 2. PUT /api/chef/settings
Update chef's kitchen settings.

**Authentication Required:** Yes (Seller role)

**Request Body:**
```json
{
  "kitchenName": "New Kitchen Name",
  "address": "New complete address",
  "operatingDays": {
    "MONDAY": {
      "isOpen": true,
      "openTime": "09:00",
      "closeTime": "23:00"
    },
    // ... other days (optional)
  }
}
```

**Validation:**
- `kitchenName`: Required, non-empty string
- `address`: Required, non-empty string
- `operatingDays`: Optional object with day keys and time values

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "kitchenId": "ck...",
    "kitchenName": "New Kitchen Name",
    "address": "New complete address",
    "operatingDays": { /* updated operating days */ }
  }
}
```

**Address Parsing:**
The address is split by comma:
- First part becomes `location`
- Remaining parts become `area`
- Example: "House 42, Road 7, Dhanmondi" → location: "House 42", area: "Road 7, Dhanmondi"

---

### 3. DELETE /api/chef/delete-account
Permanently delete chef account and all related data.

**Authentication Required:** Yes (Seller role)

**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Account and all related data have been permanently deleted"
}
```

**What Gets Deleted:**
1. All ingredients for chef's menu items
2. All menu item images for chef's menu items
3. All order items related to chef's menu items
4. All menu items belonging to chef
5. All subscription plans for the kitchen
6. All inventory items for the chef
7. Kitchen gallery images
8. All orders related to the kitchen
9. Kitchen profile
10. User addresses
11. Email OTPs
12. User account

**Important Notes:**
- This operation is **irreversible**
- All data is deleted in a single transaction (atomic operation)
- User is automatically logged out after deletion
- Authentication cookies are cleared
- Supabase session is terminated

---

## Security Features

1. **Authentication:**
   - Supports both Supabase auth and JWT tokens
   - Validates user role (must be SELLER)
   - Ensures user owns the kitchen they're modifying

2. **Data Protection:**
   - NID numbers are masked in responses
   - Owner name and phone are read-only
   - Cascading deletes ensure data integrity

3. **Validation:**
   - Non-null constraints on kitchen name and address
   - Operating days structure validation
   - Proper error messages for invalid input

---

## Error Responses

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "error": "Only sellers can access chef settings"
}
```

**404 Not Found:**
```json
{
  "error": "Kitchen not found. Please complete onboarding first."
}
```

**400 Bad Request:**
```json
{
  "error": "Kitchen name is required and cannot be empty"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch settings",
  "details": "Error message"
}
```

---

## Frontend Integration

The settings page ([chef/settings/page.tsx](../../../src/app/(chef)/chef/settings/page.tsx)) implements:

1. **Data Fetching:**
   - Loads settings on component mount
   - Displays loading state
   - Shows errors and success messages

2. **Form Management:**
   - Kitchen name and address editing
   - Operating hours toggle and time selection
   - Disabled fields for read-only data

3. **User Confirmations:**
   - Double confirmation for account deletion
   - Clear warning messages about data loss

4. **State Management:**
   - Loading states for async operations
   - Error and success message display
   - Proper form validation

---

## Database Schema Changes

No schema changes required. The implementation uses existing fields:
- `Kitchen.name`: Kitchen name
- `Kitchen.location`: Primary address
- `Kitchen.area`: Secondary address component
- `Kitchen.operatingDays`: JSON field for hours
- `Kitchen.nidName`: NID number (masked in responses)
- `Kitchen.isVerified`: Verification status
- `User.name`: Owner name (read-only)
- `User.phone`: Phone number (read-only)

---

## Removed Features

Trade License/TIN field has been removed from the UI and API responses as it's only applicable to business entities, not individual home chefs.
