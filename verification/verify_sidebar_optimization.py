from playwright.sync_api import sync_playwright, expect
import time

def run():
    print("Starting verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to app
        print("Navigating to http://localhost:3000")
        try:
            page.goto("http://localhost:3000")
        except Exception as e:
            print(f"Error navigating: {e}")
            return

        # Login if needed
        # We handle the case where we might be redirected to login
        try:
            # wait for either login form or dashboard
            page.wait_for_selector("input[data-testid='email-input'], text=THE_DECK", timeout=5000)
        except:
             print("Timeout waiting for initial load")

        if page.locator('input[data-testid="email-input"]').is_visible():
            print("Logging in...")
            page.fill('input[data-testid="email-input"]', "neo@betamax.io")
            page.fill('input[data-testid="password-input"]', "test1234")
            page.click('button[data-testid="login-submit-btn"]')
            # Wait for dashboard
            try:
                page.wait_for_selector("text=THE_DECK", timeout=5000)
                print("Login successful.")
            except:
                print("Login failed or timed out.")
                page.screenshot(path="verification/error_login.png")
                return
        else:
            print("Already logged in (or login form not found).")

        # Verify Sidebar Items exist
        print("Verifying sidebar items...")
        dashboard_btn = page.get_by_role('button', name='Dashboard')
        missions_btn = page.get_by_role('button', name='Missions')

        try:
            expect(dashboard_btn).to_be_visible()
            expect(missions_btn).to_be_visible()
        except:
            print("Sidebar items not found.")
            page.screenshot(path="verification/error_sidebar.png")
            return

        # Test Navigation to Missions
        print("Navigating to Missions...")
        missions_btn.click()
        try:
            expect(page.locator("text=Browse and join beta testing missions")).to_be_visible()
            print("Missions page loaded.")
        except:
            print("Failed to load Missions page.")
            page.screenshot(path="verification/error_missions_nav.png")
            return

        # Test Navigation back to Dashboard
        print("Navigating back to Dashboard...")
        dashboard_btn.click()
        try:
            expect(page.locator("text=THE_DECK")).to_be_visible()
            print("Dashboard page loaded.")
        except:
            print("Failed to load Dashboard page.")
            page.screenshot(path="verification/error_dashboard_nav.png")
            return

        page.screenshot(path="verification/sidebar_optimized.png")
        print("Verification passed!")
        browser.close()

if __name__ == "__main__":
    run()
