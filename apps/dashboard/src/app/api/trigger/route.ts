import { client } from "@travelese/jobs";
import { createAppRoute } from "@trigger.dev/nextjs";

export const runtime = "nodejs";
export const maxDuration = 300; // 5min

import "@travelese/jobs";

export const { POST, dynamic } = createAppRoute(client);
