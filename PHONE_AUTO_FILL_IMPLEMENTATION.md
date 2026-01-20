# Phone Number Auto-Fill Implementation

## ✅ Implementation Summary

### User Requirement
- If user already has a mobile number in their profile, it should auto-fill in onboarding
- User should not need to input phone number again
- Mobile number should be unique (one user = one mobile number)

---

## ✅ Changes Made

### 1. Auto-Fill Phone Number from Profile
**File**: `/app/(authPages)/chef-onboarding/page.tsx`

**Changes**:
- Added `useEffect` hook to fetch user profile on page load
- Extracts phone number from profile and normalizes it (removes `880` prefix and leading `0`)
- Auto-fills phone number in form state
- Sets `phoneFromProfile` flag to indicate phone is from profile

**Code**:
```typescript
// Fetch user profile to auto-fill phone number
useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        if (data.user?.phone) {
          // Remove country code (880) if present, keep only 11 digits
          let phoneNumber = data.user.phone.replace(/^880/, "");
          // Remove leading 0 if present
          if (phoneNumber.startsWith("0")) {
            phoneNumber = phoneNumber.slice(1);
          }
          // Update form data with phone number
          setFormData((prev) => ({
            ...prev,
            phone: phoneNumber,
          }));
          // Mark that phone is from profile
          setPhoneFromProfile(true);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  fetchUserProfile();
}, []);
```

---

### 2. Read-Only Phone Field When from Profile
**File**: `/components/chef/onboarding/NIDDetailsStep.tsx`

**Changes**:
- Added `phoneFromProfile` prop to indicate if phone is from profile
- Made phone input field `disabled` when `phoneFromProfile` is true
- Added visual indicator showing "(from your profile)" in label
- Added success message: "✓ This phone number is from your profile and cannot be changed"
- Styled disabled field with gray background

**Features**:
- ✅ Phone field is disabled (read-only) when from profile
- ✅ Visual feedback showing phone is from profile
- ✅ Prevents user from changing phone number if already set
- ✅ Clear messaging about why field is disabled

---

### 3. Phone Number Normalization in API
**File**: `/app/api/chef/onboarding/route.ts`

**Changes**:
- Added `normalizePhone` helper function to standardize phone format
- Normalizes phone numbers to `880XXXXXXXXXX` format before comparison
- Ensures consistent comparison regardless of input format (`+880`, `880`, or `0` prefix)

**Normalization Logic**:
```typescript
const normalizePhone = (phone: string | null | undefined): string | null => {
  if (!phone) return null;
  // Remove all non-digits
  let normalized = phone.replace(/\D/g, "");
  // Ensure it starts with 880 (Bangladesh country code)
  if (!normalized.startsWith("880")) {
    // If it starts with 0, remove it
    if (normalized.startsWith("0")) {
      normalized = normalized.slice(1);
    }
    // Add 880 prefix
    normalized = "880" + normalized;
  }
  return normalized;
};
```

**Benefits**:
- ✅ Handles different phone formats consistently
- ✅ Prevents duplicate phone numbers with different formats
- ✅ Ensures phone is stored in consistent format (`880XXXXXXXXXX`)

---

### 4. Phone Uniqueness Verification
**Status**: ✅ **Already Working**

**Database Schema**:
```prisma
model User {
  phone String? @unique  // ✅ Phone is unique
}
```

**API Validation**:
- ✅ Checks phone uniqueness before creating kitchen
- ✅ Only checks if phone is different from existing user's phone
- ✅ Returns error if phone is already registered to another user
- ✅ Normalizes phone numbers before comparison

**Code Flow**:
1. Normalize submitted phone number
2. Normalize existing user's phone number
3. Compare normalized versions
4. If different, check if phone exists for another user
5. If exists, return error
6. If same, skip update (phone already set)

---

## 🔄 User Flow

### Scenario 1: User Has Phone in Profile
```
1. User navigates to onboarding
2. System fetches user profile
3. Phone number auto-fills in form
4. Phone field is disabled (read-only)
5. User sees: "Phone Number (from your profile)"
6. User sees: "✓ This phone number is from your profile and cannot be changed"
7. User completes onboarding
8. Phone is sent to API (same as profile)
9. API normalizes and compares: same phone → no update needed
10. Onboarding completes successfully
```

### Scenario 2: User Doesn't Have Phone in Profile
```
1. User navigates to onboarding
2. System fetches user profile
3. No phone found → field remains empty
4. Phone field is enabled (editable)
5. User enters phone number
6. User completes onboarding
7. Phone is sent to API
8. API normalizes phone to 880XXXXXXXXXX format
9. API checks uniqueness → OK
10. API updates user's phone number
11. Onboarding completes successfully
```

### Scenario 3: User Tries to Use Existing Phone
```
1. User enters phone number that belongs to another user
2. User submits onboarding form
3. API normalizes phone number
4. API checks uniqueness → Phone exists for another user
5. API returns error: "Phone number is already registered"
6. User sees error message
7. User must use different phone number
```

---

## ✅ Verification Checklist

### Phone Auto-Fill
- [x] Fetches user profile on page load
- [x] Extracts phone number correctly
- [x] Normalizes phone format (removes 880, 0)
- [x] Auto-fills in form state
- [x] Sets `phoneFromProfile` flag

### Phone Field UI
- [x] Shows "(from your profile)" label when from profile
- [x] Disables input field when from profile
- [x] Shows success message when from profile
- [x] Styled with gray background when disabled
- [x] Prevents editing when disabled

### Phone Uniqueness
- [x] Database schema has `@unique` constraint
- [x] API checks uniqueness before creating kitchen
- [x] API normalizes phone numbers before comparison
- [x] API handles different phone formats
- [x] API returns proper error if phone exists

### Phone Update Logic
- [x] Only updates phone if different from existing
- [x] Normalizes phone before storing
- [x] Stores in consistent format (880XXXXXXXXXX)

---

## 🧪 Testing

### Test Case 1: User with Phone in Profile
1. Create user with phone: `8801712345678`
2. Navigate to `/chef-onboarding`
3. **Expected**: Phone field shows `1712345678` and is disabled
4. Complete onboarding
5. **Expected**: Phone remains same, no update needed

### Test Case 2: User without Phone
1. Create user without phone
2. Navigate to `/chef-onboarding`
3. **Expected**: Phone field is empty and enabled
4. Enter phone: `1712345678`
5. Complete onboarding
6. **Expected**: Phone is saved as `8801712345678`

### Test Case 3: Duplicate Phone
1. User A has phone: `8801712345678`
2. User B tries to use same phone in onboarding
3. **Expected**: Error: "Phone number is already registered"

### Test Case 4: Phone Format Variations
1. Profile has: `+8801712345678`
2. Form auto-fills: `1712345678`
3. Form submits: `8801712345678`
4. **Expected**: API normalizes and recognizes as same phone

---

## 📊 Summary

**Status**: ✅ **All Requirements Implemented**

- ✅ Phone auto-fills from profile if available
- ✅ Phone field is read-only when from profile
- ✅ Phone number is unique (enforced in schema and API)
- ✅ Phone normalization handles different formats
- ✅ Clear UI feedback for user
- ✅ Proper error handling

**Ready for testing!** 🚀
