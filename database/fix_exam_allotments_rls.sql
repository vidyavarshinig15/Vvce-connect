-- Fix RLS Policy for Exam Allotments to allow COE role to create allotments

DO $$ BEGIN
    -- Drop the existing insert policy
    DROP POLICY IF EXISTS "Faculty and Admins can create allotments" ON public.exam_allotments;
    
    -- Create the new policy including 'coe'
    CREATE POLICY "COE, Faculty, and Admins can create allotments" ON public.exam_allotments 
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('coe', 'faculty', 'admin')
        )
    );

    -- Optional: Ensure COE can also update/delete
    DROP POLICY IF EXISTS "Creators can update allotments" ON public.exam_allotments;
    CREATE POLICY "Creators and COE can update allotments" ON public.exam_allotments 
    FOR UPDATE 
    USING (
        auth.uid() = allocated_by OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coe', 'admin'))
    );

    DROP POLICY IF EXISTS "Creators can delete allotments" ON public.exam_allotments;
    CREATE POLICY "Creators and COE can delete allotments" ON public.exam_allotments 
    FOR DELETE 
    USING (
        auth.uid() = allocated_by OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('coe', 'admin'))
    );
EXCEPTION
    WHEN others THEN null;
END $$;
