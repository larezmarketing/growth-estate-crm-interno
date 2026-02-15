import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Mail, Sparkles, Play, Pause, Edit2 } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

export default function CampaignPage() {
  const params = useParams<{ workspaceId: string; campaignId: string }>();
  const workspaceId = parseInt(params.workspaceId);
  const campaignId = parseInt(params.campaignId);
  const [, setLocation] = useLocation();

  const { data: campaign, isLoading } = trpc.campaigns.getById.useQuery({ id: campaignId });
  const utils = trpc.useUtils();

  const updateStatus = trpc.campaigns.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Estado de campaña actualizado");
      utils.campaigns.getById.invalidate({ id: campaignId });
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar estado");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando campaña...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Campaña no encontrada</h2>
          <Button onClick={() => setLocation(`/workspace/${workspaceId}`)}>
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const handleActivate = () => {
    updateStatus.mutate({ id: campaignId, status: "active" });
  };

  const handlePause = () => {
    updateStatus.mutate({ id: campaignId, status: "paused" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => setLocation(`/workspace/${workspaceId}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Cliente
        </Button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{campaign.name}</h1>
            {campaign.description && (
              <p className="text-muted-foreground">{campaign.description}</p>
            )}
            <div className="flex items-center gap-3 mt-3">
              <Badge variant={
                campaign.status === 'active' ? 'default' :
                campaign.status === 'paused' ? 'secondary' :
                campaign.status === 'completed' ? 'outline' :
                'secondary'
              } className="capitalize">
                {campaign.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Intervalo: cada {campaign.sendInterval} días
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {campaign.status === 'draft' && (
              <Button onClick={handleActivate} disabled={updateStatus.isPending} className="gap-2">
                <Play className="w-4 h-4" />
                Activar Campaña
              </Button>
            )}
            {campaign.status === 'active' && (
              <Button onClick={handlePause} variant="outline" disabled={updateStatus.isPending} className="gap-2">
                <Pause className="w-4 h-4" />
                Pausar
              </Button>
            )}
            {campaign.status === 'paused' && (
              <Button onClick={handleActivate} disabled={updateStatus.isPending} className="gap-2">
                <Play className="w-4 h-4" />
                Reanudar
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="sequence" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sequence" className="gap-2">
              <Mail className="w-4 h-4" />
              Secuencia de Emails
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sequence">
            <EmailSequence emails={campaign.emails || []} campaignId={campaignId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface Email {
  id: number;
  sequenceNumber: number;
  subject: string;
  bodyHtml: string;
  bodyText: string | null;
  previewText: string | null;
}

function EmailSequence({ emails, campaignId }: { emails: Email[]; campaignId: number }) {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  if (emails.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Mail className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No hay emails en esta campaña</h3>
          <p className="text-muted-foreground text-center">
            Los emails se generarán automáticamente al crear la campaña
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Lista de emails en fila */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold mb-4">Secuencia de 10 Emails</h3>
        {emails.map((email) => (
          <Card
            key={email.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedEmail?.id === email.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedEmail(email)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      Email {email.sequenceNumber}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{email.subject}</CardTitle>
                  {email.previewText && (
                    <CardDescription className="mt-1 line-clamp-1">
                      {email.previewText}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Preview del email seleccionado */}
      <div className="lg:sticky lg:top-8 lg:self-start">
        {selectedEmail ? (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Email {selectedEmail.sequenceNumber}</Badge>
                    <Button variant="ghost" size="sm" className="gap-1 h-7">
                      <Edit2 className="w-3 h-3" />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 h-7">
                      <Sparkles className="w-3 h-3" />
                      Regenerar
                    </Button>
                  </div>
                  <CardTitle className="text-xl">{selectedEmail.subject}</CardTitle>
                  {selectedEmail.previewText && (
                    <CardDescription className="mt-1">
                      {selectedEmail.previewText}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div
                  className="border rounded-lg p-4 bg-white text-gray-900"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Mail className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-center">
                Selecciona un email para ver su contenido
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function useState<T>(initialValue: T): [T, (value: T) => void] {
  const [state, setState] = React.useState(initialValue);
  return [state, setState];
}

import React from "react";
