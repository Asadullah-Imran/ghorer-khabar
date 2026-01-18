# Toast Notification System

## Overview

A custom toast notification system to replace browser alerts with professional, styled notifications.

## Components Created

1. **Toast.tsx** - Individual toast notification component
2. **ToastContext.tsx** - Context provider and `useToast` hook
3. **globals.css** - Added slide-in animation

## Usage

### Basic Usage

```typescript
"use client";

import { useToast } from "@/contexts/ToastContext";

export default function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success("Success!", "Your action completed successfully");
  };

  const handleError = () => {
    toast.error("Error!", "Something went wrong");
  };

  const handleWarning = () => {
    toast.warning("Warning!", "Please review your input");
  };

  const handleInfo = () => {
    toast.info("Info", "Did you know?");
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

### Methods

#### 1. `toast.success(title, message?, duration?)`
Shows a green success notification with checkmark icon.

```typescript
toast.success("Saved!", "Your changes have been saved");
toast.success("Done!"); // Without message
toast.success("Uploaded!", "File uploaded successfully", 3000); // Custom duration
```

#### 2. `toast.error(title, message?, duration?)`
Shows a red error notification with X icon.

```typescript
toast.error("Failed!", "Could not save changes");
toast.error("Error!"); // Without message
toast.error("Upload failed!", "File too large", 7000); // Longer duration
```

#### 3. `toast.warning(title, message?, duration?)`
Shows a yellow warning notification with alert icon.

```typescript
toast.warning("Warning!", "This action cannot be undone");
toast.warning("Caution!");
```

#### 4. `toast.info(title, message?, duration?)`
Shows a blue info notification with info icon.

```typescript
toast.info("Tip", "You can save time by using keyboard shortcuts");
toast.info("Notice");
```

#### 5. `toast.showToast(type, title, message?, duration?)`
Generic method for custom usage.

```typescript
toast.showToast("success", "Custom", "Custom notification", 4000);
```

## Toast Types

| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| `success` | Green | ✓ CheckCircle | Successful operations, confirmations |
| `error` | Red | ✗ XCircle | Failed operations, errors |
| `warning` | Yellow | ⚠ AlertCircle | Warnings, cautions |
| `info` | Blue | ℹ Info | Information, tips, notices |

## Default Settings

- **Duration**: 5000ms (5 seconds)
- **Position**: Top-right corner
- **Animation**: Slide in from right
- **Auto-dismiss**: Yes (can be closed manually with X button)

## Replacing Browser Alerts

### Before (Browser Alert)
```typescript
// ❌ Old way
alert("Changes saved!");
```

### After (Toast Notification)
```typescript
// ✅ New way
toast.success("Saved!", "Your changes have been saved");
```

## Examples by Use Case

### Form Submission
```typescript
const handleSubmit = async () => {
  try {
    await submitForm();
    toast.success("Form submitted!", "We'll get back to you soon");
  } catch (error) {
    toast.error("Submission failed", "Please try again");
  }
};
```

### Delete Confirmation
```typescript
const handleDelete = async () => {
  toast.warning("Deleting...", "This action cannot be undone");
  try {
    await deleteItem();
    toast.success("Deleted!", "Item removed successfully");
  } catch (error) {
    toast.error("Delete failed", "Could not delete item");
  }
};
```

### File Upload
```typescript
const handleUpload = async (file: File) => {
  toast.info("Uploading...", "Please wait");
  try {
    await uploadFile(file);
    toast.success("Uploaded!", `${file.name} uploaded successfully`);
  } catch (error) {
    toast.error("Upload failed", "File too large or network error");
  }
};
```

### Login/Auth
```typescript
const handleLogin = async () => {
  try {
    await login();
    toast.success("Welcome back!", "You're now logged in");
  } catch (error) {
    toast.error("Login failed", "Invalid credentials");
  }
};
```

### Kitchen Status Toggle
```typescript
const handleStatusChange = async (status: boolean) => {
  try {
    await updateKitchenStatus(status);
    if (status) {
      toast.success("Kitchen opened!", "Now accepting orders");
    } else {
      toast.info("Kitchen closed", "Not accepting new orders");
    }
  } catch (error) {
    toast.error("Update failed", "Could not change status");
  }
};
```

## Advanced Usage

### Custom Duration
```typescript
// Show for 10 seconds
toast.success("Important!", "Read this carefully", 10000);

// Show for 2 seconds
toast.info("Quick tip", "Hover to see more", 2000);
```

### Without Message (Title Only)
```typescript
toast.success("Saved!");
toast.error("Failed!");
toast.warning("Caution!");
toast.info("Info");
```

### Multiple Toasts
Toasts stack automatically:
```typescript
toast.success("Item 1 saved!");
toast.success("Item 2 saved!");
toast.success("Item 3 saved!");
// All three will appear stacked
```

## Styling

Toast notifications are styled with:
- **Responsive**: Adapts to mobile (min-width: 320px, max-width: full on mobile)
- **Animated**: Slides in from right
- **Auto-dismiss**: Fades out after duration
- **Dismissible**: Manual close with X button
- **Accessible**: Proper ARIA attributes

## Browser Compatibility

Works in all modern browsers:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Performance

- Lightweight (~2KB)
- No external dependencies (uses Lucide icons already in project)
- Minimal re-renders with React Context
- Auto-cleanup on unmount
