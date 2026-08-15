-- Fix RLS Policy for Notifications to allow system/users to insert them
DO $$ BEGIN
    DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
    
    CREATE POLICY "Anyone can insert notifications" ON public.notifications 
    FOR INSERT 
    WITH CHECK (true);
EXCEPTION
    WHEN others THEN null;
END $$;
