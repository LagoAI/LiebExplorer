# File: leibrowser/browser/window_manager.py
"""
Window management module.
Handles browser window positioning, sizing, and zooming functionality.
"""

from selenium.webdriver import Chrome
from typing import Dict, Any, Tuple
import random
import time
from ..config import Config

class WindowManager:
    """
    Manages browser window positions, sizes, and zoom levels.
    Provides functionality for window manipulation and layout management.
    """

    @staticmethod
    def position_window(driver: Chrome, instance_id: int, randomize: bool = True) -> None:
        """
        Position a browser window in a grid layout.

        Args:
            driver: Selenium WebDriver instance
            instance_id: Instance identifier
            randomize: Whether to add random offset to position
        """
        # Calculate base window dimensions
        window_width = (Config.SCREEN_WIDTH // Config.GRID_COLS) - 4
        window_height = (Config.SCREEN_HEIGHT // Config.GRID_ROWS) - 4
        
        # Calculate grid position
        row = (instance_id - 1) // Config.GRID_COLS
        col = (instance_id - 1) % Config.GRID_COLS
        
        # Calculate window position
        x_pos = (col * Config.SCREEN_WIDTH // Config.GRID_COLS) + 2
        y_pos = (row * Config.SCREEN_HEIGHT // Config.GRID_ROWS) + 100 + 2
        
        if randomize:
            # Add small random offsets for more natural appearance
            x_pos += random.randint(-5, 5)
            y_pos += random.randint(-5, 5)
            window_width += random.randint(-10, 10)
            window_height += random.randint(-10, 10)
        
        # Set window position and size
        driver.set_window_position(x_pos, y_pos)
        driver.set_window_size(window_width, window_height)

    @staticmethod
    def set_zoom_level(driver: Chrome, zoom_level: float) -> None:
        """
        Set the zoom level for a browser window.

        Args:
            driver: Selenium WebDriver instance
            zoom_level: Zoom level percentage (25-200)
        """
        # Ensure zoom level is within valid range
        zoom_level = max(25, min(200, zoom_level))
        
        script = """
            // Set zoom using multiple methods for compatibility
            document.body.style.zoom = arguments[0] + '%';
            document.documentElement.style.setProperty('--zoom-level', arguments[0]/100);
            
            // Set transform origin for smooth zooming
            document.body.style.transformOrigin = 'top left';
            document.body.style.transform = 'scale(' + (arguments[0]/100) + ')';
            
            // Store zoom level for persistence
            window.__zoom_level = arguments[0];
        """
        driver.execute_script(script, zoom_level)

    @staticmethod
    def fit_content_to_window(driver: Chrome) -> float:
        """
        Calculate optimal zoom level to fit content to window.

        Args:
            driver: Selenium WebDriver instance

        Returns:
            Optimal zoom level percentage
        """
        script = """
            function fitToWindow() {
                // Get window dimensions
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                
                // Get content dimensions
                const contentWidth = document.documentElement.scrollWidth;
                const contentHeight = document.documentElement.scrollHeight;
                
                // Calculate optimal zoom ratio
                const widthRatio = windowWidth / contentWidth;
                const heightRatio = windowHeight / contentHeight;
                
                // Use the smaller ratio to ensure content fits
                // but limit to range [25%, 100%]
                const zoomRatio = Math.min(
                    Math.max(
                        Math.min(widthRatio, heightRatio, 1) * 100,
                        25
                    ),
                    100
                );
                
                return zoomRatio;
            }
            return fitToWindow();
        """
        return driver.execute_script(script)

    @staticmethod
    def focus_window(driver: Chrome) -> None:
        """
        Focus a browser window and bring it to front.

        Args:
            driver: Selenium WebDriver instance
        """
        script = """
            // Focus window and document
            window.focus();
            document.documentElement.focus();
            
            // Small window movement to force focus
            const x = window.screenX;
            const y = window.screenY;
            window.moveTo(x + 1, y);
            window.moveTo(x, y);
            
            // Ensure window is visible
            if (document.hidden) {
                window.focus();
            }
        """
        driver.execute_script(script)
        
        # Re-position window to ensure focus
        current_pos = driver.get_window_position()
        time.sleep(0.1)  # Small delay to prevent race conditions
        driver.set_window_position(current_pos['x'], current_pos['y'])

    @staticmethod
    def arrange_windows(drivers: Dict[int, Chrome]) -> None:
        """
        Rearrange all windows in a grid layout.

        Args:
            drivers: Dictionary mapping instance IDs to WebDriver instances
        """
        # Calculate optimal grid size
        num_windows = len(drivers)
        rows, cols = WindowManager._calculate_grid_size(num_windows)
        
        # Update configuration
        Config.GRID_ROWS = rows
        Config.GRID_COLS = cols
        
        # Reposition all windows
        for instance_id, driver in drivers.items():
            try:
                WindowManager.position_window(driver, instance_id)
                time.sleep(0.1)  # Small delay between repositioning
            except Exception:
                continue

    @staticmethod
    def _calculate_grid_size(num_windows: int) -> Tuple[int, int]:
        """
        Calculate optimal grid size for given number of windows.

        Args:
            num_windows: Number of windows to arrange

        Returns:
            Tuple of (rows, columns)
        """
        # Calculate aspect ratio of screen
        aspect_ratio = Config.SCREEN_WIDTH / Config.SCREEN_HEIGHT
        
        # Calculate ideal number of columns based on aspect ratio
        cols = round(((num_windows * aspect_ratio) ** 0.5))
        
        # Ensure at least 1 column
        cols = max(1, cols)
        
        # Calculate rows needed
        rows = (num_windows + cols - 1) // cols
        
        return rows, cols

    @staticmethod
    def get_window_state(driver: Chrome) -> Dict[str, Any]:
        """
        Get current window state information.

        Args:
            driver: Selenium WebDriver instance

        Returns:
            Dictionary containing window state information
        """
        return {
            'position': driver.get_window_position(),
            'size': driver.get_window_size(),
            'zoom_level': driver.execute_script('return window.__zoom_level || 100;'),
            'is_focused': driver.execute_script('return document.hasFocus();'),
            'is_maximized': WindowManager._is_window_maximized(driver)
        }

    @staticmethod
    def _is_window_maximized(driver: Chrome) -> bool:
        """
        Check if window is maximized.

        Args:
            driver: Selenium WebDriver instance

        Returns:
            Boolean indicating if window is maximized
        """
        window_size = driver.get_window_size()
        return (window_size['width'] >= Config.SCREEN_WIDTH - 20 and
                window_size['height'] >= Config.SCREEN_HEIGHT - 40)
