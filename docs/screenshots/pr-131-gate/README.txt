PR #131 gate screenshots (390x844 mobile).

Before: merge base 9791d43d67279d7725d6a1f7865ff10deaf36ba5 with CaptureDemo UI synced from PR HEAD for like-for-like framing.
After: same scenes and viewport on the PR branch; regenerate at branch HEAD after CSS cascade changes (unlayered tonal-active-flat.css).

Capture: node scripts/capture-pr130-followups.mjs (CAPTURE_AFTER_ONLY=1 to refresh after/ only; CAPTURE_SKIP_BEFORE=1 when before/ is current).
Last after capture: branch HEAD at commit that pins after/ in git (see PR visual checks screenshot ref).

Pairs with byte-identical before and after are omitted from the PR description. Outline pressed and navbar scrolled may be byte-identical but stay in the matrix.