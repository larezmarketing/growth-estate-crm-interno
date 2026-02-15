import React, { createContext, useContext, useState, useEffect } from "react";

interface Workspace {
  id: number;
  name: string;
  description?: string | null;
  industry?: string | null;
  logoUrl?: string | null;
  role?: "admin" | "editor" | "viewer";
  userRole?: "admin" | "editor" | "viewer";
  createdAt: Date;
  updatedAt: Date;
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);

  // Load workspace from localStorage on mount
  useEffect(() => {
    const savedWorkspaceId = localStorage.getItem("currentWorkspaceId");
    if (savedWorkspaceId) {
      // Workspace will be loaded when the component fetches workspaces
    }
  }, []);

  const setCurrentWorkspace = (workspace: Workspace | null) => {
    setCurrentWorkspaceState(workspace);
    if (workspace) {
      localStorage.setItem("currentWorkspaceId", workspace.id.toString());
    } else {
      localStorage.removeItem("currentWorkspaceId");
    }
  };

  return (
    <WorkspaceContext.Provider value={{ currentWorkspace, setCurrentWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
