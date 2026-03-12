import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const photos = [
  // Hero / overview
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/52034d96-99fc-4a0f-9bff-90c6f573573b.jpeg?im_w=1200", alt_text: "The Market House - Hero", caption: "The Market House" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/6c04c0d4-55dc-413b-8e9d-d0ed1e40c159.jpeg?im_w=1200", alt_text: "Interior Overview", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/caac2013-afa7-4593-8d5b-168bf1638911.jpeg?im_w=1200", alt_text: "Interior Overview 2", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/e8a3cf99-7488-4388-848a-e465dff94c4e.jpeg?im_w=1200", alt_text: "Interior Overview 3", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/f67ba7eb-7391-468e-bb17-01615aa5f71b.jpeg?im_w=1200", alt_text: "Interior Overview 4", caption: null },
  // Living room
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/7e5e8c3d-5e6c-4c1a-9d3b-8f7a6b5c4d2e.jpeg?im_w=1200", alt_text: "Living Room", caption: "Living room" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/0e5f8a3b-2c4d-4e6f-8a7b-9c0d1e2f3a4b.jpeg?im_w=1200", alt_text: "Living Room 2", caption: null },
  // Kitchen
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d.jpeg?im_w=1200", alt_text: "Kitchen", caption: "Full kitchen" },
  // Bedroom 1
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/5e96e6f8-3486-4ca5-b547-69052d9c9a4a.jpeg?im_w=1200", alt_text: "Bedroom 1", caption: "Bedroom 1 - Queen bed" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/0b6a3e7c-d5f4-4a8b-9c2d-1e3f5a7b9c0d.jpeg?im_w=1200", alt_text: "Bedroom 1 Detail", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f.jpeg?im_w=1200", alt_text: "Bedroom 1 Detail 2", caption: null },
  // Bedroom 2
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/bf2b4afa-7097-4385-9d8b-7fe882103625.jpeg?im_w=1200", alt_text: "Bedroom 2", caption: "Bedroom 2 - King bed" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/20788194-00f4-4370-9a1a-df97001ecb1a.jpeg?im_w=1200", alt_text: "Bedroom 2 Detail", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/e4e15293-d40a-4e9d-90cc-85cd2ec1555a.jpeg?im_w=1200", alt_text: "Bedroom 2 Detail 2", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/ff61fbff-1426-4c9e-b215-aef35c9a3953.jpeg?im_w=1200", alt_text: "Bedroom 2 Detail 3", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/3e2e0d63-684c-4924-a1a1-3954226fcd20.jpeg?im_w=1200", alt_text: "Bedroom 2 Detail 4", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/84148199-9fb6-46f9-9e6f-93a4570b97eb.jpeg?im_w=1200", alt_text: "Bedroom 2 Detail 5", caption: null },
  // Bedroom 3
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/ae08b517-d543-48a3-ad09-d0376c9d6b94.jpeg?im_w=1200", alt_text: "Bedroom 3", caption: "Bedroom 3 - King bed" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/5e37b079-b088-416b-8ded-13975b663a89.jpeg?im_w=1200", alt_text: "Bedroom 3 Detail", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/6488aab9-b5c3-49ec-b1d4-5c07ac2d5a90.jpeg?im_w=1200", alt_text: "Bedroom 3 Detail 2", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/ab90c527-c27b-494b-8165-fd9425b8f71f.jpeg?im_w=1200", alt_text: "Bedroom 3 Detail 3", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/294e84c4-085e-4d9a-90fd-7d71f2fc5e59.jpeg?im_w=1200", alt_text: "Bedroom 3 Detail 4", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/06402a94-713e-449e-b738-46f86f408b33.jpeg?im_w=1200", alt_text: "Bedroom 3 Detail 5", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/454ab3f9-0704-46a2-bc4e-f0ed7dc6ece9.jpeg?im_w=1200", alt_text: "Bedroom 3 Detail 6", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/8caed31e-de8b-4f73-b48c-d8a21a25b3c8.jpeg?im_w=1200", alt_text: "Bedroom 3 Detail 7", caption: null },
  // Bathroom 1
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/d0c0c903-9802-461e-8399-1c8b29eacfb5.jpeg?im_w=1200", alt_text: "Full Bathroom 1", caption: "Full bathroom 1" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/9cd9f1aa-d80c-4d3c-8869-0dd07e581204.jpeg?im_w=1200", alt_text: "Full Bathroom 1 Detail", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/2d4c3e57-c73e-4cdc-b1e2-a04c77f73223.jpeg?im_w=1200", alt_text: "Full Bathroom 1 Detail 2", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/faea046f-db6a-48e3-a03e-2c26bee497c0.jpeg?im_w=1200", alt_text: "Full Bathroom 1 Detail 3", caption: null },
  // Bathroom 2
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/314b866f-46b1-448c-8b32-dc7c299707ab.jpeg?im_w=1200", alt_text: "Full Bathroom 2", caption: "Full bathroom 2" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/866cea36-e0f3-4592-88fe-b9a996a85c87.jpeg?im_w=1200", alt_text: "Full Bathroom 2 Detail", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/711c053c-898b-44d2-9af8-b64597ea3974.jpeg?im_w=1200", alt_text: "Full Bathroom 2 Detail 2", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/7da704ad-2ddb-4c79-9e58-305554b63ee8.jpeg?im_w=1200", alt_text: "Full Bathroom 2 Detail 3", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/fc16d2c4-4a5e-4b36-a02d-f7aa88ab8ead.jpeg?im_w=1200", alt_text: "Full Bathroom 2 Detail 4", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/ebf39f2f-db8a-485e-ab0a-2c31b5d08a16.jpeg?im_w=1200", alt_text: "Full Bathroom 2 Detail 5", caption: null },
  // Bathroom 3
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/5323cead-a8aa-46b9-84bb-58f0f2f73165.jpeg?im_w=1200", alt_text: "Full Bathroom 3", caption: "Full bathroom 3 - Step-free access" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/4299bb1a-c865-4d09-938f-1fc1bd89a77a.jpeg?im_w=1200", alt_text: "Full Bathroom 3 Detail", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/d0b2751b-4b26-44b4-9ba7-5e176ff46978.jpeg?im_w=1200", alt_text: "Full Bathroom 3 Detail 2", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/cb520ff2-ebbf-4713-933a-1a044fe6db21.jpeg?im_w=1200", alt_text: "Full Bathroom 3 Detail 3", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/e13f7430-4de8-4dd0-a6f1-e6d3bbd93969.jpeg?im_w=1200", alt_text: "Full Bathroom 3 Detail 4", caption: null },
  // Backyard
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/ff01ffc1-fdb5-41ec-a035-95a39fa91a37.jpeg?im_w=1200", alt_text: "Backyard", caption: "Private fenced backyard" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/fa562b6f-8226-4b54-8c74-c4e468d5771f.jpeg?im_w=1200", alt_text: "Backyard 2", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/5160db4e-7f41-49c4-b2bb-0062f5130a0c.jpeg?im_w=1200", alt_text: "Backyard 3", caption: null },
  // Laundry
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/d6efca2f-6797-4b86-b9dd-423f0053cd6c.jpeg?im_w=1200", alt_text: "Laundry Area", caption: "Laundry area" },
  // Exterior
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/9f4b5397-d9d4-46d0-ba4f-d760fe35e922.jpeg?im_w=1200", alt_text: "Exterior", caption: "Exterior" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/b790b636-d805-4155-a53a-31d7012a1225.jpeg?im_w=1200", alt_text: "Exterior 2", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/bd186549-8d3a-406c-b858-f6981ff5ed31.jpeg?im_w=1200", alt_text: "Exterior 3", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/52c5b25b-9aef-442c-8612-88b9ce62a3e5.jpeg?im_w=1200", alt_text: "Exterior 4", caption: null },
  // Game room
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/265747fb-fd3b-4466-869b-c7b78257944d.jpeg?im_w=1200", alt_text: "Game Room", caption: "Game room with pool table" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/340ad187-c3e4-4c2c-b238-2cedb34dfa39.jpeg?im_w=1200", alt_text: "Game Room 2", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/c051381d-b9ff-43bf-838f-245cb128ac0c.jpeg?im_w=1200", alt_text: "Game Room 3", caption: null },
  // Additional
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/28f13ef0-f3ea-42bd-b583-e49e77c1568b.jpeg?im_w=1200", alt_text: "Interior Detail", caption: null },
]

async function main() {
  console.log('Creating new project: The Market House...')

  const { data: newProject, error: createError } = await supabase
    .from('projects')
    .insert({
      title: 'The Market House',
      subtitle: 'Urban Oasis by the Westside Market',
      slug: 'the-market-house',
      description: 'An urban oasis just steps away from the Westside Market! Located in Ohio City Neighborhood, this 3 bedroom 3 full bathroom bungalow sits just blocks away from downtown on a quiet street. Designed with functionality, style, original character, and modern touches, you will be drawn in by the peacefulness and feeling you get when you walk through the door. Unbelievable location next to Great Lakes Brewery, W 25th Street, Truss Event Space, and Cleveland Guardians Stadium.',
      category: 'residential',
      status: 'completed',
      location: 'Ohio City, Cleveland',
      featured_image_url: photos[0].url,
      featured: true,
      sort_order: 3,
    })
    .select()
    .single()

  if (createError) {
    console.error('Error creating project:', createError)
    return
  }

  console.log('Created project:', newProject.title, '(', newProject.id, ')')

  // Insert media
  const mediaRecords = photos.map((photo, index) => ({
    project_id: newProject.id, type: 'image' as const, url: photo.url,
    alt_text: photo.alt_text, caption: photo.caption, sort_order: index,
  }))

  const { data, error } = await supabase.from('media').insert(mediaRecords).select()
  if (error) { console.error('Error inserting media:', error); return }
  console.log(`Successfully inserted ${data.length} photos for The Market House!`)
}

main().catch(console.error)
