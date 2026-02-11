# Admin Updates System Setup Guide

## Quick Start

Follow these steps to set up the admin updates system:

### 1. Create Supabase Table

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase_setup.sql`
4. Run the SQL script to create the `updates` table and set up security policies

### 2. Set Up Environment Variables

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Copy the contents from `.env.example` to `.env`
3. Fill in your values:
   - `REACT_APP_SUPABASE_URL` - Your Supabase project URL
   - `REACT_APP_SUPABASE_ANON_KEY` - Your Supabase anon/public key
   - `REACT_APP_ADMIN_PASSWORD` - Set a strong password for admin access

**Important:** The `.env` file is already in `.gitignore`, so your password won't be committed to git.

### 3. Restart Your Development Server

After creating/updating the `.env` file, restart your development server:

```bash
npm run dev
```

### 4. Access the Admin Panel

1. Navigate to: `http://localhost:3000/admin/updates` (or your dev server URL)
2. Enter the password you set in `REACT_APP_ADMIN_PASSWORD`
3. You'll be logged in for the session (stored in sessionStorage)

## Features

### Admin Panel (`/admin/updates`)

- **Create Updates**: Add new updates with title, content, category, and featured status
- **Edit Updates**: Click "Edit" on any update to modify it
- **Delete Updates**: Click "Delete" and confirm to remove an update
- **Session Management**: Login persists for the browser session

### Public Updates Page (`/updates`)

- Automatically displays all updates from the database
- Shows featured update prominently at the top
- Lists other updates in chronological order (newest first)
- Handles loading and error states gracefully

## Security Notes

1. **Password Protection**: The admin password is stored in an environment variable and checked client-side. For production, consider implementing server-side authentication.

2. **Database Security**: Row Level Security (RLS) is enabled on the `updates` table:
   - Public can read (SELECT) all updates
   - Only authenticated requests can INSERT/UPDATE/DELETE (protected by app-level password)

3. **Secret URL**: The admin route `/admin/updates` is not linked in navigation, but it's not truly "secret" - anyone who knows the URL can attempt to access it (password protects it).

## Troubleshooting

### Updates not showing on public page
- Check that the `updates` table exists in Supabase
- Verify RLS policies are set correctly
- Check browser console for errors
- Ensure Supabase credentials in `.env` are correct

### Can't access admin panel
- Verify `REACT_APP_ADMIN_PASSWORD` is set in `.env`
- Make sure you restarted the dev server after creating `.env`
- Check that the route `/admin/updates` is accessible

### Can't create/edit/delete updates
- Check Supabase RLS policies allow INSERT/UPDATE/DELETE
- Verify your Supabase anon key has proper permissions
- Check browser console for specific error messages

## Next Steps (Optional Enhancements)

- Add image upload support for updates
- Implement rich text editor for content
- Add update scheduling (publish date)
- Create email notifications when new updates are posted
- Add analytics/tracking for update views
