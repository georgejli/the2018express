
# Fix: Black Gap Under Navbar on Event Page

## Problem Identified

The black gap you're seeing is caused by a **structural issue** with how backgrounds are layered:

```text
┌─────────────────────────────────────┐
│          Fixed Header (68px)        │  ← Blue navbar (position: fixed)
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│   <main> with pt-[68px] padding     │  ← This padding area has bg-background (BLACK)
│   ┌─────────────────────────────────│
│   │                                 │
│   │  Hero Section starts here       │  ← Hero has bg-gradient-to-b from-card (DARK GRAY)
│   │  with its own pt-4 padding      │
```

The `pt-[68px]` padding on `<main>` creates space to clear the fixed header, but that padding area shows the **black background** (`bg-background`) from the parent container, not the hero section's gradient.

## Why Homepage Works

The homepage uses a full-viewport hero (`min-h-[70vh]`) that handles its own padding internally (`pt-20`). The header sits on top of the hero visually. There's no explicit top padding on `<main>`.

## Solution

Remove the top padding from `<main>` and instead have the hero section handle the header clearance internally, similar to how the homepage works:

### Changes to EventPage.tsx

1. **Remove `pt-[68px]` from `<main>`** - This eliminates the black padding area

2. **Add top padding directly to the hero section** - Change `pt-4` to `pt-20` (or approximately 68px + the desired content padding) so the content clears the fixed header

3. **Extend the hero background to the top** - The gradient background will now extend from the very top of the page, appearing behind the header

### Before vs After Structure

**Before (broken):**
```text
<main pt-[68px] bg-inherited-black>   ← BLACK gap appears here
  <section pt-4 bg-gradient>           ← Content starts too low
```

**After (fixed):**
```text
<main pt-0>
  <section pt-[72px] bg-gradient>      ← Gradient extends to top, content clears header
```

This matches how professional sites handle fixed headers with full-bleed hero sections.

---

## Technical Implementation

### File: `src/pages/EventPage.tsx`

**Line 90** - Remove padding from main:
```tsx
// Before
<main className="flex-1 pt-[68px]">

// After  
<main className="flex-1">
```

**Line 92** - Add header clearance padding to hero section:
```tsx
// Before
<section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-card via-card to-background px-4 pb-8 pt-4 md:pb-16 md:pt-6">

// After
<section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-card via-card to-background px-4 pb-8 pt-20 md:pb-16 md:pt-24">
```

The `pt-20` (80px) on mobile and `pt-24` (96px) on desktop provides enough space to clear the ~68px header plus comfortable breathing room for the content.

---

## Summary

This is a proper structural fix, not a band-aid:
- Eliminates the black padding gap at its source
- Hero section gradient extends seamlessly behind the header
- Matches the homepage pattern that already works correctly
- The fixed header naturally overlays the hero with its semi-transparent styling
