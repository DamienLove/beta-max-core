from playwright.sync_api import sync_playwright
import time
import sys

def run():
    print("Starting verification: Auth Screen Performance")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to app
        url = "http://localhost:3000"
        print(f"Navigating to {url}...")
        try:
            page.goto(url)
            # Wait for the login form to appear to ensure app is loaded
            page.wait_for_selector('data-testid=login-form', timeout=10000)
        except Exception as e:
            print(f"Error navigating or waiting for load: {e}")
            browser.close()
            sys.exit(1)

        print("Page loaded.")

        # Locate background elements
        # These are the animated lines
        bg_lines = page.locator('.absolute.w-px.bg-gradient-to-b')
        count = bg_lines.count()
        print(f"Found {count} background lines.")

        if count == 0:
            print("Error: No background lines found. Selector might be wrong.")
            browser.close()
            sys.exit(1)

        # Capture initial styles of the first 5 lines
        initial_styles = []
        for i in range(min(5, count)):
            style = bg_lines.nth(i).get_attribute("style")
            initial_styles.append(style)

        print(f"Initial styles (first 3): {initial_styles[:3]}")

        # Type into the email input to trigger re-renders
        print("Typing into email input...")
        email_input = page.locator('data-testid=email-input')
        email_input.fill("test@example.com")

        # Allow a small moment for React to re-render
        time.sleep(0.5)

        # Capture styles again
        final_styles = []
        for i in range(min(5, count)):
            style = bg_lines.nth(i).get_attribute("style")
            final_styles.append(style)

        print(f"Final styles (first 3): {final_styles[:3]}")

        # Compare
        changed = False
        for i in range(len(initial_styles)):
            if initial_styles[i] != final_styles[i]:
                print(f"MISMATCH at line {i}:")
                print(f"  Before: {initial_styles[i]}")
                print(f"  After:  {final_styles[i]}")
                changed = True

        browser.close()

        if changed:
            print("FAILURE: Background elements re-rendered (styles changed).")
            sys.exit(1)
        else:
            print("SUCCESS: Background elements remained stable.")
            sys.exit(0)

if __name__ == "__main__":
    run()
