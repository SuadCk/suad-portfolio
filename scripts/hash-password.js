
const bcrypt = require("bcryptjs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter your admin password: ", async (password) => {
  if (!password) {
    console.log("Password cannot be empty.");
    rl.close();
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  const encodedHash = Buffer.from(hash).toString("base64");

  console.log("\nYour Base64 password hash:\n");
  console.log(encodedHash);

  rl.close();
});
