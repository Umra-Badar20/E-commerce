import dns from 'node:dns/promises'
dns.setServers(['1.1.1.1','8.8.8.8'])

import mongoose from "mongoose"
main().catch(err => console.log(err));

async function main() {
  try{
    await mongoose.connect('mongodb+srv://umrabadar55_db_user:K3Essl9YJbq4QjZh@cluster0.wgpc8ok.mongodb.net/user');
  console.log("Connected to DB");
  }catch(err){
    console.log("Error connecting to DB", err);
  }
}
export default main