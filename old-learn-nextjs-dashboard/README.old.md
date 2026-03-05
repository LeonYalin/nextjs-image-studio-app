### 🖼️ Nextjs Image Studio: Project Plan
A full-stack, local-first "DIY" project to master **Next.js 16, Distributed Background Jobs, and Manual Image Processing.**


### 🛠️ The "Manual" Tech Stack
| Layer | Technology | Role |
|---|---|---|
| **Orchestration** | **Docker Compose** | Runs Redis, Next.js, and the Worker as separate containers. |
| **Framework** | **Next.js 16 (App Router)** | UI, Server Actions (Producer), and Image Gallery. |
| **Database** | **SQLite + Prisma ORM** | Shared data layer for image metadata and job status. |
| **Queue/Jobs** | **BullMQ + Redis** | Reliable messaging between the App and the Worker. |
| **Processing** | **Sharp** | The Node.js engine for manual cropping and resizing. |
| **Client Sync** | **TanStack Query (v5)** | Handles gallery fetching and status polling. |
| **UI/UX** | **shadcn/ui + Tailwind** | Accessible components and styling. |
| **Image UI** | **React Adv. Cropper** | Frontend tool to generate crop coordinates (x,y,w,h). |
| **Validation** | **Zod** | Validates the crop coordinates sent to the server. |

### 📂 Project Structure
```yml
/manual-image-studio
├── /prisma
│   └── schema.prisma        # Shared database definition (SQLite)
├── /app                     # Next.js Application (The Producer)
│   ├── src/actions/         # Adds jobs to BullMQ
│   ├── src/components/      # Cropper UI & Gallery
│   └── Dockerfile
├── /worker                  # Node.js Processor (The Consumer)
│   ├── index.ts             # Sharp logic + BullMQ Worker
│   └── Dockerfile
├── /shared-data             # DOCKER VOLUME (Persisted files)
│   ├── dev.db               # SQLite database file
│   ├── /raw                 # Original uploaded images
│   └── /processed           # Final cropped images
└── docker-compose.yml       # Links Redis, App, and Worker
```

### 🚀 Execution Roadmap
#### Phase 1: Infrastructure & Data Modeling
- Set up **Prisma** with a `Post` or `Image` model containing `status` (PENDING/PROCESSING/COMPLETED) and `cropCoordinates` (JSON).
- Configure `docker-compose.yml` to spin up **Redis** and mount the `shared-data` folder as a volume to all services.
#### Phase 2: The "Producer" (Next.js)
- Implement a file upload using **Server Actions**.
- Save the raw file to the shared volume and create a database entry.
- Use **BullMQ** to push a "job" containing the `imageId` and the crop coordinates to Redis.
#### Phase 3: The "Consumer" (Worker)
- Create a standalone Node.js process that listens to the BullMQ queue.
- Use **Sharp** to:
  1. Read the raw file from the shared volume.
  2. `extract()` the crop based on the coordinates.
  3. `resize()` and convert to `.webp`.
- Update the SQLite database record via Prisma to `COMPLETED`.
#### Phase 4: The Reactive UI (TanStack Query)
- Build a Gallery that fetches images from the DB.
- For images with `PROCESSING` status, use **TanStack Query** `refetchInterval` to poll the API.
- Once the status becomes `COMPLETED`, stop polling and show the final image.

### 💡 Key Learning Objectives
1. **Distributed Systems**: Understanding how a web server communicates with a background worker.
2. **Concurrency**: Managing a shared SQLite database and file system across multiple containers.
3. **Binary Data**: Handling `Buffers` and file streams manually instead of using a cloud API.
4. **Scaling**: Learning how to scale the "Worker" service independently in Docker.