import os
import sys
import subprocess

# Define paths relative to this script's location
VENV_DIR = "venv"
REQUIREMENTS_FILE = "requirements.txt"
MAIN_SCRIPT = "main.py"

# Determine the correct python executable path based on OS
if sys.platform == "win32":
    VENV_PYTHON = os.path.join(VENV_DIR, "Scripts", "python.exe")
else:
    VENV_PYTHON = os.path.join(VENV_DIR, "bin", "python")

def run_command(command, cwd=None):
    """Runs a command, streams its output, and checks for errors."""
    print(f"--- Running: {' '.join(command)} ---")
    try:
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding='utf-8',
            errors='replace',
            cwd=cwd
        )
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                print(output.strip())
        
        rc = process.wait() # Use wait() to ensure process is finished before checking poll()
        if rc != 0:
            print(f"--- Command failed with exit code {rc} ---")
            sys.exit(rc) # Exit if a command fails
    except FileNotFoundError:
        print(f"--- Error: Command not found: {command[0]} ---")
        print("Please ensure Python is installed and in your system's PATH.")
        sys.exit(1)
    except Exception as e:
        print(f"--- An unexpected error occurred: {e} ---")
        sys.exit(1)

def main():
    """Main function to set up and run the backend server."""
    # Ensure the working directory is the script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    print(f"--- Working directory set to: {os.getcwd()} ---")

    # 1. Create virtual environment if it doesn't exist
    if not os.path.isdir(VENV_DIR):
        print(f"--- Virtual environment not found. Creating in '{VENV_DIR}'... ---")
        # Use the same Python that is running this script to create the venv
        run_command([sys.executable, "-m", "venv", VENV_DIR])
    else:
        print("--- Virtual environment already exists. ---")

    # 2. Install dependencies using the venv's pip
    print("--- Checking and installing dependencies... ---")
    run_command([VENV_PYTHON, "-m", "pip", "install", "-r", REQUIREMENTS_FILE])

    # 3. Start the main application
    print(f"--- Starting server: {MAIN_SCRIPT}... ---")
    run_command([VENV_PYTHON, MAIN_SCRIPT])

if __name__ == "__main__":
    main()
