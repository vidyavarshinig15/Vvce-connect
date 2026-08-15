-- 1. Add target_faculty_approval_status to track the first step of the workflow
ALTER TABLE public.exam_swap_requests 
ADD COLUMN IF NOT EXISTS target_faculty_approval_status TEXT DEFAULT 'Pending' 
CHECK (target_faculty_approval_status IN ('Pending', 'Approved', 'Rejected'));

-- 2. Ensure Faculty can update their incoming swap requests (Accept/Reject)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Target Faculty can update swap requests" ON public.exam_swap_requests;
    
    CREATE POLICY "Target Faculty can update swap requests" ON public.exam_swap_requests 
    FOR UPDATE 
    USING (auth.uid() = target_faculty_id);
EXCEPTION
    WHEN others THEN null;
END $$;
