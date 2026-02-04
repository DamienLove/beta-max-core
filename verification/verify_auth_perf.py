import sys
from playwright.sync_api import sync_playwright

def parse_style(style_str):
    if not style_str:
        return {}
    style_dict = {}
    for part in style_str.split(';'):
        if ':' in part:
            key, value = part.split(':', 1)
            style_dict[key.strip()] = value.strip()
    return style_dict

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

        # Select one background element
        container = page.locator('div.absolute.inset-0.overflow-hidden.pointer-events-none')
        bg_lines = container.locator('div')
        count = bg_lines.count()
        print(f"Found {count} background lines.")

        if count == 0:
            print("No background lines found!")
            sys.exit(1)

        first_line = bg_lines.first

        # Get initial style
        initial_style_str = first_line.get_attribute("style")
        print(f"Initial style raw: {initial_style_str}")
        initial_style = parse_style(initial_style_str)

        # Type into email input
        print("Typing into email input...")
        page.fill('data-testid=email-input', 't')

        # Wait a bit for react render
        page.wait_for_timeout(500)

        # Get style again
        new_style_str = first_line.get_attribute("style")
        print(f"New style raw: {new_style_str}")
        new_style = parse_style(new_style_str)

        # Check if left and height changed
        # We ignore 'transform' because it animates
        failed = False
        for prop in ['left', 'height']:
            if initial_style.get(prop) != new_style.get(prop):
                print(f"FAIL: {prop} changed from {initial_style.get(prop)} to {new_style.get(prop)}")
                failed = True

        if failed:
            print("FAIL: Background line properties changed after input!")
            sys.exit(1)
        else:
            print("PASS: Background line properties (left, height) remained stable.")

        browser.close()

if __name__ == "__main__":
    run()
