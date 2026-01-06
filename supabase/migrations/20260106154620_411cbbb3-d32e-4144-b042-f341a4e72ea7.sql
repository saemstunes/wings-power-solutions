-- Product catalog table for spare parts
CREATE TABLE public.product_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT,
  category TEXT NOT NULL,
  part_number TEXT,
  short_description TEXT,
  full_description TEXT,
  specifications JSONB DEFAULT '{}',
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'KES',
  stock_quantity INTEGER DEFAULT 0,
  min_order_quantity INTEGER DEFAULT 1,
  primary_image_url TEXT,
  additional_images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  compatible_engines TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_catalog ENABLE ROW LEVEL SECURITY;

-- Public read policy for products
CREATE POLICY "Products are publicly viewable" 
ON public.product_catalog 
FOR SELECT 
USING (true);

-- Contact submissions table
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  message TEXT NOT NULL,
  product_id UUID REFERENCES public.product_catalog(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit contact form
CREATE POLICY "Anyone can submit contact form" 
ON public.contact_submissions 
FOR INSERT 
WITH CHECK (true);

-- Quote requests table
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  company TEXT,
  product_id UUID REFERENCES public.product_catalog(id),
  product_name TEXT,
  part_number TEXT,
  quantity INTEGER DEFAULT 1,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Anyone can submit quotes
CREATE POLICY "Anyone can submit quote requests" 
ON public.quotes 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better search performance
CREATE INDEX idx_product_catalog_category ON public.product_catalog(category);
CREATE INDEX idx_product_catalog_brand ON public.product_catalog(brand);
CREATE INDEX idx_product_catalog_status ON public.product_catalog(status);
CREATE INDEX idx_product_catalog_name_search ON public.product_catalog USING gin(to_tsvector('english', name || ' ' || COALESCE(short_description, '')));
CREATE INDEX idx_product_catalog_tags ON public.product_catalog USING gin(tags);
CREATE INDEX idx_product_catalog_compatible_engines ON public.product_catalog USING gin(compatible_engines);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for product_catalog
CREATE TRIGGER update_product_catalog_updated_at
BEFORE UPDATE ON public.product_catalog
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();