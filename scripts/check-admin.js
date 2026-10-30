
const { loadEnvConfig } = require("@next/env");
const bcrypt = require("bcryptjs");
const readline = require("readline");

loadEnvConfig(process.cwd());

const email = process.env.ADMIN_EMAIL;
const encodedHash = process.env.ADMIN_PASSWORD_HASH_BASE64;

const hash = encodedHash
  ? Buffer.from(encodedHash, "base64").toString("utf8")
  : "";

console.log("\n--- Admin Configuration Check ---");
console.log("Admin email configured:", Boolean(email));
console.log("Password hash configured:", Boolean(hash));
console.log("Hash length:", hash?.length ?? 0);
console.log("Hash format:", /^\$2[aby]\$12\$/.test(hash || ""));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("\nEnter your admin password to test: ", async (password) => {
  try {
    const matches = await bcrypt.compare(password, hash || "");

    console.log("\n--- Results ---");
    console.log("Password matches hash:", matches);
  } catch (error) {
    console.log("Password check failed:", error.message);
  } finally {
    rl.close();
  }
});
