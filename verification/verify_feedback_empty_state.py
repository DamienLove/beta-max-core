
from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_feedback_ux(page: Page):
    # Go to the app
    page.goto("http://localhost:5173")

    # Wait for dashboard to load
    page.wait_for_selector("text=Dashboard")

    # --- Verify Empty State on Project 2 ---
    print("Navigating to Project 2 (Titan OS Kernel)...")
    page.click("text=Titan OS Kernel")
    page.wait_for_selector("text=Titan OS Kernel")
    page.click("text=feedback")

    print("Checking for empty state...")
    expect(page.get_by_text("No community reports yet")).to_be_visible()
    expect(page.get_by_text("Be the first to spot a bug!")).to_be_visible()

    # Check item count pluralization (should be "0 items")
    expect(page.get_by_text("0 items")).to_be_visible()

    # Screenshot Empty State
    page.screenshot(path="/home/jules/verification/empty_state_final.png")
    print("Screenshot saved: empty_state_final.png")

    # --- Verify List Items on Project 1 ---
    print("Navigating to Project 1 (Neon Wallet)...")
    page.goto("http://localhost:5173/#/")
    page.wait_for_selector("text=Dashboard")
    page.click("text=Neon Wallet")
    page.wait_for_selector("text=Neon Wallet")
    page.click("text=feedback")

    # Verify we have feedback items
    expect(page.get_by_text("Crash on launch when offline")).to_be_visible()

    # Check item count pluralization (should be "1 item" not "items")
    expect(page.get_by_text("1 item", exact=True)).to_be_visible()

    # Screenshot List Items
    page.screenshot(path="/home/jules/verification/list_items_final.png")
    print("Screenshot saved: list_items_final.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_feedback_ux(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
            raise e
        finally:
            browser.close()
