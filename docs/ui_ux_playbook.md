# ShopOps UI/UX Playbook

This document describes how the app should behave, not just how it should look. Use it when making interaction decisions.

---

## 1. General UX Principles

1. **Fast recognition, low cognitive load**
   - Use icons + labels.
   - Keep key actions in predictable places (top-right, row-actions at far right).

2. **Safe operations**
   - Destructive actions (delete, cancel project) always require confirmation.
   - Provide clear consequences in confirmation dialogs.

3. **Inline feedback**
   - Use toasts/snackbars for success and errors.
   - Show validation messages near the fields, not just a generic error.

4. **Undo where reasonable**
   - Consider temporary “undo” for soft actions (archive, mark as complete).

---

## 2. Navigation Rules

- Sidebar is primary navigation, always visible on desktop.
- The current section should always be obvious (highlighted label + accent bar).
- Don’t hide essential features behind nested menus.
- Use breadcrumbs only on deep detail pages.

---

## 3. Forms & Validation

- **Required fields:** Mark with `*`.
- Provide **inline validation** on blur and on submit.
- On error, scroll to first invalid field.
- Keep forms as short as possible:
  - Use multi-step or modals for complex object creation (e.g., project with BOM).

---

## 4. Loading & Empty States

### Loading
- Use skeleton loaders for major lists (e.g., Customers table, Projects).
- Use spinners only for small, local operations (button-level).

### Empty States
- Never show a totally blank page.
- Each empty state should have:
  - Short title: "No customers yet"
  - Explanation: "When you add customers, they'll appear here."
  - CTA: button to create or connect data.

---

## 5. Errors

- For recoverable errors: show a toast with an explanation and recommended action.
- For unrecoverable errors: show a friendly error page with:
  - What went wrong in plain language.
  - Link to go back home or retry.
- Avoid exposing raw traceback or internal IDs to the user.

---

## 6. Domain-Specific UX

### Customers
- Always show:
  - Name, email, phone, city/state.
  - Status (Active / Inactive / VIP).
- On detail page, emphasize:
  - Lifetime value.
  - Number of projects and last project date.
- Use "Add project for this customer" as a first-class action.

### Projects
- Treat `status` and `stage` as separate but related concepts:
  - Status: active, completed, cancelled.
  - Stage: workflow step.
- Make moving a project between stages easy (drag-and-drop or dropdown).
- For completed projects, show:
  - Actual hours vs estimated.
  - Revenue + margin summary.

### Sales / Invoices
- Emphasize:
  - Amount
  - Status (Paid, Pending, Overdue, Cancelled)
  - Due date / Paid date
- Make “Log payment / Mark as paid” highly visible.

---

## 7. Keyboard & Accessibility

- Provide logical tab order.
- Make buttons and links focusable with clear focus ring.
- Avoid tiny click targets; minimum target size ~40x40px.
- Use semantic HTML where possible (`<button>`, `<nav>`, `<header>`, `<main>`).

---

## 8. Microcopy Guidelines

- Use friendly, direct language:
  - “Add project”
  - “Log a sale”
  - “No customers yet”
- Avoid jargon unless it’s domain-specific and well-known to the user (e.g. SKUs).
- Confirmations should be explicit:
  - “Cancel this project? This will move it to the Cancelled list and remove it from your active workflow.”

---

## 9. Dark Mode Specifics

- Maintain contrast:
  - Text vs background should meet WCAG AA where practical.
- Use color to indicate meaning, not decoration.
- Don’t rely solely on color; pair with icons and labels.

---

## 10. Evolving This Playbook

- Each time we ship a notable UI pattern (new card type, new layout), add it here.
- If a pattern is used at least 3 times, it probably deserves:
  - A named component
  - An entry in this playbook
  - A place in the component inventory

---
