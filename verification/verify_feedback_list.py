from playwright.sync_api import Page, expect, sync_playwright

def verify_feedback_list(page: Page):
    page.goto("http://localhost:4173/")

    # Login
    expect(page.get_by_text("Beta Max")).to_be_visible()
    page.get_by_label("Email Address").fill("alex@test.com")
    page.get_by_label("Password").fill("anything")
    page.get_by_role("button", name="Sign In").click()
    expect(page.get_by_role("heading", name="Dashboard")).to_be_visible()

    # Navigate
    page.get_by_role("heading", name="Neon Wallet").click()
    expect(page.get_by_role("heading", name="Neon Wallet")).to_be_visible()

    # Click Feedback tab
    # Use exact match to avoid matching "Add feedback" button
    page.get_by_role("button", name="feedback", exact=True).click()

    # Wait for Community Reports heading (this confirms tab switched)
    expect(page.get_by_text("Community Reports")).to_be_visible()

    # Assert content
    expect(page.get_by_text("Crash on launch when offline")).to_be_visible()
    expect(page.get_by_text("Alex Dev")).to_be_visible()
    expect(page.get_by_text("Open")).to_be_visible()

    page.screenshot(path="verification/verification.png")

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
