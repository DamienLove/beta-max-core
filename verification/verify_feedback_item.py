
from playwright.sync_api import sync_playwright
import sys

def verify_project_detail(page):
    print("Navigating to home...")
    page.goto("http://localhost:5173")

    print("Filling login...")
    page.fill("#auth-email", "alex@test.com")
    page.fill("#auth-password", "password")

    print("Clicking sign in...")
    page.click("button:has-text('Sign In')")

    print("Waiting for Dashboard...")
    page.wait_for_selector("text=Dashboard")

    print("Clicking project...")
    page.click("text=Neon Wallet")

    print("Waiting for Project Detail...")
    page.wait_for_selector("text=Neon Wallet")

    print("Clicking feedback tab...")
    page.click("text=feedback")

    print("Waiting for list...")
    page.wait_for_selector("text=Community Reports")

    print("Taking screenshot...")
    page.screenshot(path="verification/project_detail_feedback.png")
    print("Screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_project_detail(page)
        except Exception as e:
            print(f"Error: {e}")
            sys.exit(1)
        finally:
            browser.close()
