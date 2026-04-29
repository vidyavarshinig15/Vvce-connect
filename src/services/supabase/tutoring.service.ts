import { createClient } from '@/src/utils/supabase/client';

export const TutoringService = {
  async getMyRequests(userId: string, joinedRequestIds: string[] = []) {
    const supabase = createClient();
    const query = supabase
      .from('tutoring_requests')
      .select(`
        *,
        tutor:profiles!tutor_id(full_name, email, phone),
        tutoring_participants(student_id, profiles(*)),
        tutoring_proposals(*, tutor:profiles!tutor_id(*))
      `)
      .order('created_at', { ascending: false });

    const { data, error } = joinedRequestIds.length > 0
      ? await query.or(`tutee_id.eq.${userId},id.in.(${joinedRequestIds.join(',')})`)
      : await query.eq('tutee_id', userId);

    return { data, error };
  },

  async getMyParticipantRequestIds(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tutoring_participants')
      .select('request_id')
      .eq('student_id', userId);

    return { data, error };
  },

  async getOpenRequests(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tutoring_requests')
      .select(`
        *,
        tutee:profiles!tutee_id(full_name, branch, semester),
        tutoring_participants(student_id, profiles(*))
      `)
      .eq('status', 'Pending')
      .neq('tutee_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      const filtered = data.filter((req: any) =>
        !req.tutoring_participants.some((p: any) => p.student_id === userId)
      );
      return { data: filtered, error: null };
    }

    return { data, error };
  },

  async getMyTeachings(userId: string) {
    const supabase = createClient();
    
    const { data: teachingsData, error: teachingsError } = await supabase
      .from('tutoring_requests')
      .select('*, tutee:profiles!tutee_id(*), tutoring_participants(student_id, profiles(*))')
      .eq('tutor_id', userId)
      .order('created_at', { ascending: false });

    const { data: proposalsData, error: proposalsError } = await supabase
      .from('tutoring_proposals')
      .select('request_id, status, tutoring_requests(*, tutee:profiles!tutee_id(*), tutoring_participants(student_id, profiles(*)))')
      .eq('tutor_id', userId);

    if (teachingsError) return { data: null, error: teachingsError };
    if (proposalsError) return { data: null, error: proposalsError };

    const combinedMap = new Map();
    
    (teachingsData || []).forEach((req: any) => {
      combinedMap.set(req.id, req);
    });

    (proposalsData || []).forEach((prop: any) => {
      if (prop.tutoring_requests && prop.status === 'Pending') {
         const req = Array.isArray(prop.tutoring_requests) ? prop.tutoring_requests[0] : prop.tutoring_requests;
         if (req && !combinedMap.has(req.id)) {
           combinedMap.set(req.id, { ...req, status: 'Proposed' });
         }
      }
    });

    return { data: Array.from(combinedMap.values()), error: null };
  },

  async createRequest(userId: string, requestData: any) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tutoring_requests')
      .insert({
        tutee_id: userId,
        ...requestData,
        status: 'Pending',
      })
      .select()
      .single();

    if (data) {
      await supabase.from('tutoring_participants').insert({
        request_id: data.id,
        student_id: userId,
      });
    }

    return { data, error };
  },

  async joinRequest(userId: string, requestId: string) {
    const supabase = createClient();

    const { data: existing } = await supabase
      .from('tutoring_participants')
      .select('id')
      .eq('request_id', requestId)
      .eq('student_id', userId)
      .single();

    if (existing) {
      return { error: 'Already joined' };
    }

    const { error } = await supabase
      .from('tutoring_participants')
      .insert({
        request_id: requestId,
        student_id: userId,
      });

    return { error };
  },

  async deleteRequest(userId: string, requestId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('tutoring_requests')
      .delete()
      .eq('id', requestId)
      .eq('tutee_id', userId);

    return { error };
  },

  async submitProposal(userId: string, requestId: string, proposalData: any) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tutoring_proposals')
      .insert({
        request_id: requestId,
        tutor_id: userId,
        ...proposalData,
      })
      .select()
      .single();

    // Removed the silent failing update to tutoring_requests since RLS prevents it.
    // The UI now dynamically infers 'Proposed' status based on tutoring_proposals.

    return { data, error };
  },

  async acceptProposal(userId: string, proposalId: string) {
    const supabase = createClient();

    const { data: proposal } = await supabase
      .from('tutoring_proposals')
      .select('request_id, tutor_id')
      .eq('id', proposalId)
      .single();

    if (!proposal) return { error: 'Proposal not found' };

    const { data: request } = await supabase
      .from('tutoring_requests')
      .select('tutee_id')
      .eq('id', proposal.request_id)
      .single();

    if (request?.tutee_id !== userId) {
      return { error: 'Unauthorized' };
    }

    const { error: updateError } = await supabase
      .from('tutoring_requests')
      .update({
        status: 'Scheduled',
        tutor_id: proposal.tutor_id,
      })
      .eq('id', proposal.request_id);

    const { error: proposalError } = await supabase
      .from('tutoring_proposals')
      .update({ status: 'Accepted' })
      .eq('id', proposalId);

    return { error: updateError || proposalError };
  },
};