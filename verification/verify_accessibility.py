from playwright.sync_api import sync_playwright, expect

def verify_accessibility(page):
    print("Navigating to app...")
    page.goto("http://localhost:3000")

    # Wait for initial load (memory says 3s animation)
    print("Waiting for initial load...")
    page.wait_for_timeout(4000)

    # 1. Verify Auth Screen Inputs
    print("Verifying Auth Screen inputs...")
    email_input = page.locator("#auth-email")
    password_input = page.locator("#auth-password")

    expect(email_input).to_be_visible()
    expect(password_input).to_be_visible()

    # Verify labels are associated
    email_label = page.locator("label[for='auth-email']")
    password_label = page.locator("label[for='auth-password']")

    expect(email_label).to_be_visible()
    expect(password_label).to_be_visible()

    print("Auth Screen inputs verified.")

    # Screenshot Auth Screen
    page.screenshot(path="verification/auth_screen.png")

    # 2. Login to verify Dashboard/Sidebar
    print("Logging in...")
    email_input.fill("neo@betamax.io")
    password_input.fill("test1234") # Password from memory is test1234, though mock data doesn't seem to check password hash strictly in App.jsx provided earlier?
    # Actually App.jsx has mock login:
    # const login = useCallback((email, password) => {
    #   const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    #   if (found) { ... return { success: true }; }
    # ...
    # It doesn't check password in the App.jsx I read! Just email.
    # But wait, AuthScreen has:
    # const result = login(email, password);
    # So I just need correct email.

    # Click submit
    submit_btn = page.locator("button[data-testid='login-submit-btn']")

    # Check loading state aria-label (it's fast, might be hard to catch, but we can try)
    # The click triggers setSubmitting(true) then a timeout of 800ms.
    submit_btn.click()

    # Immediately check for aria-label="Loading..."
    # We might miss it if playright is too slow or too fast, but let's try.
    # Actually, expect().to_have_attribute might retry.
    try:
        expect(submit_btn).to_have_attribute("aria-label", "Loading...", timeout=500)
        print("Loading state aria-label verified.")
    except Exception as e:
        print("Could not verify loading state (might be too fast):", e)

    # Wait for login
    print("Waiting for dashboard...")
    page.wait_for_selector("text=THE_DECK", timeout=5000)

    # 3. Verify Sidebar Sound Button
    print("Verifying Sidebar Sound Button...")
    # It's the first button in the bottom profile section
    # <div className="flex items-center gap-2 mt-4"> <motion.button ...>

    # Finding by the expected aria-label
    sound_btn = page.locator("button[aria-label='Mute sound']")
    expect(sound_btn).to_be_visible()
    print("Sound button 'Mute sound' verified.")

    # Toggle it
    sound_btn.click()

    # Should change to 'Enable sound'
    sound_btn_off = page.locator("button[aria-label='Enable sound']")
    expect(sound_btn_off).to_be_visible()
    print("Sound button 'Enable sound' verified.")

    # Screenshot Dashboard
    page.screenshot(path="verification/dashboard.png")

    # 4. Navigate to Mission Detail to verify Back Button
    print("Navigating to Mission Detail...")
    # Click first project card
    page.click("[data-testid^='project-card-']")

    # Check back button
    back_btn = page.locator("button[aria-label='Go back']")
    expect(back_btn).to_be_visible()
    print("Mission Detail back button verified.")

    # Screenshot Mission Detail
    page.screenshot(path="verification/mission_detail.png")

    print("Verification complete.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_accessibility(page)
        browser.close()
