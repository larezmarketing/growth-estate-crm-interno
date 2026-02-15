import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Building2, Mail, Plus, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const { data: workspaces, isLoading } = trpc.workspaces.list.useQuery();

  // Auto-select first workspace if none selected
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !currentWorkspace) {
      const savedId = localStorage.getItem("currentWorkspaceId");
      const workspace = savedId 
        ? workspaces.find(w => w.id === parseInt(savedId))
        : workspaces[0];
      
      if (workspace) {
        setCurrentWorkspace(workspace);
      }
    }
  }, [workspaces, currentWorkspace, setCurrentWorkspace]);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Bienvenido, {user?.name}
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestiona tus clientes y campañas de email marketing
            </p>
          </div>
          <Link href="/workspaces/new">
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Nuevo Cliente
            </Button>
          </Link>
        </div>

        {workspaces && workspaces.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tienes clientes todavía</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Comienza agregando tu primer cliente para gestionar sus campañas de email marketing
              </p>
              <Link href="/workspaces/new">
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Agregar Primer Cliente
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces?.map((workspace) => (
              <Link key={workspace.id} href={`/workspace/${workspace.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{workspace.name}</CardTitle>
                          {workspace.industry && (
                            <CardDescription>{workspace.industry}</CardDescription>
                          )}
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground capitalize">
                        {workspace.role}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {workspace.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {workspace.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>0 campañas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>0% tasa</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
