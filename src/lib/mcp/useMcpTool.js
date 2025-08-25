/**
 * @typedef {Object} McpClient
 * @property {function} useTool - Function to use an MCP tool
 */

/**
 * Utility function for using MCP tools
 *
 * @param {string} serverName - The name of the MCP server (e.g., 'linear-mcp')
 * @param {string} toolName - The name of the tool to use
 * @param {object} args - Arguments to pass to the tool
 * @returns {Promise<any>} - The response from the tool
 */
export async function useMcpTool(serverName, toolName, args) {
  try {
    // Check if the MCP client is available (in browser environment)
    if (typeof window !== 'undefined' && window.__mcp) {
      // @ts-ignore - TypeScript doesn't know about window.__mcp
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