/**
 * TypeScript interface for the MCP client
 */
interface McpClient {
  useTool: (serverName: string, toolName: string, args: any) => Promise<any>;
}

// Augment the Window interface
declare global {
  interface Window {
    __mcp?: McpClient;
  }
}

/**
 * Utility function for using MCP tools
 * 
 * @param serverName - The name of the MCP server (e.g., 'linear-mcp')
 * @param toolName - The name of the tool to use
 * @param args - Arguments to pass to the tool
 * @returns The response from the tool
 */
export async function useMcpTool(
  serverName: string, 
  toolName: string, 
  args: Record<string, any>
): Promise<any> {
  try {
    // Check if the MCP client is available (in browser environment)
    if (typeof window !== 'undefined' && window.__mcp) {
      const response = await window.__mcp.useTool(serverName, toolName, args);
      return response;
    } else {
      console.error('MCP client not available');
      throw new Error('MCP client not available');
    }
  } catch (error) {
    console.error(`Error using MCP tool ${serverName}.${toolName}:`, error);
    throw error;
  }
}