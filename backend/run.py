import os
import sys
import uvicorn

# Add backend directory to path for imports
sys.path.insert(0, r"C:\Users\cz 3\Desktop\phase-1\todo-app\backend")

os.chdir(r"C:\Users\cz 3\Desktop\phase-1\todo-app\backend\src")

if __name__ == "__main__":
    uvicorn.run("src.main:app", host="127.0.0.1", port=8000, reload=True)
