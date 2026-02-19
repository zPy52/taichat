import { z } from 'zod';
import { tool } from 'ai';

export class SubmoduleToolsWeb {
  public search() {
    return tool({
      description:
        'Search the web for current information using Exa AI. Returns relevant results with titles, URLs, and text snippets.',
      inputSchema: z.object({
        query: z.string().describe('The search query'),
        numResults: z.number().min(1).max(10).default(5).describe('Number of results to return'),
      }),
      execute: async ({ query, numResults }) => {
        const apiKey = process.env.EXA_API_KEY;
        if (!apiKey) {
          return { error: 'Exa API key not configured. Set EXA_API_KEY or use /config.' };
        }

        try {
          const { default: Exa } = await import('exa-js');
          const exa = new Exa(apiKey);
          const result = await exa.searchAndContents(query, {
            numResults,
            text: { maxCharacters: 1000 },
          });

          return {
            results: result.results.map((r) => ({
              title: r.title ?? '',
              url: r.url,
              snippet: r.text ?? '',
            })),
          };
        } catch (err) {
          return { error: `Web search failed: ${err instanceof Error ? err.message : String(err)}` };
        }
      },
    });
  }
}
