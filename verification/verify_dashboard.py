from playwright.sync_api import sync_playwright

def verify_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to the dashboard
            page.goto("http://localhost:5173")

            # Wait for content to load
            page.wait_for_selector("text=Dashboard")

            # Check for Project Cards (checking for specific text likely in project cards)
            page.wait_for_selector("text=Neon Wallet")
            page.wait_for_selector("text=Titan OS Kernel")

            # Check for Recent Feedback
            page.wait_for_selector("text=Your Recent Feedback")
            page.wait_for_selector("text=Crash on launch when offline")

            # Take a screenshot
            page.screenshot(path="verification/dashboard_verified.png", full_page=True)
            print("Screenshot saved to verification/dashboard_verified.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_dashboard()
