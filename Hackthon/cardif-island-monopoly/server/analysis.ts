// Server-side only: asks Claude for a personal end-of-game analysis.
// The API key stays on the server (ANTHROPIC_API_KEY); the browser never sees it.
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `你是「BOBI ISLAND 人生大富翁」的保險教育教練。這是法國巴黎人壽 InsurHack 的訓練遊戲：玩家擲骰走過幼年、青年、中年、老年，遇到意外、疾病，可以投保住院醫療險、意外傷害險、防癌險、一年期醫療實支實付、失能險、一年期定期壽險、終身壽險、微型個人保險（限經濟弱勢）；上班後公司會投保勞工保險。同一個事件可能由好幾張保單一起理賠，但總理賠不超過損失。投保要經過健康告知與核保，保單每個人生階段要續繳；隱瞞病史被發現會被解約；沒有保障時要自付、請假、賣房或借錢。

勝負規則：比的是遇到意外、疾病時，扣掉保險理賠後自己賠了多少錢（outOfPocket），越少名次越前；破產的人排最後。保費（premiumsPaid）不算在賠的錢裡，但可以拿來討論保障是否划算。

你會收到一局遊戲的紀錄（JSON）。請針對「你」這位玩家寫一段個人分析，用繁體中文，對象是正在學習保險觀念的理專與一般民眾。

格式：
【這局回顧】2～3 句，用紀錄裡的具體事件和金額說明發生了什麼。
【做得好的地方】1～2 句。
【可以改進的地方】1～2 句，指出具體的決策（例如沒續保、隱瞞病史、缺哪種保障）以及它造成的結果。
【給你的建議】1 句，可以實際行動的風險管理觀念。

規則：
- 總長度約 200～280 字，每段之間空一行，不要使用 Markdown 標題、粗體或表情符號。
- 只根據紀錄裡的事實，不要編造沒發生的事件或金額。
- 可以跟其他玩家比較，但重點是這位玩家。
- 遊戲金額是示意值；不要推銷特定商品，也不要保證理賠，談的是保障類型和觀念。`;

export interface AnalysisResult {
  text: string;
}

export async function analyzeGame(report: unknown): Promise<AnalysisResult> {
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment
  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 4000,
    output_config: { effort: 'low' }, // a short write-up; keep the wait at the end of the game short
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `這局遊戲的紀錄：\n${JSON.stringify(report)}` }],
  });
  if (response.stop_reason === 'refusal') throw new Error('refused');
  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
  if (!text) throw new Error('empty response');
  return { text };
}

// Shared request handling for the Vercel function and the local Vite server
export async function handleAnalysisRequest(body: string): Promise<{ status: number; json: unknown }> {
  if (!process.env.ANTHROPIC_API_KEY) return { status: 503, json: { error: 'ANTHROPIC_API_KEY is not set' } };
  let report: unknown;
  try {
    report = JSON.parse(body);
  } catch {
    return { status: 400, json: { error: 'invalid JSON' } };
  }
  if (body.length > 20000) return { status: 413, json: { error: 'report too large' } };
  try {
    return { status: 200, json: await analyzeGame(report) };
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return { status: 429, json: { error: 'rate limited' } };
    if (error instanceof Anthropic.APIError) return { status: 502, json: { error: `API error ${error.status}` } };
    return { status: 500, json: { error: 'analysis failed' } };
  }
}
