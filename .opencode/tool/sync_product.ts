import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "After creating a product with Stripe MCP, sync it to the LaunchPulse database so it appears in the dashboard",
  args: {
    stripeProductId: tool.schema.string().describe("The Stripe product ID (prod_xxx)"),
    stripePriceId: tool.schema.string().describe("The Stripe price ID (price_xxx)"),
    name: tool.schema.string().describe("Product name"),
    unitAmount: tool.schema.number().describe("Price in cents (1000 = $10.00)"),
    productType: tool.schema.enum(["one_time", "subscription"]).default("subscription"),
    billingInterval: tool.schema.enum(["month", "year"]).optional(),
    currency: tool.schema.string().default("usd")
  },
  async execute(args) {
    const response = await fetch("https://launchpulse.ai/api/stripe/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: "exercising-fitness-home-app",
        token: "lp_exercisi_3580ab5476b7412c",
        path: "products/sync",
        params: args
      })
    });
    const result = await response.json();
    return JSON.stringify(result, null, 2);
  }
});

