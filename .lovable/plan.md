# Basera: real backend, accounts, payments and admin panel

This is a big build, so I'll do it in 5 phases. After each phase the site keeps working and you can test it.

## Phase 1: Lovable Cloud, catalogue and accounts
- Turn on Lovable Cloud (database, logins, file storage).
- Tables for products, brands (price, GST %, SKU, stock, active, sort order), pincodes, profiles, and roles.
- Fill the tables with today's kits, items, brands and prices, plus Kota pincodes and a test partner code `KOTA10`.
- Kit pages read brands and prices from the database. Out-of-stock brands are greyed out, and the next brand in stock is picked automatically.
- Sign up and log in with email and password, plus an account page.

## Phase 2: Saved cart and checkout checks
- Signed-in customers' carts are saved, so a refresh never loses them. A guest's cart is merged in when they log in.
- Live pincode and move-in date check at checkout.
- Partner promo codes, with the total and GST worked out on the server only.

## Phase 3: Razorpay payments, orders and invoices
- Real Razorpay checkout supporting UPI and cards. You connect your Razorpay account through a secure form, so keys never go in chat.
- An order is marked paid only after Basera checks with Razorpay. Then stock goes down, the code's usage count goes up, a GST invoice (CGST/SGST or IGST) is created and the cart is cleared.
- A Razorpay webhook catches UPI payers who don't return to the site.
- "My Orders" page with live status, Reorder, a printable GST invoice, and "Report damaged item" with a photo upload (private storage).

## Phase 4: Admin panel at /admin (admins only)
- Orders: filter by status or move-in date, change status, and print packing labels and invoices.
- Catalogue and stock: edit products, brands, prices, GST and stock, with low-stock alerts.
- Returns: view damage photos, then approve, replace or reject.
- Leads and partners: export leads to CSV, see PG and hostel enquiries, and manage discount codes with usage and revenue.
- Checklist, enquiry and PG forms on the site save into the database.

## Phase 5: Notifications
- Order confirmation and "out for delivery" emails, plus checklist emails.
- A WhatsApp hook, ready for your provider's token.
- Abandoned-cart reminders for carts left for over 2 hours, sent at most once per cart.
- Every message is logged.

## Changes from your brief, and why
- **Admin role:** stored in its own roles table, not on the profile. This stops customers from making themselves admin.
- **Server code:** runs inside the app's own server instead of separate Supabase Edge Functions. The security is the same and this is the setup the site already uses.
- **Razorpay:** runs through Lovable's Razorpay connection. Payments are confirmed by asking Razorpay directly instead of checking a signature with your secret key, so the secret key never enters the app.
- **Email:** sent with Lovable's built-in email, so no Resend key is needed unless you prefer Resend.

## Technical notes
- Pricing, GST, discount and delivery rules stay as pure functions with tests, and are reused by server functions.
- Every table has grants and RLS. Customers see only their own rows, and admins are checked through `has_role`.
- Stock goes down only through an atomic conditional update when an order turns paid.
