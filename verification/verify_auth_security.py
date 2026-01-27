from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to app
        try:
            page.goto("http://localhost:5173")
            page.wait_for_selector("text=Beta Max", timeout=5000)
        except Exception as e:
            print(f"Error navigating: {e}")
            return

        print("Page loaded.")

        # Test Case 1: Login with incorrect password
        print("Testing invalid password...")
        page.fill("#auth-email", "alex@test.com")
        page.fill("#auth-password", "wrongpassword")
        page.click("button:has-text('Sign In')")

        # Expect error message
        try:
            expect(page.locator("text=Invalid credentials")).to_be_visible()
            print("PASS: Invalid password correctly rejected.")
        except Exception as e:
            print(f"FAIL: Invalid password not rejected or error message missing: {e}")
            page.screenshot(path="verification/fail_invalid_password.png")
            browser.close()
            return

        # Test Case 2: Login with correct password
        print("Testing valid password...")
        # Clear fields (or just overwrite)
        page.fill("#auth-password", "password")
        page.click("button:has-text('Sign In')")

        # Expect dashboard
        try:
            page.wait_for_selector("text=Dashboard", timeout=5000)
            print("PASS: Valid password accepted.")
        except Exception as e:
            print(f"FAIL: Valid password did not log in: {e}")
            page.screenshot(path="verification/fail_valid_login.png")
            browser.close()
            return

        browser.close()

if __name__ == "__main__":
    run()
