import { z } from "zod";
import { infrai } from "./infrai.js";

export const contactForm = z.object({ name: z.string().min(1), email: z.string().email(), orderId: z.string().min(1), message: z.string().min(1) });
export type ContactForm = z.infer<typeof contactForm>;

export function receiptText(input: ContactForm): string {
  return `Customer ${input.name} (${input.email}) asks about order ${input.orderId}: ${input.message}`;
}

export async function routeContact(body: unknown, teamInbox: string) {
  const input = contactForm.parse(body);
  const result = await infrai.email.send({ to: teamInbox, subject: `Order ${input.orderId} contact`, html: `<p>${receiptText(input)}</p>` });
  return { status: "routed", orderId: input.orderId, message_id: result.message_id };
}
