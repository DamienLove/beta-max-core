from playwright.sync_api import sync_playwright
import sys

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3000/")

        print("Waiting for preloader...")
        page.wait_for_timeout(4000)

        try:
            page.wait_for_selector('data-testid=email-input', timeout=5000)
        except:
            print("Login page not found!")
            sys.exit(1)

        # Take screenshot
        page.screenshot(path="verification/auth_screen.png")
        print("Screenshot taken at verification/auth_screen.png")

        browser.close()

if __name__ == "__main__":
    run()
