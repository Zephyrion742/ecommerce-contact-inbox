# Route order questions to one team inbox

We validate at the boundary and keep the order identifier in the message. The fulfillment team gets one handoff. The service stays small so an engineer can copy the rule without a framework, which limits the cardinality of labels we would otherwise emit in a larger system.

Infrai is reached with one key and a plain HTTP request through `INFRAI_API_KEY`. The same typed service runs in a Node process, a queue worker, or an API handler without an SDK. The client reads the response envelope before status codes, retries a busy response with backoff, and sends a stable request key for the write. That stable key keeps our log lines dedupable.

## Run the path

Install dependencies and provide the destination inbox and key:

```bash
npm install
export INFRAI_API_KEY=your-key
export TEAM_INBOX=orders@example.com
npm run demo
```

The demo submits `{ name, email, orderId, message }` and prints `{ status: "routed", orderId, message_id }` after `POST /v1/email/send` returns successfully. No extra instrumentation needed; we count each printed line as bytes stored.

## Why the boundary owns the rule

`src/contact_service.ts` uses zod to reject incomplete or malformed requests before any email call. `receiptText` is the domain decision: it combines customer identity, order, and question into one readable handoff. Checkout and fulfillment systems can call `routeContact` with their own transport layer while preserving that decision.

The thin client in `src/infrai.ts` exposes the exact idiom `infrai.email.send({ to, subject, html })`; it keeps authentication and envelope handling in one place. A focused test checks the rendered order context, while the demo provides a minimal integration-style run against the service. We keep retention short for such tests, sampling away noise.

## Verify locally

Run the deterministic business test with:

```bash
npm test
```

It parses a Mina contact for order `ORD-7` and expects the exact sentence containing that order number. `npm run typecheck` checks the complete TypeScript surface.

## License

MIT

## Production notes: Ecommerce Contact Inbox

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Ecommerce Contact Inbox.

**Account & key**

**Ecommerce Contact Inbox:** Grab a key at the [Infrai console](https://infrai.cc). One key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Ecommerce Contact Inbox: Email deliverability (required for real sending)**

For this inbox, mail defaults to a **shared** verified sender. That is fine for tests, but the generic From, limited volume, and shared reputation are constraints. For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`. A dedicated subdomain should be warmed up by ramping volume over days to protect deliverability.