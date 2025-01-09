# File: leibrowser/browser/fingerprint.py
"""
Browser fingerprint generation module.
Generates unique, realistic browser fingerprints to avoid detection.
"""

from typing import Dict, Any, Tuple, List
import random
from selenium.webdriver import Chrome

class FingerprintGenerator:
    """
    Browser fingerprint generator.
    Creates realistic browser identities to avoid detection.
    """
    
    # Platform configurations
    PLATFORMS: List[Tuple[str, List[str]]] = [
        ('Windows', ['10.0', '11.0']),  # Modern Windows versions
        ('Macintosh', ['10_15_7', '11_0_0', '12_0_0']),  # macOS versions
        ('X11', ['Linux x86_64', 'Ubuntu; Linux'])  # Linux versions
    ]
    
    # Screen resolutions
    RESOLUTIONS: List[Tuple[int, int]] = [
        (1920, 1080), (2560, 1440), (1680, 1050),  # Common resolutions
        (1440, 900), (1366, 768), (1280, 1024),    # Laptop resolutions
        (3840, 2160), (2560, 1600), (3440, 1440)   # High-end resolutions
    ]
    
    # Browser versions
    CHROME_VERSIONS: List[str] = [
        '120.0.0.0', '119.0.0.0', '118.0.0.0'
    ]
    
    # Common system fonts
    COMMON_FONTS: List[str] = [
        # Windows fonts
        "Arial", "Calibri", "Cambria", "Comic Sans MS", "Courier New",
        "Georgia", "Impact", "Times New Roman", "Trebuchet MS", "Verdana",
        # macOS fonts
        "Helvetica", "Helvetica Neue", "San Francisco", "Monaco", "Menlo",
        # Linux fonts
        "Ubuntu", "DejaVu Sans", "Liberation Sans", "FreeSans", "Droid Sans"
    ]
    
    # GPU configurations
    GPU_VENDORS = [
        {
            "vendor": "Intel",
            "renderer": "Intel Iris Xe Graphics",
            "version": "OpenGL ES 3.0"
        },
        {
            "vendor": "NVIDIA",
            "renderer": "NVIDIA GeForce RTX 3060",
            "version": "OpenGL ES 3.0"
        },
        {
            "vendor": "AMD",
            "renderer": "AMD Radeon RX 6700",
            "version": "OpenGL ES 3.0"
        }
    ]
    
    # Language and timezone configurations
    LANGUAGES = [
        'en-US', 'en-GB', 'en-CA',  # English variants
        'fr-FR', 'de-DE', 'es-ES',  # European languages
        'zh-CN', 'ja-JP', 'ko-KR'   # Asian languages
    ]
    
    TIMEZONES = [
        'America/New_York', 'America/Los_Angeles', 'America/Chicago',
        'Europe/London', 'Europe/Paris', 'Europe/Berlin',
        'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Singapore'
    ]

    @classmethod
    def generate(cls) -> Dict[str, Any]:
        """
        Generate a random browser fingerprint.
        
        Returns:
            Dict: Complete fingerprint information including platform, browser,
                 hardware, and locale settings.
        """
        # Select platform and version
        platform, os_versions = random.choice(cls.PLATFORMS)
        os_version = random.choice(os_versions)
        
        # Select display settings
        screen_width, screen_height = random.choice(cls.RESOLUTIONS)
        
        # Build fingerprint data
        fingerprint = {
            # System information
            "platform": platform,
            "os_version": os_version,
            "chrome_version": random.choice(cls.CHROME_VERSIONS),
            
            # Display settings
            "screen_width": screen_width,
            "screen_height": screen_height,
            "pixel_ratio": random.choice([1, 1.25, 1.5, 2]),
            "color_depth": 24,
            
            # Language and locale
            "language": random.choice(cls.LANGUAGES),
            "timezone": random.choice(cls.TIMEZONES),
            
            # Hardware specifications
            "memory_size": random.randint(4, 32) * 1024,
            "cpu_cores": random.choice([4, 6, 8, 12, 16]),
            "webgl_vendor": random.choice([
                'Intel Open Source Technology Center',
                'Google Inc.',
                'Apple Inc.'
            ]),
            
            # Additional features
            "fonts": random.sample(cls.COMMON_FONTS, random.randint(10, 20)),
            "gpu_info": random.choice(cls.GPU_VENDORS),
            "plugins": cls._generate_plugins(),
            "touch_points": random.choice([0, 2, 5, 10])
        }
        
        # Generate and add user agent
        fingerprint["user_agent"] = cls._generate_user_agent(
            platform, os_version, fingerprint["chrome_version"]
        )
        
        return fingerprint

    @staticmethod
    def _generate_user_agent(platform: str, os_version: str, 
                           chrome_version: str) -> str:
        """
        Generate a user agent string based on system information.
        
        Args:
            platform: Operating system platform
            os_version: OS version string
            chrome_version: Chrome version string
            
        Returns:
            str: Generated user agent string
        """
        base = "Mozilla/5.0"
        webkit = "AppleWebKit/537.36 (KHTML, like Gecko)"
        chrome = f"Chrome/{chrome_version} Safari/537.36"
        
        if platform == 'Windows':
            return f"{base} (Windows NT {os_version}) {webkit} {chrome}"
        elif platform == 'Macintosh':
            return f"{base} (Macintosh; Intel Mac OS X {os_version}) {webkit} {chrome}"
        else:  # X11
            return f"{base} ({os_version}) {webkit} {chrome}"

    @staticmethod
    def _generate_plugins() -> List[Dict[str, str]]:
        """
        Generate a list of browser plugins.
        
        Returns:
            List[Dict[str, str]]: List of plugin configurations
        """
        default_plugins = [
            {
                "name": "Chrome PDF Plugin",
                "filename": "internal-pdf-viewer",
                "description": "Portable Document Format"
            },
            {
                "name": "Chrome PDF Viewer",
                "filename": "mhjfbmdgcfjbbpaeojofohoefgiehjai",
                "description": "Chromium PDF Viewer"
            }
        ]
        
        return default_plugins

    @staticmethod
    def inject_fingerprint(driver: Chrome, fingerprint: Dict[str, Any]) -> None:
        """
        Inject fingerprint into browser instance.
        
        Args:
            driver: Selenium WebDriver instance
            fingerprint: Fingerprint data to inject
        """
        script = """
        (() => {
            const fingerprint = arguments[0];
            
            // Basic property overrides
            const overrides = {
                'navigator': {
                    'webdriver': undefined,
                    'userAgent': fingerprint.user_agent,
                    'language': fingerprint.language,
                    'languages': [fingerprint.language],
                    'platform': fingerprint.platform,
                    'hardwareConcurrency': fingerprint.cpu_cores,
                    'deviceMemory': Math.floor(fingerprint.memory_size / 1024),
                    'maxTouchPoints': fingerprint.touch_points
                },
                'screen': {
                    'width': fingerprint.screen_width,
                    'height': fingerprint.screen_height,
                    'colorDepth': fingerprint.color_depth,
                    'pixelDepth': fingerprint.color_depth,
                    'availWidth': fingerprint.screen_width,
                    'availHeight': fingerprint.screen_height,
                    'devicePixelRatio': fingerprint.pixel_ratio
                }
            };

            // Apply overrides
            for (const [objectKey, overrideObj] of Object.entries(overrides)) {
                for (const [key, value] of Object.entries(overrideObj)) {
                    try {
                        Object.defineProperty(window[objectKey], key, {
                            get: () => value,
                            configurable: true
                        });
                    } catch (e) {}
                }
            }
            
            // WebGL fingerprint override
            const getParameterProxy = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function(parameter) {
                // Override vendor-specific parameters
                const vendorSpecific = {
                    37445: fingerprint.gpu_info.vendor,    // UNMASKED_VENDOR_WEBGL
                    37446: fingerprint.gpu_info.renderer,  // UNMASKED_RENDERER_WEBGL
                    35661: fingerprint.gpu_info.version    // VERSION
                };
                
                if (parameter in vendorSpecific) {
                    return vendorSpecific[parameter];
                }
                return getParameterProxy.apply(this, arguments);
            };
            
            // Font fingerprint handling
            const fontCheck = document.createElement('canvas').getContext('2d');
            fontCheck.measureText = new Proxy(fontCheck.measureText, {
                apply: function(target, thisArg, argumentsList) {
                    const result = target.apply(thisArg, argumentsList);
                    if (thisArg.font) {
                        const fontFamily = thisArg.font.split(' ').pop();
                        if (!fingerprint.fonts.includes(fontFamily)) {
                            result.width *= 0.9;
                        }
                    }
                    return result;
                }
            });

            // Plugin override
            Object.defineProperty(navigator, 'plugins', {
                get: () => {
                    const plugins = [];
                    fingerprint.plugins.forEach(plugin => {
                        plugins.push({
                            name: plugin.name,
                            filename: plugin.filename,
                            description: plugin.description,
                            length: 1
                        });
                    });
                    return plugins;
                }
            });
            
        })();
        """
        driver.execute_script(script, fingerprint)
