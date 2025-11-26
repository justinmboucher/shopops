# Settings – UX & Content Spec

Settings help the user make ShopOps feel like their shop:
- Shop profile (name, logo, timezone)
- Workflows management
- Account basics (for later)
- General app preferences (for later)

This spec focuses on:
- Settings landing page
- Shop profile page
- Workflows settings section
- Navigation & microcopy

---

## 1. Settings Landing Page

**Route:** `/settings`  
**Goal:** Provide an overview and entry points to each settings area.

### 1.1 Page header

- Title: `Settings`
- Subtitle:  
  > Tune ShopOps so it matches how your shop runs and how you like to work.

Sections (cards or list):

1. **Shop profile**
   - Title: `Shop profile`
   - Description:  
     > Update your shop name, logo, and timezone.
   - Link/button: `Open`

2. **Workflows**
   - Title: `Workflows`
   - Description:  
     > Manage the stages your projects move through.
   - Link/button: `Open`

3. **Account** (placeholder for later)
   - Title: `Account`
   - Description:  
     > Manage your login and personal details. *(Coming later.)*
   - Disabled state / badge: `Coming soon`

4. **Preferences** (placeholder)
   - Title: `Preferences`
   - Description:  
     > Control default views and notifications. *(Coming later.)*
   - Disabled state / badge: `Coming soon`

---

## 2. Shop Profile

**Route:** `/settings/shop`  
**Goal:** Set the basic identity of the shop for UI, billing, and comms later.

### 2.1 Header

- Title: `Shop profile`
- Subtitle:  
  > Set the basics so your workspace feels like your shop, not just another app.

---

### 2.2 Shop details form

Fields:

1. **Shop name**
   - Label: `Shop name`
   - Placeholder: `Cedar Ridge Woodworks`, `Justin’s Garage Shop`
   - Helper:
     > This name appears in the header and on any exports.

2. **Logo (optional)**
   - Label: `Logo`
   - Helper:
     > A simple square logo works best. If you don’t have one yet, no worries — we’ll use a clean default.
   - Controls:
     - `Upload logo`
     - `Remove logo`
   - Empty state text:
     > No logo uploaded.

3. **Timezone**
   - Label: `Timezone`
   - Placeholder: `Select timezone`
   - Helper:
     > Used for due dates, scheduling, and timestamps. Pick where your shop lives, not where the server lives.

4. **Contact email (optional)**
   - Label: `Contact email`
   - Placeholder: `you@example.com`
   - Helper:
     > For customer-facing emails and receipts later. For now, this is just stored with your shop profile.

5. **Default currency (optional, future-ready)**
   - Label: `Currency`
   - Placeholder: `USD`
   - Helper:
     > Used for prices and reports. You can leave this as the default if you’re not sure.

Buttons:

- Primary: `Save changes`
- Secondary: `Cancel` (or `Reset` if you support it)

---

### 2.3 Validation & messages

Errors:

- Missing name:
  > Shop name is required.

- Invalid email:
  > Please enter a valid email address.

Generic save error:

> We couldn’t save your shop profile.  
> Please check your connection and try again.

Success toast:

> Shop profile updated.

---

## 3. Workflows Settings Section

**Route:** `/settings/workflows`  

This reuses the Workflows spec but from a “Settings” context, not the main board. Keep content consistent.

### 3.1 Header

- Title: `Workflows`
- Subtitle:  
  > Different types of projects move differently. Create workflows that match how your shop actually works.

---

### 3.2 List of workflows

Each workflow row/card shows:

- Name
- Default badge (if applicable): `Default`
- Mini stage preview:
  > `Design • Milling • Assembly • Finish • Ready for Pickup`
- Metadata:
  > `{{project_count}} projects`

Actions:

- Primary: `Edit`
- Secondary: `Set as default`
- Optional menu: `Delete`

Empty state:

> No workflows found.  
> Create your first workflow to define how projects move through your shop.

Button:

- `Create workflow`

(Full details for the editor are in `workflows-ui-spec.md`; this section just links to those flows.)

---

## 4. Global Navigation & Labels (Settings-related)

These are the bits that show up in your main layout / sidebar.

### 4.1 Sidebar navigation labels

- `Projects`
- `Workflows`
- `Inventory`
- `Sales`
- `Settings`

Tooltip for Settings icon (if using icon-only sidebar):

> Settings

---

### 4.2 User dropdown (top-right)

Possible items:

- `Settings`
- `Sign out`

(Actual sign-out behavior is up to your auth implementation.)

---

## 5. Empty / Loading States

### 5.1 Shop profile loading

While fetching shop data:

> Loading shop profile…

If there is truly no shop configured yet (first-time user):

- Title: `Set up your shop`
- Body:
  > We don’t have any shop details yet. Add your shop name and timezone to get started.
- Button: `Start setup`

This can feed into the onboarding wizard you already started.

---

## 6. Future Enhancements Notes

Just notes to yourself for later:

- Preferences:
  - Default landing page (Projects vs. Board)
  - Default workflow for new projects
  - Theme (light / dark)
- Notifications:
  - Reminders for due dates
  - Low inventory alerts
- Multi-shop / multi-user:
  - “Switch shop”
  - Invite other users
