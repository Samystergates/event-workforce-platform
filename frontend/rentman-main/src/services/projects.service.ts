import { axios } from "@/lib/axiosInstance";
import { IProject } from "@/interfaces/project.interfaces";

export const fetchProjects = async (): Promise<IProject[]> => {
  const response = await axios.get("/projects");
  return response.data ?? [];
};

export const createProject = async (payload: Omit<IProject, "id">): Promise<IProject> => {
  const response = await axios.post("/projects", payload);
  return response.data;
};

export const updateProject = async (id: number, payload: Omit<IProject, "id">): Promise<IProject> => {
  const response = await axios.put(`/projects/${id}`, payload);
  return response.data;
};

export const deleteProject = async (id: number): Promise<void> => {
  await axios.delete(`/projects/${id}`);
};
