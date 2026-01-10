import time
from playwright.sync_api import sync_playwright

def probe_beta_status():
    print("Initializing Recon Probe...")
    with sync_playwright() as p:
        # Launch browser with head (visible) so user can interact
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        # Target: WhatsApp (often has beta program) or a known open beta
        target_url = "https://play.google.com/store/apps/details?id=com.whatsapp"
        
        print(f"Navigating to Target: {target_url}")
        page.goto(target_url)

        print("\n[INSTRUCTION]: Please log in to your Google Account in the browser window if not logged in.")
        print("[INSTRUCTION]: Once logged in (or if you want to test as guest), press ENTER in this terminal to scan.")
        input("Press Enter to execute scan...")

        print("Scanning page for Beta indicators...")
        
        # Look for common text patterns
        content = page.content()
        
        indicators = [
            "Join the beta",
            "You're a beta tester",
            "Beta program is full",
            "Leave the beta",
            "Become a tester"
        ]
        
        found = False
        for indicator in indicators:
            if indicator in content:
                print(f"[SUCCESS] Detected Signal: '{indicator}'")
                found = True
        
        if not found:
            print("[NEGATIVE] No beta indicators found. This might mean:")
            print("1. You are not logged in.")
            print("2. The app has no public beta.")
            print("3. The UI element is hidden/dynamic.")

        # Optional: Dump screenshots for analysis
        page.screenshot(path="experiments/beta_probe_result.png")
        print("Visual confirmation saved to experiments/beta_probe_result.png")
        
        browser.close()

if __name__ == "__main__":
    probe_beta_status()
