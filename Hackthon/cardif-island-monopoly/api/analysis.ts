// Vercel serverless function: POST /api/analysis
import { handleAnalysisRequest } from '../server/analysis.js';

export async function POST(request: Request): Promise<Response> {
  const { status, json } = await handleAnalysisRequest(await request.text());
  return Response.json(json, { status });
}
