import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from "@mr/ui";

const teams = [
  { name: "Equipo A", category: "Sénior", players: 18 },
  { name: "Equipo B", category: "Sub-23", players: 16 },
  { name: "Equipo C", category: "Sub-19", players: 15 },
];

export default function TeamsPage() {
  return (
    <main className="p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.name}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{team.name}</CardTitle>
                <Badge variant="secondary">{team.category}</Badge>
              </div>
              <CardDescription>{team.players} jugadores</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Mundialito Redondela FC
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
