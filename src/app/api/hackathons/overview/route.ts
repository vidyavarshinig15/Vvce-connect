import { NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authData.user.id;

    const { data: teams, error: teamsError } = await supabaseAdmin
      .from('hackathon_teams')
      .select('*')
      .order('created_at', { ascending: false });
    if (teamsError) throw teamsError;

    const creatorIds = Array.from(new Set((teams ?? []).map((team: any) => team.creator_id).filter(Boolean)));
    let creators: any[] = [];

    if (creatorIds.length > 0) {
      const { data: creatorRows, error: creatorError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, branch')
        .in('id', creatorIds);
      if (creatorError) throw creatorError;
      creators = creatorRows ?? [];
    }

    const creatorMap = new Map(creators.map((creator) => [creator.id, creator]));
    const availableTeams = (teams ?? []).map((team: any) => ({
      ...team,
      profiles: creatorMap.get(team.creator_id) || null,
    }));

    const { data: myReqs, error: requestsError } = await supabaseAdmin
      .from('hackathon_requests')
      .select('team_id, status')
      .eq('student_id', userId);
    if (requestsError) throw requestsError;

    const myRequestStatus: Record<string, string> = {};
    (myReqs ?? []).forEach((req: any) => {
      myRequestStatus[String(req.team_id)] = String(req.status);
    });

    const { data: myOwnedTeams, error: myOwnedTeamsError } = await supabaseAdmin
      .from('hackathon_teams')
      .select('id')
      .eq('creator_id', userId);
    if (myOwnedTeamsError) throw myOwnedTeamsError;

    let incomingRequests: any[] = [];
    const teamIds = (myOwnedTeams ?? []).map((team: any) => String(team.id));

    if (teamIds.length > 0) {
      const { data: incoming, error: incomingError } = await supabaseAdmin
        .from('hackathon_requests')
        .select('*')
        .in('team_id', teamIds)
        .in('status', ['Pending', 'Accepted']);
      if (incomingError) throw incomingError;

      const requestRows = incoming ?? [];
      const requesterIds = Array.from(new Set(requestRows.map((row: any) => row.student_id).filter(Boolean)));

      const { data: requestTeams, error: requestTeamsError } = await supabaseAdmin
        .from('hackathon_teams')
        .select('id, name, spots_open')
        .in('id', teamIds);
      if (requestTeamsError) throw requestTeamsError;

      let requesterProfiles: any[] = [];
      if (requesterIds.length > 0) {
        const { data: requesterRows, error: requesterError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .in('id', requesterIds);
        if (requesterError) throw requesterError;
        requesterProfiles = requesterRows ?? [];
      }

      const teamMap = new Map((requestTeams ?? []).map((team: any) => [team.id, team]));
      const profileMap = new Map(requesterProfiles.map((profile: any) => [profile.id, profile]));

      incomingRequests = requestRows.map((row: any) => ({
        ...row,
        hackathon_teams: teamMap.get(row.team_id) || { name: 'Team', spots_open: 0 },
        profiles: profileMap.get(row.student_id) || null,
      }));
    }

    return NextResponse.json({
      availableTeams,
      incomingRequests,
      myRequestStatus,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load hackathon data' }, { status: 500 });
  }
}
