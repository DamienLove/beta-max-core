import time
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Wait for dev server to start
        time.sleep(2)

        print("Navigating to app...")
        page.goto("http://localhost:5173/")

        # Login if on AuthScreen
        try:
            if page.wait_for_selector("#auth-email", timeout=3000):
                print("Auth screen detected. Logging in...")
                page.fill("#auth-email", "alex@test.com")
                page.fill("#auth-password", "anypassword")
                page.click("button:has-text('Sign In')")
                print("Login submitted.")
        except Exception as e:
            print("Auth screen not detected or error during login (might be already logged in or timing out):", e)

        # Wait for content to load
        print("Waiting for Dashboard...")
        page.wait_for_selector("text=Dashboard")

        print("Checking for Home navigation item...")
        home_nav = page.get_by_role("button", name="Home")

        # Verify aria-current is present on the active item
        print("Verifying aria-current on Home button...")
        # Get the attribute value
        aria_current = home_nav.get_attribute("aria-current")
        print(f"Home aria-current: {aria_current}")

        if aria_current != "page":
            print("FAILURE: aria-current='page' not found on active Home button")
        else:
            print("SUCCESS: aria-current='page' found on active Home button")

        # Take screenshot of the navigation bar area
        print("Taking screenshot...")
        # Focus the home button to show the ring (though ring might not show on click, focus via tab)
        home_nav.focus()
        page.screenshot(path="verification/nav_focus.png")

        # Click Profile - finding it by text content which is safer for the bottom nav
        print("Navigating to Profile...")
        # The NavItem has label "Profile"
        page.get_by_text("Profile").click()
        time.sleep(1)

        # Verify aria-current moved
        # Finding the button that contains "Profile" text
        # This might pick up multiple things if "Profile" text is elsewhere, but let's try
        profile_nav = page.get_by_role("button").filter(has_text="Profile").last

        aria_current_profile = profile_nav.get_attribute("aria-current")
        print(f"Profile aria-current: {aria_current_profile}")

        if aria_current_profile != "page":
             print("FAILURE: aria-current='page' not found on active Profile button")
        else:
             print("SUCCESS: aria-current='page' found on active Profile button")

        # Take screenshot of profile page nav
        page.screenshot(path="verification/nav_profile.png")

        browser.close()

if __name__ == "__main__":
    run()
