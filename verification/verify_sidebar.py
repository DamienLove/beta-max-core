from playwright.sync_api import sync_playwright, expect

def verify_sidebar():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            print("Navigating to home page...")
            page.goto("http://localhost:3000")

            # Wait for login form
            print("Waiting for login form...")
            page.wait_for_selector('data-testid=login-form')

            # Login
            print("Logging in...")
            page.fill('data-testid=email-input', 'neo@betamax.io')
            page.fill('data-testid=password-input', 'test1234')
            page.click('data-testid=login-submit-btn')

            # Wait for dashboard (indicated by report anomaly button)
            print("Waiting for dashboard...")
            page.wait_for_selector('data-testid=report-anomaly-btn', timeout=10000)

            # Verify Sidebar Items
            print("Verifying sidebar items...")
            nav_items = ['dashboard', 'missions', 'external', 'terminal', 'arcade']
            for item_id in nav_items:
                locator = page.locator(f'data-testid=nav-{item_id}')
                expect(locator).to_be_visible()
                print(f"Verified nav item: {item_id}")

            # Take screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/sidebar_verified.png")
            print("Screenshot saved to verification/sidebar_verified.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_sidebar()
