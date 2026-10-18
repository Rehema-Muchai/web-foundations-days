# TicketHub System Design Document

## 1. Requirements

### Functional Requirements
* **Browse Events:** Users can view a list of upcoming concerts, events, and venue details.
* **Seat Selection:** Users can view a live seat map showing available, held, and booked seats.
* **Temporary Seat Hold:** Users can lock/hold their chosen seats for a limited time (e.g., 10 minutes) while completing payment.
* **Secure Checkout:** Users can pay for their held seats and generate valid digital tickets.
* **Ticket Management:** Users can view their purchased tickets and QR codes for event entry.

### Non-Functional Requirements
* **Speed & Latency:** Seat maps must load under 300 milliseconds, and checkout transactions must complete within 2 seconds.
* **Correctness (Zero Double-Booking):** Absolute consistency is mandatory. Under no circumstances can two different users successfully book the same seat.
* **Fairness & Availability:** High-demand event drops must handle high concurrency gracefully without crashing the core backend services.

---

## 2. Traffic Estimates

* **Registered User Base:** 2,000,000 users.
* **Normal Day Traffic:**
  * **Daily Visitors:** 50,000 unique users.
  * **Page Views:** 10 pages per user = 500,000 page views per day.
  * **Tickets Sold:** 5,000 tickets sold per day.
  * **Average RPS (Requests Per Second):** Assuming 100,000 seconds in a day, $500,000 / 100,000 = \mathbf{5 \text{ RPS}}$ average.
* **Peak "Big Sale" Traffic (Popular Concert Drop):**
  * **Traffic Spike:** 200,000 users try to buy 20,000 seats within the first 10 minutes (600 seconds).
  * **Average Peak RPS:** $200,000 / 600 = \mathbf{\sim 333 \text{ RPS}}$ average over 10 minutes, with initial burst spikes easily hitting **5,000+ RPS** at the API gateway and cache layers.

---

## 3. API Endpoints

1. **`GET /api/events`**
   * *Description:* Retrieve a list of all active concerts and events.
2. **`GET /api/events/{id}/seats`**
   * *Description:* Fetch the current status of all seats for a specific event.
3. **`POST /api/seats/hold`**
   * *Description:* Temporarily reserve selected seats for a user (payload: `user_id`, `seat_ids[]`). Returns a hold expiration timestamp.
4. **`POST /api/orders`**
   * *Description:* Process payment and finalize the purchase for held seats (payload: `user_id`, `hold_id`, `payment_token`). Creates permanent tickets.
5. **`GET /api/users/me/tickets`**
   * *Description:* Retrieve all purchased tickets for the authenticated user.

---

## 4. Data Model & Double-Booking Prevention

### Tables and Relationships
* **`users`**: `id` (PK), `email`, `password_hash`, `created_at`
* **`events`**: `id` (PK), `title`, `description`, `date`, `venue_name`, `total_seats`
* **`seats`**: `id` (PK), `event_id` (FK), `seat_number`, `status` (`'available'`, `'held'`, `'booked'`), `version_id` (for optimistic locking)
* **`orders`**: `id` (PK), `user_id` (FK), `total_amount`, `status` (`'pending'`, `completed'`, `'failed'`), `created_at`
* **`order_items`**: `id` (PK), `order_id` (FK), `seat_id` (FK)

### Preventing Double-Booking
To guarantee that two users cannot book the same seat, we use **Database Transactions with Row-Level Locking (Pessimistic Locking)** or **Atomic Conditional Updates**:
1. When a user attempts to hold or buy a seat, the application opens a strict database transaction (`BEGIN`).
2. The query checks the seat status: `SELECT * FROM seats WHERE id = ? AND status = 'available' FOR UPDATE;`.
3. The `FOR UPDATE` clause locks that specific row in the database, blocking other concurrent transactions from reading or modifying that seat until the current transaction commits or rolls back.
4. If the status is confirmed available, the database immediately updates the status to `'held'` or `'booked'`. 
5. Combined with a **unique constraint** on active order items tied to a seat, this ensures absolute consistency and zero race conditions.

---

## 5. Architecture Diagram & Component Explanation

```text
 [ Clients (Web / Mobile) ]
            │
            ▼
     [ Cloudflare CDN ]  ── (Serves static assets, images, HTML/JS)
            │
            ▼
 [ API Gateway / Load Balancer ] ── (Distributes traffic, enforces Rate Limiting)
            │
            ├────────────────────────┐
            ▼                        ▼
    [ Virtual Waiting Room ]   [ Stateless App Servers (Node.js/Go) ]
            │                        │
            │ (Controls influx       ├────────────────────────┐
            │  during big sales)     ▼                        ▼
            └──────────────► [ Redis Cache ]        [ PostgreSQL Database ]
                             (Seat status,           (Primary data store,
                              temporary holds)        ACID transactions)

## Component Breakdown
-**CDN: Offloads static content (HTML, CSS, event banners) globally so the origin servers aren't overwhelmed by initial browsing traffic.

-**API Gateway / Load Balancer: Distributes incoming traffic evenly across multiple stateless application servers.

-**Virtual Waiting Room: During a major concert drop (200k users rushing in), the waiting room queues users and lets them in sequentially, protecting app servers and the database from crashing under a sudden thundering herd.

-**Redis Cache: Stores fast-changing seat availability and temporary holds in memory to prevent heavy database read queries during peak browsing.

-**PostgreSQL Database: The single source of truth handling ACID-compliant transactions for final ticket purchases.

## 6. Trade-offs
-**Virtual Waiting Room vs. Direct Access:

-**Trade-off: Introducing a waiting room adds a layer of friction and extra UX wait time for users during a ticket drop.

### Why chosen: Without it, 200,000 concurrent requests would instantly overwhelm database connection pools, causing total system failure. The minor UX friction is a necessary sacrifice for absolute system stability.

## Redis Caching vs. Strict Real-Time Accuracy:

-**Trade-off: Serving seat maps from Redis cache means there could theoretically be a millisecond discrepancy between the cache and the actual database state.

### Why chosen: Reading seat maps directly from the database for 50,000+ active users would degrade performance and spike latency. Caching speeds up reads drastically, while the final checkout step always forces a strict, locked database verification to prevent double-booking.