-- VVCE Connect - Complete Database Schema
-- Designed for Supabase / PostgreSQL

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- Profiles Table (Links to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student', 'faculty', 'warden')),
    branch TEXT,
    semester INTEGER,
    phone TEXT,
    skills TEXT,
    achievements TEXT,
    linkedin_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hackathon Teams Table
CREATE TABLE IF NOT EXISTS public.hackathon_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    hackathon_name TEXT NOT NULL,
    description TEXT DEFAULT 'N/A',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    required_skills TEXT NOT NULL,
    total_size INTEGER NOT NULL DEFAULT 4,
    spots_open INTEGER NOT NULL DEFAULT 3,
    target_year TEXT NOT NULL DEFAULT 'Any',
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Recruiting' CHECK (status IN ('Recruiting', 'Full')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hackathon Requests Table
CREATE TABLE IF NOT EXISTS public.hackathon_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.hackathon_teams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
    contact_email TEXT NOT NULL,
    applicant_skills TEXT NOT NULL,
    project_count INTEGER DEFAULT 0,
    year_of_study TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, student_id)
);

-- Hostel Allocations Table
CREATE TABLE IF NOT EXISTS public.hostel_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable if admitted before signup
    student_email TEXT NOT NULL,
    student_name TEXT NOT NULL,
    usn TEXT NOT NULL,
    phone TEXT NOT NULL,
    branch TEXT NOT NULL,
    hostel_name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    sharing_type INTEGER NOT NULL DEFAULT 2,
    allocated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hostel Announcements Table
CREATE TABLE IF NOT EXISTS public.hostel_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    hostel_name TEXT NOT NULL, -- e.g., 'Boys Hostel', 'All'
    warden_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hostel Complaints Table
CREATE TABLE IF NOT EXISTS public.hostel_complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    student_email TEXT NOT NULL,
    issue_type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
    hostel_name TEXT NOT NULL,
    warden_response TEXT,
    responded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classroom Bookings Table
CREATE TABLE IF NOT EXISTS public.classroom_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number TEXT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    branch TEXT NOT NULL,
    academic_year INTEGER NOT NULL,
    section TEXT NOT NULL,
    faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tutoring Requests Table
CREATE TABLE IF NOT EXISTS public.tutoring_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- The one who eventually teaches
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    requested_date DATE,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Proposed', 'Scheduled', 'Completed', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tutoring Participants Table (Group members)
CREATE TABLE IF NOT EXISTS public.tutoring_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.tutoring_requests(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(request_id, student_id)
);

-- Tutoring Proposals Table
CREATE TABLE IF NOT EXISTS public.tutoring_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.tutoring_requests(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    proposed_date DATE NOT NULL,
    proposed_time TIME NOT NULL,
    venue TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'hostel', 'hackathon', 'tutoring'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INDEXES FOR PERFORMANCE

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

CREATE INDEX idx_hackathon_teams_creator_id ON public.hackathon_teams(creator_id);
CREATE INDEX idx_hackathon_requests_team_id ON public.hackathon_requests(team_id);
CREATE INDEX idx_hackathon_requests_student_id ON public.hackathon_requests(student_id);

CREATE INDEX idx_hostel_allocations_email ON public.hostel_allocations(student_email);
CREATE INDEX idx_hostel_allocations_room ON public.hostel_allocations(hostel_name, room_number);

CREATE INDEX idx_hostel_complaints_email ON public.hostel_complaints(student_email);
CREATE INDEX idx_hostel_complaints_status ON public.hostel_complaints(status);

CREATE INDEX idx_classroom_bookings_date ON public.classroom_bookings(booking_date);
CREATE INDEX idx_classroom_bookings_room ON public.classroom_bookings(room_number);

CREATE INDEX idx_tutoring_requests_tutee_id ON public.tutoring_requests(tutee_id);
CREATE INDEX idx_tutoring_requests_status ON public.tutoring_requests(status);
CREATE INDEX idx_tutoring_participants_req_id ON public.tutoring_participants(request_id);
CREATE INDEX idx_tutoring_proposals_req_id ON public.tutoring_proposals(request_id);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- 4. ROW LEVEL SECURITY (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutoring_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutoring_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutoring_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Audit Logs
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Hackathon Teams
CREATE POLICY "Anyone can view teams" ON public.hackathon_teams
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create teams" ON public.hackathon_teams
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Creators can update own teams" ON public.hackathon_teams
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own teams" ON public.hackathon_teams
    FOR DELETE USING (auth.uid() = creator_id);

-- Hackathon Requests
CREATE POLICY "Users can view their own requests" ON public.hackathon_requests
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Team leaders can view requests for their teams" ON public.hackathon_requests
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.hackathon_teams WHERE id = team_id AND creator_id = auth.uid())
    );

CREATE POLICY "Users can apply to teams" ON public.hackathon_requests
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Team leaders can update request status" ON public.hackathon_requests
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.hackathon_teams WHERE id = team_id AND creator_id = auth.uid())
    );

-- Hostel Allocations
CREATE POLICY "Students can view their own allocation" ON public.hostel_allocations
    FOR SELECT USING (
        student_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "Wardens and Admins can view all allocations" ON public.hostel_allocations
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('warden', 'admin'))
    );

-- Hostel Announcements
CREATE POLICY "Anyone can view announcements" ON public.hostel_announcements
    FOR SELECT USING (true);

-- Hostel Complaints
CREATE POLICY "Students can view their own complaints" ON public.hostel_complaints
    FOR SELECT USING (
        student_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "Wardens and Admins can view all complaints" ON public.hostel_complaints
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('warden', 'admin'))
    );

CREATE POLICY "Students can raise complaints" ON public.hostel_complaints
    FOR INSERT WITH CHECK (
        student_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "Wardens and Admins can update complaints" ON public.hostel_complaints
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('warden', 'admin'))
    );

-- Classroom Bookings
CREATE POLICY "Anyone can view bookings" ON public.classroom_bookings
    FOR SELECT USING (true);

CREATE POLICY "Faculty can create bookings" ON public.classroom_bookings
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('faculty', 'admin'))
    );

-- Tutoring
CREATE POLICY "Anyone can view tutoring requests" ON public.tutoring_requests
    FOR SELECT USING (true);

CREATE POLICY "Users can create tutoring requests" ON public.tutoring_requests
    FOR INSERT WITH CHECK (auth.uid() = tutee_id);

CREATE POLICY "Tutees can update/delete their requests" ON public.tutoring_requests
    FOR ALL USING (auth.uid() = tutee_id);

CREATE POLICY "Anyone can view participants" ON public.tutoring_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can join/leave tutoring groups" ON public.tutoring_participants
    FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Tutors can view their proposals" ON public.tutoring_proposals
    FOR SELECT USING (auth.uid() = tutor_id);

CREATE POLICY "Tutees can view proposals for their requests" ON public.tutoring_proposals
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.tutoring_requests WHERE id = request_id AND tutee_id = auth.uid())
    );

CREATE POLICY "Tutors can submit proposals" ON public.tutoring_proposals
    FOR INSERT WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Tutees can accept/reject proposals" ON public.tutoring_proposals
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.tutoring_requests WHERE id = request_id AND tutee_id = auth.uid())
    );

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);
