"use client";

import { useState, type FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { submitPublicSupport, type PublicReceipt } from "@/lib/api/public-support";

export default function SupportForm() {
  const [email, setEmail] = useState("");
  const [provider, setProvider] = useState("");
  const [kind, setKind] = useState<"general" | "payment" | "safety">("general");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PublicReceipt | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || message.trim().length < 20) return;
    setBusy(true);
    setError(null);
    setReceipt(null);
    try {
      const result = await submitPublicSupport({
        email,
        kind,
        message,
        website,
        ...(provider ? { provider: provider as "kakao" | "naver" | "google" | "apple" } : {}),
      });
      setReceipt(result);
      setMessage("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "문의를 접수하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box component="form" onSubmit={submit} noValidate sx={{ display: "grid", gap: 2.5 }}>
      <TextField required type="email" label="답변받을 이메일" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" inputProps={{ maxLength: 320 }} />
      <FormControl>
        <InputLabel id="support-provider-label">가입 로그인 방법 (선택)</InputLabel>
        <Select labelId="support-provider-label" value={provider} label="가입 로그인 방법 (선택)" onChange={(event) => setProvider(event.target.value)}>
          <MenuItem value="">선택하지 않음</MenuItem><MenuItem value="kakao">카카오</MenuItem><MenuItem value="naver">네이버</MenuItem><MenuItem value="google">구글</MenuItem><MenuItem value="apple">Apple</MenuItem>
        </Select>
      </FormControl>
      <FormControl required>
        <InputLabel id="support-kind-label">문의 유형</InputLabel>
        <Select labelId="support-kind-label" value={kind} label="문의 유형" onChange={(event) => setKind(event.target.value as typeof kind)}>
          <MenuItem value="general">일반 문의</MenuItem><MenuItem value="payment">결제 문의</MenuItem><MenuItem value="safety">신고·안전</MenuItem>
        </Select>
      </FormControl>
      <TextField required multiline minRows={6} label="문의 내용" helperText={`${message.length}/2,000 · 비밀번호와 인증 코드는 입력하지 마세요.`} value={message} onChange={(event) => setMessage(event.target.value)} inputProps={{ minLength: 20, maxLength: 2000 }} />
      <Box sx={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }} aria-hidden>
        <label htmlFor="support-website">Website</label><input id="support-website" name="website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
      </Box>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {receipt ? <Alert severity="success" aria-live="polite">문의가 접수되었습니다. 접수 번호 <strong>{receipt.receipt}</strong>를 보관해 주세요.</Alert> : null}
      <Button type="submit" size="large" variant="contained" disabled={busy || !email.trim() || message.trim().length < 20}>{busy ? "접수 중…" : "문의 접수"}</Button>
      <Typography variant="caption" color="text.secondary">같은 이메일·유형으로 24시간 안에 다시 접수하면 기존 접수 번호가 안내됩니다.</Typography>
    </Box>
  );
}
