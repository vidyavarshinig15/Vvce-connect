import { NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';
import { supabaseAdmin } from '@/src/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check if user is Warden or Admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .maybeSingle();

    const emailLower = user.email?.toLowerCase() || profile?.email?.toLowerCase() || '';
    const isPrivileged =
      profile?.role === 'warden' ||
      profile?.role === 'admin' ||
      user.email === 'vvceconnect.official@gmail.com' ||
      emailLower.includes('warden');

    if (!isPrivileged) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, allocationData, allocationId } = await request.json();

    if (action === 'insert') {
      const email = allocationData.student_email?.toLowerCase().trim();
      const roomNumber = allocationData.room_number?.trim();
      const hostelName = allocationData.hostel_name;

      // 1. Check for existing allocation for this student
      const { data: existingStudent } = await supabaseAdmin
        .from('hostel_allocations')
        .select('id, room_number, hostel_name')
        .eq('student_email', email)
        .maybeSingle();

      if (existingStudent) {
        return NextResponse.json({ 
          error: `Student ${email} is already allocated to Room ${existingStudent.room_number} in ${existingStudent.hostel_name}` 
        }, { status: 400 });
      }

      // 2. Capacity Check
      const { data: occupants } = await supabaseAdmin
        .from('hostel_allocations')
        .select('id, sharing_type')
        .eq('hostel_name', hostelName)
        .eq('room_number', roomNumber);

      const currentOccupants = occupants?.length || 0;
      const roomCapacity = occupants && occupants.length > 0 
        ? occupants[0].sharing_type 
        : parseInt(allocationData.sharing_type || '2');

      if (currentOccupants >= roomCapacity) {
        return NextResponse.json({ 
          error: `Room ${roomNumber} is full (${currentOccupants}/${roomCapacity})` 
        }, { status: 400 });
      }

      let studentId = allocationData.student_id || null;
      if (!studentId && email) {
        const { data: studentProfile, error: studentProfileError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (studentProfileError) throw studentProfileError;
        studentId = studentProfile?.id || null;
      }

      const { error } = await supabaseAdmin.from('hostel_allocations').insert({
        ...allocationData,
        student_email: email,
        room_number: roomNumber,
        student_id: studentId,
        usn: (allocationData.usn || '').trim(),
        allocated_by: user.id,
      });

      if (error) throw error;
      return NextResponse.json({ message: 'Allocation successful' });
    }

    if (action === 'delete') {
      const { error } = await supabaseAdmin.from('hostel_allocations').delete().eq('id', allocationId);
      if (error) throw error;
      return NextResponse.json({ message: 'Vacated successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
