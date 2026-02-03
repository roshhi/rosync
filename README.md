# Rosync - Personal Cloud Storage

<div align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Cloudinary-Storage-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary">
</div>

<br/>

A modern, secure file management platform that allows users to upload, organize, and share files with enterprise-grade security and a beautiful user interface.

---

## Features

- **File Upload** - Upload files up to 50MB with real-time progress tracking
- **Folder Management** - Create, rename, and delete folders with nested structure support
- **Secure Sharing** - Generate expirable share links (1, 7, or 30 days)
- **Authentication** - Secure JWT-based authentication with HTTP-only cookies
- **Storage Tracking** - Real-time storage usage monitoring
- **Modern UI** - Beautiful dark theme with smooth Framer Motion animations

---

## UI Screenshots

<img width="1920" height="1243" alt="Screenshot 2026-02-03 at 6 49 49 AM" src="https://github.com/user-attachments/assets/20589a1b-c47e-4fc8-a98c-98e33a1ed066" />

<img width="1920" height="1243" alt="Screenshot 2026-02-03 at 6 54 02 AM" src="https://github.com/user-attachments/assets/2c441101-47d5-433a-938a-e45ef7516dd7" />

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS 4 | Styling |
| Framer Motion | Animations |
| React Router | Navigation |
| Axios | HTTP Client |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | Server Framework |
| Prisma ORM | Database Access |
| PostgreSQL | Database |
| Cloudinary | File Storage |
| JWT | Authentication |
| bcrypt | Password Hashing |

---

## Project Structure

```
rosync/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   └── services/        # API service modules
│   └── package.json
│
├── backend/                 # Express backend API
│   ├── controller/          # Route controllers
│   ├── routes/              # API route definitions
│   ├── prisma/              # Database schema
│   ├── config/              # Configuration files
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/rosync.git
cd rosync
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file with the following variables:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-super-secret-jwt-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
FRONTEND_URL="http://localhost:5173"
```

Run database migrations:

```bash
npx prisma generate
npx prisma db push
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## How File Sharing Works

Rosync implements a secure, time-limited file sharing system:

### Creating a Share Link

1. **User Action**: Click "Share" on any folder in the dashboard
2. **Duration Selection**: Choose link validity (1, 7, or 30 days)
3. **Link Generation**: Server creates a unique UUID-based share link
4. **Database Entry**: A `ShareLink` record is created with:
   - Unique ID (UUID)
   - Reference to the shared folder
   - Expiration timestamp

### Accessing Shared Content

1. **Public Access**: Anyone with the link can access `/share/{shareId}`
2. **Validation**: Server checks if the link exists and hasn't expired
3. **Content Display**: If valid, folder contents (files + subfolders) are displayed
4. **Download**: Users can download any file directly from the shared view

### Link Expiry Mechanism

```
┌─────────────────────────────────────────────────────────────┐
│  User shares folder with 7-day expiry                       │
│                    ↓                                        │
│  Server calculates: expiresAt = currentDate + 7 days        │
│                    ↓                                        │
│  ShareLink stored in database with expiresAt timestamp      │
│                    ↓                                        │
│  On access: Server compares current time vs expiresAt       │
│                    ↓                                        │
│  If expired → Returns 410 "Share link has expired"          │
│  If valid   → Returns folder contents + files               │
└─────────────────────────────────────────────────────────────┘
```

**Key Points:**
- Expiration is validated server-side on every access request
- Expired links return HTTP 410 (Gone) status
- Share links are automatically orphaned when parent folder is deleted (cascade delete)
- No authentication required to access valid share links

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |

### Folders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/folders/:parentId` | Get folders |
| POST | `/api/folders` | Create folder |
| PUT | `/api/folders/:id` | Rename folder |
| DELETE | `/api/folders/:id` | Delete folder |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files/:folderId` | Get files |
| POST | `/api/files/upload` | Upload file |
| DELETE | `/api/files/:id` | Delete file |

### Sharing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/share/:folderId` | Create share link |
| GET | `/api/share/:shareId` | Get shared folder (public) |

---

## Database Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  folders   Folder[]
  files     File[]
}

model Folder {
  id         Int         @id @default(autoincrement())
  name       String
  userId     Int
  parentId   Int?        // Supports nested folders
  files      File[]
  shareLinks ShareLink[]
}

model File {
  id        Int      @id @default(autoincrement())
  name      String
  size      Int
  mimeType  String
  url       String   // Cloudinary URL
  folderId  Int?
  userId    Int
}

model ShareLink {
  id        String   @id @default(uuid())
  folderId  Int
  expiresAt DateTime
}
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ by <strong>Roshiii</strong></p>
</div>
