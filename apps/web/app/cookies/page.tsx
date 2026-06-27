import type { Metadata } from "next";
import { LegalPage } from "../components/legal-page";

export const metadata: Metadata = {
  title: "Política de cookies | Mundialito Redondela 2026",
};

export default function CookiesPage() {
  return (
    <LegalPage title="Política de cookies">
      <p>
        Este sitio no guarda cookies propias en tu navegador para registro,
        publicidad, seguimiento comercial ni personalización.
      </p>
      <p>
        La preferencia de tema claro u oscuro puede guardarse localmente en tu
        navegador para mantener la apariencia elegida, pero no se usa para
        identificarte.
      </p>
      <p>
        Si en el futuro se incorporase cualquier uso de cookies, esta página se
        actualizaría con la información correspondiente.
      </p>
      <p>
        Para dudas o consultas, puedes escribir a
        contacto@mundialitoredondela.com.
      </p>
    </LegalPage>
  );
}
