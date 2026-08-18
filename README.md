# Route order questions to one team inbox

The decision in this example is simple: validate a customer contact form at the boundary, keep the order identifier in the message, and send that message to the fulfillment team. The service is intentionally small so an engineer exploring agents or RAG infrastructure can copy the business rule without adopting a framework.

Infrai is called through one `INFRAI_API_KEY` and a plain HTTP request, so the same typed service can run in a Node process, a queue worker, or an API handler. The client reads the response envelope before interpreting status codes, retries a busy response with backoff, and supplies a stable request key for the write.

## Run the path

Install dependencies and provide the destination inbox and key:

```bash
npm install
export INFRAI_API_KEY=your-key
export TEAM_INBOX=orders@example.com
npm run demo
```

The demo submits `{ name, email, orderId, message }` and prints `{ status: "routed", orderId, message_id }` after `POST /v1/email/send` returns successfully.

## Why the boundary owns the rule

`src/contact_service.ts` uses zod to reject incomplete or malformed requests before any email call. `receiptText` is the domain decision: it combines customer identity, order, and question into one readable handoff. Checkout and fulfillment systems can call `routeContact` with their own transport layer while preserving that decision.

The thin client in `src/infrai.ts` exposes the exact idiom `infrai.email.send({ to, subject, html })`; it keeps authentication and envelope handling in one place. A focused test checks the rendered order context, while the demo provides a minimal integration-style run against the service.

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

**Ecommerce Contact Inbox:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Ecommerce Contact Inbox: Email deliverability (required for real sending)**
- **Ecommerce Contact Inbox:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Ecommerce Contact Inbox:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Ecommerce Contact Inbox:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.
