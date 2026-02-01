import sys
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            page.goto("http://localhost:3000")
            page.wait_for_selector("input[type='email']")

            # Find one of the background lines
            # Structure: div.min-h-screen > div.absolute.inset-0 > div (motion.div)
            # The background lines are the children of the div with class "absolute inset-0 overflow-hidden pointer-events-none"
            bg_container = page.locator("div.absolute.inset-0.overflow-hidden.pointer-events-none").first
            # Get the first line
            first_line = bg_container.locator("div").first

            # Get initial style
            initial_style = first_line.get_attribute("style")
            print(f"Initial style: {initial_style}")

            if not initial_style:
                print("Could not find style attribute on background line.")
                sys.exit(1)

            # Type in email input
            page.fill("input[type='email']", "t")

            # Wait a bit for React to re-render
            time.sleep(0.5)

            # Get new style
            new_style = first_line.get_attribute("style")
            print(f"New style: {new_style}")

            if initial_style != new_style:
                print("ISSUE REPRODUCED: Background style changed after typing.")
            else:
                print("ISSUE NOT REPRODUCED: Background style remained stable.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
