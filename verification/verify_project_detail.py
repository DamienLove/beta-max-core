from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to app
        try:
            page.goto("http://localhost:5173")
        except Exception as e:
            print(f"Error navigating: {e}")
            return

        # Login
        print("Logging in...")
        try:
            page.wait_for_selector("text=Beta Max", timeout=5000)
            page.fill("#auth-email", "alex@test.com")
            page.fill("#auth-password", "password")
            page.click("button:has-text('Sign In')")
            page.wait_for_selector("text=Dashboard", timeout=5000)
        except Exception as e:
            print(f"Error logging in: {e}")
            page.screenshot(path="verification/debug_login_error.png")
            browser.close()
            return

        print("Dashboard loaded.")

        # Click first project
        print("Navigating to project...")
        try:
            page.click("text=Neon Wallet")
            page.wait_for_selector("text=Neon Wallet", timeout=5000)
            # Verify Overview tab is active by default
            expect(page.locator("text=Description")).to_be_visible()
            expect(page.locator("text=Testing Scope")).to_be_visible()
            expect(page.locator("text=Biometric Login")).to_be_visible()
            print("Overview tab verified.")
        except Exception as e:
            print(f"Error verifying overview: {e}")
            page.screenshot(path="verification/debug_overview_error.png")
            browser.close()
            return

        # Click Changelog tab
        print("Switching to Changelog...")
        try:
            page.click("button:has-text('changelog')")
            # Verify changelog content
            # Scoping to make sure we find the list item
            expect(page.locator("li", has_text="Added biometric login flow")).to_be_visible()
            print("Changelog tab verified.")
        except Exception as e:
            print(f"Error verifying changelog: {e}")
            page.screenshot(path="verification/debug_changelog_error.png")
            browser.close()
            return

        # Click Feedback tab
        print("Switching to Feedback...")
        try:
            page.click("button:has-text('feedback')")
            # Verify feedback content
            expect(page.locator("text=Community Reports")).to_be_visible()
            expect(page.locator("h4", has_text="Crash on launch when offline")).to_be_visible()
            print("Feedback tab verified.")
        except Exception as e:
            print(f"Error verifying feedback: {e}")
            page.screenshot(path="verification/debug_feedback_error.png")
            browser.close()
            return

        print("Verification passed!")
        page.screenshot(path="verification/project_detail.png")
        browser.close()

if __name__ == "__main__":
    run()
