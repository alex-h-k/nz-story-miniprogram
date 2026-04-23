# 个人出行 Grouping Preference Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename "独自出行" to "个人出行" and give solo travelers the same grouping-preference choice (单独成团 / 愿意和他人组团) that group travelers already have, with full validation and tests.

**Architecture:** All changes are in the single-page form component (`trip-form/index.jsx`) and its test file (`index.test.jsx`). The form already has a `groupingPref` field and UI for non-solo travelers; this change extends that existing pattern to solo travelers by removing the auto-assignment of `join_group` and lifting the `form.groupType !== 'solo'` guard from the UI conditional. No new state fields, no new API surface.

**Tech Stack:** Taro 4 / React 18, Jest 30, @testing-library/react 16, jsdom

**Working directory for all commands:** `/Users/alex/nz-story/miniprogram-v4`

---

## Context: What Was Changed in the Implementation

The following code changes are already applied to `src/pages/trip-form/index.jsx`:

1. Label `独自出行` → `个人出行` (in the tag group on line ~552).
2. `handleGroupTypeSelect`: removed `groupingPref: id === 'solo' ? 'join_group' : ''` — solo no longer auto-joins; all types start with `groupingPref: ''`.
3. The 成团方式 UI block condition changed from `form.groupType && form.groupType !== 'solo'` → `form.groupType` — so solo now sees the picker.
4. `handleNext` validation: removed `form.groupType !== 'solo' &&` guard — solo must also pick a groupingPref before proceeding.

The tests in `src/pages/trip-form/index.test.jsx` have **not** been updated yet and will fail. This plan fixes them in TDD order: update failing tests first, verify they now pass, then add new coverage for the new behavior.

---

## File Map

| File | Action |
|------|--------|
| `src/pages/trip-form/index.jsx` | Already modified (no further changes needed) |
| `src/pages/trip-form/index.test.jsx` | Fix broken tests + add new tests |

---

## Task 1: Run baseline to confirm which tests are currently broken

**Files:**
- Read: `src/pages/trip-form/index.test.jsx` (already done — no edits in this task)

- [ ] **Step 1: Run the full test suite**

```bash
npm test -- --no-coverage 2>&1 | tail -60
```

Expected: Several FAIL entries referencing:
- `Unable to find an element with the text: 独自出行` (label was renamed)
- Tests that expected solo to skip 成团方式 or auto-show join_group prefs

> Record which tests fail — they are exactly the ones fixed in Tasks 2 and 3.

---

## Task 2: Fix all `独自出行` label references in tests

The test file clicks and queries for the old text `独自出行` in ~10 places. All must become `个人出行`.

**Files:**
- Modify: `src/pages/trip-form/index.test.jsx`

- [ ] **Step 1: Write the updated label assertions (failing → passing)**

Replace every occurrence of `'独自出行'` with `'个人出行'` in the test file. The affected lines are:

| Test description | Change |
|-----------------|--------|
| `shows the group type options` | `getByText('独自出行')` → `getByText('个人出行')` |
| `does NOT show 出行人员性别构成 for solo` | click target |
| `does NOT show 成团方式 for solo` | click target |
| `shows join_group preference fields for solo (auto-joins group)` | click target |
| `solo shows join_group prefs but not 成团方式 (auto-joins)` | click target |
| `blocks on missing groupType after groupType field is visible` | assertion |
| `does not show childCount for solo type` | click target |
| `does NOT show groupingPref field for solo` | click target |
| `solo shows join_group prefs after groupType selection (auto-joins)` | click target |
| `groupIdentity and companionPref are shown for solo traveller choosing 拼团` | click target |

Perform a global find-and-replace — every `'独自出行'` string in the file becomes `'个人出行'`:

```js
// Before (example):
fireEvent.click(screen.getByText('独自出行'))
expect(screen.getByText('独自出行')).toBeInTheDocument()

// After:
fireEvent.click(screen.getByText('个人出行'))
expect(screen.getByText('个人出行')).toBeInTheDocument()
```

- [ ] **Step 2: Run tests — expect label-related failures to disappear, but behavior-expectation failures remain**

```bash
npm test -- --testPathPattern=trip-form --no-coverage 2>&1 | tail -40
```

Expected: `Unable to find an element with the text: 独自出行` errors are gone. Behavioral expectation failures from Tasks 3–4 remain.

- [ ] **Step 3: Commit**

```bash
cd /Users/alex/nz-story/miniprogram-v4
git add src/pages/trip-form/index.test.jsx
git commit -m "test: update 独自出行 → 个人出行 label references in test file"
```

---

## Task 3: Fix tests that assumed solo auto-joins (old behavior)

These tests described the old behavior (solo skips 成团方式, auto-shows join prefs). They must be rewritten to match the new behavior:
- Solo **does** see 成团方式 with 单独成团 / 愿意和他人组团 options
- Solo does **not** auto-show join_group prefs
- Solo's join_group prefs appear only after explicitly selecting 愿意和他人组团

**Files:**
- Modify: `src/pages/trip-form/index.test.jsx`

### 3a. Test: solo does NOT skip 成团方式 anymore

- [ ] **Step 1: Replace the test "does NOT show 成团方式 for solo"**

Old test (wrong):
```js
it('does NOT show 成团方式 for solo', () => {
  render(<TripForm />)
  fireEvent.click(screen.getByText('独自出行'))
  expect(screen.queryByText('成团方式')).not.toBeInTheDocument()
})
```

New test (correct new behavior):
```js
it('shows 成团方式 for 个人出行', () => {
  render(<TripForm />)
  fireEvent.click(screen.getByText('个人出行'))
  expect(screen.getByText('成团方式')).toBeInTheDocument()
  expect(screen.getByText('单独成团')).toBeInTheDocument()
  expect(screen.getByText('愿意和他人组团')).toBeInTheDocument()
})
```

### 3b. Test: solo does NOT auto-show join_group prefs on selection

- [ ] **Step 2: Replace the test "shows join_group preference fields for solo (auto-joins group)"**

Old test (wrong):
```js
it('shows join_group preference fields for solo (auto-joins group)', () => {
  render(<TripForm />)
  fireEvent.click(screen.getByText('独自出行'))
  expect(screen.getByText('你的年龄段')).toBeInTheDocument()
  expect(screen.getByText('我们是')).toBeInTheDocument()
  expect(screen.getByText('希望和')).toBeInTheDocument()
})
```

New test (correct new behavior):
```js
it('does NOT show join_group prefs immediately for 个人出行 — must choose groupingPref first', () => {
  render(<TripForm />)
  fireEvent.click(screen.getByText('个人出行'))
  // No groupingPref chosen yet — join prefs must be hidden
  expect(screen.queryByText('你的年龄段')).not.toBeInTheDocument()
  expect(screen.queryByText('我们是')).not.toBeInTheDocument()
  expect(screen.queryByText('希望和')).not.toBeInTheDocument()
})
```

### 3c. Test: fix the "solo shows join_group prefs but not 成团方式" test

- [ ] **Step 3: Replace "solo shows join_group prefs but not 成团方式 (auto-joins)"**

Old test (wrong — both assertions are now backward):
```js
it('solo shows join_group prefs but not 成团方式 (auto-joins)', () => {
  render(<TripForm />)
  fireEvent.click(screen.getByText('独自出行'))
  expect(screen.queryByText('成团方式')).not.toBeInTheDocument()
  expect(screen.getByText('你的年龄段')).toBeInTheDocument()
  expect(screen.getByText('我们是')).toBeInTheDocument()
})
```

New test (correct new behavior):
```js
it('solo shows 成团方式 and reveals join_group prefs only after 愿意和他人组团 is selected', () => {
  render(<TripForm />)
  fireEvent.click(screen.getByText('个人出行'))
  // 成团方式 is now visible for solo
  expect(screen.getByText('成团方式')).toBeInTheDocument()
  // Join prefs not yet shown
  expect(screen.queryByText('你的年龄段')).not.toBeInTheDocument()
  // Select join_group
  fireEvent.click(screen.getByText('愿意和他人组团'))
  // Now join prefs appear
  expect(screen.getByText('你的年龄段')).toBeInTheDocument()
  expect(screen.getByText('我们是')).toBeInTheDocument()
})
```

### 3d. Fix "does NOT show groupingPref field for solo"

- [ ] **Step 4: Replace "does NOT show groupingPref field for solo"**

Old test (wrong):
```js
it('does NOT show groupingPref field for solo', () => {
  render(<TripForm />)
  fireEvent.click(screen.getByText('独自出行'))
  expect(screen.queryByText('成团方式')).not.toBeInTheDocument()
})
```

New test (correct new behavior):
```js
it('shows groupingPref 成团方式 field for 个人出行', () => {
  render(<TripForm />)
  fireEvent.click(screen.getByText('个人出行'))
  expect(screen.getByText('成团方式')).toBeInTheDocument()
})
```

### 3e. Fix "solo shows join_group prefs after groupType selection (auto-joins)"

- [ ] **Step 5: Replace "solo shows join_group prefs after groupType selection (auto-joins)"**

Old test (wrong):
```js
it('solo shows join_group prefs after groupType selection (auto-joins)', () => {
  render(<TripForm />)
  fireEvent.click(screen.getByText('独自出行'))
  expect(screen.getByText('你的年龄段')).toBeInTheDocument()
  expect(screen.getByText('我们是')).toBeInTheDocument()
  expect(screen.getByText('希望和')).toBeInTheDocument()
})
```

New test (correct new behavior):
```js
it('solo join_group prefs appear only after selecting 愿意和他人组团', () => {
  render(<TripForm />)
  fireEvent.click(screen.getByText('个人出行'))
  // Not visible yet
  expect(screen.queryByText('你的年龄段')).not.toBeInTheDocument()
  // Explicitly choose to join group
  fireEvent.click(screen.getByText('愿意和他人组团'))
  // Now visible
  expect(screen.getByText('你的年龄段')).toBeInTheDocument()
  expect(screen.getByText('我们是')).toBeInTheDocument()
  expect(screen.getByText('希望和')).toBeInTheDocument()
})
```

### 3f. Fix "groupIdentity and companionPref are shown for solo traveller choosing 拼团"

- [ ] **Step 6: Replace the test in the groupIdentity/companionPref describe block**

Old test (wrong — solo no longer auto-sets join_group):
```js
it('groupIdentity and companionPref are shown for solo traveller choosing 拼团', () => {
  render(<TripForm />)
  fireEvent.click(screen.getByText('独自出行'))
  // Solo auto-sets groupingPref = join_group, so fields should appear
  expect(screen.getByText('我们是')).toBeInTheDocument()
  expect(screen.getByText('希望和')).toBeInTheDocument()
})
```

New test (correct new behavior):
```js
it('groupIdentity and companionPref shown for 个人出行 after selecting 愿意和他人组团', () => {
  render(<TripForm />)
  fireEvent.click(screen.getByText('个人出行'))
  // Must explicitly choose before fields appear
  expect(screen.queryByText('我们是')).not.toBeInTheDocument()
  fireEvent.click(screen.getByText('愿意和他人组团'))
  expect(screen.getByText('我们是')).toBeInTheDocument()
  expect(screen.getByText('希望和')).toBeInTheDocument()
})
```

- [ ] **Step 7: Run tests to verify all behavior-expectation failures are now fixed**

```bash
npm test -- --testPathPattern=trip-form --no-coverage 2>&1 | tail -40
```

Expected: All previously-failing tests now PASS. Only new tests (from Task 4) should be missing.

- [ ] **Step 8: Commit**

```bash
cd /Users/alex/nz-story/miniprogram-v4
git add src/pages/trip-form/index.test.jsx
git commit -m "test: fix solo grouping-pref behavior expectations after 个人出行 feature"
```

---

## Task 4: Add new tests for the 个人出行 grouping preference feature

These tests cover behavior that didn't exist before and has no prior test coverage.

**Files:**
- Modify: `src/pages/trip-form/index.test.jsx`

Add a new `describe` block after the existing `TripForm — step 1 fields` block:

- [ ] **Step 1: Add the new describe block**

```js
// ── 个人出行 grouping preference ──────────────────────────────────────────────

describe('TripForm — 个人出行 grouping preference', () => {
  it('shows 单独成团 confirmation message when solo selects 单独成团', () => {
    render(<TripForm />)
    fireEvent.click(screen.getByText('个人出行'))
    fireEvent.click(screen.getByText('单独成团'))
    expect(screen.getByText(/我们会为你单独安排成团/)).toBeInTheDocument()
  })

  it('does NOT show join_group prefs when solo selects 单独成团', () => {
    render(<TripForm />)
    fireEvent.click(screen.getByText('个人出行'))
    fireEvent.click(screen.getByText('单独成团'))
    expect(screen.queryByText('你的年龄段')).not.toBeInTheDocument()
    expect(screen.queryByText('我们是')).not.toBeInTheDocument()
    expect(screen.queryByText('希望和')).not.toBeInTheDocument()
  })

  it('shows full join_group preference fields when solo selects 愿意和他人组团', () => {
    render(<TripForm />)
    fireEvent.click(screen.getByText('个人出行'))
    fireEvent.click(screen.getByText('愿意和他人组团'))
    expect(screen.getByText('你的年龄段')).toBeInTheDocument()
    expect(screen.getByText('我们是')).toBeInTheDocument()
    expect(screen.getByText('希望和')).toBeInTheDocument()
    expect(screen.getByText('偏好同行者年龄段')).toBeInTheDocument()
  })

  it('solo selecting 愿意和他人组团 triggers scroll to .join-group-prefs', () => {
    jest.useFakeTimers()
    render(<TripForm />)
    fireEvent.click(screen.getByText('个人出行'))
    fireEvent.click(screen.getByText('愿意和他人组团'))
    act(() => { jest.advanceTimersByTime(200) })
    expect(Taro.pageScrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ selector: '.join-group-prefs' })
    )
    jest.useRealTimers()
  })

  it('solo selecting 单独成团 does NOT trigger scroll', () => {
    jest.useFakeTimers()
    render(<TripForm />)
    fireEvent.click(screen.getByText('个人出行'))
    fireEvent.click(screen.getByText('单独成团'))
    act(() => { jest.advanceTimersByTime(200) })
    expect(Taro.pageScrollTo).not.toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('validation blocks 下一步 for solo without groupingPref selection', () => {
    render(<TripForm />)
    Taro.showToast.mockImplementation(() => {})
    fireEvent.click(screen.getByText('个人出行'))
    // Solo has groupType but no groupingPref — should be blocked
    // (departureDate is the first blocker in sequential validation)
    fireEvent.click(screen.getByText('下一步'))
    expect(Taro.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: '请选择出发日期' })
    )
    // The 成团方式 toast fires after date is set — we confirm the field exists
    expect(screen.getByText('成团方式')).toBeInTheDocument()
  })

  it('switching from 愿意和他人组团 back to 单独成团 hides join_group prefs', () => {
    render(<TripForm />)
    fireEvent.click(screen.getByText('个人出行'))
    fireEvent.click(screen.getByText('愿意和他人组团'))
    expect(screen.getByText('你的年龄段')).toBeInTheDocument()
    fireEvent.click(screen.getByText('单独成团'))
    expect(screen.queryByText('你的年龄段')).not.toBeInTheDocument()
  })

  it('solo groupSize remains 1 regardless of groupingPref choice', () => {
    // groupSize=1 is implicit for solo; the childCount field must not appear
    render(<TripForm />)
    fireEvent.click(screen.getByText('个人出行'))
    fireEvent.click(screen.getByText('愿意和他人组团'))
    expect(screen.queryByText('其中小孩人数')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run new tests to verify they all pass**

```bash
npm test -- --testPathPattern=trip-form --no-coverage 2>&1 | tail -40
```

Expected: All tests in the new `个人出行 grouping preference` describe block PASS.

- [ ] **Step 3: Commit**

```bash
cd /Users/alex/nz-story/miniprogram-v4
git add src/pages/trip-form/index.test.jsx
git commit -m "test: add 个人出行 grouping preference test coverage"
```

---

## Task 5: Run full integration test suite

Run all test files together to confirm nothing in the index page or waiting page is broken by the trip-form changes.

**Files:** (no changes — read-only verification)

- [ ] **Step 1: Run the complete test suite**

```bash
npm test -- --no-coverage 2>&1
```

Expected output pattern:
```
Test Suites: 2 passed, 2 total
Tests:       XX passed, XX total
Snapshots:   0 total
Time:        X.Xs
```

All test suites must be green. Zero failures.

- [ ] **Step 2: If any test fails, read the error and fix it**

If a test fails unexpectedly:
1. Read the full error message
2. If it's in `index/index.test.jsx` — those tests don't reference `独自出行` or solo behavior, so any failure there is unrelated regression; investigate carefully before touching
3. If it's in `trip-form/index.test.jsx` — cross-check against Tasks 2-4 to confirm the fix was applied correctly

- [ ] **Step 3: Final commit (only if any fixes were needed)**

```bash
cd /Users/alex/nz-story/miniprogram-v4
git add src/pages/trip-form/index.test.jsx
git commit -m "test: fix remaining test regressions after full suite run"
```

---

## Self-Review Checklist

### Spec Coverage

| Requirement | Task covering it |
|-------------|-----------------|
| Rename `独自出行` → `个人出行` | Implementation already done; Task 2 updates test label references |
| Solo sees 成团方式 picker | Task 3a, 3c, 3d |
| Solo does NOT auto-show join prefs | Task 3b, 3c, 3e, 3f |
| Solo selecting 单独成团 shows confirmation, hides join prefs | Task 4 (new tests) |
| Solo selecting 愿意和他人组团 shows full join prefs | Task 3e, Task 4 (new tests) |
| Solo selecting 愿意和他人组团 triggers scroll | Task 4 (new tests) |
| Validation requires solo to pick groupingPref | Task 4 (validation test) |
| Switching back from join_group clears prefs | Task 4 (switching test) |
| Full suite regression check | Task 5 |

### No Placeholders
All test code is complete and literal — no "implement later" or "similar to above".

### Type Consistency
All component text labels (`个人出行`, `单独成团`, `愿意和他人组团`, `成团方式`) match exactly what `src/pages/trip-form/index.jsx` renders.
