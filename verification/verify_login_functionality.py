import sys
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:3000/")

        # Wait for preloader
        print("Waiting for preloader...")
        page.wait_for_timeout(4000)

        # Ensure we are on the login page
        try:
            page.wait_for_selector('data-testid=email-input', timeout=5000)
        except:
            print("Login page not found!")
            sys.exit(1)

        print("Filling credentials...")
        page.fill('data-testid=email-input', 'neo@betamax.io')
        page.fill('data-testid=password-input', 'test1234')

        print("Clicking login...")
        page.click('data-testid=login-submit-btn')

        # Wait for login simulation (800ms) + react update
        page.wait_for_timeout(2000)

        # Check for dashboard element
        # "THE_DECK" heading
        if page.get_by_text("THE_DECK").is_visible():
            print("PASS: Login successful. Dashboard visible.")
        else:
            print("FAIL: Dashboard not visible after login.")
            page.screenshot(path="verification/login_fail.png")
            sys.exit(1)

        browser.close()

if __name__ == "__main__":
    run()
