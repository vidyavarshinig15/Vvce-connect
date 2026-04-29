export interface Profile {
  id: string;
  full_name: string;
  branch: string;
  semester?: string | number;
  email?: string;
  phone?: string;
  usn?: string;
  skills?: string;
  achievements?: string;
  linkedin_url?: string;
  resume_link?: string;
  role?: 'admin' | 'student' | 'faculty' | 'warden';
}

export interface HackathonTeam {
  id: string;
  name: string;
  hackathon_name: string;
  description: string;
  start_date: string;
  end_date: string;
  required_skills: string;
  total_size: number;
  spots_open: number;
  target_year: string;
  creator_id: string;
  status: string;
  created_at: string;
  profiles?: Profile;
}

export interface HackathonRequest {
  id: string;
  team_id: string;
  student_id: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  contact_email: string;
  applicant_skills: string;
  project_count: number;
  year_of_study: string;
  created_at: string;
  hackathon_teams: {
    name: string;
    spots_open: number;
  };
  profiles?: Profile;
}

export interface HostelAllocation {
  id: string;
  student_email: string;
  student_name: string;
  usn?: string;
  phone?: string;
  branch?: string;
  hostel_name: string;
  room_number: string;
  sharing_type?: string | number;
  created_at: string;
}

export interface HostelAnnouncement {
  id: string;
  title: string;
  content: string;
  hostel_name: string;
  created_at: string;
}

export interface HostelComplaint {
  id: string;
  student_email: string;
  issue_type: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  hostel_name: string;
  created_at: string;
  warden_response?: string;
}

export interface ClassroomBooking {
  id: string;
  room_number: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  branch: string;
  academic_year: number;
  section: string;
  faculty_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}