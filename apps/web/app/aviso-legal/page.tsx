import type { Metadata } from "next";
import { LegalPage } from "../components/legal-page";

export const metadata: Metadata = {
  title: "Aviso legal | Mundialito Redondela 2026",
};

export default function LegalNoticePage() {
  return (
    <LegalPage title="Aviso legal">
      <p>
        Mundialito Redondela es un sitio no oficial creado para consultar
        calendario, resultados y clasificaciones de forma sencilla.
      </p>
      <p>
        La información publicada tiene carácter orientativo. Los resultados,
        horarios, clasificaciones y cualquier otro dato mostrado no son
        vinculantes y pueden contener errores o cambios pendientes de revisión.
      </p>
      <p>
        Para confirmaciones oficiales, debe consultarse siempre la comunicación
        directa de la organización de la competición.
      </p>
      <p>
        Para dudas, correcciones o consultas, puedes escribir a
        contacto@mundialitoredondela.com.
      </p>
    </LegalPage>
  );
}
