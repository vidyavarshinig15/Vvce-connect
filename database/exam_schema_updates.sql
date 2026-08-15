-- 1. Create the new `exams` table
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Ongoing', 'Completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add status tracking to `exam_allotments`
-- Note: If you receive an error about these columns already existing, you can safely ignore it.
ALTER TABLE public.exam_allotments 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Swapped'));

ALTER TABLE public.exam_allotments 
ADD COLUMN IF NOT EXISTS exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE;

-- 3. Enhance existing `notifications` table (if needed)
-- Note: The notifications table already exists for other modules, we just need to make sure `action_link` is supported.
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS action_link TEXT;

-- 4. Enable Row Level Security (RLS) on new exams table
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- 5. Set RLS Policies for exams
DO $$ BEGIN
    CREATE POLICY "Anyone can view exams" ON public.exams FOR SELECT USING (true);
    CREATE POLICY "COE and Admins can manage exams" ON public.exams FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coe', 'admin'))
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
