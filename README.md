# BokaTrade - Plateforme B2B Afrique

**URL**: https://lovable.dev/projects/b5c8f428-3d9a-48b2-9f4a-f0274233046b

Plateforme B2B pour la vente en gros et l'import-export en Afrique de l'Ouest.

## 🚀 Optimisations de Performance Implémentées

### Images
- ✅ Lazy loading automatique (`loading="lazy"`)
- ✅ Décodage asynchrone (`decoding="async"`)
- ✅ Composant OptimizedImage avec intersection observer
- 📝 Format WebP recommandé (compression 80%)

### Mise en cache
- ✅ Assets statiques : 1 an (`public/_headers`)
- ✅ Images : 1 mois de cache
- ✅ Fonts : 1 an de cache immutable
- ✅ HTML : pas de cache pour contenu dynamique

### Code Splitting & Build
- ✅ Lazy loading des routes non-critiques (React.lazy)
- ✅ Chunks vendor séparés (React, UI, Query, Supabase)
- ✅ Minification Terser avec suppression console.log en prod
- ✅ Source maps uniquement en dev
- ✅ Preconnect aux domaines Supabase critiques

### Mobile First
- ✅ Responsive design complet
- ✅ Zones tactiles 48px minimum
- ✅ Safe area pour encoche mobile
- ✅ Menu hamburger optimisé
- ✅ BottomNav 64px avec badges

### Sécurité & SEO
- ✅ Headers de sécurité (X-Frame-Options, CSP)
- ✅ Meta tags SEO complets
- ✅ Open Graph & Twitter Cards
- ✅ Thème mobile PWA-ready

## 🌍 Recommandations Hébergement Afrique

Pour performances optimales en Afrique de l'Ouest :
1. **Cloudflare** - Datacenter Lagos (Nigeria) ⭐ Recommandé
2. **Bunny CDN** - Point de présence Johannesburg
3. **AWS CloudFront** - Région Cape Town (af-south-1)
4. **Azure CDN** - South Africa North

### Configuration Cloudflare recommandée :
- Brotli compression activé
- Auto Minify (JS, CSS, HTML)
- Rocket Loader pour JS non-critique
- Mirage pour optimisation images mobile
- Argo Smart Routing pour latence réduite

## 📊 Performance Metrics Cible
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Total Bundle Size: < 500KB (gzipped)

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b5c8f428-3d9a-48b2-9f4a-f0274233046b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b5c8f428-3d9a-48b2-9f4a-f0274233046b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
