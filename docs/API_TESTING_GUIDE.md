# Inkby API Testing Guide

Complete integration test script using `curl`. Run each section in order — later steps depend on IDs returned by earlier steps.

## Prerequisites

1. **Supabase project** created and migration applied (`supabase/migrations/001_initial_schema.sql`)
2. **`.env.local`** configured (copy from `.env.local.example`)
3. **Disable email confirmation** in Supabase Dashboard → Authentication → Settings → turn off "Enable email confirmations" (for local testing)
4. **Dev server running:**

```bash
npm run dev
```

5. **Set the base URL variable:**

```bash
BASE=http://localhost:3000
```

---

## 1. Healthcheck

Verify the server is running.

```bash
curl -s $BASE/api/healthcheck | jq
```

**Expected:** `{ "status": "ok", "timestamp": "...", "uptime": ... }`

---

## 2. Auth — Register

```bash
curl -s -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artist@test.com",
    "password": "test123456",
    "slug": "rgl.munkh"
  }' | jq
```

**Expected:** `{ "user": { "id": "<ARTIST_ID>", "email": "artist@test.com" }, "message": "Registration successful" }`

Save the artist ID:

```bash
ARTIST_ID=<paste the id from the response>
```

### Validation test — duplicate slug:

```bash
curl -s -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "another@test.com",
    "password": "test123456",
    "slug": "rgl.munkh"
  }' | jq
```

**Expected:** `{ "error": "This username is already taken" }`

### Validation test — invalid slug:

```bash
curl -s -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bad@test.com",
    "password": "test123456",
    "slug": "UPPER CASE!"
  }' | jq
```

**Expected:** `{ "error": "Slug must be lowercase alphanumeric, dots, or underscores" }`

---

## 3. Auth — Login

```bash
curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "artist@test.com",
    "password": "test123456"
  }' | jq
```

**Expected:** `{ "user": { "id": "...", "email": "..." }, "session": { "access_token": "..." } }`

The `-c cookies.txt` saves the Supabase session cookies. All authenticated requests below use `-b cookies.txt`.

### Validation test — wrong password:

```bash
curl -s -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artist@test.com",
    "password": "wrongpassword"
  }' | jq
```

**Expected:** `{ "error": "Invalid login credentials" }`

---

## 4. Auth — Get Current User

```bash
curl -s $BASE/api/auth/me \
  -b cookies.txt | jq
```

**Expected:** User object with artist profile (onboarding_completed = false).

### Validation test — no auth:

```bash
curl -s $BASE/api/auth/me | jq
```

**Expected:** `{ "error": "Unauthorized" }`

---

## 5. Artist — Complete Onboarding

```bash
curl -s -X PUT $BASE/api/artist/onboarding \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "instagram_username": "rgl.munkh",
    "display_name": "RGL Munkh",
    "deposit_amount": 50000,
    "studio_location": "Ulaanbaatar, Mongolia"
  }' | jq
```

**Expected:** Artist object with `onboarding_completed: true`.

### Validation test — missing required field:

```bash
curl -s -X PUT $BASE/api/artist/onboarding \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "instagram_username": "rgl.munkh"
  }' | jq
```

**Expected:** `{ "error": "Required" }` (missing deposit_amount and studio_location)

---

## 6. Artist — Get Profile (Authenticated)

```bash
curl -s $BASE/api/artist/profile \
  -b cookies.txt | jq
```

**Expected:** Full artist profile object.

---

## 7. Artist — Update Profile

```bash
curl -s -X PATCH $BASE/api/artist/profile \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "bio": "Mongolian traditional tattoo artist. 5 years experience.",
    "deposit_amount": 75000
  }' | jq
```

**Expected:** Updated artist object with new bio and deposit amount.

---

## 8. Public — Get Artist Profile by Slug

```bash
curl -s $BASE/api/artist/rgl.munkh | jq
```

**Expected:** Public artist info + flash_deals array (empty for now).

### Validation test — nonexistent slug:

```bash
curl -s $BASE/api/artist/nonexistent | jq
```

**Expected:** `{ "error": "Artist not found" }`

---

## 9. Flash Deals — Create

```bash
curl -s -X POST $BASE/api/flash-deals \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "photo_url": "https://example.com/flash-dragon.jpg",
    "title": "Dragon Sleeve",
    "description": "Traditional Mongolian dragon design",
    "is_repeatable": false,
    "sizes": [
      { "size_label": "Small (10cm)", "estimated_amount": 150000 },
      { "size_label": "Medium (20cm)", "estimated_amount": 250000 },
      { "size_label": "Large (30cm)", "estimated_amount": 400000 }
    ]
  }' | jq
```

**Expected:** Flash deal object with nested `flash_deal_sizes` array. Status `201`.

Save the flash deal ID:

```bash
FLASH_DEAL_ID=<paste the id from the response>
```

### Validation test — missing sizes:

```bash
curl -s -X POST $BASE/api/flash-deals \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "photo_url": "https://example.com/photo.jpg",
    "sizes": []
  }' | jq
```

**Expected:** `{ "error": "At least one size is required" }`

---

## 10. Flash Deals — List (Artist)

```bash
curl -s $BASE/api/flash-deals \
  -b cookies.txt | jq
```

**Expected:** Array of flash deals with sizes.

---

## 11. Flash Deals — Get Single

```bash
curl -s $BASE/api/flash-deals/$FLASH_DEAL_ID | jq
```

**Expected:** Single flash deal object with sizes.

---

## 12. Flash Deals — Update

```bash
curl -s -X PATCH $BASE/api/flash-deals/$FLASH_DEAL_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Dragon Sleeve (Limited Edition)",
    "sizes": [
      { "size_label": "Medium (20cm)", "estimated_amount": 280000 },
      { "size_label": "Large (30cm)", "estimated_amount": 450000 }
    ]
  }' | jq
```

**Expected:** Updated flash deal. Sizes replaced entirely (old sizes removed, new ones added).

---

## 13. Public — Get Artist Profile with Flash Deals

```bash
curl -s $BASE/api/artist/rgl.munkh | jq
```

**Expected:** Artist profile now includes the flash deal in `flash_deals` array.

---

## 14. Booking Request — Create (Public)

This is the user-facing endpoint. No auth required.

```bash
curl -s -X POST $BASE/api/booking-requests \
  -H "Content-Type: application/json" \
  -d '{
    "artist_id": "'$ARTIST_ID'",
    "first_name": "Bold",
    "last_name": "Bataa",
    "phone": "99112233",
    "email": "bold@test.com",
    "idea_description": "I want a wolf howling at the moon on my shoulder. Realistic style with some geometric elements.",
    "tattoo_size": "medium",
    "placement": "right shoulder"
  }' | jq
```

**Expected:** Booking request object with `status: "pending"`. Status `201`.

Save the booking request ID:

```bash
BOOKING_ID=<paste the id from the response>
```

### Validation test — invalid tattoo size:

```bash
curl -s -X POST $BASE/api/booking-requests \
  -H "Content-Type: application/json" \
  -d '{
    "artist_id": "'$ARTIST_ID'",
    "first_name": "Test",
    "last_name": "User",
    "phone": "99000000",
    "email": "test@test.com",
    "idea_description": "test",
    "tattoo_size": "huge",
    "placement": "arm"
  }' | jq
```

**Expected:** Validation error (tattoo_size must be small/medium/large/extra-large).

---

## 15. Booking Request — List (Artist)

```bash
curl -s "$BASE/api/booking-requests?status=pending" \
  -b cookies.txt | jq
```

**Expected:** Array of pending booking requests with pagination info.

### With pagination:

```bash
curl -s "$BASE/api/booking-requests?page=1&limit=5" \
  -b cookies.txt | jq
```

---

## 16. Booking Request — Get Single

```bash
curl -s $BASE/api/booking-requests/$BOOKING_ID | jq
```

**Expected:** Booking request with `booking_request_photos` and `booking_schedules` arrays (both empty for now).

---

## 17. Scheduling — Artist Proposes Dates

```bash
curl -s -X POST $BASE/api/booking-requests/$BOOKING_ID/schedule \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "duration_minutes": 120,
    "suggested_dates": [
      { "datetime": "2026-04-10T14:00:00Z" },
      { "datetime": "2026-04-12T10:00:00Z" },
      { "datetime": "2026-04-15T16:00:00Z" }
    ],
    "low_amount": 200000,
    "high_amount": 350000,
    "message": "Looking forward to this piece! Any of these dates work for me. The final price depends on the level of detail.",
    "private_note": "Client seems flexible on size, might upsell to large"
  }' | jq
```

**Expected:** Array of 3 schedule objects. Status `201`.

Save one of the schedule IDs:

```bash
SCHEDULE_ID=<paste one of the schedules[].id values>
```

### Verify request status changed:

```bash
curl -s $BASE/api/booking-requests/$BOOKING_ID | jq '.booking_request.status'
```

**Expected:** `"scheduled"`

### Validation test — scheduling again (already scheduled):

```bash
curl -s -X POST $BASE/api/booking-requests/$BOOKING_ID/schedule \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "duration_minutes": 60,
    "suggested_dates": [{ "datetime": "2026-04-20T10:00:00Z" }],
    "low_amount": 100000,
    "high_amount": 200000
  }' | jq
```

**Expected:** `{ "error": "Booking request is not in pending status" }`

---

## 18. Appointment — User Confirms (Picks a Time)

```bash
curl -s -X POST $BASE/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "booking_request_id": "'$BOOKING_ID'",
    "schedule_id": "'$SCHEDULE_ID'",
    "chosen_datetime": "2026-04-10T14:00:00Z"
  }' | jq
```

**Expected:** Appointment object with `status: "pending_payment"`. Status `201`.

Save the appointment ID:

```bash
APPOINTMENT_ID=<paste the id from the response>
```

### Validation test — duplicate appointment:

```bash
curl -s -X POST $BASE/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "booking_request_id": "'$BOOKING_ID'",
    "schedule_id": "'$SCHEDULE_ID'",
    "chosen_datetime": "2026-04-10T14:00:00Z"
  }' | jq
```

**Expected:** `{ "error": "An appointment already exists for this booking request" }`

---

## 19. Appointment — Get Details

```bash
curl -s $BASE/api/appointments/$APPOINTMENT_ID | jq
```

**Expected:** Appointment with nested `booking_requests`, `booking_schedules`, and `artists` data.

---

## 20. Appointments — List (Artist)

```bash
curl -s $BASE/api/appointments \
  -b cookies.txt | jq
```

**Expected:** Array of appointments with booking request and schedule info.

### Filter by status:

```bash
curl -s "$BASE/api/appointments?status=pending_payment" \
  -b cookies.txt | jq
```

---

## 21. Calendar — Get Events by Date Range

```bash
curl -s "$BASE/api/calendar?start=2026-04-01T00:00:00Z&end=2026-04-30T23:59:59Z" \
  -b cookies.txt | jq
```

**Expected:** `{ "appointments": [...], "pending_schedules": [...] }`

### Validation test — missing params:

```bash
curl -s "$BASE/api/calendar" \
  -b cookies.txt | jq
```

**Expected:** `{ "error": "start and end query parameters are required (ISO 8601)" }`

---

## 22. QPAY — Create Invoice

> Requires valid QPAY credentials in `.env.local`. Skip if not configured yet.

```bash
curl -s -X POST $BASE/api/qpay/create-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": "'$APPOINTMENT_ID'"
  }' | jq
```

**Expected:**

```json
{
  "invoice_id": "...",
  "qr_text": "...",
  "qr_image": "data:image/png;base64,...",
  "urls": [
    { "name": "Khan bank", "link": "..." },
    { "name": "Golomt bank", "link": "..." }
  ],
  "amount": 75000
}
```

---

## 23. QPAY — Check Payment Status

```bash
curl -s $BASE/api/qpay/check/$APPOINTMENT_ID | jq
```

**Expected:** `{ "payment": { "id": "...", "amount": 75000, "status": "pending", "paid_at": null } }`

---

## 24. QPAY — Simulate Callback

> In production, QPAY sends this automatically. For testing:

```bash
curl -s -X POST "$BASE/api/qpay/callback?appointment_id=$APPOINTMENT_ID" | jq
```

**Expected:** Payment and appointment status updated to `"paid"` (if QPAY confirms the payment).

---

## 25. File Upload

```bash
curl -s -X POST $BASE/api/upload \
  -F "file=@/path/to/your/photo.jpg" \
  -F "bucket=reference-photos" | jq
```

**Expected:** `{ "url": "https://<supabase-url>/storage/v1/object/public/reference-photos/..." }`

### Validation test — invalid bucket:

```bash
curl -s -X POST $BASE/api/upload \
  -F "file=@/path/to/photo.jpg" \
  -F "bucket=invalid-bucket" | jq
```

**Expected:** `{ "error": "Invalid bucket. Must be one of: reference-photos, flash-deal-photos, avatars" }`

---

## 26. Flash Deals — Delete

```bash
curl -s -X DELETE $BASE/api/flash-deals/$FLASH_DEAL_ID \
  -b cookies.txt | jq
```

**Expected:** `{ "message": "Flash deal deleted" }`

---

## 27. Auth — Logout

```bash
curl -s -X POST $BASE/api/auth/logout \
  -b cookies.txt | jq
```

**Expected:** `{ "message": "Logged out" }`

### Verify session is cleared:

```bash
curl -s $BASE/api/auth/me \
  -b cookies.txt | jq
```

**Expected:** `{ "error": "Unauthorized" }`

---

## Full Flow Summary

```
Register → Login → Onboarding → [Artist is set up]
                                       │
                     ┌─────────────────┤
                     ▼                  ▼
              Create Flash Deal   User Creates Booking
                                       │
                                       ▼
                              Artist Schedules Dates
                                       │
                                       ▼
                              User Confirms Appointment
                                       │
                                       ▼
                              QPAY Invoice Created
                                       │
                                       ▼
                              User Pays Deposit
                                       │
                                       ▼
                              Callback Confirms Payment
                                       │
                                       ▼
                              Appointment Status = "paid"
                                       │
                                       ▼
                              Shows on Artist Calendar
```

---

## Cleanup

Remove the saved cookies file:

```bash
rm cookies.txt
```

To reset test data, go to Supabase Dashboard → Table Editor and delete rows, or re-run the migration on a fresh database.
