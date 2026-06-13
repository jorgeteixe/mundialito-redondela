import { Button } from "@mr/ui";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">
        Mundialito da Xunqueira - Redondela 2026
      </h1>
      <div className="flex gap-4">
        <Button>Inscríbete</Button>
        <Button variant="outline">Más información</Button>
      </div>
    </main>
  );
}
