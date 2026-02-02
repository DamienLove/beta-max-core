import time
from playwright.sync_api import sync_playwright

def verify_login():
    print("Starting verification: App Login")
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Navigate to the app
            print("Navigating to http://localhost:3000...")
            page.goto("http://localhost:3000")

            # Wait for initial load
            print("Waiting for login form...")
            page.wait_for_selector('text="Identity_ID"', timeout=10000)

            # Take screenshot of Auth Screen
            page.screenshot(path="verification/auth_screen.png")
            print("Screenshot taken: verification/auth_screen.png")

            # Check for form elements
            email_input = page.locator('[data-testid="email-input"]')
            password_input = page.locator('[data-testid="password-input"]')
            submit_btn = page.locator('[data-testid="login-submit-btn"]')

            if not email_input.is_visible() or not password_input.is_visible():
                print("FAILED: Login inputs not visible")
                return False

            print("Login form visible. Entering credentials...")

            # Type credentials
            email_input.fill("neo@betamax.io")
            password_input.fill("test1234") # Password doesn't strictly matter for mock unless validation is strict, mock says "neo@betamax.io" is enough to find user?
            # App.jsx: const login = useCallback((email, password) => { ... found = MOCK_USERS.find ... return { success: true };
            # It checks email only for finding user, but password is passed.
            # Wait, logic is: `if (found) { setUser(found); ... return { success: true }; }`
            # It DOES NOT check password in the simplified App.jsx logic I read earlier!
            # "found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()); if (found) ..."

            # Click submit
            submit_btn.click()
            print("Clicked login...")

            # Wait for dashboard
            print("Waiting for dashboard...")
            page.wait_for_selector('text="THE_DECK"', timeout=10000)

            print("SUCCESS: Logged in and saw THE_DECK")
            return True

        except Exception as e:
            print(f"FAILED: An error occurred: {e}")
            page.screenshot(path="verification_failure.png")
            return False
        finally:
            browser.close()

if __name__ == "__main__":
    success = verify_login()
    if success:
        exit(0)
    else:
        exit(1)
