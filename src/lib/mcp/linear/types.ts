/**
 * Linear data structure types
 */

export interface LinearTeam {
  id: string;
  name: string;
  key: string;
  description?: string;
}

export interface LinearProject {
  id: string;
  name: string;
  description?: string;
  state: string;
  teamIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LinearIssue {
  id: string;
  title: string;
  description?: string;
  teamId: string;
  projectId?: string;
  assigneeId?: string;
  priority?: number;
  state: {
    id: string;
    name: string;
    color?: string;
  };
  labels?: {
    id: string;
    name: string;
    color?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface LinearWorkflowState {
  id: string;
  name: string;
  color?: string;
  type: string;
  position: number;
  teamId: string;
}

export interface LinearLabel {
  id: string;
  name: string;
  color?: string;
  teamId: string;
}

/**
 * Request parameters for Linear API calls
 */

export interface CreateIssueParams {
  title: string;
  description?: string;
  teamId: string;
  assigneeId?: string;
  priority?: number;
  labels?: string[];
  status?: string;
  projectId?: string;
}

export interface UpdateIssueParams {
  issueId: string;
  title?: string;
  description?: string;
  status?: string;
  assigneeId?: string;
  priority?: number;
  labels?: string[];
  projectId?: string;
}

export interface ListIssuesParams {
  teamId?: string;
  assigneeId?: string;
  status?: string;
  first?: number;
}

export interface ListProjectsParams {
  teamId?: string;
  first?: number;
}

export interface ListWorkflowStatesParams {
  teamId: string;
}

export interface SearchIssuesParams {
  query: string;
  first?: number;
}