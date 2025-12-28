import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "List products from the LaunchPulse database for this project",
  args: {},
  async execute() {
    const response = await fetch("https://launchpulse.ai/api/stripe/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: "exercising-fitness-home-app",
        token: "lp_exercisi_3580ab5476b7412c",
        path: "products/list-synced",
        params: {}
      })
    });
    const result = await response.json();
    return JSON.stringify(result, null, 2);
  }
});

