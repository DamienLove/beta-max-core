
from playwright.sync_api import sync_playwright

def verify_login_error():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the preview server
        page.goto("http://localhost:4173")

        # Wait for the login form
        page.wait_for_selector("form")

        # Fill in invalid credentials
        page.fill("input[type='email']", "invalid@example.com")
        page.fill("input[type='password']", "wrongpassword")

        # Click the Sign In button
        page.click("button:has-text('Sign In')")

        # Wait for the error message to appear
        # The error message container has role="alert"
        error_locator = page.locator("div[role='alert']")
        error_locator.wait_for(state="visible")

        # Take a screenshot of the error state
        page.screenshot(path="verification/login_error.png")

        print("Screenshot saved to verification/login_error.png")

        browser.close()

if __name__ == "__main__":
    verify_login_error()
