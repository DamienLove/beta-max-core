from playwright.sync_api import sync_playwright

def verify_selectors():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # 1. Login
            print("Navigating to login...")
            page.goto("http://localhost:5173/")
            page.fill("#auth-email", "alex@test.com")
            page.fill("#auth-password", "password")
            page.click("button:has-text('Sign In')")

            # Wait for dashboard
            print("Waiting for dashboard...")
            page.wait_for_selector("text=Dashboard")

            # 2. Go to Feedback Form
            print("Navigating to feedback form...")
            page.click("button[aria-label='Add feedback']")

            # Wait for form
            print("Waiting for form...")
            page.wait_for_selector("text=Submit Feedback")

            # 3. Verify TypeSelector (Initially Bug is selected)
            bug_button = page.locator("button:has-text('Bug Report')")
            suggestion_button = page.locator("button:has-text('Suggestion')")

            print(f"Bug Button Role: {bug_button.get_attribute('role')}")
            print(f"Bug Button Checked: {bug_button.get_attribute('aria-checked')}")

            # 4. Verify Severity Selector (Visible when Bug is selected)
            print("Checking Severity Selector...")
            severity_group = page.locator("div[role='radiogroup'][aria-labelledby='severity-label']")
            # We wait for it to be attached
            severity_group.wait_for(state="attached")
            print(f"Severity Group found: True")

            critical_button = page.locator("button:has-text('Critical')")
            print(f"Critical Button Role: {critical_button.get_attribute('role')}")
            print(f"Critical Button Checked: {critical_button.get_attribute('aria-checked')}")

            # 5. Toggle to Suggestion
            print("Switching to Suggestion...")
            suggestion_button.click()
            print(f"Suggestion Button Checked after click: {suggestion_button.get_attribute('aria-checked')}")
            print(f"Bug Button Checked after click: {bug_button.get_attribute('aria-checked')}")

            # Verify Severity is gone
            print("Verifying Severity Selector is gone...")
            if severity_group.count() == 0 or not severity_group.is_visible():
                print("Severity Selector correctly hidden.")
            else:
                print("Warning: Severity Selector still visible.")

            # Take screenshot
            page.screenshot(path="verification/selectors_verification.png")
            print("Screenshot saved to verification/selectors_verification.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_selectors()
