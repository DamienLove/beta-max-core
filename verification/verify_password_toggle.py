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

        # Wait for auth screen
        try:
            page.wait_for_selector("text=Beta Max", timeout=5000)
        except:
            print("Timeout waiting for 'Beta Max' text. Saving screenshot for debug.")
            page.screenshot(path="verification/debug_timeout.png")
            browser.close()
            return

        # Type password
        page.fill("#auth-password", "secret123")

        # Verify type is password
        input_el = page.locator("#auth-password")
        expect(input_el).to_have_attribute("type", "password")

        # Take screenshot of masked password
        page.screenshot(path="verification/password_masked.png")
        print("Screenshot masked taken")

        # Click toggle
        page.click("button[aria-label='Show password']")

        # Verify type is text
        expect(input_el).to_have_attribute("type", "text")

        # Take screenshot of visible password
        page.screenshot(path="verification/password_visible.png")
        print("Screenshot visible taken")

        browser.close()

if __name__ == "__main__":
    run()
