@echo off
echo Running text extraction...
echo.

REM Check if Python is available
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH
    exit /b 1
)

REM Run the extraction script with all arguments passed to this batch file
python "%~dp0text_extraction.py" %*

REM Check if the script ran successfully
if %ERRORLEVEL% NEQ 0 (
    echo Failed to run text extraction script.
    exit /b %ERRORLEVEL%
)

echo.
echo Text extraction completed successfully.
exit /b 0 