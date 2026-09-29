import type { Metadata } from "next";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import { BrandHomeLink } from "@/components/BrandHomeLink";
import Typography from "@mui/material/Typography";
import AccountDeletionForm from "./AccountDeletionForm";

export const metadata: Metadata = {
  title: "회원탈퇴 | MINGLES",
  description: "MINGLES 앱 내 회원탈퇴와 로그인 불가 계정의 삭제 검토 요청",
};

export default function AccountDeletionPage() {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 } }}>
      <BrandHomeLink />
      <Typography component="h1" variant="h3" fontWeight={800} sx={{ mt: 2 }}>
        회원탈퇴
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        로그인 가능한 경우 앱 설정 화면 맨 아래의 회원탈퇴에서 즉시 처리할 수 있습니다. 앱에 접근할 수
        없는 경우 아래에서 본인 확인을 위한 검토 요청을 접수해 주세요.
      </Typography>
      <Alert severity="warning" sx={{ mt: 3 }}>
        공개 폼 접수만으로 계정이 삭제되지는 않습니다. 운영자가 가입 계정과 본인 여부를 확인한 뒤
        처리하며, 법령상 보관 의무가 있는 최소 정보는 해당 기간 동안 분리 보관됩니다.
      </Alert>
      <AccountDeletionForm />
    </Container>
  );
}
