import { createClient } from '@/src/utils/supabase/client';

export const HostelService = {
  async getAllocations(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('hostel_allocations')
      .select('*')
      .order('room_number', { ascending: true });
    return { data, error };
  },

  async getUserAllocation(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('hostel_allocations')
      .select('*')
      .eq('student_id', userId)
      .single();
    return { data, error };
  },

  async createAllocation(userId: string, allocationData: any) {
    const profile = await this._getUserProfile(userId);
    if (!['warden', 'admin'].includes(profile?.role)) {
      return { error: 'Unauthorized: Only wardens can allocate', data: null };
    }

    const { supabaseAdmin } = await import('@/src/lib/supabase-admin');

    const { data, error } = await supabaseAdmin
      .from('hostel_allocations')
      .insert({
        ...allocationData,
        allocated_by: userId,
      })
      .select()
      .single();

    if (!error) {
      await this._logAudit(userId, 'ALLOCATION_CREATED', 'hostel_allocations', data?.id);
    }

    return { data, error };
  },

  async deleteAllocation(userId: string, allocationId: string) {
    const profile = await this._getUserProfile(userId);
    if (!['warden', 'admin'].includes(profile?.role)) {
      return { error: 'Unauthorized' };
    }

    const { supabaseAdmin } = await import('@/src/lib/supabase-admin');

    const { data: oldData } = await supabaseAdmin
      .from('hostel_allocations')
      .select('*')
      .eq('id', allocationId)
      .single();

    const { error } = await supabaseAdmin
      .from('hostel_allocations')
      .delete()
      .eq('id', allocationId);

    if (!error) {
      await this._logAudit(userId, 'ALLOCATION_DELETED', 'hostel_allocations', allocationId);
    }

    return { error };
  },

  async getComplaints(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('hostel_complaints')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getAnnouncements(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('hostel_announcements')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createComplaint(userId: string, complaintData: any) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('hostel_complaints')
      .insert({
        ...complaintData,
        student_id: userId,
      })
      .select()
      .single();
    return { data, error };
  },

  async updateComplaintStatus(userId: string, complaintId: string, status: string, response: string) {
    const profile = await this._getUserProfile(userId);
    if (!['warden', 'admin'].includes(profile?.role)) {
      return { error: 'Unauthorized', data: null };
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('hostel_complaints')
      .update({
        status,
        warden_response: response,
        responded_by: userId,
        updated_at: new Date(),
      })
      .eq('id', complaintId)
      .select()
      .single();

    if (!error) {
      await this._logAudit(userId, 'COMPLAINT_UPDATED', 'hostel_complaints', complaintId);
    }

    return { data, error };
  },

  async createAnnouncement(userId: string, announcementData: any) {
    const profile = await this._getUserProfile(userId);
    if (!['warden', 'admin'].includes(profile?.role)) {
      return { error: 'Unauthorized', data: null };
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('hostel_announcements')
      .insert({
        ...announcementData,
        warden_id: userId,
      })
      .select()
      .single();

    return { data, error };
  },

  async getProfileByEmail(email: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    return { data, error };
  },

  async getAllocationByEmail(email: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('hostel_allocations')
      .select('*')
      .eq('student_email', email)
      .single();

    return { data, error };
  },

  async _getUserProfile(userId: string) {
    const { supabaseAdmin } = await import('@/src/lib/supabase-admin');
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    return data;
  },

  async _logAudit(userId: string, action: string, table: string, recordId: string) {
    try {
      const { supabaseAdmin } = await import('@/src/lib/supabase-admin');
      await supabaseAdmin.from('audit_logs').insert({
        user_id: userId,
        action,
        table_name: table,
        record_id: recordId,
      });
    } catch (err) {
      console.error('Audit log error:', err);
    }
  },
};
