import os
import json
import time
import random
import psutil
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager as WebDriverManagerChrome

from ..browser.fingerprint import FingerprintGenerator
from ..browser.stealth import StealthBrowser
from ..browser.window_manager import WindowManager
from ..browser.driver_manager import ChromeDriverManager as CustomChromeDriverManager
class BrowserManager:

    def __init__(self):
        # 初始化目录和配置
        self.profiles_dir = "./chrome_profiles"
        self.state_file = "./chrome_states.json"
        if not os.path.exists(self.profiles_dir):
            os.makedirs(self.profiles_dir)

        # 强制英文输入
        os.environ['LANG'] = 'en_US.UTF-8'
        os.environ['LC_ALL'] = 'en_US.UTF-8'

        # 初始化状态和管理器
        self.chrome_processes = {}
        self.web_driver_manager = WebDriverManagerChrome()
        self.custom_driver_manager = CustomChromeDriverManager()
        self.load_saved_state()

    def load_saved_state(self):
        """加载保存的状态"""
        try:
            if os.path.exists(self.state_file):
                with open(self.state_file, 'r') as f:
                    self.saved_states = json.load(f)
            else:
                self.saved_states = {}
        except:
            self.saved_states = {}

    def save_state(self):
        """保存状态"""
        states = self.saved_states.copy() if hasattr(self, 'saved_states') else {}
        
        for instance_id, info in self.chrome_processes.items():
            try:
                driver = info['driver']
                current_url = driver.current_url
                saved_url = states.get(str(instance_id), {}).get('url', 'No history')
                url = current_url if current_url != 'about:blank' else saved_url
                
                states[str(instance_id)] = {
                    'url': url,
                    'profile': f"profile_{instance_id}",
                    'position': driver.get_window_position(),
                    'size': driver.get_window_size(),
                    'zoom_level': info.get('zoom_level', 100),
                    'fingerprint': info.get('fingerprint'),
                    'last_used': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }
            except Exception as e:
                print(f"Failed to save state for instance {instance_id}: {str(e)}")
                continue
        
        try:
            with open(self.state_file, 'w') as f:
                json.dump(states, f, indent=2)
            self.saved_states = states
        except Exception as e:
            print(f"Failed to write state file: {str(e)}")

    
    def create_instance(self, instance_id):
        """创建新的浏览器实例"""
        try:
            # 配置 Chrome 选项
            chrome_options = Options()
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            
            # 设置用户数据目录
            profile_path = os.path.join(self.profiles_dir, f"profile_{instance_id}")
            chrome_options.add_argument(f'--user-data-dir={profile_path}')

            # 创建 Chrome 驱动
            service = Service(executable_path=self.web_driver_manager.install())
            driver = webdriver.Chrome(service=service, options=chrome_options)

            # 应用指纹和隐身设置
            fingerprint = FingerprintGenerator.generate()
            FingerprintGenerator.inject_fingerprint(driver, fingerprint)
            StealthBrowser.inject_stealth_js(driver)

            # 设置窗口位置和大小
            WindowManager.position_window(driver, instance_id)

            # 保存实例信息
            self.chrome_processes[instance_id] = {
                'driver': driver,
                'status': 'running',
                'launch_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'fingerprint': fingerprint
            }

            return True
        except Exception as e:
            print(f"Failed to start instance {instance_id}: {str(e)}")
            try:
                if 'driver' in locals():
                    driver.quit()
            except:
                pass
            return False

    def delete_instance(self, instance_id):
        """删除浏览器实例"""
        if instance_id in self.chrome_processes:
            try:
                self.driver_manager.quit_driver(self.chrome_processes[instance_id]['driver'])
                del self.chrome_processes[instance_id]
                return True
            except Exception as e:
                print(f"Error stopping instance {instance_id}: {str(e)}")
        return False

    async def visit_url(self, instance_id, url):
        """访问URL"""
        if instance_id not in self.chrome_processes:
            return False
        
        try:
            driver = self.chrome_processes[instance_id]['driver']
            await StealthBrowser.stealth_page_visit(driver, url)
            return True
        except Exception as e:
            print(f"Failed to visit URL for instance {instance_id}: {str(e)}")
            return False

    def get_instance_info(self, instance_id):
        """获取实例信息"""
        if instance_id not in self.chrome_processes:
            return None

        info = self.chrome_processes[instance_id]
        try:
            return self.driver_manager.get_instance_info(
                info['driver'],
                instance_id
            )
        except Exception as e:
            print(f"Error getting instance info: {str(e)}")
            return None

    def get_all_instances(self):
        """获取所有实例信息"""
        instances = {}
        for instance_id in self.chrome_processes:
            info = self.get_instance_info(instance_id)
            if info:
                instances[instance_id] = info
        return instances

    def cleanup(self):
        """清理所有实例"""
        for instance_id in list(self.chrome_processes.keys()):
            self.delete_instance(instance_id)
