-- 1. Update roles to include 'coe' and 'hod'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'student', 'faculty', 'warden', 'coe', 'hod'));

-- 2. Create the exam_swap_requests table
CREATE TABLE IF NOT EXISTS public.exam_swap_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    allotment_id UUID NOT NULL REFERENCES public.exam_allotments(id) ON DELETE CASCADE,
    requesting_faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_faculty_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- optional if swapping with someone specific
    reason TEXT,
    hod_approval_status TEXT DEFAULT 'Pending' CHECK (hod_approval_status IN ('Pending', 'Approved', 'Rejected')),
    coe_approval_status TEXT DEFAULT 'Pending' CHECK (coe_approval_status IN ('Pending', 'Approved', 'Rejected')),
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS Policies for exam_swap_requests
ALTER TABLE public.exam_swap_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Anyone can view swap requests" ON public.exam_swap_requests FOR SELECT USING (true);
    CREATE POLICY "Faculty can create swap requests" ON public.exam_swap_requests FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('faculty', 'admin')));
    CREATE POLICY "Faculty can update their own swap requests" ON public.exam_swap_requests FOR UPDATE USING (auth.uid() = requesting_faculty_id);
    CREATE POLICY "HOD can update swap requests" ON public.exam_swap_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('hod', 'admin')));
    CREATE POLICY "COE can update swap requests" ON public.exam_swap_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coe', 'admin')));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
