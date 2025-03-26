# Notification Service (MERN)

## Deskripsi

Proyek ini adalah Notification Service berbasis MERN. Saat ini, proyek mendukung notifikasi WhatsApp dan akan dikembangkan untuk mendukung email untuk kedepannya.

## Teknologi yang Digunakan

### Backend:

- **Node.js** dengan **Express.js**
- **TypeScript** untuk meningkatkan keandalan kode
- **MySQL** sebagai database
- **Baileys** sebagai library untuk WhatsApp gateway
- **Prisma** sebagai ORM

### Frontend:

- **React.js**
- **Vite** sebagai build tool
- **Zustand** untuk state management

## Instalasi dan Menjalankan Proyek

### 1. Backend

#### Prasyarat:

- Node.js dan npm/yarn telah terinstall
- MySQL telah terinstall dan dikonfigurasi

#### Langkah-langkah:

```sh
cd backend
npm install  # atau yarn install
```

Buat file `.env` dan tambahkan konfigurasi berikut:

```env
cp .env.template .env
```

Jalankan perintah:

```env
cp .env.template .env
```

Jalankan server backend:

```sh
npm run dev  # atau yarn dev
```

### 2. Frontend

#### Prasyarat:

- Node.js dan npm/yarn telah terinstall

#### Langkah-langkah:

```sh
cd frontend
npm install  # atau yarn install
```

Jalankan aplikasi frontend:

```sh
npm run dev  # atau yarn dev
```

Akses aplikasi di `http://localhost:5173/`.

## Struktur Proyek

```
root/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── dtos/
│   │   ├── exceptions/
│   │   ├── http/
│   │   ├── interfaces/
│   │   ├── jobs/
│   │   ├── libs/
│   │   ├── middlewares/
│   │   ├── prisma/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── contexts/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── libs/
│   │   ├── routes/
│   │   ├── types/
│   │   ├── zustand/
```

## Docker

build compose

```sh
docker build -t registry.mojokertokab.go.id/silverwing/notification-service .
```

push ke gitlab

```sh
docker push registry.mojokertokab.go.id/silverwing/notification-service
```

## Kontributor

- [Wing-Dimas](https://github.com/Wing-Dimas)
