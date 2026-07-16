# Ordalee API Contract — v1

Base URL: /api/v1
All responses follow the EB's envelope:
  Success: { "success": true, "data": {...}, "message": "..." }
  Error:   { "success": false, "error": { "code": "...", "message": "..." } }

## Auth
POST   /auth/register          { email, password }
POST   /auth/verify-email      { token }
POST   /auth/login             { email, password } -> { accessToken } (refresh token set as httpOnly cookie)
POST   /auth/refresh           (cookie) -> { accessToken }
POST   /auth/logout
POST   /auth/forgot-password   { email }
POST   /auth/reset-password    { token, newPassword }

## Business
POST   /businesses             { name, phone, email?, address?, currency?, receiptPrefix?, taxPercentage? }
GET    /businesses/me
PATCH  /businesses/:id

## Receipts
POST   /businesses/:businessId/receipts
  Body: { clientReceiptId, customerName?, items[], discountType?, discountValue?, notes?, paymentMethod, clientCreatedAt }
  Idempotent on clientReceiptId — if a receipt with that clientReceiptId
  already exists for this business, return the existing one (200) instead
  of creating a duplicate. This is what makes retried offline syncs safe.

GET    /businesses/:businessId/receipts
  Query: from?, to?, search?, page?, limit?

GET    /businesses/:businessId/receipts/:id
GET    /businesses/:businessId/receipts/:id/pdf   (server-side backup copy)

## Dashboard
GET    /businesses/:businessId/dashboard
  Returns: todayRevenueMinor, weekRevenueMinor, monthRevenueMinor,
           todayReceiptCount, recentReceipts[]