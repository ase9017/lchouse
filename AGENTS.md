<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Product illustrations are bundled by hardware type and mapped in a shared image selector; do not present them as exact model photography.
- Quotations use a public validated write-only server function with server-calculated catalogue totals; company reads and status updates require authenticated administrator roles and RLS.
- The quotation cart confirms durable company receipt without requiring an external handoff; external messaging and payments remain optional integrations.
- The product catalogue lives in the `products` / `product_categories` tables (migrations 0004–0005), not in bundled JSON. Visitors get only safe fields via `getCatalog` (availability bands, never price or exact stock); administrators manage products at `/admin-products`. Real photos go to the `product-images` storage bucket; products without one fall back to the type illustration.
- Company administrator assignment occurs only after the configured company email is verified by hosted authentication; ordinary account creation must not grant quote access.
