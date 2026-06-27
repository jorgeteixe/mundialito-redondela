import type { Metadata } from "next";
import { LegalPage } from "../components/legal-page";

export const metadata: Metadata = {
  title: "Política de privacidad | Mundialito Redondela 2026",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de privacidad">
      <p>
        Este sitio es un proyecto informativo no oficial. No está afiliado,
        gestionado ni respaldado directamente por la organización de la
        competición.
      </p>
      <p>
        La página no ofrece registro de usuarios, formularios ni áreas privadas.
        No se solicita información personal desde el sitio.
      </p>
      <p>
        Si escribes a contacto@mundialitoredondela.com, se usará tu dirección de
        correo únicamente para responder a tus dudas o consultas.
      </p>
    </LegalPage>
  );
}
