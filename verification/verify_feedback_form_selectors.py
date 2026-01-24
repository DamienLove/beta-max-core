from playwright.sync_api import sync_playwright

def verify_feedback_form_selectors():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        try:
            # Login
            print("Navigating to login...")
            page.goto("http://localhost:5173")

            print("Filling login form...")
            page.fill("#auth-email", "alex@test.com")
            page.fill("#auth-password", "password")
            page.click("button[type='submit']")

            # Wait for dashboard
            print("Waiting for dashboard...")
            # page.wait_for_url("**/#/") # This timed out
            page.wait_for_selector("text=Dashboard", timeout=5000)
            print("Dashboard loaded.")

            # Navigate to feedback form
            print("Navigating to feedback form...")
            page.goto("http://localhost:5173/#/feedback/new")

            # Wait for selectors
            print("Waiting for selectors...")
            page.wait_for_selector("#project-select")
            page.wait_for_selector("#version-select")

            # Check initial state
            initial_project = page.input_value("#project-select")
            print(f"Initial project: {initial_project}")

            # Change project
            print("Changing project...")
            page.select_option("#project-select", "p2")

            # Verify project changed
            new_project = page.input_value("#project-select")
            print(f"New project: {new_project}")

            # Wait a bit for React to update
            page.wait_for_timeout(500)

            version_value = page.input_value("#version-select")
            print(f"Version value: {version_value}")

            # Take screenshot
            page.screenshot(path="verification/feedback_form_selectors.png")
            print("Screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    verify_feedback_form_selectors()
