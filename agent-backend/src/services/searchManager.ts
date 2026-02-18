import axios from "axios";

const TAVILY_KEY = process.env.TAVILY_API_KEY;
const SERPAPI_KEY = process.env.SERPAPI_KEY;

export async function searchWeb(query: string) {
  try {
    const tavily = await axios.post("https://api.tavily.com/search", {
      api_key: TAVILY_KEY,
      query,
      search_depth: "advanced",
      include_answer: true,
    });

    if (tavily.data?.results?.length > 0) {
      return JSON.stringify(normalize("Tavily", tavily.data.results));
    }
  } catch (err) {
    console.log("Tavily failed, falling back...");
  }

  try {
    const serp = await axios.get("https://serpapi.com/search", {
      params: {
        q: query,
        api_key: SERPAPI_KEY,
      },
    });

    if (serp.data?.organic_results?.length) {
      return JSON.stringify(normalize("SerpAPI", serp.data.organic_results));
    }
  } catch (err) {
    console.log("SerpAPI failed");
  }

  return "No search results found.";
}

function normalize(source: string, results: any[]) {
  return results.slice(0, 5).map((r: any) => ({
    title: r.title || r.name,
    snippet: r.content || r.snippet,
    url: r.url || r.link,
    source,
  }));
}
