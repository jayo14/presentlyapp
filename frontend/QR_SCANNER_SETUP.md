# QR Scanner Setup

## Required Dependencies

The QR code scanner in `EnhancedAttendanceScanner.tsx` requires the `jsqr` library to function.

### Installation

```bash
npm install jsqr
```

or

```bash
yarn add jsqr
```

### What it does

The `jsqr` library decodes QR codes from image data captured from the device camera. It's used to automatically detect and read QR codes containing session codes for attendance marking.

### Alternative

If you prefer a different QR scanning library, you can replace the jsQR import with:
- `@zxing/browser` - More feature-rich but larger bundle size
- `qr-scanner` - Modern, performant alternative
- `html5-qrcode` - Includes built-in UI components

Make sure to update the scanning logic in `EnhancedAttendanceScanner.tsx` accordingly if you switch libraries.
