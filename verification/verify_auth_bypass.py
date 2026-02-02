from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to app...")
        try:
            page.goto("http://localhost:3000", timeout=10000)
        except Exception as e:
            print(f"Failed to load page: {e}")
            return

        # Wait for loading animation (approx 3s according to memory/journal)
        print("Waiting for app to load...")
        try:
            page.wait_for_selector('data-testid=login-form', timeout=15000)
        except:
            print("Login form not found. Taking screenshot.")
            page.screenshot(path="verification/debug_load_fail.png")
            browser.close()
            return

        print("Attempting login with WRONG password...")
        # Login as Neo with WRONG password
        page.fill('data-testid=email-input', 'neo@betamax.io')
        page.fill('data-testid=password-input', 'WRONG_PASSWORD_123')

        # Click login
        page.click('data-testid=login-submit-btn')

        # Wait for result
        # If bypass exists, we expect to see the dashboard or "THE_DECK"
        # If fixed, we expect to see an error message

        try:
            # Check for dashboard element "THE_DECK" which is in Dashboard component
            print("Checking for successful login (Bypass)...")
            # Wait a bit for transition
            time.sleep(2)

            dashboard_header = page.locator('text=THE_DECK')
            if dashboard_header.is_visible():
                print("VULNERABILITY CONFIRMED: Logged in with wrong password!")
                page.screenshot(path="verification/bypass_success.png")
            else:
                # Maybe it takes longer?
                dashboard_header.wait_for(state='visible', timeout=5000)
                print("VULNERABILITY CONFIRMED: Logged in with wrong password!")
                page.screenshot(path="verification/bypass_success.png")

        except Exception as e:
            print("Login did not succeed (Dashboard not seen). checking for error...")
            # Take screenshot of failure
            page.screenshot(path="verification/bypass_failed.png")

            # Check for error message
            if page.locator('text=Access denied').is_visible():
                print("SAFE: Error message visible: Access denied")
            else:
                print(f"Unknown state. Error: {e}")

        browser.close()

if __name__ == "__main__":
    run()
