import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) { console.error('Set MONGODB_URI in .env.local'); process.exit(1) }

  const [,, username, password, displayName] = process.argv
  if (!username || !password || !displayName) {
    console.error('Usage: npx tsx scripts/seed.ts <username> <password> "<Display Name>"')
    process.exit(1)
  }

  await mongoose.connect(uri)

  const { default: User } = await import('../lib/models/User')
  const existing = await User.findOne({ username: username.toLowerCase() })
  if (existing) { console.error(`User "${username}" already exists`); process.exit(1) }

  const passwordHash = await bcrypt.hash(password, 12)
  await User.create({ username: username.toLowerCase(), passwordHash, displayName })
  console.log(`Created user "${username}" (${displayName})`)
  await mongoose.disconnect()
}

seed().catch((e) => { console.error(e); process.exit(1) })
