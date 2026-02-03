from playwright.sync_api import sync_playwright, expect
import time

def run():
    print("Starting Auth Security Verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to app
        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000")
            page.wait_for_selector("text=System Access Protocol", timeout=5000)
            print("Auth screen loaded.")
        except Exception as e:
            print(f"Error navigating: {e}")
            page.screenshot(path="verification/error_nav.png")
            browser.close()
            return

        # Attempt 1: Wrong Password
        print("Attempting login with WRONG password...")
        page.fill("input[data-testid='email-input']", "neo@betamax.io")
        page.fill("input[data-testid='password-input']", "wrongpass")
        page.click("button[data-testid='login-submit-btn']")

        # Wait a bit for processing
        time.sleep(2)

        # Check for error message
        try:
            # We expect an error message. If we successfully logged in, we would see "THE_DECK" or dashboard elements.
            # Or we can check if the error message "Access denied" is visible.
            error_msg = page.locator("text=Access denied. Invalid credentials.")
            if error_msg.is_visible():
                print("PASS: Login failed with wrong password.")
                page.screenshot(path="verification/auth_failed.png")
            else:
                # Check if we logged in
                if page.locator("text=THE_DECK").is_visible():
                     print("FAIL: Logged in with wrong password! (VULNERABILITY CONFIRMED)")
                else:
                     print("UNKNOWN STATE: Neither error nor dashboard visible.")
                     page.screenshot(path="verification/unknown_state_wrong_pass.png")

        except Exception as e:
            print(f"Error checking wrong password attempt: {e}")

        # Reload to reset state
        page.reload()
        try:
            page.wait_for_selector("text=System Access Protocol", timeout=5000)
        except:
             # Try logout if we logged in by mistake
             if page.locator("text=THE_DECK").is_visible():
                  # Assuming there is no easy logout button reachable or I'd have to use it.
                  # But reload usually keeps session if it's persistent?
                  # App.jsx uses useState for 'user', so reload should clear it unless it's persisted (which it doesn't seem to be, it's just AppProvider state)
                  pass

        # Attempt 2: Correct Password
        print("Attempting login with CORRECT password...")
        page.fill("input[data-testid='email-input']", "neo@betamax.io")
        page.fill("input[data-testid='password-input']", "test1234")
        page.click("button[data-testid='login-submit-btn']")

        # Wait for dashboard
        try:
            page.wait_for_selector("text=THE_DECK", timeout=5000)
            print("PASS: Logged in with correct password.")
            page.screenshot(path="verification/auth_success.png")
        except:
            print("FAIL: Could not log in with correct password.")
            page.screenshot(path="verification/fail_correct_pass.png")

        browser.close()

if __name__ == "__main__":
    run()
