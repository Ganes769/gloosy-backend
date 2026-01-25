import User from "../model/userSchema.ts";
import UserProfile from "../model/userProfileSchema.ts";
import { hashPassword } from "./hashPassword.ts";

// Sample data arrays for generating random users
const firstNames = [
  "John", "Jane", "Michael", "Sarah", "David", "Emily", "James", "Emma",
  "Robert", "Olivia", "William", "Sophia", "Richard", "Isabella", "Joseph",
  "Ava", "Thomas", "Mia", "Charles", "Charlotte", "Daniel", "Amelia",
  "Matthew", "Harper", "Anthony", "Evelyn", "Mark", "Abigail", "Donald",
  "Elizabeth", "Steven", "Sofia", "Paul", "Avery", "Andrew", "Ella",
  "Joshua", "Scarlett", "Kenneth", "Victoria", "Kevin", "Aria", "Brian",
  "Grace", "George", "Chloe", "Timothy", "Camila", "Ronald", "Penelope",
  "Jason", "Riley", "Edward", "Layla", "Jeffrey", "Lillian", "Ryan",
  "Nora", "Jacob", "Zoey", "Gary", "Mila", "Nicholas", "Aubrey",
  "Eric", "Hannah", "Jonathan", "Addison", "Stephen", "Eleanor", "Larry",
  "Natalie", "Justin", "Luna", "Scott", "Savannah", "Brandon", "Leah",
  "Benjamin", "Bella", "Samuel", "Claire", "Frank", "Lucy", "Gregory",
  "Paisley", "Raymond", "Everly", "Alexander", "Anna", "Patrick", "Caroline",
  "Jack", "Nova", "Dennis", "Genesis", "Jerry", "Aaliyah", "Tyler", "Kennedy",
  "Aaron", "Kinsley", "Jose", "Allison", "Henry", "Maya", "Adam", "Willow",
  "Douglas", "Naomi", "Nathan", "Elena", "Zachary", "Sarah", "Peter", "Ariana",
  "Kyle", "Allison", "Noah", "Gabriella", "Ethan", "Alice", "Jeremy", "Madelyn",
  "Walter", "Cora", "Christian", "Ruby", "Keith", "Eva", "Roger", "Serenity",
  "Terry", "Autumn", "Gerald", "Adeline", "Harold", "Hailey", "Sean", "Gianna",
  "Austin", "Valentina", "Carl", "Isla", "Arthur", "Brielle", "Lawrence", "Claire",
  "Dylan", "Violet", "Jesse", "Stella", "Jordan", "Aurora", "Bryan", "Bella",
  "Billy", "Skylar", "Joe", "Lucy", "Ralph", "Paisley", "Roy", "Everly",
  "Eugene", "Anna", "Wayne", "Caroline", "Louis", "Nova", "Philip", "Genesis",
  "Johnny", "Aaliyah", "Bobby", "Kennedy", "Howard", "Kinsley", "Randy", "Allison"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris",
  "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen",
  "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
  "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter",
  "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz",
  "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
  "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson",
  "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
  "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza",
  "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers",
  "Long", "Ross", "Foster", "Jimenez", "Powell", "Jenkins", "Perry", "Russell",
  "Sullivan", "Bell", "Coleman", "Butler", "Henderson", "Barnes", "Gonzales",
  "Fisher", "Vasquez", "Simmons", "Romero", "Jordan", "Patterson", "Alexander",
  "Hamilton", "Graham", "Reynolds", "Griffin", "Wallace", "Moreno", "West",
  "Cole", "Hayes", "Bryant", "Herrera", "Gibson", "Ellis", "Tran", "Medina"
];

const descriptions = [
  "Software Developer", "Video Creator", "Photographer", "Content Creator",
  "Digital Artist", "Video Editor", "Photography Expert", "Creative Director",
  "Media Producer", "Visual Storyteller", "Multimedia Specialist", "Creative Professional",
  "Video Production Specialist", "Photo Editor", "Content Strategist", "Visual Designer",
  "Media Content Creator", "Creative Videographer", "Professional Photographer", "Digital Content Creator"
];

const primarySkills = ["Video creation", "Photo Creation"];

// Generate a random date of birth between 1980 and 2000
const getRandomDateOfBirth = (): Date => {
  const year = Math.floor(Math.random() * (2000 - 1980 + 1)) + 1980;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1; // Use 28 to avoid month-end issues
  return new Date(year, month, day);
};

// Generate random profile picture URL (using placeholder service)
const getRandomProfilePicture = (): string => {
  const seed = Math.floor(Math.random() * 1000);
  return `https://res.cloudinary.com/df9sy6tw7/image/upload/v1768514044/profile-${seed}.jpg`;
};


// Generate a single user data object
const generateUserData = async (index: number) => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const email = `user${index}@example.com`;
  const password = await hashPassword("password123"); // Default password for all seeded users
  // Ensure at least 50% are creators, but allow mix
  const role = Math.random() > 0.3 ? "creator" : "customer";
  
  return {
    role,
    email,
    password,
    firstName,
    lastName,
    userName: `${firstName} ${lastName}`,
    dateOfBirth: getRandomDateOfBirth(),
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    experience: Math.floor(Math.random() * 20) + 1, // 1-20 years
    primarySkill: primarySkills[Math.floor(Math.random() * primarySkills.length)],
    profilePicture: getRandomProfilePicture(),
  };
};

// Seed function to create 200 users and their profiles
export const seedUsers = async () => {
  try {
    console.log("Starting to seed 200 users...");
    
    // Check if users already exist
    const existingUsersCount = await User.countDocuments();
    if (existingUsersCount > 0) {
      console.log(`Database already contains ${existingUsersCount} users. Skipping seed.`);
      return;
    }

    const users = [];
    const userProfiles = [];

    // Generate 200 users
    for (let i = 1; i <= 200; i++) {
      const userData = await generateUserData(i);
      users.push(userData);
    }

    // Insert all users
    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    // Create user profiles for each user
    for (const user of createdUsers) {
      const profileData = {
        user: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        dateOfBirth: user.dateOfBirth,
        description: user.description,
        profilePicture: user.profilePicture,
        primarySkill: user.primarySkill,
        experience: user.experience,
      };
      userProfiles.push(profileData);
    }

    // Insert all user profiles
    const createdProfiles = await UserProfile.insertMany(userProfiles);
    console.log(`Created ${createdProfiles.length} user profiles`);

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
};
