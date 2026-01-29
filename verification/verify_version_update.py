from playwright.sync_api import sync_playwright, expect
import time

def verify_version_update(page):
    print("Navigating to app...")
    # 1. Login
    page.goto("http://localhost:5173/")

    print("Logging in...")
    # Wait for app to load
    page.get_by_label("Email Address").fill("alex@test.com")
    page.locator("#auth-password").fill("password")

    page.get_by_role("button", name="Sign In").click()

    # 2. Wait for dashboard
    expect(page.get_by_role("heading", name="Dashboard")).to_be_visible()
    print("Dashboard loaded.")

    # 3. Go to "Submit Feedback"
    page.get_by_label("Add feedback").click()

    # 4. Check initial state
    expect(page.get_by_text("Submit Feedback")).to_be_visible()
    print("Feedback form loaded.")

    # Check Project select value
    # <select id="project-select">
    expect(page.locator("#project-select")).to_have_value("p1")

    # Check Version select value
    expect(page.locator("#version-select")).to_have_value("4.2.0-beta")
    print("Initial version correct.")

    # 5. Change Project to "Titan OS Kernel" (p2)
    print("Changing project...")
    page.locator("#project-select").select_option(value="p2")

    # 6. Verify Version updated to "0.9.1-alpha" (current for p2)
    # This proves the synchronous update works.
    expect(page.locator("#version-select")).to_have_value("0.9.1-alpha")
    print("Version updated successfully!")

    # 7. Screenshot
    page.screenshot(path="verification/version_update.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_version_update(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()
