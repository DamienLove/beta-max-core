from playwright.sync_api import sync_playwright, expect
import re

def run():
    print("Starting Sidebar Optimization Verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to app
        try:
            page.goto("http://localhost:3000")
            print("Navigated to http://localhost:3000")
        except Exception as e:
            print(f"Error navigating: {e}")
            return

        # Login
        print("Logging in...")
        try:
            # Login as Neo
            page.fill("input[data-testid='email-input']", "neo@betamax.io")
            page.fill("input[data-testid='password-input']", "password") # Password doesn't matter
            page.click("button[data-testid='login-submit-btn']")
            # Wait for dashboard
            page.wait_for_selector("text=THE_DECK", timeout=10000)
            print("Login successful.")
        except Exception as e:
            print(f"Error logging in: {e}")
            page.screenshot(path="verification/debug_login_error.png")
            browser.close()
            return

        # Verify Sidebar Navigation Items exist
        print("Verifying Sidebar items...")
        nav_ids = ['dashboard', 'missions', 'external', 'terminal', 'arcade']
        for nid in nav_ids:
            try:
                expect(page.locator(f"button[data-testid='nav-{nid}']")).to_be_visible()
            except Exception as e:
                print(f"Error finding nav item {nid}: {e}")
                browser.close()
                return
        print("All sidebar items found.")

        # Test Navigation to Missions
        print("Navigating to Missions...")
        try:
            page.click("button[data-testid='nav-missions']")
            # Verify URL
            expect(page).to_have_url("http://localhost:3000/#/missions")
            # Verify Missions page content
            expect(page.locator("h1:has-text('MISSIONS')")).to_be_visible()
            # Verify Missions nav item is active (has cyan text/border)
            button = page.locator("button[data-testid='nav-missions']")
            # Expect class to contain text-cyan-400
            expect(button).to_have_class(re.compile(r"text-cyan-400"))
            print("Navigation to Missions successful and active state verified.")
        except Exception as e:
            print(f"Error navigating to Missions: {e}")
            page.screenshot(path="verification/debug_missions_error.png")
            browser.close()
            return

        # Test Navigation back to Dashboard
        print("Navigating back to Dashboard...")
        try:
            page.click("button[data-testid='nav-dashboard']")
            expect(page).to_have_url("http://localhost:3000/#/")
            expect(page.locator("text=THE_DECK")).to_be_visible()
            button = page.locator("button[data-testid='nav-dashboard']")
            expect(button).to_have_class(re.compile(r"text-cyan-400"))
            print("Navigation back to Dashboard successful.")
        except Exception as e:
            print(f"Error navigating to Dashboard: {e}")
            page.screenshot(path="verification/debug_dashboard_error.png")
            browser.close()
            return

        print("Verification passed!")
        page.screenshot(path="verification/sidebar_verified.png")
        print("Screenshot saved to verification/sidebar_verified.png")
        browser.close()

if __name__ == "__main__":
    run()
