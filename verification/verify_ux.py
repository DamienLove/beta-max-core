from playwright.sync_api import sync_playwright, expect
import time

def verify_ux():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Navigate to app
        print("Navigating to app...")
        try:
            page.goto("http://localhost:5173", timeout=10000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            return

        # Login
        print("Logging in...")
        page.fill("#auth-email", "alex@test.com")
        page.fill("#auth-password", "password")
        page.click("button[type='submit']")

        # Wait for dashboard
        page.wait_for_url("http://localhost:5173/")
        expect(page.get_by_role("heading", name="Dashboard")).to_be_visible()

        # Check Icon accessibility on Dashboard
        dashboard_icons = page.get_by_text("dashboard", exact=True)
        count = dashboard_icons.count()
        print(f"Found {count} elements with exact text 'dashboard'")

        for i in range(count):
            icon = dashboard_icons.nth(i)
            tag = icon.evaluate("el => el.tagName")
            aria_hidden = icon.get_attribute("aria-hidden")
            print(f"Element {i} ({tag}): aria-hidden={aria_hidden}")
            if tag == "SPAN" and aria_hidden != "true":
                 print("FAIL: Icon does not have aria-hidden='true'")
                 # Don't return, continue testing other things

        # Navigate to Feedback Form
        print("Navigating to Feedback Form...")
        page.click("button[aria-label='Add feedback']")

        # Wait for Feedback Form
        expect(page.get_by_text("Submit Feedback")).to_be_visible()

        # Check Post button state (Empty form)
        post_button = page.get_by_text("Post", exact=True)
        is_disabled = post_button.is_disabled()
        print(f"Post button disabled initially: {is_disabled}")

        if not is_disabled:
            print("FAIL: Post button should be disabled when empty")
            return

        # Try to force click
        post_button.click(force=True)
        time.sleep(1)
        if page.url == "http://localhost:5173/":
             print("FAIL: Form submitted even if disabled!")
             return

        # Fill Form
        print("Filling form...")
        page.fill("#title-input", "Test Bug")

        # Check if button is still disabled (Description missing)
        if not post_button.is_disabled():
             print("FAIL: Post button enabled with only title")
             return

        page.fill("#description-input", "This is a test description.")

        # Check if button is enabled
        if post_button.is_disabled():
             print("FAIL: Post button disabled with all fields filled")
             return

        print("PASS: Post button enabled when filled")

        # Submit
        post_button.click()

        # Expect navigation back to dashboard (or wherever history goes, here likely dashboard)
        # Note: navigate(-1) from /feedback/new (which came from /) goes to /
        expect(page).to_have_url("http://localhost:5173/")
        print("PASS: Form submitted successfully")

        # Screenshot
        page.screenshot(path="verification/ux_check_after.png")
        print("Screenshot saved to verification/ux_check_after.png")

        browser.close()

if __name__ == "__main__":
    verify_ux()
