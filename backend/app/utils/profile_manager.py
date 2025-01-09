"""
Chrome profile management module.
Handles browser profile saving, loading and management.
"""

import os
import json
import shutil
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

class ChromeProfileManager:
   """
   Manages Chrome browser profiles.
   Handles profile creation, deletion, and state management.
   """

   def __init__(self):
       """Initialize profile manager with configuration."""
       # 从配置中获取profiles_dir
       from ..config import Config
       self.profiles_dir = Config.PROFILES_DIR
       if not isinstance(self.profiles_dir, Path):
           self.profiles_dir = Path(self.profiles_dir)
       self.profiles_dir.mkdir(parents=True, exist_ok=True)
       self.state_file = self.profiles_dir / "profile_states.json"
       self.load_states()

   def load_states(self):
       """Load saved profile states."""
       try:
           if self.state_file.exists():
               with open(self.state_file, 'r', encoding='utf-8') as f:
                   self.states = json.load(f)
           else:
               self.states = {}
       except Exception as e:
           print(f"Error loading profile states: {e}")
           self.states = {}

   def save_states(self):
       """Save profile states to file."""
       try:
           with open(self.state_file, 'w', encoding='utf-8') as f:
               json.dump(self.states, f, indent=2)
       except Exception as e:
           print(f"Error saving profile states: {e}")

   def get_profile_path(self, profile_id: str) -> Path:
       """
       Get the path for a profile directory.

       Args:
           profile_id: Profile identifier

       Returns:
           Path: Profile directory path
       """
       return self.profiles_dir / f"profile_{profile_id}"

   def create_profile(self, profile_id: str) -> Path:
       """
       Create a new browser profile.

       Args:
           profile_id: Profile identifier

       Returns:
           Path: Path to created profile directory
       """
       profile_path = self.get_profile_path(profile_id)
       profile_path.mkdir(parents=True, exist_ok=True)
       
       self.states[profile_id] = {
           'created_at': datetime.now().isoformat(),
           'last_used': None,
           'url': None,
           'settings': {}
       }
       self.save_states()
       
       return profile_path

   def delete_profile(self, profile_id: str) -> bool:
       """
       Delete a browser profile.

       Args:
           profile_id: Profile identifier

       Returns:
           bool: True if profile was deleted successfully
       """
       try:
           profile_path = self.get_profile_path(profile_id)
           if profile_path.exists():
               shutil.rmtree(profile_path)
           
           if profile_id in self.states:
               del self.states[profile_id]
               self.save_states()
           
           return True
       except Exception as e:
           print(f"Error deleting profile {profile_id}: {e}")
           return False

   def save_profile(self, profile_id: str, profile_data: Dict[str, Any] = None) -> bool:
       """
       Save profile state and data.

       Args:
           profile_id: Profile identifier
           profile_data: Optional profile data to save

       Returns:
           bool: True if profile was saved successfully
       """
       try:
           if profile_id not in self.states:
               self.states[profile_id] = {
                   'created_at': datetime.now().isoformat(),
                   'last_used': None,
                   'url': None,
                   'settings': {}
               }
           
           self.states[profile_id].update({
               'last_used': datetime.now().isoformat(),
               'settings': profile_data or {}
           })
           
           self.save_states()
           return True
       except Exception as e:
           print(f"Error saving profile {profile_id}: {e}")
           return False

   def get_profile_info(self, profile_id: str) -> Optional[Dict[str, Any]]:
       """
       Get profile information.

       Args:
           profile_id: Profile identifier

       Returns:
           Optional[Dict[str, Any]]: Profile information if exists
       """
       return self.states.get(str(profile_id))

   def list_profiles(self) -> Dict[str, Any]:
       """
       Get list of all profiles.

       Returns:
           Dict[str, Any]: Dictionary of profile information
       """
       return self.states

   def clean_unused_profiles(self, max_age_days: int = 30) -> int:
       """
       Clean up profiles that haven't been used for specified time.

       Args:
           max_age_days: Maximum age in days for unused profiles

       Returns:
           int: Number of profiles cleaned
       """
       now = datetime.now()
       cleaned_count = 0
       
       for profile_id, info in list(self.states.items()):
           last_used = datetime.fromisoformat(info['last_used']) if info['last_used'] else None
           if last_used and (now - last_used).days > max_age_days:
               if self.delete_profile(profile_id):
                   cleaned_count += 1
       
       return cleaned_count
