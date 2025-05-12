import {
  AzureKeyCredential,
  SearchClient,
  SearchIndexClient,
} from "@azure/search-documents";
import { AzureOpenAI } from "openai";
import {
  AZURE_ADMIN_KEY,
  AZURE_SEARCH_ENDPOINT,
  AZURE_SEARCH_INDEX,
  EMBED_API_VERSION,
  EMBED_ENDPOINT,
  EMBED_MODEL,
  FOUNDRY_API_KEY,
} from "../../env.js";
import type { VectorRecord, VectorSearchResult } from "./types.js";

const oai = new AzureOpenAI({
  apiKey: FOUNDRY_API_KEY,
  apiVersion: EMBED_API_VERSION,
  endpoint: EMBED_ENDPOINT,
});

const adminKey = new AzureKeyCredential(AZURE_ADMIN_KEY);
const indexClient = new SearchIndexClient(AZURE_SEARCH_ENDPOINT, adminKey);
const searchClient = new SearchClient(
  AZURE_SEARCH_ENDPOINT,
  AZURE_SEARCH_INDEX,
  adminKey,
);

export async function checkSearchIndex() {
  try {
    await indexClient.getIndex(AZURE_SEARCH_INDEX);
    console.log("Azure AI Search index exists");
    return;
  } catch (error) {
    console.error(`Azure AI Search index (${AZURE_SEARCH_INDEX}) not found`);
    throw error;
  }
}

async function embed(input: string): Promise<number[]> {
  const res = await oai.embeddings.create({ input, model: EMBED_MODEL });
  return res.data[0].embedding;
}

export async function searchTranscript(
  transcript: string,
  {
    active = true,
    callSids,
    topics,
  }: {
    active?: boolean;
    callSids?: string[];
    topics?: string | string[];
  } = {},
  topK = 5,
) {
  const vector = await embed(transcript);

  const filters: string[] = [];
  if (typeof active === "boolean") filters.push(`active eq ${active}`);

  if (topics && (Array.isArray(topics) ? topics.length : true)) {
    const topicFilter = (Array.isArray(topics) ? topics : [topics])
      .map((t) => `topics/any(t: t eq '${t.replace(/'/g, "''")}')`)
      .join(" or ");
    filters.push(`(${topicFilter})`);
  }

  if (callSids && callSids.length > 0) {
    const escaped = callSids.map((s) => s.replace(/'/g, "''"));
    if (escaped.length === 1) {
      filters.push(`callSid eq '${escaped[0]}'`);
    } else {
      // use search.in for multi-value equality list
      filters.push(`search.in(callSid, '${escaped.join(",")}', ',')`);
    }
  }

  const filter = filters.length ? filters.join(" and ") : undefined;

  // execute search
  const res = await searchClient.search("", {
    vectorSearchOptions: {
      queries: [
        {
          kind: "vector",
          fields: ["vector"],
          kNearestNeighborsCount: topK ?? 5,
          vector,
        },
      ],
    },
    filter,
    select: ["id", "callSid", "feedback", "summary", "topics", "active"],
    top: topK,
  });

  const results: VectorSearchResult[] = [];
  for await (const r of res.results) results.push(r as VectorSearchResult);

  return results;
}

export async function insertTranscript(transcript: string, meta: VectorRecord) {
  // 1. Embed the transcript → vector
  const vector = await embed(transcript);

  // 2. Shape the document as per schema
  const doc: VectorRecord & { vector: number[] } = {
    id: meta.id,
    vector, // Collection(Edm.Single)
    feedback: meta.feedback,
    topics: meta.topics,
    active: meta.active,
    callSid: meta.callSid,
    summary: meta.summary,
  };

  // 3. Upsert into the index
  const response = await searchClient.mergeOrUploadDocuments([doc]);
  const success = response.results[0]?.succeeded;
  if (!success) console.error("Failed to insert document", response.results[0]);

  return response;
}

export async function deleteTranscript(id: string) {
  await searchClient.deleteDocuments([{ id }]);
}
