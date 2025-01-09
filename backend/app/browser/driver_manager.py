"""
Chrome WebDriver manager module.
Handles browser instance creation, configuration, and management.
"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import os
import time
import random
from datetime import datetime
from pathlib import Path

from ..config import Config
from .fingerprint import FingerprintGenerator
from .stealth import StealthBrowser
from .window_manager import WindowManager

class ChromeDriverManager:
    def __init__(self):
        """Initialize ChromeDriverManager with necessary components."""
        self.fingerprints = {}
        # 延迟初始化 profile_manager 和 service
        self._profile_manager = None
        self._service = None

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
            self._service = Service(ChromeDriverManager().install())
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
            # Configure Chrome options
            options = self._get_chrome_options(instance_id, profile_name)
            
            # Create driver instance
            driver = webdriver.Chrome(service=self.service, options=options)
            
            # Apply stealth and fingerprint settings
            self._apply_stealth_settings(driver, instance_id)
            
            # Configure window
            self._configure_window(driver, instance_id)
            
            # Load profile if requested
            if load_profile:
                self._load_profile(driver, instance_id)
            
            return driver
            
        except Exception as e:
            raise Exception(f"Failed to create driver: {str(e)}")

    def _get_chrome_options(self, instance_id: int, profile_name: str = None) -> Options:
        """
        Configure Chrome options for a new instance.

        Args:
            instance_id: Instance identifier
            profile_name: Optional profile name

        Returns:
            Configured Chrome options
        """
        options = Options()
        
        # Set user profile directory
        profile_path = os.path.join(
            Config.PROFILES_DIR,
            profile_name or f"profile_{instance_id}"
        )
        options.add_argument(f'--user-data-dir={profile_path}')
        
        # Generate and store fingerprint
        fingerprint = FingerprintGenerator.generate()
        self.fingerprints[instance_id] = fingerprint
        
        # Apply fingerprint settings
        self._apply_fingerprint_options(options, fingerprint)
        
        # Security settings
        self._apply_security_settings(options)
        
        # Performance settings
        self._apply_performance_settings(options)
        
        return options

    def _apply_fingerprint_options(self, options: Options, fingerprint: dict):
        """
        Apply fingerprint settings to Chrome options.

        Args:
            options: Chrome options instance
            fingerprint: Browser fingerprint data
        """
        # Basic settings
        options.add_argument(f'--user-agent={fingerprint["user_agent"]}')
        options.add_argument(
            f'--window-size={fingerprint["screen_width"]},{fingerprint["screen_height"]}'
        )
        options.add_argument(f'--device-scale-factor={fingerprint["pixel_ratio"]}')
        
        # Language and locale
        options.add_argument(f'--lang={fingerprint["language"]}')
        options.add_argument(f'--timezone={fingerprint["timezone"]}')
        
        # Hardware settings
        options.add_argument(f'--js-flags=--memory-size={fingerprint["memory_size"]}')
        options.add_argument('--use-gl=' + fingerprint["webgl_vendor"])

    def _apply_security_settings(self, options: Options):
        """Apply security-related Chrome options."""
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option('excludeSwitches', ['enable-automation'])
        options.add_experimental_option('useAutomationExtension', False)
        
        if Config.ENCRYPT_PROFILES:
            options.add_argument('--password-store=basic')

    def _apply_performance_settings(self, options: Options):
        """Apply performance-related Chrome options."""
        options.add_argument('--disable-gpu')  # Disable GPU hardware acceleration
        options.add_argument('--disable-software-rasterizer')
        options.add_argument(f'--js-flags=--max-old-space-size={Config.MAX_MEMORY_PER_INSTANCE}')
        options.add_argument('--disable-dev-shm-usage')

    def _apply_stealth_settings(self, driver: webdriver.Chrome, instance_id: int):
        """
        Apply stealth settings to browser instance.

        Args:
            driver: Chrome WebDriver instance
            instance_id: Instance identifier
        """
        fingerprint = self.fingerprints.get(instance_id)
        if fingerprint:
            FingerprintGenerator.inject_fingerprint(driver, fingerprint)
            StealthBrowser.inject_stealth_js(driver)
        
        # Add random delays
        time.sleep(random.uniform(0.5, 1.5))

    def _configure_window(self, driver: webdriver.Chrome, instance_id: int):
        """
        Configure window position, size, and zoom level.

        Args:
            driver: Chrome WebDriver instance
            instance_id: Instance identifier
        """
        WindowManager.position_window(driver, instance_id)
        WindowManager.set_zoom_level(driver, Config.DEFAULT_ZOOM)

    def _load_profile(self, driver: webdriver.Chrome, instance_id: int):
        """
        Load saved profile settings if available.

        Args:
            driver: Chrome WebDriver instance
            instance_id: Instance identifier
        """
        profile_data = self.profile_manager.get_profile_info(instance_id)
        if profile_data:
            if profile_data.get('url') and profile_data['url'] != 'about:blank':
                driver.get(profile_data['url'])
            if profile_data.get('zoom_level'):
                WindowManager.set_zoom_level(driver, profile_data['zoom_level'])

    def get_instance_info(self, driver: webdriver.Chrome, instance_id: int) -> dict:
        """
        Get instance information.

        Args:
            driver: Chrome WebDriver instance
            instance_id: Instance identifier

        Returns:
            Dictionary containing instance information
        """
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
        except Exception:
            return {
                'id': instance_id,
                'status': 'error',
                'timestamp': datetime.now().isoformat()
            }

    def quit_driver(self, driver: webdriver.Chrome):
        """
        Safely quit a Chrome WebDriver instance.

        Args:
            driver: Chrome WebDriver instance to quit
        """
        try:
            # Save profile state before quitting
            if hasattr(driver, 'profile_path'):
                self.profile_manager.save_profile(driver.profile_path)
            
            # Quit driver
            driver.quit()
        except Exception:
            # Ignore errors during quit
            pass
