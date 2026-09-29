import type { Metadata } from "next";
import Container from "@mui/material/Container";
import { BrandHomeLink } from "@/components/BrandHomeLink";
import Typography from "@mui/material/Typography";
import SupportForm from "./SupportForm";

export const metadata: Metadata = { title: "고객지원 | MINGLES", description: "MINGLES 이용, 결제, 신고·안전 문의 접수" };

export default function SupportPage() {
  return <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 } }}><BrandHomeLink /><Typography component="h1" variant="h3" fontWeight={800} sx={{ mt: 2 }}>고객지원</Typography><Typography color="text.secondary" sx={{ mt: 2, mb: 4 }}>앱에 로그인할 수 없는 경우에도 문의할 수 있습니다. 로그인 가능한 경우 앱 설정의 신고·문의에서 접수하면 처리 결과를 앱에서 바로 확인할 수 있습니다.</Typography><SupportForm /></Container>;
}
