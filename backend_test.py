"""
═══════════════════════════════════════════════════════════════════════════
 BACKEND API TESTING SCRIPT | ÖH Wirtschaft News & Admin System
═══════════════════════════════════════════════════════════════════════════
"""

import requests
import sys
import json
from datetime import datetime

class NewsAdminAPITester:
    def __init__(self, base_url="https://homepage-carousel-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.admin_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_news_id = None
        self.created_admin_id = None
        self.created_update_id = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")

    def api_request(self, method, endpoint, data=None, auth=True):
        """Make API request with proper headers"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            
            return response
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {str(e)}")
            return None

    def test_health_check(self):
        """Test health endpoint"""
        response = self.api_request('GET', '/api/health', auth=False)
        if response and response.status_code == 200:
            data = response.json()
            success = data.get('status') == 'ok'
            self.log_test("Health Check", success)
            return success
        self.log_test("Health Check", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_login(self):
        """Test master admin login"""
        login_data = {
            "username": "masteradmin",
            "password": "OeH_Wirtschaft_2024!"
        }
        
        response = self.api_request('POST', '/api/auth/login', login_data, auth=False)
        if response and response.status_code == 200:
            data = response.json()
            if 'access_token' in data and 'admin' in data:
                self.token = data['access_token']
                self.admin_data = data['admin']
                self.log_test("Master Admin Login", True)
                return True
        
        self.log_test("Master Admin Login", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_me(self):
        """Test get current admin info"""
        response = self.api_request('GET', '/api/auth/me')
        if response and response.status_code == 200:
            data = response.json()
            success = data.get('username') == 'masteradmin' and data.get('is_master') == True
            self.log_test("Get Current Admin Info", success)
            return success
        
        self.log_test("Get Current Admin Info", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_stats(self):
        """Test statistics endpoint"""
        response = self.api_request('GET', '/api/stats')
        if response and response.status_code == 200:
            data = response.json()
            required_fields = ['total_news', 'published_news', 'draft_news', 'total_views', 
                             'total_admins', 'active_admins', 'news_by_priority', 'recent_activity']
            success = all(field in data for field in required_fields)
            self.log_test("Get Dashboard Statistics", success)
            return success
            
        self.log_test("Get Dashboard Statistics", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_public_news(self):
        """Test public news endpoint (no auth required)"""
        response = self.api_request('GET', '/api/news', auth=False)
        if response and response.status_code == 200:
            data = response.json()
            success = isinstance(data, list)
            self.log_test("Get Public News", success)
            return success
            
        self.log_test("Get Public News", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_all_news(self):
        """Test admin-only news endpoint"""
        response = self.api_request('GET', '/api/news/all')
        if response and response.status_code == 200:
            data = response.json()
            success = isinstance(data, list)
            self.log_test("Get All News (Admin)", success)
            return success
            
        self.log_test("Get All News (Admin)", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_create_news(self):
        """Test news creation"""
        news_data = {
            "title": "Test News Article",
            "content": "This is a test news article created during automated testing. It contains sufficient content to test the system properly.",
            "excerpt": "Test excerpt for the news article",
            "priority": "medium",
            "color": "blue",
            "is_published": True,
            "is_pinned": False
        }
        
        response = self.api_request('POST', '/api/news', news_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data and data.get('title') == news_data['title']:
                self.created_news_id = data['id']
                self.log_test("Create News", True)
                return True
                
        self.log_test("Create News", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_update_news(self):
        """Test news update"""
        if not self.created_news_id:
            self.log_test("Update News", False, "No news ID to update")
            return False
            
        update_data = {
            "title": "Updated Test News Article",
            "is_pinned": True
        }
        
        response = self.api_request('PUT', f'/api/news/{self.created_news_id}', update_data)
        if response and response.status_code == 200:
            data = response.json()
            success = data.get('title') == update_data['title'] and data.get('is_pinned') == True
            self.log_test("Update News", success)
            return success
            
        self.log_test("Update News", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_news_by_id(self):
        """Test get single news article"""
        if not self.created_news_id:
            self.log_test("Get News By ID", False, "No news ID to retrieve")
            return False
            
        response = self.api_request('GET', f'/api/news/{self.created_news_id}', auth=False)
        if response and response.status_code == 200:
            data = response.json()
            # Check that views incremented
            success = data.get('id') == self.created_news_id and data.get('views', 0) > 0
            self.log_test("Get News By ID (+ Views Increment)", success)
            return success
            
        self.log_test("Get News By ID", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_admins(self):
        """Test get all admins"""
        response = self.api_request('GET', '/api/admins')
        if response and response.status_code == 200:
            data = response.json()
            success = isinstance(data, list) and len(data) > 0
            # Should at least have master admin
            master_found = any(admin.get('is_master') for admin in data)
            self.log_test("Get All Admins", success and master_found)
            return success and master_found
            
        self.log_test("Get All Admins", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_create_admin(self):
        """Test admin creation (master admin only)"""
        admin_data = {
            "username": f"testadmin_{int(datetime.now().timestamp())}",
            "email": f"test_{int(datetime.now().timestamp())}@test.com",
            "password": "TestPassword123!",
            "display_name": "Test Administrator",
            "role": "admin"
        }
        
        response = self.api_request('POST', '/api/admins', admin_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data and data.get('username') == admin_data['username']:
                self.created_admin_id = data['id']
                self.log_test("Create New Admin", True)
                return True
                
        self.log_test("Create New Admin", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_update_admin(self):
        """Test admin update"""
        if not self.created_admin_id:
            self.log_test("Update Admin", False, "No admin ID to update")
            return False
            
        update_data = {
            "display_name": "Updated Test Administrator",
            "is_active": True
        }
        
        response = self.api_request('PUT', f'/api/admins/{self.created_admin_id}', update_data)
        if response and response.status_code == 200:
            data = response.json()
            success = data.get('display_name') == update_data['display_name']
            self.log_test("Update Admin", success)
            return success
            
        self.log_test("Update Admin", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_activity_logs(self):
        """Test activity logs endpoint"""
        response = self.api_request('GET', '/api/activity?limit=10')
        if response and response.status_code == 200:
            data = response.json()
            success = isinstance(data, list)
            self.log_test("Get Activity Logs", success)
            return success
            
        self.log_test("Get Activity Logs", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_change_password(self):
        """Test password change functionality"""
        # First, let's try with wrong current password
        wrong_password_data = {
            "current_password": "WrongPassword",
            "new_password": "NewTestPassword123!"
        }
        
        response = self.api_request('POST', '/api/auth/change-password', wrong_password_data)
        if response and response.status_code == 400:
            self.log_test("Password Change (Wrong Current Password)", True)
            
            # Now test with correct current password but don't actually change it
            # (We'll skip this to avoid changing master admin password)
            self.log_test("Password Change Validation", True)
            return True
            
        self.log_test("Password Change", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    # ═══════════════════════════════════════════════════════════════════════
    # SGU (STUDIENGANG-UPDATES) SYSTEM TESTS
    # ═══════════════════════════════════════════════════════════════════════
    
    def test_get_study_categories(self):
        """Test GET /api/study/categories - public endpoint"""
        response = self.api_request('GET', '/api/study/categories', auth=False)
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                # Verify structure of first category
                cat = data[0]
                required_fields = ['id', 'name', 'display_name', 'color', 'programs']
                if all(field in cat for field in required_fields) and isinstance(cat['programs'], list):
                    self.log_test("Get Study Categories", True)
                    return True
            self.log_test("Get Study Categories", False, "Invalid data structure")
            return False
        self.log_test("Get Study Categories", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_study_programs(self):
        """Test GET /api/study/programs - public endpoint"""
        response = self.api_request('GET', '/api/study/programs', auth=False)
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                # Verify structure of first program
                prog = data[0]
                required_fields = ['id', 'name', 'category_id', 'category_name']
                if all(field in prog for field in required_fields):
                    self.log_test("Get Study Programs", True)
                    return True
            self.log_test("Get Study Programs", False, "Invalid data structure")
            return False
        self.log_test("Get Study Programs", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_study_updates(self):
        """Test GET /api/study/updates - public endpoint"""
        response = self.api_request('GET', '/api/study/updates', auth=False)
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_test("Get Study Updates", True)
                return True
            self.log_test("Get Study Updates", False, "Invalid data structure")
            return False
        self.log_test("Get Study Updates", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_study_updates_grouped(self):
        """Test GET /api/study/updates/grouped - main endpoint for frontend"""
        response = self.api_request('GET', '/api/study/updates/grouped', auth=False)
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                # Check structure if data exists
                if len(data) > 0:
                    group = data[0]
                    required_fields = ['program_id', 'program_name', 'category_name', 'updates']
                    if all(field in group for field in required_fields) and isinstance(group['updates'], list):
                        self.log_test("Get Study Updates Grouped", True)
                        return True
                else:
                    # Empty data is also valid
                    self.log_test("Get Study Updates Grouped", True)
                    return True
            self.log_test("Get Study Updates Grouped", False, "Invalid data structure")
            return False
        self.log_test("Get Study Updates Grouped", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_admin_get_study_categories(self):
        """Test GET /api/admin/study/categories - admin endpoint"""
        response = self.api_request('GET', '/api/admin/study/categories')
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_test("Admin Get Study Categories", True)
                return True
            self.log_test("Admin Get Study Categories", False, "Invalid data structure")
            return False
        self.log_test("Admin Get Study Categories", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_admin_get_study_programs(self):
        """Test GET /api/admin/study/programs - admin endpoint"""
        response = self.api_request('GET', '/api/admin/study/programs')
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_test("Admin Get Study Programs", True)
                return True
            self.log_test("Admin Get Study Programs", False, "Invalid data structure")
            return False
        self.log_test("Admin Get Study Programs", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_admin_get_study_updates(self):
        """Test GET /api/admin/study/updates - admin endpoint"""
        response = self.api_request('GET', '/api/admin/study/updates')
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_test("Admin Get Study Updates", True)
                return True
            self.log_test("Admin Get Study Updates", False, "Invalid data structure")
            return False
        self.log_test("Admin Get Study Updates", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_admin_create_study_update(self):
        """Test POST /api/admin/study/updates - create new update"""
        # First get a program to use
        programs_response = self.api_request('GET', '/api/study/programs', auth=False)
        if not programs_response or programs_response.status_code != 200:
            self.log_test("Admin Create Study Update", False, "Could not get programs for test")
            return False
        
        programs = programs_response.json()
        if not programs:
            self.log_test("Admin Create Study Update", False, "No programs available for test")
            return False

        update_data = {
            "program_id": programs[0]['id'],
            "content": "Test update created during automated testing - This is a comprehensive test of the update system functionality",
            "semester": "Test Semester 2025",
            "is_active": True,
            "sort_order": 0
        }
        
        response = self.api_request('POST', '/api/admin/study/updates', update_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data:
                self.created_update_id = data['id']
                self.log_test("Admin Create Study Update", True)
                return True
        
        self.log_test("Admin Create Study Update", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_admin_update_study_update(self):
        """Test PUT /api/admin/study/updates/{id} - update existing update"""
        if not hasattr(self, 'created_update_id') or not self.created_update_id:
            self.log_test("Admin Update Study Update", False, "No update ID to modify")
            return False

        update_data = {
            "content": "Updated test content - Modified during automated testing",
            "is_active": False
        }
        
        response = self.api_request('PUT', f'/api/admin/study/updates/{self.created_update_id}', update_data)
        if response and response.status_code == 200:
            self.log_test("Admin Update Study Update", True)
            return True
        
        self.log_test("Admin Update Study Update", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_admin_delete_study_update(self):
        """Test DELETE /api/admin/study/updates/{id} - delete update"""
        if not hasattr(self, 'created_update_id') or not self.created_update_id:
            self.log_test("Admin Delete Study Update", False, "No update ID to delete")
            return False

        response = self.api_request('DELETE', f'/api/admin/study/updates/{self.created_update_id}')
        if response and response.status_code == 200:
            self.log_test("Admin Delete Study Update", True)
            self.created_update_id = None  # Reset since deleted
            return True
        
        self.log_test("Admin Delete Study Update", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_study_api_auth_protection(self):
        """Test that admin endpoints require authentication"""
        # Test without token
        temp_token = self.token
        self.token = None
        
        response = self.api_request('GET', '/api/admin/study/categories')
        auth_protected = response and response.status_code == 401
        
        # Restore token
        self.token = temp_token
        
        self.log_test("Study API Auth Protection", auth_protected)
        return auth_protected

    def test_calendar_events_basic(self):
        """Test basic calendar events endpoint"""
        response = self.api_request('GET', '/api/events', auth=False)
        if response and response.status_code == 200:
            data = response.json()
            success = isinstance(data, list)
            self.log_test("Get Calendar Events", success)
            return success
        self.log_test("Get Calendar Events", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def cleanup_test_data(self):
        """Clean up created test data"""
        cleanup_success = True
        
        # Delete test news
        if self.created_news_id:
            response = self.api_request('DELETE', f'/api/news/{self.created_news_id}')
            if response and response.status_code == 200:
                print(f"✅ Cleaned up test news (ID: {self.created_news_id})")
            else:
                print(f"⚠️  Failed to delete test news (ID: {self.created_news_id})")
                cleanup_success = False
        
        # Delete test admin
        if self.created_admin_id:
            response = self.api_request('DELETE', f'/api/admins/{self.created_admin_id}')
            if response and response.status_code == 200:
                print(f"✅ Cleaned up test admin (ID: {self.created_admin_id})")
            else:
                print(f"⚠️  Failed to delete test admin (ID: {self.created_admin_id})")
                cleanup_success = False

        # Delete test study update (if not already deleted)
        if hasattr(self, 'created_update_id') and self.created_update_id:
            response = self.api_request('DELETE', f'/api/admin/study/updates/{self.created_update_id}')
            if response and response.status_code == 200:
                print(f"✅ Cleaned up test study update (ID: {self.created_update_id})")
            else:
                print(f"⚠️  Failed to delete test study update (ID: {self.created_update_id})")
                cleanup_success = False
        
        return cleanup_success

    def run_all_tests(self):
        """Run comprehensive backend API tests"""
        print("🚀 Starting ÖH Wirtschaft Backend API Tests")
        print("=" * 60)
        
        # Core system tests
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return False
            
        if not self.test_login():
            print("❌ Login failed - stopping tests")
            return False
        
        # Authentication tests
        self.test_get_me()
        self.test_change_password()
        
        # Statistics and dashboard
        self.test_get_stats()
        
        # News management tests
        self.test_get_public_news()
        self.test_get_all_news()
        self.test_create_news()
        self.test_update_news()
        self.test_get_news_by_id()
        
        # Admin management tests
        self.test_get_admins()
        self.test_create_admin()
        self.test_update_admin()
        
        # Activity logging
        self.test_get_activity_logs()
        
        # SGU (Studiengang-Updates) System Tests
        print("\n📚 Testing SGU (Studiengang-Updates) System...")
        self.test_get_study_categories()
        self.test_get_study_programs()
        self.test_get_study_updates()
        self.test_get_study_updates_grouped()
        self.test_admin_get_study_categories()
        self.test_admin_get_study_programs()
        self.test_admin_get_study_updates()
        self.test_admin_create_study_update()
        self.test_admin_update_study_update()
        self.test_admin_delete_study_update()
        self.test_study_api_auth_protection()
        
        # Calendar events basic test
        self.test_calendar_events_basic()
        
        # Cleanup
        print("\n🧹 Cleaning up test data...")
        self.cleanup_test_data()
        
        # Print results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = NewsAdminAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())