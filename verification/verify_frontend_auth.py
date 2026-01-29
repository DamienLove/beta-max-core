from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to login page...")
        page.goto("http://localhost:5173")

        # Take screenshot of login page
        page.screenshot(path="verification/login_page.png")
        print("Captured login_page.png")

        # Test valid login
        print("Attempting valid login...")
        page.fill("#auth-email", "alex@test.com")
        page.fill("#auth-password", "test1234")
        page.click("button[type='submit']")

        # Wait for dashboard
        page.wait_for_selector("text=Dashboard", timeout=5000)

        # Take screenshot of dashboard
        page.screenshot(path="verification/dashboard_after_login.png")
        print("Captured dashboard_after_login.png")

        browser.close()

if __name__ == "__main__":
    verify_frontend()
