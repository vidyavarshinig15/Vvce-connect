import { supabaseAdmin } from '@/src/lib/supabase-admin';

export const AuthService = {
  async createUser(email: string, password: string, fullName: string) {
    if (!email?.endsWith('@vvce.ac.in')) {
      return { error: 'Only VVCE email addresses allowed' };
    }

    const role = this._determineRole(email);

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) return { error: authError.message };

    if (authData.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: fullName,
          email,
          role,
          updated_at: new Date(),
        });

      if (profileError) return { error: profileError.message };

      await this._logAudit(authData.user.id, 'USER_CREATED', 'profiles', authData.user.id);
    }

    return { user: authData.user, error: null };
  },

  _determineRole(email: string): 'admin' | 'student' | 'faculty' | 'warden' {
    const emailLower = email.toLowerCase();

    if (emailLower === 'vvceconnect.official@gmail.com') return 'admin';
    if (emailLower.includes('warden')) return 'warden';
    if (/^vvce\d{2}[a-z0-9]+@vvce\.ac\.in$/.test(emailLower)) return 'student';
    if (emailLower.endsWith('@vvce.ac.in')) return 'faculty';

    return 'student';
  },

  async _logAudit(userId: string | null, action: string, tableName: string, recordId: string) {
    try {
      await supabaseAdmin.from('audit_logs').insert({
        user_id: userId,
        action,
        table_name: tableName,
        record_id: recordId,
        created_at: new Date(),
      });
    } catch (err) {
      console.error('Audit log failed:', err);
    }
  },
};