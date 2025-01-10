# File: backend/app/core/browser_manager.py
"""Browser instance management module."""

from typing import Dict, Optional
import asyncio
import os
import time
from loguru import logger
from selenium import webdriver
from selenium.common.exceptions import WebDriverException

from app.config import Config
from app.browser import (
    ChromeDriverManager,
    WindowManager,
    FingerprintGenerator,
    StealthBrowser
)

class BrowserManager:
    def __init__(self):
        """Initialize browser manager."""
        logger.info("Initializing BrowserManager")
        self.chrome_processes: Dict[str, webdriver.Chrome] = {}
        self.driver_manager = ChromeDriverManager()
        self._ensure_directories()
        logger.info("BrowserManager initialization completed")
        
    def _ensure_directories(self):
        """Ensure required directories exist."""
        try:
            logger.info("Setting up required directories")
            # Create necessary directories
            os.makedirs(Config.PROFILES_DIR, exist_ok=True)
            os.makedirs(Config.LOG_DIR, exist_ok=True)
            
            # Set proper permissions
            os.chmod(Config.PROFILES_DIR, 0o755)
            os.chmod(Config.LOG_DIR, 0o755)
            
            logger.info(f"Directory setup completed successfully\n"
                       f"Profiles dir: {Config.PROFILES_DIR}\n"
                       f"Logs dir: {Config.LOG_DIR}")
            
        except Exception as e:
            logger.error(f"Failed to setup directories: {str(e)}")
            raise

    def create_instance(self, instance_id: str) -> bool:
        """Create a new browser instance with retry mechanism."""
        logger.info(f"Starting creation of instance {instance_id}")
        try:
            # Log initial state
            logger.info(f"Current processes: {len(self.chrome_processes)}")
            logger.info(f"Profiles directory: {Config.PROFILES_DIR}")
            
            # Check if instance already exists
            if instance_id in self.chrome_processes:
                logger.warning(f"Instance {instance_id} already exists")
                return False
                
            # Create profile directory
            profile_dir = os.path.join(Config.PROFILES_DIR, f"profile_{instance_id}")
            os.makedirs(profile_dir, exist_ok=True)
            logger.info(f"Created/verified profile directory: {profile_dir}")
            
            # Create driver with retry logic
            max_retries = 3
            retry_delay = 1
            last_error = None
            
            for attempt in range(max_retries):
                logger.info(f"Attempt {attempt + 1}/{max_retries} to create instance {instance_id}")
                try:
                    # Important: Use time.sleep instead of asyncio.sleep
                    if attempt > 0:
                        logger.info(f"Waiting {retry_delay} seconds before retry")
                        time.sleep(retry_delay)
                
                    logger.info("Creating Chrome driver...")
                    driver = self.driver_manager.create_driver(
                        int(instance_id),
                        profile_name=f"profile_{instance_id}"
                    )
                    logger.info("Chrome driver created successfully")
                    
                    # Verify instance
                    logger.info("Verifying instance...")
                    if self._verify_instance(driver):
                        self.chrome_processes[instance_id] = driver
                        logger.info(f"Successfully created and verified instance {instance_id}")
                        return True
                    else:
                        logger.warning(f"Instance {instance_id} verification failed")
                        if driver:
                            try:
                                driver.quit()
                                logger.info("Successfully quit failed driver")
                            except Exception as e:
                                logger.warning(f"Failed to quit driver: {str(e)}")
                            
                except Exception as e:
                    last_error = e
                    logger.error(
                        f"Failed to create instance {instance_id} "
                        f"(attempt {attempt + 1}/{max_retries}): {str(e)}\n"
                        f"Error type: {type(e).__name__}"
                    )
                    retry_delay *= 2
                    continue
            
            if last_error:
                logger.error(
                    f"Failed to create instance after {max_retries} attempts.\n"
                    f"Last error: {str(last_error)}\n"
                    f"Error type: {type(last_error).__name__}"
                )
            return False
            
        except Exception as e:
            logger.error(
                f"Critical error creating instance {instance_id}:\n"
                f"Error: {str(e)}\n"
                f"Error type: {type(e).__name__}"
            )
            return False
            
    def _verify_instance(self, driver: webdriver.Chrome) -> bool:
        """Verify browser instance is working correctly."""
        try:
            logger.info("Starting instance verification...")
            
            # Basic checks
            if not driver:
                logger.error("Driver object is None")
                return False
                
            if not driver.current_url:
                logger.error("Driver has no current URL")
                return False
                
            # Test page load
            logger.info("Testing page load with about:blank")
            driver.get("about:blank")
            logger.info("Successfully loaded about:blank")
            
            # Test JavaScript execution
            logger.info("Testing JavaScript execution")
            result = driver.execute_script("return navigator.userAgent")
            if not result:
                logger.error("JavaScript execution returned no result")
                return False
                
            logger.info(f"JavaScript test successful, user agent: {result}")
            return True
            
        except Exception as e:
            logger.error(
                f"Instance verification failed:\n"
                f"Error: {str(e)}\n"
                f"Error type: {type(e).__name__}"
            )
            return False

    def delete_instance(self, instance_id: str) -> bool:
        """Delete a browser instance."""
        logger.info(f"Attempting to delete instance {instance_id}")
        try:
            driver = self.chrome_processes.get(instance_id)
            if not driver:
                logger.warning(f"Instance {instance_id} not found")
                return False
                
            # Graceful shutdown
            try:
                driver.quit()
                logger.info(f"Successfully quit driver for instance {instance_id}")
            except Exception as e:
                logger.warning(f"Error during driver quit: {str(e)}")
                
            # Clean up process
            del self.chrome_processes[instance_id]
            logger.info(f"Successfully deleted instance {instance_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting instance {instance_id}: {str(e)}")
            return False
            
    async def visit_url(self, instance_id: str, url: str) -> bool:
        """Control browser instance to visit URL."""
        logger.info(f"Attempting to visit URL {url} with instance {instance_id}")
        try:
            driver = self.chrome_processes.get(instance_id)
            if not driver:
                logger.warning(f"Instance {instance_id} not found")
                return False
                
            # Use stealth visit
            await StealthBrowser.stealth_page_visit(
                driver, 
                url,
                logger=logger.info
            )
            logger.info(f"Successfully visited URL: {url} with instance {instance_id}")
            return True
            
        except Exception as e:
            logger.error(
                f"Error visiting URL for instance {instance_id}:\n"
                f"URL: {url}\n"
                f"Error: {str(e)}"
            )
            return False

    def get_instance_info(self, instance_id: str) -> Optional[Dict]:
        """Get information about a browser instance."""
        logger.info(f"Getting info for instance {instance_id}")
        try:
            driver = self.chrome_processes.get(instance_id)
            if not driver:
                logger.warning(f"Instance {instance_id} not found")
                return None
                
            # Get instance info from driver
            try:
                info = {
                    'id': instance_id,
                    'status': 'running',
                    'url': driver.current_url,
                    'title': driver.title
                }
                logger.info(f"Retrieved basic info for instance {instance_id}")
            except Exception as e:
                logger.error(f"Failed to get basic instance info: {str(e)}")
                return None
            
            # Add window state
            try:
                window_state = WindowManager.get_window_state(driver)
                info['window_state'] = window_state
                logger.info("Successfully got window state")
            except Exception as e:
                logger.warning(f"Failed to get window state: {str(e)}")
                info['window_state'] = None
                
            return info
            
        except Exception as e:
            logger.error(f"Error getting instance info for {instance_id}: {str(e)}")
            return None

    def get_all_instances(self) -> Dict[str, Dict]:
        """Get information about all browser instances."""
        logger.info("Getting info for all instances")
        instances = {}
        for instance_id in list(self.chrome_processes.keys()):
            try:
                info = self.get_instance_info(instance_id)
                if info:
                    instances[instance_id] = info
                    logger.info(f"Retrieved info for instance {instance_id}")
            except Exception as e:
                logger.error(f"Error getting info for instance {instance_id}: {str(e)}")
                continue
        logger.info(f"Retrieved info for {len(instances)} instances")
        return instances

    def cleanup(self):
        """Clean up all instances."""
        logger.info(f"Starting cleanup of {len(self.chrome_processes)} instances")
        for instance_id in list(self.chrome_processes.keys()):
            try:
                success = self.delete_instance(instance_id)
                if success:
                    logger.info(f"Successfully cleaned up instance {instance_id}")
                else:
                    logger.warning(f"Failed to clean up instance {instance_id}")
            except Exception as e:
                logger.error(f"Error cleaning up instance {instance_id}: {str(e)}")
        logger.info("Completed browser instance cleanup")