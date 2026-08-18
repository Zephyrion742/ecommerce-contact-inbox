import { routeContact } from "../src/contact_service.js";

const inbox = process.env.TEAM_INBOX;
if (!inbox) throw new Error("TEAM_INBOX is required");
const result = await routeContact({ name: "Ari", email: "ari@example.com", orderId: "ORD-1042", message: "Can you confirm the delivery date?" }, inbox);
console.log(result);
