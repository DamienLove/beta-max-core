import time
import sys
from playwright.sync_api import sync_playwright

def parse_style(style_str):
    if not style_str: return {}
    return dict(item.split(":") for item in style_str.split(";") if ":" in item)

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        print("Connecting to http://localhost:3000...")
        # Retry loop for server availability
        connected = False
        for i in range(60):
            try:
                page.goto("http://localhost:3000")
                connected = True
                break
            except Exception as e:
                time.sleep(1)

        if not connected:
            print("Failed to connect to server.")
            sys.exit(1)

        print("Connected. Waiting for preloader to finish (4s)...")
        time.sleep(4)

        print("Waiting for AuthScreen...")

        # Wait for the login form to appear
        try:
            page.wait_for_selector('form[data-testid="login-form"]', timeout=10000)
        except:
            print("Login form not found. Page content:")
            print(page.content())
            sys.exit(1)

        # Select the first background line
        bg_lines = page.locator('div.absolute.inset-0.overflow-hidden.pointer-events-none > div.absolute.w-px')

        if bg_lines.count() == 0:
            print("Background lines not found!")
            sys.exit(1)

        first_line = bg_lines.first
        initial_style_str = first_line.get_attribute("style")
        print(f"Initial style: {initial_style_str}")

        initial_props = parse_style(initial_style_str)
        initial_left = initial_props.get(" left", "").strip() or initial_props.get("left", "").strip()
        initial_height = initial_props.get(" height", "").strip() or initial_props.get("height", "").strip()

        if not initial_left:
            print("Could not parse left/height from style.")
            sys.exit(1)

        # Type into the email input
        print("Typing into email input...")
        page.fill('input[type="email"]', "n")

        # Give React a moment to render
        time.sleep(0.5)

        # Check style again
        new_style_str = first_line.get_attribute("style")
        print(f"New style: {new_style_str}")

        new_props = parse_style(new_style_str)
        new_left = new_props.get(" left", "").strip() or new_props.get("left", "").strip()
        new_height = new_props.get(" height", "").strip() or new_props.get("height", "").strip()

        # Take screenshot
        page.screenshot(path="verification/verification.png")
        print("Screenshot saved to verification/verification.png")

        if initial_left != new_left or initial_height != new_height:
            print(f"FAILURE: Style changed! Left: {initial_left}->{new_left}, Height: {initial_height}->{new_height}")
            sys.exit(1)
        else:
            print("SUCCESS: Static properties (left, height) remained stable.")
            sys.exit(0)

if __name__ == "__main__":
    verify()
