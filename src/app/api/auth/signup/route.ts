import { NextResponse } from 'next/server';
import { AuthService } from '@/src/services/supabase/auth.service';

export async function POST(request: Request) {
  try {
    const { fullName, email, password } = await request.json();

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const { user, error } = await AuthService.createUser(email, password, fullName);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Account created successfully! You can now log in." },
      { status: 200 }
    );

  } catch (err) {
    console.error("Signup route error:", err);
    return NextResponse.json({ error: "Internal Server Error during signup." }, { status: 500 });
  }
}