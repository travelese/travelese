import Typesense from "typesense";
import { getInstitutions } from "./get-institutions";

const typesense = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_ENDPOINT!,
      port: 443,
      protocol: "https",
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY!,
  numRetries: 3,
  connectionTimeoutSeconds: 120,
  logLevel: "debug",
});

async function main() {
  const documents = await getInstitutions();

  try {
    await typesense
      .collections("institutions")
      .documents()
      .import(documents, { action: "upsert" });
  } catch (error) {
    // @ts-ignore
    console.log(error.importResults);
  }
}

main();
