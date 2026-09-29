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
import { submitPublicDeletion, type PublicReceipt } from "@/lib/api/public-support";

export default function AccountDeletionForm() {
  const [email, setEmail] = useState("");
  const [provider, setProvider] = useState<"" | "kakao" | "naver" | "google" | "apple">("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PublicReceipt | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !provider || message.trim().length < 20) return;
    setBusy(true); setError(null); setReceipt(null);
    try { setReceipt(await submitPublicDeletion({ email, provider, message, website })); setMessage(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "탈퇴 요청을 접수하지 못했습니다."); }
    finally { setBusy(false); }
  }
  return <Box component="form" onSubmit={submit} noValidate sx={{ display: "grid", gap: 2.5, mt: 3 }}>
    <TextField required type="email" label="가입 계정 이메일" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" inputProps={{ maxLength: 320 }} />
    <FormControl required><InputLabel id="deletion-provider-label">가입 로그인 방법</InputLabel><Select labelId="deletion-provider-label" value={provider} label="가입 로그인 방법" onChange={(event) => setProvider(event.target.value as typeof provider)}><MenuItem value="kakao">카카오</MenuItem><MenuItem value="naver">네이버</MenuItem><MenuItem value="google">구글</MenuItem><MenuItem value="apple">Apple</MenuItem></Select></FormControl>
    <TextField required multiline minRows={4} label="본인 확인에 도움이 되는 설명" helperText={`${message.length}/2,000 · 비밀번호와 인증 코드는 입력하지 마세요.`} value={message} onChange={(event) => setMessage(event.target.value)} inputProps={{ minLength: 20, maxLength: 2000 }} />
    <Box sx={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }} aria-hidden><label htmlFor="deletion-website">Website</label><input id="deletion-website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" /></Box>
    {error ? <Alert severity="error">{error}</Alert> : null}
    {receipt ? <Alert severity="success" aria-live="polite">탈퇴 검토 요청이 접수되었습니다. 접수 번호 <strong>{receipt.receipt}</strong>. 본인 확인 후 처리되며, 이 메시지는 탈퇴 완료를 뜻하지 않습니다.</Alert> : null}
    <Button type="submit" color="error" variant="contained" size="large" disabled={busy || !email.trim() || !provider || message.trim().length < 20}>{busy ? "접수 중…" : "탈퇴 검토 요청"}</Button>
  </Box>;
}
