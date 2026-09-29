export type PublicReceipt = { accepted: true; receipt: string; createdAt: string };

async function submitPublic(path: string, body: Record<string, unknown>): Promise<PublicReceipt> {
  const response = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(payload.message) ? payload.message.join("\n") : payload.message;
    throw new Error(message || "요청을 접수하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
  if (!payload.accepted || typeof payload.receipt !== "string") {
    throw new Error("접수 확인 번호를 받지 못했습니다. 다시 시도해 주세요.");
  }
  return payload as PublicReceipt;
}

export function submitPublicSupport(input: {
  email: string;
  provider?: "kakao" | "naver" | "google" | "apple";
  kind: "general" | "payment" | "safety";
  message: string;
  website?: string;
}) {
  return submitPublic("/public/support", input);
}

export function submitPublicDeletion(input: {
  email: string;
  provider: "kakao" | "naver" | "google" | "apple";
  message: string;
  website?: string;
}) {
  return submitPublic("/public/account-deletion-requests", input);
}
