from playwright.sync_api import sync_playwright
import time

def verify_a11y():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to app
        page.goto("http://localhost:3000/")

        # Login
        page.get_by_test_id("email-input").fill("neo@betamax.io")
        page.get_by_test_id("password-input").fill("anything")
        page.get_by_test_id("login-submit-btn").click()

        # Wait for dashboard
        page.wait_for_selector("text=THE_DECK")

        # Take screenshot of Dashboard with sidebar
        page.screenshot(path="verification/dashboard_sidebar.png")
        print("📸 Screenshot saved to verification/dashboard_sidebar.png")

        # Check Sound Toggle in Sidebar
        sound_btn = page.locator("aside button:has(.lucide-volume-2, .lucide-volume-x)")

        if sound_btn.count() == 0:
            print("❌ Could not find sound toggle button")
        else:
            aria_label = sound_btn.get_attribute("aria-label")
            if aria_label:
                print(f"✅ Sound toggle has aria-label: {aria_label}")
            else:
                print("❌ Sound toggle MISSING aria-label")

        # Navigate to Mission Detail
        page.click("[data-testid^='project-card-']")

        # Wait for detail page
        page.wait_for_selector("text=Testing Scope")

        # Take screenshot of Mission Detail
        page.screenshot(path="verification/mission_detail.png")
        print("📸 Screenshot saved to verification/mission_detail.png")

        # Check Back Button
        back_btn = page.locator("button:has(.lucide-arrow-left)")

        if back_btn.count() == 0:
            print("❌ Could not find back button")
        else:
            aria_label = back_btn.get_attribute("aria-label")
            if aria_label:
                print(f"✅ Back button has aria-label: {aria_label}")
            else:
                print("❌ Back button MISSING aria-label")

        browser.close()

if __name__ == "__main__":
    verify_a11y()
