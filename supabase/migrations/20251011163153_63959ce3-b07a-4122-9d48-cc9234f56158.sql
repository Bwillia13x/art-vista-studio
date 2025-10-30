-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stylists table
CREATE TABLE public.stylists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  specialty TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create add_ons table
CREATE TABLE public.add_ons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.add_ons ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (no auth required for viewing)
CREATE POLICY "Services are viewable by everyone" 
ON public.services 
FOR SELECT 
USING (true);

CREATE POLICY "Stylists are viewable by everyone" 
ON public.stylists 
FOR SELECT 
USING (true);

CREATE POLICY "Add-ons are viewable by everyone" 
ON public.add_ons 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stylists_updated_at
BEFORE UPDATE ON public.stylists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_add_ons_updated_at
BEFORE UPDATE ON public.add_ons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for services
INSERT INTO public.services (name, description, duration, price, category) VALUES
('Classic Cut', 'Traditional men''s haircut with precision styling', 45, 55.00, 'Haircut'),
('Premium Cut & Style', 'Expert cut with luxury grooming products and styling', 60, 75.00, 'Haircut'),
('Beard Trim & Shape', 'Professional beard sculpting and maintenance', 30, 35.00, 'Beard'),
('Hot Towel Shave', 'Traditional straight razor shave with hot towel treatment', 45, 65.00, 'Shave'),
('The Full Experience', 'Cut, shave, and grooming - the complete package', 90, 120.00, 'Package');

-- Insert sample data for stylists
INSERT INTO public.stylists (name, bio, specialty) VALUES
('Marcus Chen', 'Master barber with 15 years experience in classic and modern cuts', 'Precision Cuts'),
('James Rodriguez', 'Specializing in beard artistry and traditional hot towel shaves', 'Beard & Shave'),
('Alex Thompson', 'Expert in contemporary styling and premium grooming', 'Modern Styling');

-- Insert sample data for add-ons
INSERT INTO public.add_ons (name, description, price) VALUES
('Premium Hair Treatment', 'Nourishing treatment for healthy, styled hair', 25.00),
('Scalp Massage', 'Relaxing therapeutic scalp massage', 15.00),
('Grey Blending', 'Natural grey coverage and blending', 30.00);