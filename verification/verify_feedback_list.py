from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Go to app
    page.goto("http://localhost:5173/")

    # Login
    page.fill("#auth-email", "alex@test.com")
    page.fill("#auth-password", "password") # dummy
    page.click("button[type='submit']")

    # Wait for dashboard
    page.wait_for_selector("text=Dashboard")

    # Click on a project (Neon Wallet)
    page.click("text=Neon Wallet")

    # Wait for project detail
    page.wait_for_selector("text=Bounty Program")

    # Click Feedback tab
    # The tab button has text "feedback" (uppercase in CSS/rendering? Code says lowercase 'feedback' but CSS `uppercase`)
    # The text in button is {tab} which is 'feedback'.
    # CSS: uppercase. So it renders FEEDBACK.
    # Playwright text selector is case-insensitive usually or matches text content.
    page.click("text=feedback")

    # Wait for feedback items
    page.wait_for_selector("text=Community Reports")

    # Verify my optimization didn't break rendering
    # Look for "Crash on launch when offline"
    page.wait_for_selector("text=Crash on launch when offline")

    # Screenshot
    page.screenshot(path="verification/feedback_list.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
