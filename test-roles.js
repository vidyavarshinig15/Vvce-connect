function determineRole(email) {
  const emailLower = email.toLowerCase();
  let expectedRole = 'student'; // default fallback
  
  if (emailLower === 'vvceconnect.official@gmail.com') {
    expectedRole = 'admin';
  } else if (emailLower === 'warden@vvce.ac.in') {
    expectedRole = 'warden';
  } else if (emailLower.endsWith('@vvce.ac.in')) {
    const studentRegex = /^vvce\d{2}[a-z]+\d{4}@vvce\.ac\.in$/;
    if (studentRegex.test(emailLower)) {
      expectedRole = 'student';
    } else {
      expectedRole = 'faculty'; // Any other @vvce.ac.in email is a faculty
    }
  }
  return expectedRole;
}

const testCases = [
  // Warden Rule
  "warden@vvce.ac.in",
  
  // Student Rule (vvce + 2 digits + branch + 4 digits @vvce.ac.in)
  "vvce23cse0032@vvce.ac.in",
  "vvce22ise0032@vvce.ac.in",
  "vvce24ece1234@vvce.ac.in",
  "vvce21aiml0001@vvce.ac.in",
  
  // Faculty Rule (anyname@vvce.ac.in except warden and students)
  "leela@vvce.ac.in",
  "pp@vvce.ac.in",
  "vidya@vvce.ac.in",
  "dr.smith@vvce.ac.in",
  "principal@vvce.ac.in",
  
  // Edge Cases / Invalid / Outsiders
  "random.student@gmail.com",
  "vvce23cse0032@yahoo.com",
  "vvceconnect.official@gmail.com"
];

console.log("======================================");
console.log("   ROLE ROUTING LOGIC TEST RESULTS    ");
console.log("======================================\n");

testCases.forEach(email => {
  const role = determineRole(email);
  console.log(`${email.padEnd(35, ' ')} -> ${role.toUpperCase()}`);
});

console.log("\n======================================");
