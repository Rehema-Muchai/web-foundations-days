# SnapShare Scaling Plan

## 1. Assumptions
- 10,000,000 registered users.
- 10% of users are active each day = 1,000,000 Daily Active Users (DAU).
- Each active user uploads 1 photo per day.
- Each active user views 50 feed pages per day.
- Average photo size = 2 MB.
- Average thumbnail size = 50 KB (0.05 MB).
- For estimation, 1 day ≈ 100,000 seconds.

## 2. Traffic and Storage Estimates
**Uploads (Writes):**
- Daily uploads: 1,000,000 users × 1 photo = 1,000,000 uploads/day.
- Average uploads per second: 1,000,000 ÷ 100,000 = **10 uploads/sec**.
- Peak uploads per second (5× average): **50 uploads/sec**.

**Feed Views (Reads):**
- Daily feed views: 1,000,000 users × 50 pages = 50,000,000 views/day.
- Average views per second: 50,000,000 ÷ 100,000 = **500 views/sec**.
- Peak views per second (5× average): **2,500 views/sec**.

**Storage per Year:**
- Storage per photo (original + thumbnail): 2 MB + 0.05 MB = 2.05 MB.
- Daily storage: 1,000,000 photos × 2.05 MB = 2,050,000 MB ≈ 2,050 GB (≈ 2.05 TB) per day.
- Yearly storage: 2.05 TB × 365 days ≈ **748 TB per year**.

## 3. Read-Heavy vs Write-Heavy
The system is **heavily read-heavy**. At peak, there are 2,500 read requests per second compared to only 50 write requests per second (a 50:1 ratio). 
**Design Impact:** We must optimize for fast reads. This means aggressively caching feed data (e.g., using Redis) and routing read traffic to database read replicas, while the single primary database can easily handle the relatively low volume of 50 writes per second.

## 4. Why Not Store Photos in the Database?
Relational databases are optimized for fast querying of structured text/numbers, not large binary files (BLOBs). Storing 2 MB+ images in a database would bloat its size, slow down backups, and waste expensive database memory. Instead, photos should be stored in **Object Storage** (like AWS S3), and the database should only store the text URL/link pointing to the file.

## 5. Architecture Diagram

```text
                               ┌─────────┐
                  ┌──────────> │   DNS   │
                  │            └─────────┘
  ┌───────────────┴──────┐  static assets  ┌──────────────────────┐
  │  User Browser / App  │ ──────────────> │  CDN (HTML, CSS, JS) │
  └───────────────┬──────┘                 └──────────────────────
                  │ API calls (HTTPS)
                  v
           ┌───────────────┐
           │ Load Balancer │
           └──────┬────────┘
             ┌────┴─────┬──────────┐
             v          v          v
        ┌────────┐ ┌────────┐ ┌────────┐       ┌──────────────┐
        │ App 1  │ │ App 2  │ │ App 3  │ ────> │ Cache (Redis)│
        └───┬────┘ └───┬────┘ └───┬────┘       └──────────────┘
            │ writes   │ reads    │ jobs
            v          v          v
      ┌──────────┐ ┌──────────┐ ┌───────┐    ┌──────────────────┐
      │ Primary  │ │ Read     │ │ Queue │──> │ Worker (Thumbnail│
      │   DB     │ │ Replicas │ └───────┘    │  Generator)      │
      └──────────┘ └──────────┘              └────────┬─────────┘
                                                      │ saves file
                                                      v
                                             ┌──────────────────┐
                                             │ Object Storage   │
                                             │ (e.g., AWS S3)   │
                                             └──────────────────┘

## 6. Component Explanations
- **CDN**: Serves static front-end files (HTML, CSS, JS) from servers geographically close to the user to reduce latency.
- **Load Balancer**: Distributes incoming API traffic evenly across multiple app servers and removes unhealthy servers from rotation.
- **App Servers**: Stateless servers that handle business logic, validate requests, and coordinate between the cache, database, and queue.
- **Cache (Redis)**: Stores frequently accessed feed data in memory to serve read requests in ~1 ms, drastically reducing database load.
- **Primary Database**: The single source of truth that handles all write operations (new users, new photo metadata) to ensure data consistency.
- **Read Replicas**: Copies of the primary database that handle the massive volume of read requests, keeping the primary database free for writes.
- **Message Queue**: Holds background jobs (like thumbnail generation) so the app server can respond to the user immediately without waiting for slow tasks.
- **Worker**: A background process that picks up jobs from the queue, generates the 50 KB thumbnail, and saves it.
- **Object Storage**: A highly scalable, cheap storage system designed specifically for holding large binary files like images and videos.

## 7. Step-by-Step Upload Flow
1. The user selects a photo and clicks "Upload". The app sends a `POST /photos` request with the image file to the Load Balancer.
2. The Load Balancer routes the request to an available App Server.
3. The App Server saves the original 2 MB photo directly to **Object Storage** and receives a URL in return.
4. The App Server writes the photo metadata (including the Object Storage URL) to the **Primary Database**.
5. The App Server adds a "generate thumbnail" job to the **Message Queue** and immediately returns a `201 Created` response to the user.
6. A **Worker** picks up the job from the queue, downloads the image, creates the 50 KB thumbnail, and saves it to Object Storage.
7. The Worker updates the photo's record in the **Primary Database** with the thumbnail URL.
8. The Cache entry for the user's feed is invalidated so the next feed load shows the new photo.

## 8. System Trade-offs
- **Speed vs. Freshness (Eventual Consistency):** By using a Cache and Read Replicas, feed loads are incredibly fast. However, there is a tiny replication lag, meaning a user might not see their brand-new post in their feed for a few milliseconds. For a photo app, this trade-off is perfectly acceptable.
- **Simplicity vs. Scalability:** Introducing a Message Queue and background Workers adds significant complexity to the system (more moving parts to monitor and debug). However, it is necessary because generating thumbnails synchronously would block the App Server, causing slow response times and poor user experience during traffic spikes.