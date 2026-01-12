@echo off
cd /d %~dp0src
set PYTHONPATH=%~dp0
..\venv\Scripts\python.exe main.py
