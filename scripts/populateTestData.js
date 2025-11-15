const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("../src/models/user");
const ConnectRequest = require("../src/models/connectRequest");

// Sample data for generating users
const names = [
  "Alice Johnson", "Bob Smith", "Charlie Brown", "Diana Prince", "Ethan Hunt",
  "Fiona Green", "George Wilson", "Hannah Martinez", "Ian Thompson", "Julia Roberts",
  "Kevin Hart", "Laura Chen", "Michael Jordan", "Nancy Drew", "Oliver Twist",
  "Patricia Lee", "Quinn Taylor", "Rachel Green", "Steve Rogers", "Tina Turner",
  "Uma Thurman", "Victor Stone", "Wendy Williams", "Xavier Woods", "Yara Shahidi",
  "Zachary Levi", "Amy Adams", "Ben Affleck", "Cate Blanchett", "Daniel Craig",
  "Emma Watson", "Frank Ocean", "Grace Kelly", "Henry Cavill", "Isla Fisher",
  "Jack Black", "Kate Winslet", "Liam Neeson", "Mila Kunis", "Noah Centineo",
  "Olivia Wilde", "Paul Rudd", "Queen Latifah", "Ryan Reynolds", "Scarlett Johansson",
  "Tom Hanks", "Uma Thurman", "Viola Davis", "Will Smith", "Zendaya"
];

const genders = ["Male", "Female", "Other"];
const locations = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
  "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
  "Austin", "Jacksonville", "San Francisco", "Columbus", "Fort Worth",
  "Charlotte", "Seattle", "Denver", "Boston", "Nashville"
];

const skillsList = [
  "JavaScript", "Python", "Java", "React", "Node.js", "Vue.js", "Angular",
  "TypeScript", "MongoDB", "PostgreSQL", "MySQL", "Redis", "Docker",
  "Kubernetes", "AWS", "Azure", "GCP", "GraphQL", "REST API", "Microservices",
  "Machine Learning", "Data Science", "DevOps", "CI/CD", "Git", "Linux",
  "Agile", "Scrum", "UI/UX", "Design", "Product Management"
];

// Generate random skills array
const getRandomSkills = () => {
  const numSkills = Math.floor(Math.random() * 5) + 2; // 2-6 skills
  const shuffled = [...skillsList].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numSkills);
};

// Generate random about text
const getRandomAbout = (name) => {
  const abouts = [
    `Hi, I'm ${name.split(' ')[0]}! Passionate developer looking to connect.`,
    `${name.split(' ')[0]} here. Love coding and building amazing products.`,
    `Developer and tech enthusiast. Always learning something new!`,
    `Full-stack developer with a passion for clean code and great UX.`,
    `Tech professional seeking meaningful connections in the dev community.`,
    `Building the future, one commit at a time. Let's connect!`,
    `Software engineer passionate about solving complex problems.`,
    `Developer, designer, and dreamer. Always up for a good tech discussion!`
  ];
  return abouts[Math.floor(Math.random() * abouts.length)];
};

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    return false;
  }
};

// Create 50 users
const createUsers = async () => {
  console.log("\n📝 Creating 50 users...");
  const users = [];
  const usedEmails = new Set();

  for (let i = 0; i < 50; i++) {
    let email;
    do {
      const namePart = names[i].toLowerCase().replace(/\s+/g, '');
      email = `${namePart}${i}@example.com`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = new User({
      name: names[i],
      email: email,
      password: hashedPassword,
      age: Math.floor(Math.random() * 30) + 22, // 22-52 years old
      gender: genders[Math.floor(Math.random() * genders.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      skills: getRandomSkills(),
      about: getRandomAbout(names[i])
    });

    users.push(user);
  }

  // Clear existing users (optional - comment out if you want to keep existing data)
  // await User.deleteMany({});
  
  const savedUsers = await User.insertMany(users);
  console.log(`✅ Created ${savedUsers.length} users`);
  return savedUsers;
};

// Login as a user and get token (simulated - we'll just use the user object)
const loginUser = async (user) => {
  console.log(`\n🔐 Logged in as: ${user.name} (${user.email})`);
  return user;
};

// Send connection requests
const sendConnectionRequests = async (loggedInUser, allUsers) => {
  console.log("\n📤 Sending connection requests...");
  const otherUsers = allUsers.filter(u => u._id.toString() !== loggedInUser._id.toString());
  const numRequests = Math.min(10, otherUsers.length); // Send to 10 random users
  const selectedUsers = otherUsers.sort(() => 0.5 - Math.random()).slice(0, numRequests);

  let successCount = 0;
  for (const targetUser of selectedUsers) {
    try {
      // Randomly choose status: "interested" or "ignore"
      const status = Math.random() > 0.3 ? "interested" : "ignore";
      
      // Check if request already exists
      const existingRequest = await ConnectRequest.findOne({
        $or: [
          { fromUserId: loggedInUser._id, toUserId: targetUser._id },
          { fromUserId: targetUser._id, toUserId: loggedInUser._id }
        ]
      });

      if (!existingRequest) {
        const request = new ConnectRequest({
          fromUserId: loggedInUser._id,
          toUserId: targetUser._id,
          status: status
        });
        await request.save();
        console.log(`  ✓ Sent ${status} request to ${targetUser.name}`);
        successCount++;
      }
    } catch (error) {
      console.log(`  ✗ Failed to send request to ${targetUser.name}: ${error.message}`);
    }
  }
  console.log(`✅ Sent ${successCount} connection requests`);
};

// Have other users send requests to logged in user
const receiveConnectionRequests = async (loggedInUser, allUsers) => {
  console.log("\n📥 Having other users send requests to logged in user...");
  const otherUsers = allUsers.filter(u => u._id.toString() !== loggedInUser._id.toString());
  const numRequests = Math.min(8, otherUsers.length); // 8 users will send requests
  const selectedUsers = otherUsers.sort(() => 0.5 - Math.random()).slice(0, numRequests);

  let successCount = 0;
  for (const senderUser of selectedUsers) {
    try {
      // Check if request already exists
      const existingRequest = await ConnectRequest.findOne({
        $or: [
          { fromUserId: senderUser._id, toUserId: loggedInUser._id },
          { fromUserId: loggedInUser._id, toUserId: senderUser._id }
        ]
      });

      if (!existingRequest) {
        const request = new ConnectRequest({
          fromUserId: senderUser._id,
          toUserId: loggedInUser._id,
          status: "interested" // All received requests are "interested"
        });
        await request.save();
        console.log(`  ✓ ${senderUser.name} sent interested request`);
        successCount++;
      }
    } catch (error) {
      console.log(`  ✗ Failed: ${error.message}`);
    }
  }
  console.log(`✅ Received ${successCount} connection requests`);
};

// Ignore/reject a received request
const ignoreReceivedRequest = async (loggedInUser) => {
  console.log("\n🚫 Ignoring a received request...");
  
  // Find a request sent to the logged in user with status "interested"
  const request = await ConnectRequest.findOne({
    toUserId: loggedInUser._id,
    status: "interested"
  });

  if (request) {
    // Update status to "rejected" (this is how we "ignore" a request)
    request.status = "rejected";
    await request.save();
    
    const sender = await User.findById(request.fromUserId);
    console.log(`  ✓ Ignored/rejected request from ${sender.name}`);
    return request;
  } else {
    console.log("  ℹ No pending requests to ignore");
    return null;
  }
};

// Main function
const main = async () => {
  try {
    // Connect to database
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }

    // Create 50 users
    const users = await createUsers();

    // Select first user as logged in user
    const loggedInUser = users[0];
    await loginUser(loggedInUser);

    // Send connection requests from logged in user
    await sendConnectionRequests(loggedInUser, users);

    // Have other users send requests to logged in user
    await receiveConnectionRequests(loggedInUser, users);

    // Ignore a received request
    await ignoreReceivedRequest(loggedInUser);

    console.log("\n✅ Test data population completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   - Total users created: ${users.length}`);
    console.log(`   - Logged in as: ${loggedInUser.name} (${loggedInUser.email})`);
    console.log(`   - Password for all users: password123`);
    
    // Show some stats
    const totalRequests = await ConnectRequest.countDocuments();
    const sentRequests = await ConnectRequest.countDocuments({ fromUserId: loggedInUser._id });
    const receivedRequests = await ConnectRequest.countDocuments({ toUserId: loggedInUser._id });
    
    console.log(`\n📈 Connection Request Stats:`);
    console.log(`   - Total requests: ${totalRequests}`);
    console.log(`   - Requests sent by ${loggedInUser.name}: ${sentRequests}`);
    console.log(`   - Requests received by ${loggedInUser.name}: ${receivedRequests}`);

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
};

// Run the script
main();

