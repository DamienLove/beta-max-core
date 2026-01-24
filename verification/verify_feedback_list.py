from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Go to app
    page.goto("http://localhost:5173/")
def verify_feedback_list(page: Page):
    page.goto("http://localhost:4173/")

    # Login
    page.fill("#auth-email", "alex@test.com")
    page.fill("#auth-password", "password") # dummy
    page.click("button[type='submit']")

    # Wait for dashboard
    page.wait_for_selector("text=Dashboard")

    # Click on a project (Neon Wallet)
    page.click("text=Neon Wallet")
    expect(page.get_by_text("Beta Max")).to_be_visible()
    page.get_by_label("Email Address").fill("alex@test.com")
    page.get_by_label("Password").fill("anything")
    page.get_by_role("button", name="Sign In").click()
    expect(page.get_by_role("heading", name="Dashboard")).to_be_visible()

    # Wait for project detail
    page.wait_for_selector("text=Bounty Program")
    # Navigate
    page.get_by_role("heading", name="Neon Wallet").click()
    expect(page.get_by_role("heading", name="Neon Wallet")).to_be_visible()

    # Click Feedback tab
    # The tab button has text "feedback" (uppercase in CSS/rendering? Code says lowercase 'feedback' but CSS `uppercase`)
    # The text in button is {tab} which is 'feedback'.
    # CSS: uppercase. So it renders FEEDBACK.
    # Playwright text selector is case-insensitive usually or matches text content.
    page.click("text=feedback")

    # Wait for feedback items
    page.wait_for_selector("text=Community Reports")
    # Use exact match to avoid matching "Add feedback" button
    page.get_by_role("button", name="feedback", exact=True).click()

    # Verify my optimization didn't break rendering
    # Look for "Crash on launch when offline"
    page.wait_for_selector("text=Crash on launch when offline")
    # Wait for Community Reports heading (this confirms tab switched)
    expect(page.get_by_text("Community Reports")).to_be_visible()

    # Screenshot
    page.screenshot(path="verification/feedback_list.png")
    # Assert content
    expect(page.get_by_text("Crash on launch when offline")).to_be_visible()
    expect(page.get_by_text("Alex Dev")).to_be_visible()
    expect(page.get_by_text("Open")).to_be_visible()

    browser.close()
    page.screenshot(path="verification/verification.png")

with sync_playwright() as playwright:
    run(playwright)
if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_feedback_list(page)
            print("Verification script ran successfully.")
        except Exception as e:
            print(f"Verification script failed: {e}")
            page.screenshot(path="verification/failed.png") # Capture failure
            raise
        finally:
            browser.close()

