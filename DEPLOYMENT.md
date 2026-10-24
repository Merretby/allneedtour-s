# Para La Grand - Beauty E-commerce

A modern e-commerce beauty website built with React, Vite, TypeScript, and Tailwind CSS.

## 🚀 Features

- 🛍️ Full shopping cart with localStorage persistence
- ❤️ Favorites/wishlist functionality
- 📦 Order tracking (Sendit-style interface)
- 🔍 Product search
- 👤 User authentication with localStorage
- 📱 Fully responsive design
- 🎨 Modern UI with Tailwind CSS and shadcn/ui components

## 🛠️ Technologies

- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Navigation
- **Lucide React** - Icons
- **Sonner** - Toast notifications

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deploy to Vercel

### Quick Deploy

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Click "Deploy"

That's it! Your site will be live in minutes.

### Manual Configuration

The project includes a `vercel.json` file with the following configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Environment Variables

No environment variables are required! The app uses localStorage for all data persistence.

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── ui/        # shadcn/ui components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ...
├── pages/         # Page components
│   ├── Index.tsx      # Homepage
│   ├── Cart.tsx       # Shopping cart
│   ├── Orders.tsx     # Order tracking
│   ├── Favorites.tsx  # Wishlist
│   ├── Profile.tsx    # User profile
│   ├── Search.tsx     # Search results
│   └── ...
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
└── App.tsx        # Main app component
```

## 🎯 Key Features

### Shopping Cart
- Add/remove products
- Update quantities
- Persistent across sessions (localStorage)
- Real-time cart count in header

### User Authentication
- Sign up / Sign in
- Profile management
- Session persistence with localStorage
- No backend required!

### Order Tracking
- Sendit-style tracking interface
- Status timeline with history
- Order details and shipping info

### Search
- Real-time product search
- Search by name, brand, or category
- Dedicated search results page

## 🎨 Customization

### Colors

Edit `src/index.css` to customize the color scheme:

```css
:root {
  --primary: #D946EF;
  --secondary: #F97316;
  --accent: #8B5CF6;
  /* ... */
}
```

### Logo

Replace `/public/logo.png` with your own logo.

## 📝 Notes

- All data is stored in localStorage (cart, favorites, users, sessions)
- No backend or database required
- Perfect for static hosting (Vercel, Netlify, GitHub Pages)
- Demo products are hardcoded for demonstration

## 🐛 Troubleshooting

### Build fails on Vercel

Make sure:
- `package.json` has correct build script
- `vercel.json` is present
- No TypeScript errors in the code

### Routes not working after deployment

The `vercel.json` includes rewrites to handle SPA routing. All routes redirect to `index.html`.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Feel free to submit issues or pull requests!

---

Built with ❤️ for Para La Grand Beauty
