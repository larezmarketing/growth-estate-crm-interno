import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

export default function NewCampaign() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = parseInt(params.workspaceId);
  const [, setLocation] = useLocation();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sendInterval, setSendInterval] = useState(3);

  const utils = trpc.useUtils();
  const createCampaign = trpc.campaigns.create.useMutation({
    onSuccess: (data) => {
      toast.success("Campaña creada exitosamente con 10 emails generados por IA");
      utils.campaigns.list.invalidate();
      setLocation(`/workspace/${workspaceId}/campaigns/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear campaña");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("El nombre de la campaña es requerido");
      return;
    }
    
    createCampaign.mutate({
      workspaceId,
      name: name.trim(),
      description: description.trim() || undefined,
      sendInterval,
      generateEmails: true,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-2xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => setLocation(`/workspace/${workspaceId}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">Nueva Campaña con IA</CardTitle>
                <CardDescription>
                  Genera automáticamente 10 emails personalizados usando inteligencia artificial
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Campaña *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Lanzamiento de Producto Q1 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el objetivo de esta campaña"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interval">Intervalo de Envío (días)</Label>
                <Input
                  id="interval"
                  type="number"
                  min="1"
                  max="30"
                  value={sendInterval}
                  onChange={(e) => setSendInterval(parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Los emails se enviarán cada {sendInterval} {sendInterval === 1 ? 'día' : 'días'}
                </p>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Generación con IA</h4>
                    <p className="text-sm text-muted-foreground">
                      La IA generará una secuencia de 10 emails basándose en la base de conocimiento de tu cliente,
                      incluyendo asuntos, contenido HTML y llamados a la acción optimizados.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation(`/workspace/${workspaceId}`)}
                  className="flex-1"
                  disabled={createCampaign.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createCampaign.isPending}
                  className="flex-1 gap-2"
                >
                  {createCampaign.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generando con IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Crear Campaña
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
