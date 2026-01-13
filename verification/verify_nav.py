from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        # Wait for server to start, try a few times
        try:
            page.goto("http://localhost:5173", timeout=10000)
        except:
             # retry once
            page.wait_for_timeout(2000)
            page.goto("http://localhost:5173")

        page.wait_for_selector("nav", state="visible")

        # Check if bottom nav exists
        nav = page.locator("nav")
        # Take screenshot of the bottom navigation
        nav.screenshot(path="verification/nav_bar.png")

        # Also take full screenshot
        page.screenshot(path="verification/full_page.png")

        browser.close()

if __name__ == "__main__":
    run()
