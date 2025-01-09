# File: leibrowser/browser/stealth.py
"""
Stealth browsing module.
Provides functionality for evading detection and simulating human behavior.
"""

from selenium.webdriver import Chrome
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from typing import Optional, Dict, Any, List, Callable
import random
import time
import asyncio
import math

class StealthBrowser:
    """
    Implements stealth browsing capabilities and human behavior simulation.
    """

    # Common referrers for simulating traffic sources
    REFERRERS = [
        'https://www.google.com/',
        'https://www.bing.com/',
        'https://duckduckgo.com/',
        'https://www.reddit.com/',
        'https://www.facebook.com/',
        None  # Sometimes no referrer
    ]

    @classmethod
    async def stealth_page_visit(cls, driver: Chrome, url: str, 
                                logger: Optional[Callable] = None) -> None:
        """
        Visit a webpage using stealth techniques.

        Args:
            driver: Selenium WebDriver instance
            url: URL to visit
            logger: Optional logging function
        """
        try:
            # Set random referrer
            if random.choice([True, False]):  # 50% chance to use referrer
                chosen_referrer = random.choice(cls.REFERRERS)
                if chosen_referrer:
                    driver.execute_script(
                        f'document.referrer = "{chosen_referrer}";'
                    )

            # Randomize page load timeout
            timeout = random.uniform(10, 20)
            driver.set_page_load_timeout(timeout)

            # Pre-visit mouse movement
            cls.simulate_human_mouse_movement(driver)
            await asyncio.sleep(random.uniform(0.5, 1.5))

            # Visit page
            driver.get(url)

            # Wait for page load with random timeout
            WebDriverWait(driver, timeout).until(
                lambda d: d.execute_script('return document.readyState') == 'complete'
            )

            # Post-load interaction
            await asyncio.sleep(random.uniform(1, 2))
            cls.simulate_human_scrolling(driver)

        except Exception as e:
            if logger:
                logger(f"Stealth page visit failed: {str(e)}")
            raise

    @staticmethod
    def simulate_human_mouse_movement(driver: Chrome) -> None:
        """
        Simulate natural mouse movements using Bézier curves.

        Args:
            driver: Selenium WebDriver instance
        """
        try:
            script = """
                function createBezierCurve(points, steps = 50) {
                    function pascalRow(n) {
                        let row = [1];
                        for (let k = 0; k < n; k++) {
                            row.push(row[k] * (n - k) / (k + 1));
                        }
                        return row;
                    }

                    const n = points.length - 1;
                    const combinations = pascalRow(n);
                    const curve = [];

                    for (let t = 0; t <= steps; t++) {
                        const t_normalized = t / steps;
                        let x = 0, y = 0;

                        for (let i = 0; i < points.length; i++) {
                            const coefficient = combinations[i] * 
                                Math.pow(t_normalized, i) * 
                                Math.pow(1 - t_normalized, n - i);
                            x += points[i].x * coefficient;
                            y += points[i].y * coefficient;
                        }

                        curve.push({x: Math.round(x), y: Math.round(y)});
                    }

                    return curve;
                }

                function simulateMouseMovement(points, delays) {
                    points.forEach((point, i) => {
                        setTimeout(() => {
                            const event = new MouseEvent('mousemove', {
                                view: window,
                                bubbles: true,
                                cancelable: true,
                                clientX: point.x,
                                clientY: point.y,
                                movementX: i > 0 ? point.x - points[i-1].x : 0,
                                movementY: i > 0 ? point.y - points[i-1].y : 0,
                                buttons: 0,
                                pressure: 0,
                                isTrusted: true
                            });
                            document.dispatchEvent(event);
                        }, delays[i]);
                    });
                }

                const viewport = {
                    width: window.innerWidth,
                    height: window.innerHeight
                };

                const numPoints = Math.floor(Math.random() * 3) + 3;  // 3-5 control points
                const controlPoints = Array.from({length: numPoints}, () => ({
                    x: Math.random() * viewport.width,
                    y: Math.random() * viewport.height
                }));

                const curvePoints = createBezierCurve(controlPoints);
                const delays = curvePoints.map((_, i) => 
                    Math.floor(i * (Math.random() * 20 + 20))
                );

                simulateMouseMovement(curvePoints, delays);
            """
            driver.execute_script(script)
            time.sleep(random.uniform(0.5, 1.0))  # Wait for animation to complete

        except Exception as e:
            print(f"Mouse movement simulation failed: {str(e)}")

    @staticmethod
    def simulate_human_scrolling(driver: Chrome) -> None:
        """
        Simulate natural scrolling behavior with variable speed and pauses.

        Args:
            driver: Selenium WebDriver instance
        """
        try:
            script = """
                function simulateReading() {
                    const maxScroll = Math.max(
                        document.body.scrollHeight,
                        document.documentElement.scrollHeight
                    );
                    
                    const config = {
                        baseSpeed: arguments[0],    // Base scrolling speed
                        variance: arguments[1],     // Speed variance
                        pauseProb: arguments[2],    // Probability of pausing
                        minPause: arguments[3],     // Minimum pause duration
                        maxPause: arguments[4]      // Maximum pause duration
                    };
                    
                    let currentScroll = window.pageYOffset;
                    
                    function scroll() {
                        if (currentScroll >= maxScroll) return;
                        
                        // Random speed variation
                        const speed = config.baseSpeed * 
                            (1 + (Math.random() - 0.5) * config.variance);
                        
                        // Calculate next scroll position
                        let nextScroll = currentScroll + speed;
                        nextScroll = Math.min(nextScroll, maxScroll);
                        
                        // Random pause
                        if (Math.random() < config.pauseProb) {
                            const pauseDuration = Math.random() * 
                                (config.maxPause - config.minPause) + 
                                config.minPause;
                            setTimeout(scroll, pauseDuration);
                            return;
                        }
                        
                        // Smooth scroll
                        window.scrollTo({
                            top: nextScroll,
                            behavior: 'smooth'
                        });
                        
                        currentScroll = nextScroll;
                        
                        // Continue scrolling
                        setTimeout(scroll, 50 + Math.random() * 100);
                    }
                    
                    scroll();
                }
            """
            
            # Configuration parameters
            config = {
                'baseSpeed': random.uniform(100, 300),  # pixels per scroll
                'variance': 0.4,                        # 40% speed variance
                'pauseProb': 0.2,                      # 20% chance to pause
                'minPause': 500,                       # 0.5s minimum pause
                'maxPause': 2000                       # 2s maximum pause
            }
            
            driver.execute_script(
                script,
                config['baseSpeed'],
                config['variance'],
                config['pauseProb'],
                config['minPause'],
                config['maxPause']
            )

        except Exception as e:
            print(f"Scrolling simulation failed: {str(e)}")

    @staticmethod
    def inject_stealth_js(driver: Chrome) -> None:
        """
        Inject stealth-related JavaScript code.

        Args:
            driver: Selenium WebDriver instance
        """
        script = """
            (() => {
                // Remove automation flags
                delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
                delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
                delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;

                // Override time-based functions
                const originalDate = Date;
                const originalGetTime = Date.prototype.getTime;
                const timeOffset = Math.floor(Math.random() * 1000);

                // Add random time offset
                Date = function(...args) {
                    if (args.length === 0) {
                        const date = new originalDate();
                        date.getTime = function() {
                            return originalGetTime.call(this) + timeOffset;
                        };
                        return date;
                    }
                    return new originalDate(...args);
                };

                // Override performance timing
                if (window.performance && window.performance.now) {
                    const originalNow = window.performance.now.bind(window.performance);
                    window.performance.now = function() {
                        return originalNow() + timeOffset;
                    };
                }

                // Override notification permissions
                const originalPermissions = window.Notification?.permission;
                Object.defineProperty(window.Notification || {}, 'permission', {
                    get: () => originalPermissions || 'default'
                });

                // Add plugins to appear more realistic
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [
                        {
                            description: "Portable Document Format",
                            filename: "internal-pdf-viewer",
                            name: "Chrome PDF Plugin"
                        }
                    ]
                });

                // Override permissions API
                const originalQuery = window.Permissions?.prototype.query;
                window.Permissions.prototype.query = function(queryObj) {
                    return Promise.resolve({
                        state: 'prompt',
                        onchange: null
                    });
                };
            })();
        """
        driver.execute_script(script)

    @staticmethod
    async def install_extension_async(driver: Chrome, url: str) -> None:
        """
        Install Chrome extension with human-like behavior.

        Args:
            driver: Chrome WebDriver instance
            url: Extension URL
        """
        script = """
            return new Promise((resolve, reject) => {
                function clickButton(text) {
                    for (let btn of document.querySelectorAll('div[role="button"]')) {
                        if (btn.textContent.includes(text) || 
                            btn.getAttribute('aria-label')?.includes(text)) {
                            btn.click();
                            return true;
                        }
                    }
                    return false;
                }
                
                // Click Install button with delay
                setTimeout(() => {
                    if (clickButton('Install')) {
                        // Click Add extension button after random delay
                        setTimeout(() => {
                            if (clickButton('Add')) {
                                resolve(true);
                            } else {
                                reject(new Error('Failed to find Add button'));
                            }
                        }, Math.random() * 1000 + 1000);
                    } else {
                        reject(new Error('Failed to find Install button'));
                    }
                }, Math.random() * 500 + 500);
            });
        """
        await driver.execute_async_script(script)
