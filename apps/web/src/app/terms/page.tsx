import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { TERMS_SECTIONS } from "@mingle/shared";
import { LegalOperatorDetails } from "@/components/legal/LegalOperatorDetails";

export default function TermsPage() {
  return (
    <LegalPage title="서비스 이용약관">
      {TERMS_SECTIONS.map((section) => (
        <LegalSection key={section.title} title={section.title}>
          {section.paragraphs.join("\n\n")}
        </LegalSection>
      ))}
      <LegalOperatorDetails includeProcessors={false} />
    </LegalPage>
  );
}
