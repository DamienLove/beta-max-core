from playwright.sync_api import sync_playwright
import time
import sys

def run():
    print("Starting visual verification: Auth Screen")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to app
        url = "http://localhost:3000"
        print(f"Navigating to {url}...")
        try:
            page.goto(url)
            # Wait for the login form to appear
            page.wait_for_selector('data-testid=login-form', timeout=10000)
            # Wait a bit for animations to settle (though they are continuous)
            time.sleep(1)
        except Exception as e:
            print(f"Error navigating: {e}")
            browser.close()
            sys.exit(1)

        print("Page loaded. Taking screenshot...")
        screenshot_path = "verification/auth_screen.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    run()
