from mcp.server.fastmcp import FastMCP

# Initialize the MCP Server
# We name it "TodoMCP" and allow it to manage todo resources
mcp = FastMCP("TodoMCP")

def get_mcp_server():
    return mcp

# Import tools to ensure they are registered
from . import tools
