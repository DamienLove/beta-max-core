import os
import time
from playwright.sync_api import sync_playwright, expect

def run():
    print("Starting verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        page = context.new_page()

        # Navigate to app
        try:
            print("Navigating to http://localhost:3000")
            page.goto("http://localhost:3000")
            # Wait for login form to be visible
            page.wait_for_selector("data-testid=login-form", timeout=10000)
        except Exception as e:
            print(f"Error navigating: {e}")
            browser.close()
            exit(1)

        print("Page loaded. Testing invalid password...")

        # Test Case 1: Invalid Password
        page.fill("data-testid=email-input", "neo@betamax.io")
        page.fill("data-testid=password-input", "wrongpassword")
        page.click("data-testid=login-submit-btn")

        # Expect error message
        try:
            # Wait for error message
            error_locator = page.locator("text=Access denied. Invalid credentials.")
            expect(error_locator).to_be_visible(timeout=5000)
            print("✅ Successfully blocked invalid password.")
        except Exception as e:
            print(f"❌ Failed to block invalid password or error message not found: {e}")
            page.screenshot(path="verification/failure_invalid_pass.png")
            browser.close()
            exit(1)

        print("Testing valid password...")

        # Test Case 2: Valid Password
        page.fill("data-testid=password-input", "test1234")
        page.click("data-testid=login-submit-btn")

        try:
            # Expect navigation to dashboard
            expect(page.locator("text=THE_DECK")).to_be_visible(timeout=5000)
            print("✅ Successfully logged in with correct password.")
        except Exception as e:
            print(f"❌ Failed to login with correct password: {e}")
            page.screenshot(path="verification/failure_valid_pass.png")
            browser.close()
            exit(1)

        browser.close()

if __name__ == "__main__":
    run()
