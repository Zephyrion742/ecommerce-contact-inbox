import test from "node:test";
import assert from "node:assert/strict";
import { receiptText, contactForm } from "../src/contact_service.js";

test("the contact decision keeps order context in the team message", () => {
  const input = contactForm.parse({ name: "Mina", email: "mina@example.com", orderId: "ORD-7", message: "Where is it?" });
  assert.equal(receiptText(input), "Customer Mina (mina@example.com) asks about order ORD-7: Where is it?");
});
