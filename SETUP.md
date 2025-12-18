# Setup Instructions

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit .env.local and add your Azure credentials (optional for dev)
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in your mobile browser:**
   - Go to `http://localhost:3000`
   - Or use your local IP: `http://192.168.x.x:3000`

## Azure Storage Setup (Optional)

If you want to store photos in Azure instead of using placeholders:

1. **Create Azure Storage Account:**
   - Go to [Azure Portal](https://portal.azure.com)
   - Create a new Storage Account
   - Create a container named `drink-proofs`
   - Set the container to "Blob" access level

2. **Get Connection String:**
   - Go to Storage Account → Access Keys
   - Copy "Connection string"
   - Add it to `.env.local`:
     ```
     AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
     ```

3. **Configure CORS (if needed):**
   - Go to Storage Account → Resource sharing (CORS)
   - Add allowed origins, methods, and headers

## Customizing Users

Edit `types/index.ts` and update the `HARDCODED_USERS` array with your friends' names.

## Adding Photos

### House Photo:
1. Add your house photo to `public/house.jpg`
2. Update `app/page.tsx` to use the image:
   ```tsx
   <img src="/house.jpg" alt="The House" />
   ```

### User Avatars:
1. Create folder: `public/avatars/`
2. Add photos: `bruno.jpg`, `joao.jpg`, etc.
3. Photos will be automatically used based on the names in `types/index.ts`

## Testing on Mobile

### Same WiFi Network:
1. Find your computer's local IP:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` or `ip addr`
2. On your phone, go to: `http://YOUR_IP:3000`

### Using ngrok (for remote testing):
```bash
npx ngrok http 3000
```

## Deployment

### Vercel (Recommended):
```bash
npm install -g vercel
vercel
```

### Other platforms:
- The app works on any platform that supports Next.js
- Make sure to set environment variables in your hosting platform
- Consider using a real database for production

## Troubleshooting

### Photos not uploading:
- Check Azure credentials in `.env.local`
- Verify CORS settings in Azure
- Check browser console for errors

### Login not working:
- Make sure `NEXTAUTH_SECRET` is set
- Clear browser cookies
- Check console for errors

### Camera not working:
- Mobile browsers need HTTPS for camera access (except localhost)
- Use ngrok or deploy to a hosting service for HTTPS

### Leaderboard not updating:
- Refresh the page manually
- Check browser console for API errors
- Verify the app is running correctly

## Production Considerations

Before deploying to production:

1. **Use a real database** instead of in-memory storage
2. **Add authentication security** (passwords, JWT, etc.)
3. **Implement rate limiting** for uploads
4. **Add image compression** to reduce storage costs
5. **Use WebSockets** for real-time updates
6. **Add error tracking** (Sentry, etc.)
7. **Implement backup system** for photos and data
8. **Add user permissions** and moderation
9. **Set up monitoring** and alerts
10. **Create proper CI/CD pipeline**

