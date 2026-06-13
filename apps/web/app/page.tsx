import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@mr/ui";
import { CalendarDays, ExternalLink, MapPin } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="gap-3">
          <Badge variant="secondary" className="w-fit">
            XLVII Edición
          </Badge>
          <CardTitle className="text-2xl leading-tight">
            Mundialito da Xunqueira
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
