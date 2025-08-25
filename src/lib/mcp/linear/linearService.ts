import { useMcpTool } from '../useMcpTool';
import type {
  LinearTeam,
  LinearProject,
  LinearIssue,
  LinearWorkflowState,
  CreateIssueParams,
  UpdateIssueParams,
  ListIssuesParams,
  ListProjectsParams,
  ListWorkflowStatesParams,
  SearchIssuesParams
} from './types';

// MCP server name
const SERVER_NAME = 'linear-mcp';

/**
 * Service for interacting with Linear through MCP
 */
export class LinearService {
  /**
   * List all teams in the Linear workspace
   * @returns Array of teams
   */
  static async listTeams(): Promise<LinearTeam[]> {
    try {
      const response = await useMcpTool(SERVER_NAME, 'linear_list_teams', {});
      return response?.teams || [];
    } catch (error) {
      console.error('Failed to list Linear teams:', error);
      throw error;
    }
  }

  /**
   * List projects with optional filtering
   * @param params Parameters for listing projects
   * @returns Array of projects
   */
  static async listProjects(params: ListProjectsParams = {}): Promise<LinearProject[]> {
    try {
      const response = await useMcpTool(SERVER_NAME, 'linear_list_projects', params);
      return response?.projects || [];
    } catch (error) {
      console.error('Failed to list Linear projects:', error);
      throw error;
    }
  }

  /**
   * Create a new issue in Linear
   * @param params Parameters for creating an issue
   * @returns Created issue
   */
  static async createIssue(params: CreateIssueParams): Promise<LinearIssue> {
    try {
      const response = await useMcpTool(SERVER_NAME, 'linear_create_issue', params);
      return response?.issue;
    } catch (error) {
      console.error('Failed to create Linear issue:', error);
      throw error;
    }
  }

  /**
   * Update an existing issue in Linear
   * @param params Parameters for updating an issue
   * @returns Updated issue
   */
  static async updateIssue(params: UpdateIssueParams): Promise<LinearIssue> {
    try {
      const response = await useMcpTool(SERVER_NAME, 'linear_update_issue', params);
      return response?.issue;
    } catch (error) {
      console.error('Failed to update Linear issue:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about an issue
   * @param issueId ID of the issue to retrieve
   * @returns Issue details
   */
  static async getIssue(issueId: string): Promise<LinearIssue> {
    try {
      const response = await useMcpTool(SERVER_NAME, 'linear_get_issue', { issueId });
      return response?.issue;
    } catch (error) {
      console.error('Failed to get Linear issue:', error);
      throw error;
    }
  }

  /**
   * List issues with optional filtering
   * @param params Parameters for listing issues
   * @returns Array of issues
   */
  static async listIssues(params: ListIssuesParams = {}): Promise<LinearIssue[]> {
    try {
      const response = await useMcpTool(SERVER_NAME, 'linear_list_issues', params);
      return response?.issues || [];
    } catch (error) {
      console.error('Failed to list Linear issues:', error);
      throw error;
    }
  }

  /**
   * Search for issues based on a query
   * @param params Parameters for searching issues
   * @returns Array of matching issues
   */
  static async searchIssues(params: SearchIssuesParams): Promise<LinearIssue[]> {
    try {
      const response = await useMcpTool(SERVER_NAME, 'linear_search_issues', params);
      return response?.issues || [];
    } catch (error) {
      console.error('Failed to search Linear issues:', error);
      throw error;
    }
  }

  /**
   * List workflow states for a team
   * @param params Parameters for listing workflow states
   * @returns Array of workflow states
   */
  static async listWorkflowStates(params: ListWorkflowStatesParams): Promise<LinearWorkflowState[]> {
    try {
      const response = await useMcpTool(SERVER_NAME, 'linear_list_workflow_states', params);
      return response?.states || [];
    } catch (error) {
      console.error('Failed to list Linear workflow states:', error);
      throw error;
    }
  }
  
  /**
   * Create a new project in Linear
   * @param projectData Project data
   * @returns Created project
   */
  static async createProject(projectData: {
    name: string;
    description: string;
    teamIds: string[];
    state: string;
  }): Promise<LinearProject | null> {
    try {
      const response = await useMcpTool(SERVER_NAME, 'linear_create_project', projectData);
      return response?.project || null;
    } catch (error) {
      console.error('Failed to create Linear project:', error);
      throw error;
    }
  }

  /**
   * Map a Boardt status to a Linear status
   * @param boardtStatus Boardt status
   * @returns Corresponding Linear status
   */
  static mapBoardtStatusToLinear(boardtStatus: string): string {
    const statusMap: Record<string, string> = {
      'draft': 'Todo',
      'inProgress': 'In Progress', 
      'review': 'In Review',
      'completed': 'Done'
    };
    
    return statusMap[boardtStatus] || 'Todo';
  }

  /**
   * Map a Linear status to a Boardt status
   * @param linearStatus Linear status
   * @returns Corresponding Boardt status
   */
  static mapLinearStatusToBoardt(linearStatus: string): string {
    const statusMap: Record<string, string> = {
      'Todo': 'draft',
      'In Progress': 'inProgress',
      'In Review': 'review',
      'Done': 'completed'
    };
    
    return statusMap[linearStatus] || 'draft';
  }
}