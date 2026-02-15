import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Building2, Database, Mail, Zap } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useEffect } from "react";

export default function WorkspacePage() {
  const params = useParams<{ id: string }>();
  const workspaceId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const { setCurrentWorkspace } = useWorkspace();

  const { data: workspace, isLoading } = trpc.workspaces.getById.useQuery({ id: workspaceId });

  useEffect(() => {
    if (workspace) {
      setCurrentWorkspace(workspace);
    }
  }, [workspace, setCurrentWorkspace]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Cliente no encontrado</h2>
          <Button onClick={() => setLocation("/")}>Volver al Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Button>

        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{workspace.name}</h1>
              {workspace.industry && (
                <p className="text-muted-foreground">{workspace.industry}</p>
              )}
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground capitalize inline-block mt-2">
                {workspace.userRole}
              </span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList>
            <TabsTrigger value="campaigns" className="gap-2">
              <Mail className="w-4 h-4" />
              Campañas
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="gap-2">
              <Database className="w-4 h-4" />
              Base de Conocimiento
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Zap className="w-4 h-4" />
              Cuenta de Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            <CampaignsTab workspaceId={workspaceId} />
          </TabsContent>

          <TabsContent value="knowledge">
            <KnowledgeBaseTab workspaceId={workspaceId} />
          </TabsContent>

          <TabsContent value="email">
            <EmailAccountTab workspaceId={workspaceId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CampaignsTab({ workspaceId }: { workspaceId: number }) {
  const [, setLocation] = useLocation();
  const { data: campaigns, isLoading } = trpc.campaigns.list.useQuery({ workspaceId });

  if (isLoading) {
    return <div className="text-center py-8">Cargando campañas...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Campañas de Email</h2>
          <p className="text-muted-foreground">
            Gestiona tus secuencias de 10 emails generadas con IA
          </p>
        </div>
        <Button onClick={() => setLocation(`/workspace/${workspaceId}/campaigns/new`)}>
          Nueva Campaña
        </Button>
      </div>

      {campaigns && campaigns.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Mail className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay campañas todavía</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Crea tu primera campaña con 10 emails generados automáticamente por IA
            </p>
            <Button onClick={() => setLocation(`/workspace/${workspaceId}/campaigns/new`)}>
              Crear Primera Campaña
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns?.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setLocation(`/workspace/${workspaceId}/campaigns/${campaign.id}`)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{campaign.name}</CardTitle>
                    {campaign.description && (
                      <CardDescription>{campaign.description}</CardDescription>
                    )}
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full capitalize ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                    campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                    campaign.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function KnowledgeBaseTab({ workspaceId }: { workspaceId: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Base de Conocimiento</CardTitle>
        <CardDescription>
          Información sobre el cliente que se usará para generar emails con IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Próximamente...</p>
      </CardContent>
    </Card>
  );
}

function EmailAccountTab({ workspaceId }: { workspaceId: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cuenta de Email</CardTitle>
        <CardDescription>
          Configura la cuenta SMTP/IMAP desde donde se enviarán los emails
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Próximamente...</p>
      </CardContent>
    </Card>
  );
}
