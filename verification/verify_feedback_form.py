import time
from playwright.sync_api import sync_playwright, expect, TimeoutError

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173/")

        # Login
        try:
            # Check if auth screen is present
            page.wait_for_selector("#auth-email", timeout=3000)
            print("Logging in...")
            page.fill("#auth-email", "alex@test.com")
            page.fill("#auth-password", "any")
            page.click("button:has-text('Sign In')")
        except TimeoutError:
            print("Already logged in or no auth screen (Timeout).")

        print("Waiting for Dashboard...")
        page.wait_for_selector("text=Dashboard")

        print("Navigating to Feedback Form...")
        page.click("button[aria-label='Add feedback']")

        print("Waiting for Feedback Form...")
        page.wait_for_selector("text=Submit Feedback")

        # Check Project Select
        print("Checking Project Select...")
        project_select = page.locator("#project-select")
        initial_project = project_select.input_value()
        print(f"Initial Project: {initial_project}")

        # Check Version Select
        print("Checking Version Select...")
        version_select = page.locator("#version-select")
        initial_version = version_select.input_value()
        print(f"Initial Version: {initial_version}")

        # Change Project
        # I know mock data: p1 (Neon Wallet) and p2 (Titan OS Kernel).
        new_project = "p2" if initial_project == "p1" else "p1"
        print(f"Changing Project to {new_project}...")
        project_select.select_option(new_project)

        # Verify Version updated
        # Wait for the version value to change from the initial value
        # This replaces the fragile time.sleep(1)
        print("Waiting for version update...")
        expect(version_select).not_to_have_value(initial_version, timeout=5000)

        new_version = version_select.input_value()
        print(f"New Version: {new_version}")

        if initial_project == "p1" and new_project == "p2":
            if "0.9.1" in new_version:
                 print("SUCCESS: Version updated correctly for p2.")
            else:
                 print(f"FAILURE: Version did not update correctly. Got {new_version}")
        elif initial_project == "p2" and new_project == "p1":
             if "4.2.0" in new_version or "4.1.5" in new_version:
                  print("SUCCESS: Version updated correctly for p1.")
             else:
                  print(f"FAILURE: Version did not update correctly. Got {new_version}")


        # Verify Typing in Title doesn't reset Project
        print("Typing in Title...")
        page.fill("#title-input", "Test Bug Title")
        # Give it a tiny moment to ensure any reactive effects would trigger (though we expect none)
        # We can't really "wait" for something NOT to happen, but we can verify state after action.
        page.wait_for_timeout(500)

        current_project = project_select.input_value()
        if current_project == new_project:
            print("SUCCESS: Project selection remained stable after typing.")
        else:
             print(f"FAILURE: Project selection reset to {current_project}!")

        page.screenshot(path="verification/feedback_form.png")
        browser.close()

if __name__ == "__main__":
    run()
