from playwright.sync_api import sync_playwright, expect
import sys
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        print("Navigating to http://localhost:3000")
        try:
            page.goto("http://localhost:3000")
        except Exception as e:
            print(f"Error navigating: {e}")
            sys.exit(1)

        # Wait for auth screen
        try:
            page.wait_for_selector("text=System Access Protocol", timeout=10000)
            print("Auth screen loaded.")
        except:
            print("Timeout waiting for Auth Screen.")
            page.screenshot(path="verification/debug_auth_timeout.png")
            sys.exit(1)

        # 1. Test Login with WRONG password
        print("Test 1: Attempting login with 'neo@betamax.io' and WRONG password...")
        page.fill("input[type='email']", "neo@betamax.io")
        page.fill("input[type='password']", "WRONG_PASSWORD_123")
        page.click("button[data-testid='login-submit-btn']")

        # We expect login to FAIL (show error message).
        # Currently (before fix), it will SUCCEED (show Dashboard).

        try:
            # Wait for error message
            error_locator = page.locator("text=Access denied. Invalid credentials.")
            expect(error_locator).to_be_visible(timeout=5000)
            print("PASS: Login correctly failed with wrong password.")
        except AssertionError:
            print("FAIL: Did not see invalid credentials error.")
            # Check if we logged in
            if page.locator("text=THE_DECK").is_visible():
                print("VULNERABILITY CONFIRMED: Logged in with wrong password!")
            else:
                print("State unknown.")

            page.screenshot(path="verification/auth_bypass_fail.png")
            # We exit with 1 because this script is meant to verify the FIX.
            # So initially it should fail.
            sys.exit(1)
        except Exception as e:
            print(f"Error waiting for message: {e}")
            sys.exit(1)

        # 2. Test Login with CORRECT password
        print("Test 2: Attempting login with 'neo@betamax.io' and CORRECT password...")

        # We need to refresh or clear state. Since we are on Auth screen (if Test 1 passed), we can just retry.
        # But let's reload to be clean.
        page.reload()
        page.wait_for_selector("text=System Access Protocol", timeout=5000)

        page.fill("input[type='email']", "neo@betamax.io")
        page.fill("input[type='password']", "test1234")
        page.click("button[data-testid='login-submit-btn']")

        try:
            expect(page.locator("text=THE_DECK")).to_be_visible(timeout=5000)
            print("PASS: Logged in with correct password.")
            page.screenshot(path="verification/login_success.png")
        except AssertionError:
            print("FAIL: Could not log in with correct password.")
            page.screenshot(path="verification/auth_correct_fail.png")
            sys.exit(1)

        browser.close()

if __name__ == "__main__":
    run()
