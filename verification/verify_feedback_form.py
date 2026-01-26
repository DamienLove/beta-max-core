import time
from playwright.sync_api import sync_playwright

def run():
    """
    Run an end-to-end Playwright verification of the feedback form in the local app.
    
    Performs a full UI check against http://localhost:5173: optionally authenticates if an auth screen appears, opens the Submit Feedback form, reads the project and version select values, switches the project selection and verifies the version updates to the expected mapping, types into the title input and verifies the project selection remains stable, saves a screenshot to verification/feedback_form.png, and prints success/failure diagnostics to stdout.
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173/")

        # Login
        try:
            if page.wait_for_selector("#auth-email", timeout=3000):
                print("Logging in...")
                page.fill("#auth-email", "alex@test.com")
                page.fill("#auth-password", "any")
                page.click("button:has-text('Sign In')")
        except:
            print("Already logged in or no auth screen.")

        print("Waiting for Dashboard...")
        page.wait_for_selector("text=Dashboard")

        print("Navigating to Feedback Form...")
        # There is a + button in the bottom nav or a "Submit Feedback" link?
        # In Dashboard, there is no direct link except maybe via FAB in ProjectDetail or bottom nav.
        # NavigationWrapper has a FAB for '/feedback/new'.
        # It has aria-label="Add feedback".
        # Note: The bottom nav might be covered or off screen? No, fixed position.
        # Use aria-label to find the button.
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
        # Find another project ID.
        # I know mock data: p1 (Neon Wallet) and p2 (Titan OS Kernel).
        new_project = "p2" if initial_project == "p1" else "p1"
        print(f"Changing Project to {new_project}...")
        project_select.select_option(new_project)

        # Verify Version updated
        # p1 has versions 4.2.0-beta, 4.1.5-alpha
        # p2 has version 0.9.1-alpha

        time.sleep(1) # Wait for react update
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
        time.sleep(0.5)

        current_project = project_select.input_value()
        if current_project == new_project:
            print("SUCCESS: Project selection remained stable after typing.")
        else:
             print(f"FAILURE: Project selection reset to {current_project}!")

        page.screenshot(path="verification/feedback_form.png")
        browser.close()

if __name__ == "__main__":
    run()