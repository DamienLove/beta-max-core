from playwright.sync_api import sync_playwright, expect
import time

def run():
    print("Starting Login Security Verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to app
        try:
            page.goto("http://localhost:3000")
        except Exception as e:
            print(f"Error navigating: {e}")
            return

        # Wait for auth screen
        try:
            # Wait for preloader to disappear or auth screen to appear
            # Increasing timeout to 15s because of preloader delay
            page.wait_for_selector("[data-testid='email-input']", timeout=15000)
        except:
            print("Timeout waiting for email input. App might not be running or preloader stuck.")
            page.screenshot(path="verification/debug_timeout.png")
            browser.close()
            return

        print("App loaded. Testing scenarios...")

        # Scenario 1: Wrong Password
        print("Scenario 1: Testing Wrong Password...")
        # Using correct selectors from App.jsx
        page.fill("[data-testid='email-input']", "neo@betamax.io")
        page.fill("[data-testid='password-input']", "wrongpass")
        page.click("[data-testid='login-submit-btn']")

        # Wait a bit for potential async login (simulating real network if needed, or local async)
        # The app has a 800ms delay
        time.sleep(2)

        # Expect to stay on login screen or see error
        # If login succeeded, we would see "THE_DECK" (Dashboard title)
        if page.is_visible("text=THE_DECK"):
            print("❌ FAILURE: Logged in with wrong password! (Vulnerability confirmed)")
        else:
            # Check for error message
            error_visible = page.is_visible("text=Access denied")
            if error_visible:
                 print("✅ SUCCESS: Login failed as expected for wrong password.")
                 page.screenshot(path="verification/login_failed.png")
            else:
                 print("⚠️ WARNING: Login failed but no error message found?")

        # Scenario 2: Correct Password (if we didn't login yet)
        if not page.is_visible("text=THE_DECK"):
            print("Scenario 2: Testing Correct Password...")
            # Clear fields might be needed if not cleared
            page.fill("[data-testid='email-input']", "neo@betamax.io")
            # We will set 'test1234' as the correct password in our fix
            page.fill("[data-testid='password-input']", "test1234")
            page.click("[data-testid='login-submit-btn']")

            # Wait for navigation
            try:
                page.wait_for_selector("text=THE_DECK", timeout=5000)
                print("✅ SUCCESS: Logged in with correct password.")
                page.screenshot(path="verification/login_success.png")
            except:
                print("❌ FAILURE: Could not log in with correct password.")

        browser.close()
    print("Verification complete.")

if __name__ == "__main__":
    run()
