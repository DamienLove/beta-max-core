from playwright.sync_api import sync_playwright, expect
import time

def run():
    print("Starting verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to app
        try:
            page.goto("http://localhost:5173")
            print("Navigated to http://localhost:5173")
        except Exception as e:
            print(f"Error navigating: {e}")
            return

        # Wait for auth screen
        try:
            page.wait_for_selector("text=Beta Max", timeout=5000)
            print("Auth screen loaded")
        except:
            print("Timeout waiting for 'Beta Max' text.")
            page.screenshot(path="verification/debug_timeout.png")
            browser.close()
            return

        # Test 1: Invalid Password
        print("Test 1: Attempting login with invalid password...")
        page.fill("#auth-email", "alex@test.com")
        page.fill("#auth-password", "wrongpassword")
        page.click("button[type='submit']")

        try:
            # Check for error message
            error_locator = page.locator("role=alert")
            expect(error_locator).to_contain_text("Invalid credentials")
            print("✅ Test 1 Passed: Error message displayed for invalid password")
        except Exception as e:
            print(f"❌ Test 1 Failed: {e}")
            page.screenshot(path="verification/failure_test1.png")

        # Test 2: Invalid Email
        print("Test 2: Attempting login with invalid email...")
        page.fill("#auth-email", "unknown@test.com")
        page.fill("#auth-password", "password") # Password doesn't matter here
        page.click("button[type='submit']")

        try:
            # Check for error message
            error_locator = page.locator("role=alert")
            expect(error_locator).to_contain_text("Invalid credentials")
            print("✅ Test 2 Passed: Error message displayed for invalid email")
        except Exception as e:
            print(f"❌ Test 2 Failed: {e}")
            page.screenshot(path="verification/failure_test2.png")

        # Test 3: Correct Credentials
        print("Test 3: Attempting login with correct credentials...")
        page.fill("#auth-email", "alex@test.com")
        page.fill("#auth-password", "password")
        page.click("button[type='submit']")

        try:
            # Wait for dashboard
            page.wait_for_selector("text=Dashboard", timeout=5000)
            print("✅ Test 3 Passed: Successfully logged in")
            page.screenshot(path="verification/success_login.png")
        except Exception as e:
            print(f"❌ Test 3 Failed: {e}")
            page.screenshot(path="verification/failure_test3.png")

        browser.close()

if __name__ == "__main__":
    run()
