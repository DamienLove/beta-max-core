from playwright.sync_api import sync_playwright

def verify_app_load():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Go to the dashboard, should redirect to Auth page because not logged in
            page.goto("http://localhost:5173/dashboard")

            # Wait for some content to load. Since we added Suspense, we might see "LOADING_MODULE..." briefly
            # Then we should land on Auth page.
            # Auth page has "Sign in to access the mainframe" or similar text?
            # Let's check AuthPage.jsx or just wait for network idle

            page.wait_for_load_state("networkidle")

            # Take screenshot
            page.screenshot(path="verification/app_load.png")
            print("Screenshot taken at verification/app_load.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app_load()
