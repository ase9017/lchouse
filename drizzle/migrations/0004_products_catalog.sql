-- Product catalogue moved from the bundled products.json into the database.
-- Prices and exact stock stay private: visitors only receive the safe public
-- fields through the catalog server function; administrators manage everything.

CREATE TABLE public.product_categories (
 key text PRIMARY KEY CHECK (key ~ '^[a-z]{2,20}$'),
 label text NOT NULL CHECK (char_length(label) BETWEEN 2 AND 80),
 sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.products (
 id text PRIMARY KEY CHECK (id ~ '^\d{5}$'),
 name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 200),
 brand text NOT NULL DEFAULT '' CHECK (char_length(brand) <= 60),
 category text NOT NULL REFERENCES public.product_categories(key) ON UPDATE CASCADE,
 model text NOT NULL DEFAULT '' CHECK (char_length(model) <= 100),
 description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
 price numeric(14,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
 stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
 image_url text CHECK (image_url IS NULL OR char_length(image_url) <= 500),
 featured boolean NOT NULL DEFAULT false,
 active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON public.products(category);
CREATE INDEX products_active_featured_idx ON public.products(active, featured);

CREATE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 NEW.updated_at = now();
 RETURN NEW;
END;
$$;
CREATE TRIGGER products_touch_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.product_categories, public.products TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_categories, public.products TO authenticated;

CREATE POLICY "Company administrators read categories" ON public.product_categories FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Company administrators insert categories" ON public.product_categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Company administrators update categories" ON public.product_categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Company administrators delete categories" ON public.product_categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Company administrators read products" ON public.products FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Company administrators insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Company administrators update products" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Company administrators delete products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

COMMENT ON TABLE public.products IS 'Product catalogue. Price and stock are private; visitors read only safe fields through the public catalog server function.';

-- Public bucket for real product photos uploaded by administrators.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Product images are public" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Company administrators upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Company administrators update product images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Company administrators delete product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
