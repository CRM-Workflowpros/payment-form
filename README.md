# Nuvei Subscription Test Form

React + Vite + TypeScript test app for validating the Nuvei subscription payment flow.

## Development

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

1. Push to GitHub
2. Settings → Pages → Source: `GitHub Actions`
3. Add `.github/workflows/deploy.yml` (see below), or manually:
   ```bash
   npm run build
   # push dist/ to gh-pages branch
   ```

> `vite.config.ts` already has `base: '/payment-form/'` for GitHub Pages.

## Flow

```
1. Enter Nuvei credentials + backend URL + client ID in the UI
2. Load plans            →  GET  /membership-plans
3. Select a plan
4. Initialize Session    →  POST /clients/{clientId}/membership/nuvei-session
                            ← { provider: 'NUVEI', nuvei: { sessionToken, orderId, ... } }
5. Nuvei card field renders (embedded iframe via SafeCharge SDK)
6. Fill cardholder + email + card details
7. Subscribe
   a. SafeCharge.createPayment() → Nuvei processes initial payment
   b. POST /clients/{clientId}/membership/subscribe
      ← ClientMembership object
```

## Backend endpoints contract

### `GET /membership-plans`
```json
[{ "id": 1, "name": "Monthly", "billingAmount": 99, "billingPeriod": "ONE_MONTH", "nuveiPlanId": "..." }]
```

### `POST /clients/{clientId}/membership/nuvei-session`
Request: `{ "membershipPlanId": 1, "amount": 99 }`
Response:
```json
{
  "provider": "NUVEI",
  "nuvei": { "sessionToken": "...", "orderId": "...", "merchantId": "...", "merchantSiteId": "...", "env": "int", "userTokenId": "client_123" }
}
```

### `POST /clients/{clientId}/membership/subscribe`
Request:
```json
{ "membershipPlanId": 1, "userPaymentOptionId": "...", "cardHolderName": "John Smith", "email": "john@example.com", "transactionId": "...", "authCode": "..." }
```
Response: `ClientMembership`

## Nuvei sandbox test cards

| Number              | Result   |
|---------------------|----------|
| 4111 1111 1111 1111 | Approved |
| 4000 0000 0000 0002 | Declined |

Any future expiry, any 3-digit CVV.
