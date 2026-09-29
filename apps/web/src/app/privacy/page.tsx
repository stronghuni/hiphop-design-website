import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { PRIVACY_SECTIONS } from "@mingle/shared";
import { LegalOperatorDetails } from "@/components/legal/LegalOperatorDetails";

export default function PrivacyPage() {
  return (
    <LegalPage title="개인정보 처리 안내">
      {PRIVACY_SECTIONS.map((section) => (
        <LegalSection key={section.title} title={section.title}>
          {section.paragraphs.join("\n\n")}
        </LegalSection>
      ))}
      <LegalOperatorDetails />
    </LegalPage>
  );
}
