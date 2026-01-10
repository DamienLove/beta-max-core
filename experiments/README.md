# Experiment: Beta Probe

This script tests whether a logged-in browser can detect "Join Beta" buttons on the Google Play Store web interface.

## Why this experiment?
We suspect Google hides beta buttons from anonymous users. This script allows you to log in manually so we can verify if the HTML changes to reveal the "Join" button.

## Prerequisites
- Python 3.x
- Playwright (`pip install playwright`)
- Chromium (`playwright install chromium`)

## Usage
1. Run the script:
   ```bash
   python experiments/beta_probe.py
   ```
2. A browser window will open.
3. **Log in** to your Google Account in that window.
4. Go back to the terminal and press **ENTER**.
5. The script will scan the page for beta indicators.

## Next Steps
If this works, we will port this logic to the Android App using a `WebView` to automate finding beta programs for your installed apps.
