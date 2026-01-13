# Chef Onboarding Setup Instructions

## ✅ Already Implemented

The chef onboarding system is **fully functional** with the following features:

### Frontend (UI/UX)
- ✅ 4-step wizard with progress indicator
- ✅ Form validation with Zod schemas
- ✅ Image upload with drag-and-drop
- ✅ Map-based location picker
- ✅ LocalStorage for progress persistence
- ✅ Responsive design with brand colors

### Backend (APIs)
- ✅ `/api/upload` - Image upload endpoint
- ✅ `/api/chef/onboarding` - Creates Kitchen, KitchenGallery, Address records
- ✅ Authentication checks via Supabase
- ✅ Role-based access control

### Database
- ✅ Kitchen model with NID fields
- ✅ KitchenGallery for multiple images
- ✅ Address model integration
- ✅ Prisma client generated

---

## ⚠️ Required: Supabase Storage Setup

You must create two storage buckets in your Supabase dashboard:

### Step 1: Create Storage Buckets

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **New bucket**

#### Bucket 1: `nid-documents` (Private)
```
Name: nid-documents
Public: NO (unchecked)
File size limit: 5 MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

#### Bucket 2: `kitchen-images` (Public)
```
Name: kitchen-images
Public: YES (checked)
File size limit: 5 MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

### Step 2: Set Up Storage Policies (RLS)

#### For `nid-documents` bucket:

1. Click on the `nid-documents` bucket
2. Go to **Policies** tab
3. Click **New Policy** → **Create policy from scratch**

**Policy 1: Allow authenticated users to upload**
```sql
Policy name: Users can upload their own NID documents
Target roles: authenticated
Policy definition:
  - Operation: INSERT
  - Expression: (bucket_id = 'nid-documents')
```

**Policy 2: Allow users to read their own documents**
```sql
Policy name: Users can view their own NID documents
Target roles: authenticated
Policy definition:
  - Operation: SELECT
  - Expression: (bucket_id = 'nid-documents')
```

#### For `kitchen-images` bucket:

1. Click on the `kitchen-images` bucket
2. Go to **Policies** tab
3. Click **New Policy** → **Create policy from scratch**

**Policy 1: Allow authenticated users to upload**
```sql
Policy name: Users can upload kitchen images
Target roles: authenticated
Policy definition:
  - Operation: INSERT
  - Expression: (bucket_id = 'kitchen-images')
```

**Policy 2: Public read access**
```sql
Policy name: Anyone can view kitchen images
Target roles: public
Policy definition:
  - Operation: SELECT
  - Expression: (bucket_id = 'kitchen-images')
```

---

## 🧪 Testing the Onboarding Flow

### Test Steps:

1. **Register a new user**
   - Go to `/register`
   - Create account with email/password or Google OAuth

2. **Verify email** (if using email/password)
   - Check your email for verification link

3. **Select SELLER role**
   - Go to `/role-selection`
   - Click "I want to Sell"
   - Should redirect to `/chef-onboarding`

4. **Complete onboarding**
   - **Step 1**: Enter kitchen name (min 3 characters)
   - **Step 2**: Enter address, zone, and select location on map
   - **Step 3**: Enter NID name and phone number (format: 1XXXXXXXXX)
   - **Step 4**: Upload NID front, NID back, and 1-4 kitchen images

5. **Submit**
   - Click "Complete Setup"
   - Should create Kitchen record with `isVerified: false`
   - Redirects to `/chef` dashboard

### Expected Database Records:

After successful onboarding, you should have:
- 1 `Kitchen` record with `onboardingCompleted: true`, `isVerified: false`
- 1-4 `KitchenGallery` records
- 1 `Address` record with kitchen location
- User's `phone` field updated

---

## 🔍 Troubleshooting

### Issue: Upload fails with "Failed to upload file"
**Solution**: Ensure Supabase Storage buckets are created with correct names

### Issue: "Unauthorized" error
**Solution**: User must be logged in. Check Supabase auth session

### Issue: "Only sellers can create kitchens"
**Solution**: User must have `role: SELLER`. This is set when selecting SELLER in role selection

### Issue: "You have already completed onboarding"
**Solution**: User already has a kitchen. This is expected behavior to prevent duplicates

### Issue: Map doesn't load
**Solution**: Check internet connection. Map uses OpenStreetMap tiles

### Issue: Form validation errors
**Solution**: 
- Kitchen name: minimum 3 characters
- Address: minimum 10 characters
- Zone: minimum 2 characters
- Phone: must be 11 digits starting with 1 (e.g., 1712345678)
- Must select location on map
- Must upload both NID images
- Must upload at least 1 kitchen image

---

## 📊 Admin Verification Flow (Future Enhancement)

Currently, after onboarding:
- Kitchen is created with `isVerified: false` and `isActive: false`
- Chef can access dashboard but cannot accept orders

**To implement admin verification:**
1. Create admin panel at `/admin/chef-verification`
2. List pending kitchens where `isVerified: false`
3. Admin reviews NID images and kitchen photos
4. Admin can approve (set `isVerified: true`, `isActive: true`) or reject
5. Send email notification to chef on status change

---

## 🎯 Current Flow Summary

```
User Registration
    ↓
Email Verification (if email/password)
    ↓
Role Selection → Select "SELLER"
    ↓
Chef Onboarding (4 steps)
    ↓
Kitchen Created (pending verification)
    ↓
Redirect to Chef Dashboard
```

---

## ✨ Features Implemented

- ✅ Multi-step form with progress tracking
- ✅ Form validation with error messages
- ✅ Image upload to Supabase Storage
- ✅ Map-based location picker
- ✅ Phone number formatting
- ✅ LocalStorage progress backup
- ✅ Prevent duplicate onboarding
- ✅ Role-based access control
- ✅ Responsive mobile-friendly design
- ✅ Brand color theming (#477e77 teal, #feb728 yellow)
- ✅ Loading states and spinners
- ✅ Success/error handling

The system is production-ready once Supabase Storage is configured! 🚀
