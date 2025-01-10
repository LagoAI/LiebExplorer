# File: backend/app/browser/driver_manager.py
"""
Chrome WebDriver manager module.
Handles browser instance creation, configuration, and management.
"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager as WDManager
import os
import time
import random
import subprocess
from datetime import datetime
from pathlib import Path
from loguru import logger

from ..config import Config
from .fingerprint import FingerprintGenerator
from .stealth import StealthBrowser
from .window_manager import WindowManager

class ChromeDriverManager:
    def __init__(self):
        """Initialize ChromeDriverManager with necessary components."""
        self.fingerprints = {}
        self._profile_manager = None
        self._service = None
        self._check_chrome_version()

    def _check_chrome_version(self):
        """Check Chrome version"""
        try:
            chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
            result = subprocess.check_output([chrome_path, '--version'])
            version = result.decode('utf-8').strip().split()[-1]
            logger.info(f"Chrome version: {version}")
            return version
        except Exception as e:
            logger.warning(f"Unable to get Chrome version: {e}")
            return None

    @property
    def profile_manager(self):
        """Lazy initialization of profile manager"""
        if self._profile_manager is None:
            from ..utils.profile_manager import ChromeProfileManager
            self._profile_manager = ChromeProfileManager()
        return self._profile_manager

    @property
    def service(self):
        """Lazy initialization of ChromeDriver service"""
        if self._service is None:
            try:
                driver_path = WDManager().install()
                self._service = Service(driver_path)
                logger.info(f"ChromeDriver installed at: {driver_path}")
            except Exception as e:
                logger.error(f"Failed to initialize ChromeDriver service: {e}")
                raise
        return self._service

    def create_driver(self, instance_id: int, profile_name: str = None,
                     load_profile: bool = True) -> webdriver.Chrome:
        """
        Create a new Chrome WebDriver instance with custom configuration.

        Args:
            instance_id: Unique identifier for the browser instance
            profile_name: Optional name for the browser profile
            load_profile: Whether to load an existing profile

        Returns:
            Chrome WebDriver instance configured with custom settings
        """
        try:
            logger.info(f"Creating Chrome driver for instance {instance_id}")
            
            # Configure Chrome options
            options = self._get_chrome_options(instance_id, profile_name)
            
            # Create profile directory if needed
            profile_dir = os.path.join(Config.PROFILES_DIR, f"profile_{instance_id}")
            os.makedirs(profile_dir, exist_ok=True)
            
            # Create driver instance
            driver = webdriver.Chrome(service=self.service, options=options)
            logger.info("Chrome driver created successfully")
            
            # Configure window first
            self._configure_window(driver, instance_id)
            
            # Apply basic settings last
            if load_profile:
                self._load_profile(driver, instance_id)
            
            return driver
            
        except Exception as e:
            logger.error(f"Failed to create driver: {e}")
            raise Exception(f"Failed to create driver: {str(e)}")

    def _get_chrome_options(self, instance_id: int, profile_name: str = None) -> Options:
        """Configure Chrome options for a new instance."""
        try:
            options = Options()
            
            # Set up profile directory
            profile_path = os.path.join(
                Config.PROFILES_DIR,
                profile_name or f"profile_{instance_id}"
            )
            options.add_argument(f'--user-data-dir={profile_path}')
            logger.info(f"Using profile directory: {profile_path}")
            
            # Essential Chrome options
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--disable-extensions')
            options.add_argument('--disable-software-rasterizer')
            options.add_argument('--remote-debugging-port=0')
            options.add_argument(f'--js-flags=--max-old-space-size={Config.MAX_MEMORY_PER_INSTANCE}')
            
            # Automation settings
            options.add_experimental_option('excludeSwitches', ['enable-automation'])
            options.add_experimental_option('useAutomationExtension', False)
            options.add_experimental_option('w3c', True)
            
            # Generate fingerprint
            fingerprint = FingerprintGenerator.generate()
            self.fingerprints[instance_id] = fingerprint
            logger.info("Generated browser fingerprint")
            
            # Apply basic fingerprint settings only
            options.add_argument(f'--user-agent={fingerprint["user_agent"]}')
            options.add_argument(
                f'--window-size={fingerprint["screen_width"]},{fingerprint["screen_height"]}'
            )
            options.add_argument(f'--lang={fingerprint["language"]}')
            
            if Config.ENCRYPT_PROFILES:
                options.add_argument('--password-store=basic')
            
            return options
            
        except Exception as e:
            logger.error(f"Failed to configure Chrome options: {e}")
            raise

    def _configure_window(self, driver: webdriver.Chrome, instance_id: int):
        """Configure window position, size, and zoom level."""
        try:
            WindowManager.position_window(driver, instance_id)
            WindowManager.set_zoom_level(driver, Config.DEFAULT_ZOOM)
            logger.info("Configured window settings successfully")
            
        except Exception as e:
            logger.error(f"Failed to configure window: {e}")
            raise

    def _load_profile(self, driver: webdriver.Chrome, instance_id: int):
        """Load saved profile settings if available."""
        try:
            profile_data = self.profile_manager.get_profile_info(instance_id)
            if profile_data:
                if profile_data.get('url') and profile_data['url'] != 'about:blank':
                    driver.get(profile_data['url'])
                if profile_data.get('zoom_level'):
                    WindowManager.set_zoom_level(driver, profile_data['zoom_level'])
                logger.info("Loaded profile settings successfully")
                
        except Exception as e:
            logger.error(f"Failed to load profile: {e}")
            raise

    def get_instance_info(self, driver: webdriver.Chrome, instance_id: int) -> dict:
        """Get instance information."""
        try:
            return {
                'id': instance_id,
                'status': 'running',
                'url': driver.current_url,
                'title': driver.title,
                'fingerprint': self.fingerprints.get(instance_id, {}),
                'window_size': driver.get_window_size(),
                'window_position': driver.get_window_position(),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Failed to get instance info: {e}")
            return {
                'id': instance_id,
                'status': 'error',
                'timestamp': datetime.now().isoformat()
            }

    def quit_driver(self, driver: webdriver.Chrome):
        """Safely quit a Chrome WebDriver instance."""
        try:
            # Save profile state before quitting
            if hasattr(driver, 'profile_path'):
                self.profile_manager.save_profile(driver.profile_path)
            
            # Quit driver
            driver.quit()
            logger.info("Driver quit successfully")
            
        except Exception as e:
            logger.error(f"Failed to quit driver: {e}")
            pass  # Ignore errors during quit