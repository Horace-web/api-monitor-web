# API Monitor — Frontend

Frontend de **API Monitor**, une plateforme full-stack de surveillance d'APIs et de services HTTP.

Le frontend permet aux utilisateurs de s'authentifier, d'accéder à leur espace de monitoring et de consulter les indicateurs fournis par l'API NestJS.

## Fonctionnalités

- Inscription avec email et mot de passe
- Connexion avec Supabase Auth
- Gestion de session
- Déconnexion
- Redirection automatique vers la connexion lorsqu'aucune session n'est active
- Dashboard de monitoring
- Statistiques des services et monitors
- Uptime et nombre de checks
- Suivi des échecs
- Temps de réponse moyen
- Tendance des checks sur les dernières 24 heures
- Bascule entre checks et temps de réponse
- Interface responsive avec navigation adaptée au mobile
- Intégration avec l'API NestJS déployée sur Render

## Stack

- **Next.js 14** — App Router
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Supabase Auth**
- **Axios**
- **Space Grotesk + Space Mono**

## Architecture

```text
Browser
   │
   ├── Supabase Auth
   │       └── Session utilisateur
   │
   └── Axios + Bearer token
           │
           ▼
     NestJS API
           │
           ▼
     PostgreSQL / Supabase
```

## Structure du projet

```text
api-monitor-web/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Connexion et inscription
│   │   ├── dashboard/           # Dashboard authentifié
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── icon.svg             # Favicon monitoring
│   │   └── providers.tsx
│   ├── components/              # Composants réutilisables
│   ├── lib/
│   │   ├── api.ts               # Client API
│   │   └── supabase.ts          # Client Supabase navigateur
│   ├── hooks/                   # Hooks personnalisés
│   └── types/                   # Types TypeScript
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
└── README.md
```

## Design system

Le frontend utilise les tokens visuels suivants :

| Rôle | Couleur |
| --- | --- |
| Ink | `#0B0F1A` |
| Electric | `#3D6FFF` |
| Volt | `#00E5A0` |
| Flare | `#FF4757` |
| Solar | `#FFB830` |

Typographie :

- **Space Grotesk** pour l'interface et le contenu
- **Space Mono** pour les endpoints, statuts et données techniques

## Variables d'environnement

Créer un fichier `.env.local` à partir de `.env.example` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_API_URL=https://api-monitor-api-7q9b.onrender.com
NODE_ENV=development
```

Les variables `NEXT_PUBLIC_` sont exposées au navigateur. Elles ne doivent contenir aucune clé secrète, mot de passe de base de données ou clé Supabase service-role.

## Installation

```bash
npm install
npm run dev
```

Application locale :

```text
http://localhost:3000
```

## Backend

Dépôt backend :

https://github.com/Horace-web/api-monitor-api

API de production :

https://api-monitor-api-7q9b.onrender.com

Documentation Swagger :

https://api-monitor-api-7q9b.onrender.com/docs

## Production

Frontend déployé sur Vercel :

https://api-monitor-web.vercel.app

Backend déployé sur Render :

https://api-monitor-api-7q9b.onrender.com

## Scripts

| Commande | Utilisation |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm start` | Serveur de production |
| `npm run lint` | Vérification ESLint |
| `npm run format` | Formatage Prettier |

## État du projet

| Fonctionnalité | État |
| --- | --- |
| Authentification Supabase | ✅ |
| Dashboard | ✅ |
| Statistiques de monitoring | ✅ |
| Uptime et checks | ✅ |
| Temps de réponse | ✅ |
| Responsive desktop/mobile | ✅ |
| Intégration API NestJS | ✅ |
| Déploiement Vercel | ✅ |

## Licence

MIT

---

**Créé par :** Horace-web  
**Projet :** API Monitor  
**Version :** 1.0.0
