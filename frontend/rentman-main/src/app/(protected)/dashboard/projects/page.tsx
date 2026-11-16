"use client";

import React, { useEffect, useMemo, useState } from "react";
import { IconsComponent } from "@/components/common/icons.component";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { IProject } from "@/interfaces/project.interfaces";
import { createProject, deleteProject, fetchProjects, updateProject } from "@/services/projects.service";
import useAuthRequest from "@/lib/useAuthRequest";
import { appLogger } from "@/lib/logger";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addProject, removeProjectEntry, saveProjects, updateProjectEntry } from "@/redux/reducers/eventReducers";

type FormMode = "create" | "edit";

const ProjectsPage: React.FC = () => {
  useAuthRequest();

  const dispatch = useAppDispatch();
  const projects = useAppSelector(state => state.events.projects);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [activeProject, setActiveProject] = useState<IProject | null>(null);
  const [formName, setFormName] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<IProject | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProjects();
        if (!cancelled) {
          dispatch(saveProjects(Array.isArray(data) ? data : []));
        }
      } catch (error: any) {
        if (!cancelled) {
          appLogger.error("Failed to load projects", error);
          toast({
            variant: "destructive",
            title: "Projecten konden niet worden geladen",
            description: error?.response?.data?.message ?? "Probeer het later opnieuw."
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, [dispatch, toast]);

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return projects ?? [];
    }

    return (projects ?? []).filter(project => project.name?.toLowerCase().includes(term));
  }, [projects, searchTerm]);

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setActiveProject(null);
  };

  const openCreateDialog = () => {
    setFormMode("create");
    resetForm();
    setIsFormOpen(true);
  };

  const openEditDialog = (project: IProject) => {
    setFormMode("edit");
    setActiveProject(project);
    setFormName(project.name ?? "");
    setFormDescription(project.description ?? "");
    setIsFormOpen(true);
  };

  const closeFormDialog = () => {
    setIsFormOpen(false);
    setIsSaving(false);
  };

  const handleSaveProject = async () => {
    if (!formName.trim()) {
      toast({
        variant: "destructive",
        title: "Naam is verplicht",
        description: "Voer een projectnaam in om verder te gaan."
      });
      return;
    }

    setIsSaving(true);

    try {
      if (formMode === "create") {
        const created = await createProject({
          name: formName.trim(),
          description: formDescription.trim()
        });
        dispatch(addProject(created));
        toast({ title: "Project aangemaakt" });
      } else if (formMode === "edit" && activeProject) {
        const updated = await updateProject(activeProject.id, {
          name: formName.trim(),
          description: formDescription.trim()
        });
        dispatch(updateProjectEntry(updated));
        toast({ title: "Project bijgewerkt" });
      }

      closeFormDialog();
    } catch (error: any) {
      appLogger.error("Failed to save project", error);
      toast({
        variant: "destructive",
        title: formMode === "create" ? "Project aanmaken mislukt" : "Project bijwerken mislukt",
        description: error?.response?.data?.message ?? "Probeer het later opnieuw."
      });
      setIsSaving(false);
    }
  };

  const openDeleteDialog = (project: IProject) => {
    setDeleteTarget(project);
    setIsDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteOpen(false);
    setDeleteTarget(null);
    setIsDeleting(false);
  };

  const handleDeleteProject = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProject(deleteTarget.id);
      dispatch(removeProjectEntry(deleteTarget.id));
      toast({ title: "Project verwijderd" });
      closeDeleteDialog();
    } catch (error: any) {
      appLogger.error("Failed to delete project", error);
      toast({
        variant: "destructive",
        title: "Project verwijderen mislukt",
        description: error?.response?.data?.message ?? "Probeer het later opnieuw."
      });
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Projecten</h1>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nieuw project
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[220px]">
            <Input
              placeholder="Zoek op projectnaam..."
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center gap-2 text-gray-600">
            <IconsComponent.spinner className="h-6 w-6 animate-spin" />
            Projecten laden...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-sm font-medium text-gray-600">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Naam</th>
                  <th className="px-4 py-3">Beschrijving</th>
                  <th className="px-4 py-3 text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                      Geen projecten gevonden
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map(project => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 align-top text-gray-700">{project.id}</td>
                      <td className="px-4 py-3 align-top text-gray-900 font-medium">{project.name}</td>
                      <td className="px-4 py-3 align-top text-gray-600 whitespace-pre-line">{project.description}</td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(project)}
                            aria-label="Project bewerken"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(project)}
                            aria-label="Project verwijderen"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMode === "create" ? "Nieuw project" : "Project bewerken"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="project-name">
                Projectnaam
              </label>
              <Input
                id="project-name"
                value={formName}
                onChange={event => setFormName(event.target.value)}
                placeholder="Bijvoorbeeld: Nieuw marketingproject"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="project-description">
                Beschrijving
              </label>
              <Textarea
                id="project-description"
                value={formDescription}
                onChange={event => setFormDescription(event.target.value)}
                placeholder="Voeg een korte omschrijving toe"
                className="min-h-[120px]"
                disabled={isSaving}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  closeFormDialog();
                }}
                disabled={isSaving}
              >
                Annuleren
              </Button>
              <Button onClick={handleSaveProject} disabled={isSaving}>
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opslaan...
                  </span>
                ) : (
                  "Opslaan"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project verwijderen</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Weet je zeker dat je het project {deleteTarget ? <span className="font-semibold text-gray-800">{deleteTarget.name}</span> : 'dit project'} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
          </p>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={closeDeleteDialog} disabled={isDeleting}>
              Annuleren
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={isDeleting}>
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verwijderen...
                </span>
              ) : (
                "Verwijderen"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsPage;
