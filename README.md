# ⚖️ Business Balance

![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-active-success)

> **Simple but useful.** Not a POS. Not accounting software. Not a warehouse system.
> A **business balancing app**.

The **Business Balance** application is a mobile tool designed for small and medium-sized
retail businesses to help owners monitor both their inventory and finances in
one place. It enables users to track products, record stock coming in and going
out, monitor cash inflows and expenses, and view the current value of their
inventory. By providing summaries of sales, expenses, profits, losses, and cash
balances, the application gives business owners a clear picture of their
financial position. Its simple and intuitive design helps users make informed
decisions about restocking, controlling expenses, and improving profitability
without the complexity of a full accounting or enterprise management system.

---

## 🔹 The Key Idea

Instead of simply stating stock quantities, the app provides actionable financial
insights for the owner:

- The total cost value of the current inventory.
- Expected revenue and profit upon selling the stock.
- The business's overall current cash balance.
- Total business assets (Cash + Stock value).

That way, the owner doesn't just know **what's in stock**—they understand **the
financial position of the business**, which helps them decide whether they can
restock, whether profits are improving, and where money is tied up. This keeps
the application focused, practical, and easy for a small or medium-sized shop
to use.

---

## 🔸 Navigation & Structure

Since it's a mobile application, we keep it to as few screens as possible while
keeping everything easy to access.

### Bottom Navigation

To keep navigation simple, we use five main tabs:

```text
✧ Home | ✧ Inventory | ✧ Cashbook | ✧ Reports | ✧ Settings
```

Floating action buttons or dashboard shortcuts are available for common tasks:

- ⊞ Add Product
- ⊞ Add Stock
- ⊞ Record Sale
- ⊞ Add Expense

---

## 🔹 Modules & Screens

The app is organized into 10 simple screens across the 5 main tabs.

### 1. Login Screen

- Email/Username
- Password
- Login button

### 2. Dashboard (Home)

This is the first screen after login.
Shows:

- ⬩ Cash Balance
- ⬩ Stock Value
- ⬩ Profit/Loss
- ⬩ Low Stock Items
- Quick summary of today's activity

*Quick action buttons:* Add Stock, Record Sale, Add Expense, View Reports.

### 3. Inventory

This is only for tracking quantities. List of all products.
For each product:

- Product Name
- Category
- Buying Price & Selling Price
- Quantity in stock (units)

*Actions:* Search, Add Product, Tap a product to edit.

### 4. Product Details

Shows information about one product.

- Name, Category, Buying Price, Selling Price, Current Units
- *Buttons:* Add Stock, Remove Stock, Edit Product

### 5. Add/Edit Product

Form with:

- Product Name, Category, Buying Price, Selling Price, Initial Quantity

### 6. Cashbook

Track all money entering and leaving the business.
Shows all money movements (Income, Expenses, Current cash balance).
Each record:

- Date, Description, Amount, Income or Expense
- *Button:* Add Transaction

### 7. Add Transaction

Simple form for adding to the cashbook.

- Type (Income/Expense), Amount, Description, Date

### 8. Sales

A simple way to record sales.

- Fields: Product, Quantity Sold
- *The app automatically:* Reduces stock, calculates sale amount, and adds money
  to the cashbook.

### 9. Reports

Simple financial summaries to show the owner the total stock value, total sales,
total expenses, gross profit, net profit, and estimated business value.

- Daily Summary
- Weekly Summary
- Monthly Summary
- Inventory Report
- Profit Report

### 10. Settings

- Business Name, Currency, Low Stock Limit, Logout

---


## 🎨 Design & Color Palette

The app follows a **Modern Fintech + Material 3** design philosophy, relying
on a neutral background with soft accent colors to highlight important
information. This makes the application feel professional, trustworthy,
and easy to scan.

### Design Philosophy

The application uses a **neutral foundation** (`#F8FAFC` and `#FFFFFF`) with **meaningful accent colors**:
* 🟢 **Green** → Cash, profit, positive values, available stock.
* 🔵 **Blue** → Inventory information and informational metrics.
* 🟠 **Amber** → Warnings, sales highlights, and low stock.
* 🟣 **Purple** → Business value, reports, and analytics.
* 🔴 **Red** → Expenses, losses, and out-of-stock indicators.

This consistent palette ensures that users can quickly recognize the meaning of colors across all screens, making the app intuitive and professional.

### Shared Colors Across the Entire App
These should never change between screens.

| Purpose | Hex |
| :--- | :--- |
| Background | `#F8FAFC` |
| Card | `#FFFFFF` |
| Primary Text | `#111827` |
| Secondary Text | `#6B7280` |
| Divider | `#E5E7EB` |
| Primary Green | `#10B981` |
| Blue | `#3B82F6` |
| Amber | `#F59E0B` |
| Purple | `#8B5CF6` |
| Red | `#EF4444` |
| Green Background | `#ECFDF5` |
| Blue Background | `#EFF6FF` |
| Amber Background | `#FFF7ED` |
| Purple Background | `#F5F3FF` |
| Red Background | `#FEE2E2` |

### Typography

| Element | Font | Weight | Size |
| :--- | :--- | :--- | :--- |
| Screen Title | Inter | Bold (700) | 28px |
| Card Value | Inter | Bold (700) | 24px |
| Card Title | Inter | Medium (500) | 15px |
| Section Title | Inter | SemiBold (600) | 20px |
| Body Text | Inter | Regular (400) | 16px |
| Caption | Inter | Regular (400) | 13px |

---

### Screen Breakdowns

Since all three screens are part of the same application, they should use **one consistent design system**. The difference between screens comes from **accent colors**, while the background, typography, cards, and spacing remain identical.

<table>
  <tr>
    <td width="35%" valign="top">
      <img src="assets/home_dashboard.png" width="100%" alt="Home Dashboard Screen" />
    </td>
    <td width="65%" valign="top">
      <h4>1. Home (Dashboard)</h4>
      <p><b>Purpose:</b> A quick overview of the business's financial and inventory health.</p>
      <h5>Colors:</h5>
      <ul>
        <li><b>Background:</b> <code>#F8FAFC</code></li>
        <li><b>Cards:</b> <code>#FFFFFF</code></li>
        <li><b>Primary (Cash/Profit):</b> <code>#10B981</code> (Emerald Green)</li>
        <li><b>Stock Value:</b> <code>#3B82F6</code> (Royal Blue)</li>
        <li><b>Sales:</b> <code>#F59E0B</code> (Amber)</li>
        <li><b>Reports:</b> <code>#8B5CF6</code> (Purple)</li>
        <li><b>Text:</b> <code>#111827</code> (Dark Gray)</li>
        <li><b>Secondary Text:</b> <code>#6B7280</code> (Gray)</li>
        <li><b>Divider:</b> <code>#E5E7EB</code> (Light Gray)</li>
      </ul>
      <h5>Soft Accent Backgrounds:</h5>
      <ul>
        <li><b>Green:</b> <code>#ECFDF5</code></li>
        <li><b>Blue:</b> <code>#EFF6FF</code></li>
        <li><b>Amber:</b> <code>#FFF7ED</code></li>
        <li><b>Purple:</b> <code>#F5F3FF</code></li>
      </ul>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td width="35%" valign="top">
      <img src="assets/inventory_screen.png" width="100%" alt="Inventory Screen" />
    </td>
    <td width="65%" valign="top">
      <h4>2. Inventory</h4>
      <p><b>Purpose:</b> Track products and stock levels.</p>
      <h5>Colors:</h5>
      <ul>
        <li><b>Background:</b> <code>#F8FAFC</code></li>
        <li><b>Cards:</b> <code>#FFFFFF</code></li>
        <li><b>Inventory Primary:</b> <code>#3B82F6</code> (Royal Blue)</li>
        <li><b>Units Available:</b> <code>#10B981</code> (Emerald Green)</li>
        <li><b>Low Stock:</b> <code>#F59E0B</code> (Amber)</li>
        <li><b>Out of Stock:</b> <code>#EF4444</code> (Red)</li>
        <li><b>Product Value:</b> <code>#8B5CF6</code> (Purple)</li>
        <li><b>Text:</b> <code>#111827</code></li>
        <li><b>Secondary Text:</b> <code>#6B7280</code></li>
      </ul>
      <h5>Badges:</h5>
      <ul>
        <li><b>Available:</b> BG <code>#ECFDF5</code> / Text <code>#10B981</code></li>
        <li><b>Low Stock:</b> BG <code>#FEF3C7</code> / Text <code>#F59E0B</code></li>
        <li><b>Out of Stock:</b> BG <code>#FEE2E2</code> / Text <code>#EF4444</code></li>
        <li><b>Product Icon Background:</b> <code>#EFF6FF</code></li>
      </ul>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td width="35%" valign="top">
      <img src="assets/cashbook_screen.png" width="100%" alt="Cashbook Screen" />
    </td>
    <td width="65%" valign="top">
      <h4>3. Cashbook</h4>
      <p><b>Purpose:</b> Track money entering and leaving the business.</p>
      <h5>Colors:</h5>
      <ul>
        <li><b>Background:</b> <code>#F8FAFC</code></li>
        <li><b>Cards:</b> <code>#FFFFFF</code></li>
        <li><b>Cash Balance:</b> <code>#10B981</code> (Emerald Green)</li>
        <li><b>Income:</b> <code>#3B82F6</code> (Blue)</li>
        <li><b>Expenses:</b> <code>#EF4444</code> (Red)</li>
        <li><b>Filter Active:</b> <code>#10B981</code> (Emerald Green)</li>
        <li><b>Filter Background:</b> <code>#ECFDF5</code> (Light Green)</li>
        <li><b>Transaction Divider:</b> <code>#E5E7EB</code></li>
        <li><b>Text:</b> <code>#111827</code></li>
        <li><b>Secondary Text:</b> <code>#6B7280</code></li>
      </ul>
      <h5>Transaction Colors:</h5>
      <ul>
        <li><b>Income:</b> Text <code>#10B981</code> / Icon BG <code>#ECFDF5</code></li>
        <li><b>Expense:</b> Text <code>#EF4444</code> / Icon BG <code>#FEE2E2</code></li>
        <li><b>Positive Balance:</b> <code>#10B981</code></li>
        <li><b>Negative Balance:</b> <code>#EF4444</code></li>
      </ul>
    </td>
  </tr>
</table>
