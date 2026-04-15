const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  const College = require('./models/College');

  // Find the main college (BPIT)
  const mainCollege = await College.findOne({ name: /Bhagwan/i });
  if (!mainCollege) {
    console.error('Main college not found!');
    process.exit(1);
  }

  console.log(`Reassigning orphaned users to: ${mainCollege.name} [${mainCollege._id}]`);

  // Get all valid college IDs
  const colleges = await College.find({}, '_id');
  const validCollegeIds = colleges.map(c => c._id.toString());

  // Find users whose college is not in valid list
  const users = await User.find({});
  let fixed = 0;
  for (const user of users) {
    const collegeId = user.college?.toString();
    if (!collegeId || !validCollegeIds.includes(collegeId)) {
      await User.findByIdAndUpdate(user._id, { college: mainCollege._id });
      console.log(`  Fixed: ${user.name} (${user.email})`);
      fixed++;
    }
  }

  console.log(`\nFixed ${fixed} orphaned users.`);
  process.exit(0);
}).catch(console.error);
