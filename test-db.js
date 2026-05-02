const { createClient } = require('@supabase/supabase-js');
// removed dotenv

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRole() {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'faculty' })
    .eq('email', 'leela@vvce.ac.in');
  
  if (error) {
    console.error('Error updating role:', error);
  } else {
    console.log('Successfully updated leela@vvce.ac.in to faculty!');
  }
}
fixRole();
