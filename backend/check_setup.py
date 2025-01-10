# File: backend/check_setup.py

import os
from pathlib import Path
from app.config import Config

def check_directories():
    """Check if required directories exist and have proper permissions."""
    directories = [
        ("Profiles Directory", Config.PROFILES_DIR),
        ("Logs Directory", Config.LOG_DIR),
    ]
    
    print("\nChecking directories...")
    for name, dir_path in directories:
        print(f"\nChecking {name}: {dir_path}")
        
        # Check existence
        if os.path.exists(dir_path):
            print("✓ Directory exists")
        else:
            print("✗ Directory does not exist")
            try:
                os.makedirs(dir_path)
                print("  → Created directory")
            except Exception as e:
                print(f"  → Failed to create directory: {e}")
                continue
        
        # Check permissions
        try:
            perms = oct(os.stat(dir_path).st_mode)[-3:]
            print(f"Current permissions: {perms}")
            if perms != '755':
                os.chmod(dir_path, 0o755)
                print("  → Updated permissions to 755")
        except Exception as e:
            print(f"✗ Failed to check/set permissions: {e}")
            
        # Check writability
        try:
            test_file = dir_path / '.test'
            test_file.touch()
            test_file.unlink()
            print("✓ Directory is writable")
        except Exception as e:
            print(f"✗ Directory is not writable: {e}")

if __name__ == "__main__":
    Config.initialize()
    check_directories()