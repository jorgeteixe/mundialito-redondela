import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Header,
} from "@mr/ui";
import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { ModeToggle } from "./components/mode-toggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <Header
        edition="XLVII"
        eventName="Mundialito da Xunqueira"
        navItems={
          <>
            <Button variant="ghost" size="sm">
              Equipos
            </Button>
            <Button variant="ghost" size="sm">
              Calendario
            </Button>
            <Button variant="ghost" size="sm">
              Resultados
            </Button>
          </>
        }
        actions={
          <>
            <ModeToggle />
          </>
        }
      />
      <Card className="w-full max-w-md">
        <CardHeader className="gap-3">
          <CardTitle className="text-2xl leading-tight">
            <div className="flex items-center gap-2">
              Mundialito da Xunqueira
              <Badge variant="secondary" className="w-fit">
                XLVII
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            <a
              href="https://maps.app.goo.gl/oAu6FkNf1eUSWW2n6"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Pista de A Xunqueira, Redondela
            </a>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0" />
            <span>29 jun – 24 jul 2026</span>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button asChild>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSfw9x_7AGtd7LbWosYPkU06ks8I0kLr-RGnDZETmbMTKuypVg/viewform?usp=sf_link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Inscríbete
              <ExternalLink className="ml-1 size-3.5" />
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://redondela.gal/evento/mundialito-da-xunquiera-2026/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Más información
              <ExternalLink className="ml-1 size-3.5" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
