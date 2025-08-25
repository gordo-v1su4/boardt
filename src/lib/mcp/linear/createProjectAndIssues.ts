import { LinearService } from './linearService';
import { linearConfig } from '$lib/stores/linearConfig.svelte.js';
import type { LinearProject, LinearIssue } from './types';

/**
 * Create a Linear project for Boardt with predefined issues
 * using BOA-XX-YYY naming convention
 */
export async function createBoardtProject(): Promise<LinearProject | null> {
  try {
    const config = linearConfig.getValue();
    if (!config.enabled || !config.teamId) {
      console.error('Linear is not properly configured');
      return null;
    }
    
    // Create the project
    const projectData = {
      name: 'Boardt Canvas Implementation',
      description: 'SvelteFlow-based canvas implementation for storyboard creation and editing',
      teamIds: [config.teamId],
      state: 'started'
    };
    
    const project = await LinearService.createProject(projectData);
    
    if (project) {
      console.log('Created Boardt project:', project.id);
      
      // Update the Linear config with the project ID
      linearConfig.setProjectId(project.id);
      
      // Create the predefined issues
      await createBoardtIssues(project.id);
      
      return project;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to create Boardt project:', error);
    return null;
  }
}

/**
 * Create predefined issues for Boardt project
 */
async function createBoardtIssues(projectId: string): Promise<void> {
  // Define the major tasks with their subtasks
  const tasks = [
    {
      major: {
        id: '07',
        title: 'SvelteFlow Canvas Setup',
        description: 'Set up the basic SvelteFlow canvas with nodes and edges'
      },
      subtasks: [
        {
          id: '001',
          title: 'Initialize SvelteFlow',
          description: 'Set up SvelteFlow with basic configuration',
          status: 'Done'
        },
        {
          id: '002',
          title: 'Create ChunkNode Component',
          description: 'Implement the custom node component for story chunks',
          status: 'Done'
        },
        {
          id: '003',
          title: 'Create ChunkEdge Component',
          description: 'Implement the custom edge component for connections',
          status: 'Done'
        },
        {
          id: '004',
          title: 'Implement Basic Interactions',
          description: 'Add node selection, dragging, and connecting',
          status: 'Done'
        }
      ]
    },
    {
      major: {
        id: '08',
        title: 'ChunkCreator Modal',
        description: 'Create the modal for adding new chunks to the canvas'
      },
      subtasks: [
        {
          id: '001',
          title: 'Design ChunkCreator UI',
          description: 'Design the user interface for creating new chunks',
          status: 'Done'
        },
        {
          id: '002',
          title: 'Implement Form Validation',
          description: 'Add validation for chunk creation form',
          status: 'Done'
        },
        {
          id: '003',
          title: 'Handle Chunk Types',
          description: 'Implement different chunk types (sequence, choice, keyframe)',
          status: 'Done'
        }
      ]
    },
    {
      major: {
        id: '09',
        title: 'Canvas Controls and UX',
        description: 'Implement canvas controls and improve user experience'
      },
      subtasks: [
        {
          id: '001',
          title: 'Add Zoom and Pan Controls',
          description: 'Implement zooming and panning functionality',
          status: 'Done'
        },
        {
          id: '002',
          title: 'Add Keyboard Shortcuts',
          description: 'Implement keyboard shortcuts for common actions',
          status: 'Done'
        },
        {
          id: '003',
          title: 'Implement Stats Panel',
          description: 'Add statistics panel for canvas information',
          status: 'Done'
        }
      ]
    },
    {
      major: {
        id: '10',
        title: 'Linear Integration',
        description: 'Integrate with Linear for task tracking'
      },
      subtasks: [
        {
          id: '001',
          title: 'Set Up Linear MCP Client',
          description: 'Configure Linear MCP client for API access',
          status: 'Done'
        },
        {
          id: '002',
          title: 'Implement Linear Configuration UI',
          description: 'Create UI for configuring Linear integration',
          status: 'Done'
        },
        {
          id: '003',
          title: 'Create Sync Service',
          description: 'Implement two-way synchronization with Linear',
          status: 'Done'
        },
        {
          id: '004',
          title: 'Add Linear Information to Nodes',
          description: 'Show Linear issue status in canvas nodes',
          status: 'Done'
        }
      ]
    },
    {
      major: {
        id: '11',
        title: 'Documentation',
        description: 'Create comprehensive documentation for the canvas implementation'
      },
      subtasks: [
        {
          id: '001',
          title: 'Document Canvas Implementation',
          description: 'Create documentation for SvelteFlow setup and configuration',
          status: 'Done'
        },
        {
          id: '002',
          title: 'Document Custom Components',
          description: 'Document ChunkNode and ChunkEdge components',
          status: 'Done'
        },
        {
          id: '003',
          title: 'Document ChunkCreator',
          description: 'Document the ChunkCreator component',
          status: 'Done'
        },
        {
          id: '004',
          title: 'Document Linear Integration',
          description: 'Document Linear API integration',
          status: 'Done'
        }
      ]
    }
  ];
  
  // Create all the issues
  for (const task of tasks) {
    // Create the major task
    const majorIssue = await createIssue({
      title: `BOA-${task.major.id}: ${task.major.title}`,
      description: task.major.description,
      projectId
    });
    
    // Create the subtasks
    if (majorIssue) {
      for (const subtask of task.subtasks) {
        const subtaskIssue = await createIssue({
          title: `BOA-${task.major.id}-${subtask.id}: ${subtask.title}`,
          description: subtask.description,
          projectId,
          parentId: majorIssue.id,
          status: subtask.status
        });
        
        // Log results
        if (subtaskIssue) {
          console.log(`Created subtask: BOA-${task.major.id}-${subtask.id}`);
        }
      }
      
      console.log(`Created major task: BOA-${task.major.id}`);
    }
  }
}

/**
 * Create a single Linear issue
 */
async function createIssue({
  title,
  description,
  projectId,
  parentId = undefined,
  status = 'Todo'
}: {
  title: string;
  description: string;
  projectId: string;
  parentId?: string;
  status?: string;
}): Promise<LinearIssue | null> {
  const config = linearConfig.getValue();
  
  try {
    const issueData = {
      title,
      description,
      teamId: config.teamId,
      projectId,
      status,
      parentId
    };
    
    const issue = await LinearService.createIssue(issueData);
    return issue;
  } catch (error) {
    console.error('Failed to create issue:', error);
    return null;
  }
}

// End of file