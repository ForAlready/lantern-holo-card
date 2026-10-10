# Album expansion release — 2026-10-10

Source: the selected Drive imgs/animation inventory, 214 unique source IDs. The catalog retains all six original cards and adds 134 reviewed layered cards, for 140 total. The remaining 80 sources have explicit safety exclusion records; this release does not claim the planned 220-card import was completed. See work/source-inventory.json, work/qa/approved.json and scripts/progress.mjs for reconciliation.

All 134 added cards received individual static composite review. Generated semantic masks select original RGB pixels; generated background plates remove subjects or provide a suitable scene where needed. Original credits are restored from source pixels. Difficult staircase and poster scenes use coherent foreground groups; source 126 has original graphic decorations in a separate UI plane.

Final validation: 214 source IDs; 140 unique card IDs; 659 referenced assets fully decoded and content-hash verified. Search, orientation filter, favorites and ordering checks pass. The 1,000-record virtual-grid simulation mounts at most 48 cards. Renderer checks cover six draw passes, 20 resource lifecycles, abort before allocation and shader-failure cleanup. Unreferenced layer assets were pruned (185 files, 50,256,500 bytes).

Offline depth sampling follows layer-coordinate formulas at depth -3/+3 and a 25-degree tilt; it is a CPU approximation for inspecting separation, not a complete shader render. Real browser/GPU, touch, sensor permissions and phone device verification are unavailable in this environment and remain unverified. No actual-device performance or memory claims are made.

The current public audience and same Sites project are preserved. Prior published version 4 remains available for rollback. Runtime assets are hosted by the Site; no visitor Drive connection is required.

## UI restoration — 2026-10-11

Hide original filenames in collection and viewer presentation while retaining filename search. Restore the original gold illustrated back for all 140 cards and the original purple star favicon; add a Safari touch icon. Fit the shader's visible card (1/1.6 of the canvas), filling 90% of the limiting host dimension without changing source aspect ratio. ResizeObserver refits after layout/screen changes. Restore CSS-only preview foil/glare and pointer tilt, gated by visibility and reduced-motion settings. Replace font glyph navigation with optically centered inline SVG chevrons, refined translucent surfaces and 44px touch targets.

Presentation geometry tests pass for all 140 ratios at phone, tablet and desktop dimensions. Collection 1,000-record simulation remains at max 48 mounted cards. Existing renderer lifecycle tests and full asset decoding/hash validation pass. Real Safari/GPU/mobile interaction remains unverified; uploaded user screenshots were inspected.

GitHub mirror uses a public manifest with per-file SHA-256, validates allowed target paths and downloads only absent/changed files; the scheduled workflow was rejected by automatic approval review. Current-source synchronization instead uses native GitHub blob/tree/commit operations; the existing Pages workflow is retained. Repository HEAD and the existing Pages run must be verified independently.

## Overview interaction follow-up

Restore original overview tilt range (±9° pitch / ±12° yaw), pointer-following foil and glare, a lifted rim highlight, and horizontal touch-drag preview. An 8px intent threshold keeps taps opening details and vertical gestures scrolling; moved gestures suppress the subsequent click. One delegated controller serves the virtual grid without animation loops or additional WebGL instances. Reduced motion remains an explicit runtime setting initialized from the system preference; a stale unconditional thumbnail transform override was removed. Gesture integration tests cover hover, touch preview, tap, scroll, cancellation and reduced motion; real-device browser verification remains unavailable.
