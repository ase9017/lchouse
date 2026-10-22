CREATE TABLE public.quote_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 request_key uuid NOT NULL UNIQUE,
 customer_name text NOT NULL CHECK (char_length(customer_name) BETWEEN 2 AND 100),
 phone text NOT NULL CHECK (phone ~ '^\+?[0-9]{10,15}$'),
 email text NOT NULL DEFAULT '' CHECK (char_length(email) <= 255),
 company text NOT NULL DEFAULT '' CHECK (char_length(company) <= 150),
 address text NOT NULL DEFAULT '' CHECK (char_length(address) <= 300),
 notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 1000),
 items jsonb NOT NULL CHECK (jsonb_typeof(items) = 'array' AND jsonb_array_length(items) BETWEEN 1 AND 100),
 estimated_total numeric(14,2) NOT NULL CHECK (estimated_total >= 0),
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'closed')),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.quote_requests TO service_role;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.quote_requests IS 'Private customer quotation inbox. Public validated server function may insert only; no public or ordinary authenticated reads.';