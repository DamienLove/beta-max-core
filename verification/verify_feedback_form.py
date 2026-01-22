
from playwright.sync_api import sync_playwright

def verify_feedback_form_rendering(page):
    # Navigate to the home page
    print("Navigating to http://localhost:5173")
    page.goto("http://localhost:5173")

    # Wait for the dashboard to load (look for "Dashboard" header)
    print("Waiting for Dashboard...")
    # It might be behind an auth screen. Let's check for Auth screen first.
    # Auth screen has "Beta Max" text.

    try:
        page.wait_for_selector("text=Beta Max", timeout=2000)
        print("Auth screen detected. Logging in...")
        page.fill("#auth-email", "alex@test.com")
        page.fill("#auth-password", "password") # Any password works in mock
        page.click("button[type='submit']")
        print("Login submitted.")
    except:
        print("No Auth screen detected, checking for Dashboard directly.")

    page.wait_for_selector("text=Dashboard", timeout=10000)
    print("Dashboard loaded.")

    # Click on the FAB to add feedback
    # The FAB has aria-label="Add feedback"
    print("Clicking Add Feedback button...")
    page.click("button[aria-label='Add feedback']")

    # Wait for the feedback form to load
    print("Waiting for Feedback Form...")
    page.wait_for_selector("text=Submit Feedback", timeout=5000)

    # Verify Project Select exists and is visible
    print("Checking Project Select...")
    project_select = page.locator("#project-select")
    if not project_select.is_visible():
        raise Exception("Project Select is not visible")

    # Verify Version Select exists and is visible
    print("Checking Version Select...")
    version_select = page.locator("#version-select")
    if not version_select.is_visible():
        raise Exception("Version Select is not visible")

    # Take a screenshot
    page.screenshot(path="verification/feedback_form.png")
    print("Screenshot taken: verification/feedback_form.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_feedback_form_rendering(page)
        except Exception as e:
            print(f"Error: {e}")
            # Take error screenshot
            page.screenshot(path="verification/error_state.png")
            print("Error screenshot taken: verification/error_state.png")
        finally:
            browser.close()
