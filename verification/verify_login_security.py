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

        # TEST 1: WRONG PASSWORD
        print("\nTEST 1: Attempting login with WRONG password...")
        page.fill('data-testid=email-input', 'neo@betamax.io')
        page.fill('data-testid=password-input', 'WRONG_PASSWORD_123')
        page.click('data-testid=login-submit-btn')

        # Wait for result - expecting failure
        time.sleep(2)

        if page.locator('text=THE_DECK').is_visible():
            print("❌ FAILURE: Logged in with wrong password! Vulnerability still exists.")
            page.screenshot(path="verification/failed_fix_bypass.png")
            browser.close()
            return

        if page.locator('text=Access denied').is_visible():
            print("✅ SUCCESS: Login failed with wrong password.")
        else:
            print("⚠️ WARNING: Did not see 'Access denied' error, but also didn't login.")
            page.screenshot(path="verification/warning_unknown_state.png")

        # TEST 2: CORRECT PASSWORD
        print("\nTEST 2: Attempting login with CORRECT password...")
        # Clear fields? Or just overwrite.
        page.fill('data-testid=email-input', 'neo@betamax.io')
        page.fill('data-testid=password-input', 'test1234')
        page.click('data-testid=login-submit-btn')

        # Wait for dashboard
        try:
            page.wait_for_selector('text=THE_DECK', timeout=5000)
            print("✅ SUCCESS: Logged in with correct password.")
            page.screenshot(path="verification/success_login.png")
        except:
            print("❌ FAILURE: Could not log in with correct password.")
            page.screenshot(path="verification/failed_login_correct.png")

        browser.close()

if __name__ == "__main__":
    run()
