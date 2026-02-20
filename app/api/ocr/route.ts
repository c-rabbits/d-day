import { type NextRequest } from "next/server";

const VISION_URL = "https://vision.googleapis.com/v1/images:annotate";

/** OCR 텍스트에서 계약 정보 추출 (날짜, 금액, 제목 휴리스틱) */
function parseContractFromText(fullText: string): {
  title: string;
  start_date: string;
  end_date: string;
  amount: string;
} {
  const today = new Date();
  const defaultStart = today.toISOString().slice(0, 10);
  const defaultEnd = new Date(today);
  defaultEnd.setMonth(defaultEnd.getMonth() + 1);
  const fallbackEnd = defaultEnd.toISOString().slice(0, 10);

  const lines = fullText
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  // 날짜 패턴: YYYY-MM-DD, YYYY.MM.DD, YYYY/MM/DD, YYYY년 M월 D일
  const dateRegex =
    /(\d{4})[-./년]?\s*(\d{1,2})[-./월]?\s*(\d{1,2})일?/g;
  const isoLike = /\d{4}-\d{2}-\d{2}/g;
  const dates: string[] = [];
  let m: RegExpExecArray | null;
  const restText = fullText.replace(/\s+/g, " ");
  while ((m = dateRegex.exec(restText)) !== null) {
    const y = m[1];
    const mo = m[2].padStart(2, "0");
    const d = m[3].padStart(2, "0");
    dates.push(`${y}-${mo}-${d}`);
  }
  if (dates.length === 0) {
    while ((m = isoLike.exec(restText)) !== null) dates.push(m[0]);
  }
  const start_date = dates[0] ?? defaultStart;
  const end_date = dates[1] ?? dates[0] ?? fallbackEnd;

  // 금액: 숫자+쉼표 또는 "원" 앞 숫자
  const amountMatch = fullText.match(
    /(\d{1,3}(?:,\d{3})*)\s*원?|금액\s*[:.]?\s*(\d[\d,]*)|(\d[\d,]*)\s*원/
  );
  const amount = amountMatch
    ? (amountMatch[1] ?? amountMatch[2] ?? amountMatch[3] ?? "").trim()
    : "";

  // 제목: 첫 줄 또는 "계약", "서비스명" 등이 포함된 줄
  let title = "";
  for (const line of lines) {
    if (line.length < 2) continue;
    if (
      /계약|서비스|요금제|상품명|구독|멤버십/i.test(line) ||
      (line.length <= 50 && !/^\d+$/.test(line))
    ) {
      title = line.slice(0, 80);
      break;
    }
  }
  if (!title && lines[0]) title = lines[0].slice(0, 80);
  if (!title) title = "[OCR 결과] 계약명을 확인해 주세요";

  return {
    title,
    start_date,
    end_date,
    amount,
  };
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GOOGLE_CLOUD_VISION_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  let base64: string;
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    if (!file || !file.type.startsWith("image/")) {
      return Response.json(
        { error: "이미지 파일(image)을 보내주세요." },
        { status: 400 }
      );
    }
    const buf = await file.arrayBuffer();
    base64 = Buffer.from(buf).toString("base64");
  } else if (contentType.includes("application/json")) {
    const body = await request.json();
    const b = body?.imageBase64 ?? body?.base64;
    if (typeof b !== "string") {
      return Response.json(
        { error: "JSON에 imageBase64 또는 base64 필드가 필요합니다." },
        { status: 400 }
      );
    }
    base64 = b;
  } else {
    return Response.json(
      { error: "Content-Type: multipart/form-data 또는 application/json" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${VISION_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Vision API error", res.status, errText);
      return Response.json(
        { error: "Vision API 호출 실패. API 키와 결제 설정을 확인하세요." },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      responses?: Array<{
        fullTextAnnotation?: { text?: string };
        error?: { message?: string };
      }>;
    };
    const first = data.responses?.[0];
    if (first?.error) {
      return Response.json(
        { error: first.error.message ?? "Vision API 오류" },
        { status: 502 }
      );
    }
    const fullText = first?.fullTextAnnotation?.text ?? "";
    if (!fullText.trim()) {
      return Response.json(
        { error: "이미지에서 텍스트를 찾지 못했습니다." },
        { status: 422 }
      );
    }

    const parsed = parseContractFromText(fullText);
    return Response.json(parsed);
  } catch (e) {
    console.error("OCR error", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "OCR 처리 중 오류" },
      { status: 500 }
    );
  }
}
