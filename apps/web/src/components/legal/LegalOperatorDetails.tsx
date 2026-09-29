import { LegalSection } from "./LegalPage";

type LegalOperator = {
  name: string;
  representative: string;
  businessNumber: string;
  mailOrderNumber: string;
  address: string;
  privacyOfficer: string;
  processorsDisclosure: string;
};

function legalOperator(): LegalOperator | null {
  const value: LegalOperator = {
    name: process.env.LEGAL_OPERATOR_NAME?.trim() ?? "",
    representative: process.env.LEGAL_REPRESENTATIVE?.trim() ?? "",
    businessNumber: process.env.LEGAL_BUSINESS_NUMBER?.trim() ?? "",
    mailOrderNumber: process.env.LEGAL_MAIL_ORDER_NUMBER?.trim() ?? "",
    address: process.env.LEGAL_ADDRESS?.trim() ?? "",
    privacyOfficer: process.env.LEGAL_PRIVACY_OFFICER?.trim() ?? "",
    processorsDisclosure: process.env.LEGAL_PROCESSORS_DISCLOSURE?.trim() ?? "",
  };
  const missing = Object.entries(value).filter(([, field]) => !field).map(([key]) => key);
  if (missing.length === 0) return value;
  if (process.env.VERCEL_ENV === "production") {
    throw new Error(`Production legal operator configuration is incomplete: ${missing.join(", ")}`);
  }
  return null;
}

export function LegalOperatorDetails({ includeProcessors = true }: { includeProcessors?: boolean }) {
  const operator = legalOperator();
  if (!operator) return null;
  return (
    <LegalSection title={includeProcessors ? "14. 운영 사업자와 개인정보 보호책임자" : "운영 사업자 정보"}>
      {`${operator.name} · 대표 ${operator.representative}\n사업자등록번호 ${operator.businessNumber} · 통신판매업 신고번호 ${operator.mailOrderNumber}\n주소 ${operator.address}\n개인정보 보호책임자 ${operator.privacyOfficer} · contact@mingles.cloud${includeProcessors ? `\n\n운영 사업자 및 위탁 현황\n${operator.processorsDisclosure}` : ""}`}
    </LegalSection>
  );
}
