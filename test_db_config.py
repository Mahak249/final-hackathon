import asyncio
import os
import sys

# Add the project directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

# Set a dummy Neon-like DATABASE_URL
os.environ["DATABASE_URL"] = "postgres://user:pass@ep-cool-frog-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"

from src.database import init_db

async def main():
    print("Attempting to connect to DB...")
    # This will fail to connect but we just want to verify the URL handling
    # We expect a connection error, not an import/config error
    try:
        await init_db()
        print("DB Connection Successful!")
    except Exception as e:
        print(f"DB Connection Attempted but Failed (expected with dummy creds): {e}")
        # Check if the error is about sqlalchemy.dialects:postgres meaning we didn't fix the URL
        if "Can't load plugin: sqlalchemy.dialects:postgres" in str(e):
             print("FAILURE: URL fix did not work, still using postgres://")
        else:
             print("SUCCESS: Config seems correct, failure due to bad credentials as expected.")

if __name__ == "__main__":
    asyncio.run(main())
