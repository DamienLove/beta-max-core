
from playwright.sync_api import sync_playwright

def verify_dashboard(page):
    # Go to the local dev server
    page.goto("http://localhost:5173/")

    # Wait for the dashboard to load (look for "Dashboard" header)
    page.wait_for_selector("text=Dashboard")

    # Check if project cards are visible
    # We extracted ProjectListCard, so we expect buttons with project names
    page.wait_for_selector("text=Neon Wallet")

    # Take a screenshot
    page.screenshot(path="/home/jules/verification/dashboard.png")
    print("Screenshot taken")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_dashboard(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
