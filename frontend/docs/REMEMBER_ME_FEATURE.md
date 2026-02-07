# Remember Me Feature Documentation

## Overview
The "Remember Me" functionality allows users to stay logged in across browser sessions. When checked, authentication tokens are stored in `localStorage` (persistent). When unchecked, tokens are stored in `sessionStorage` (session-only).

## Implementation Details

### Token Storage Strategy

#### Remember Me Checked (Default)
- Tokens are stored in `localStorage`
- User remains logged in even after closing the browser
- Tokens persist until explicitly logged out or expired

#### Remember Me Unchecked
- Tokens are stored in `sessionStorage`
- User is logged out when the browser tab/window is closed
- Provides better security for shared/public computers

### Modified Files

1. **`frontend/services/api/client.ts`**
   - Updated `tokenManager` to support both `localStorage` and `sessionStorage`
   - Added `getRememberMe()` method to retrieve the preference
   - Modified `setTokens()` to accept `rememberMe` parameter
   - Updated token refresh logic to preserve the `rememberMe` preference

2. **`frontend/services/api/auth.ts`**
   - Updated `LoginData` interface to include `rememberMe` field
   - Modified `login()` to accept and use `rememberMe` parameter
   - Updated `googleAuth()` to accept `rememberMe` parameter (defaults to `true`)
   - Modified `verifyEmailOTP()` to accept `rememberMe` parameter
   - Updated `register()` to default to `rememberMe = true`

3. **`frontend/components/Auth/Login.tsx`**
   - Added `rememberMe` state (defaults to `true`)
   - Connected checkbox to state with `checked` and `onChange` handlers
   - Passed `rememberMe` to login mutation
   - Updated Google Auth handler to pass `rememberMe` preference

4. **`frontend/hooks/useAuth.ts`**
   - Updated `useGoogleAuth` hook to accept `rememberMe` parameter

## Usage

### Standard Login
```typescript
// User checks "Remember Me" checkbox (default)
loginMutation.mutate({ email, password, rememberMe: true });
// Tokens stored in localStorage

// User unchecks "Remember Me" checkbox
loginMutation.mutate({ email, password, rememberMe: false });
// Tokens stored in sessionStorage
```

### Google Authentication
```typescript
// Google Auth defaults to rememberMe: true
googleAuthMutation.mutate({ idToken, rememberMe: true });
```

### Token Refresh
```typescript
// When tokens are refreshed, the original rememberMe preference is preserved
const rememberMe = tokenManager.getRememberMe();
tokenManager.setTokens(newAccessToken, newRefreshToken, rememberMe);
```

## Security Considerations

1. **SessionStorage Benefits**:
   - Tokens are cleared when tab/window closes
   - Better for shared computers or public access
   - Reduces risk of unauthorized access if user forgets to log out

2. **LocalStorage Benefits**:
   - Convenient for personal devices
   - User stays logged in across sessions
   - Standard behavior for most web applications

3. **Token Refresh**:
   - The preference is preserved during token refresh
   - Ensures consistent behavior throughout the session

## Testing Checklist

### Manual Testing
- [x] Login with "Remember Me" checked
  - Verify tokens are in localStorage
  - Close and reopen browser
  - Verify user is still logged in

- [x] Login with "Remember Me" unchecked
  - Verify tokens are in sessionStorage
  - Close and reopen browser tab
  - Verify user is logged out

- [x] Token Refresh
  - Login with "Remember Me" checked/unchecked
  - Wait for token to refresh (or trigger manually)
  - Verify tokens remain in the correct storage

- [x] Logout
  - Verify tokens are cleared from both storages
  - Verify rememberMe preference is cleared

## Browser Compatibility

This feature works in all modern browsers with support for:
- localStorage API (widely supported since IE 8)
- sessionStorage API (widely supported since IE 8)
- ES6+ JavaScript features

The feature is compatible with all current desktop and mobile browsers.

## Future Enhancements

1. Add visual indicator showing current storage type in developer mode
2. Add analytics to track usage patterns
3. Consider adding "Remember Me for X days" option
4. Implement token expiry warnings for persistent sessions
