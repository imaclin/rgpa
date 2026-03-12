import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const photos = [
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/9ced306d-52b4-4ec3-b7bd-0aa34b18ff51.jpeg?im_w=1200", alt_text: "The Primary - Hero", caption: "The Primary - Large modern home inspired by color" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/a24ff0b4-3485-4440-9eb3-10770670e33f.jpeg?im_w=1200", alt_text: "The Primary Interior", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/576e894a-6a58-41c5-8129-c4481b6490b2.jpeg?im_w=1200", alt_text: "The Primary Living Space", caption: null },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/9c032bc5-4a22-4374-a8f8-c95bac515bc5.jpeg?im_w=1200", alt_text: "The Primary Interior Detail", caption: null },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/1e646473-0f34-471b-8e1b-2168dea214c5.jpeg?im_w=1200", alt_text: "The Primary Interior Detail 2", caption: null },
  // Living room / common areas
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/7e7e9bde-d0e0-4e3d-8d3b-f2e3e4f0a2e5.jpeg?im_w=1200", alt_text: "Living Room", caption: "Living room" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/4a1f1c5a-b9b1-4e5e-b0f2-3f3c2d7f0a1e.jpeg?im_w=1200", alt_text: "Dining Area", caption: "Dining area" },
  // Kitchen
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/e2b1a3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c.jpeg?im_w=1200", alt_text: "Kitchen", caption: "Full kitchen" },
  // Bedrooms
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/efcde576-e1d9-4ac0-9a6f-8ef4c41bffcf.jpeg?im_w=1200", alt_text: "Bedroom 1 - Primary", caption: "Large primary bedroom on 1st floor - King bed" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/3e9540e3-ff99-4654-818a-4a050566ab72.jpeg?im_w=1200", alt_text: "Bedroom 1 Detail", caption: "1st floor primary bedroom with large closet and en suite full bathroom" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/edc48158-a9fb-4f67-9284-de22028b9ae9.jpeg?im_w=1200", alt_text: "Bedroom 2", caption: "Bedroom 2 - King bed" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/debf5793-9c1a-4ae6-8835-5665c7d00139.jpeg?im_w=1200", alt_text: "Bedroom 3", caption: "Bedroom 3 - King bed" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/c7577261-b714-4032-8ddd-0bf70ecfbaa7.jpeg?im_w=1200", alt_text: "Bedroom 4", caption: "Bedroom 4 - Queen bed" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/443b80eb-e20f-4be6-9d5e-2200c968605b.jpeg?im_w=1200", alt_text: "Bedroom 4 Detail", caption: "Bedroom 4 - 2nd Level - Queen bed" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/d6befe80-454a-4aed-bbd6-264b68c3b1be.jpeg?im_w=1200", alt_text: "3rd Floor Loft", caption: "3rd floor loft with color coded books" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/57761c08-c7b4-477b-a166-82e379fe48f5.jpeg?im_w=1200", alt_text: "Bedroom 5", caption: "3rd floor loft bedroom with queen bed" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/70f9c12d-d530-40be-a624-612af903a820.jpeg?im_w=1200", alt_text: "Bedroom 5 Wide", caption: "5th bedroom - 3rd floor loft with seating area, TV, and 2 queen beds" },
  // Bathrooms
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/fba13833-2954-498d-8b0c-e127dd4a06ea.jpeg?im_w=1200", alt_text: "Full Bathroom 1", caption: "1st floor full guest bathroom" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/06e61bf2-dc04-4b6f-8fed-cd9261c73f36.jpeg?im_w=1200", alt_text: "Full Bathroom 2", caption: "Full bathroom 2" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/61968f32-569c-4bef-9c8c-5c6c966f8460.jpeg?im_w=1200", alt_text: "Primary Bathroom", caption: "1st floor primary bathroom with large shower, double vanity, and private toilet room" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/d216db66-78b8-4e29-9fe4-6ae73ba52e39.jpeg?im_w=1200", alt_text: "Full Bathroom 3", caption: "2nd floor full bathroom" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/351534da-d8f6-457e-9e54-2333b8adb4b9.jpeg?im_w=1200", alt_text: "Full Bathroom 4", caption: "2nd floor full bathroom" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/333e08db-edcc-4209-9090-b31c25e22fd3.jpeg?im_w=1200", alt_text: "Full Bathroom 4 Detail", caption: "Full bathroom 4" },
  // Rooftop / Deck
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/a754c106-7c10-44d0-9ac1-9dfcff20982c.jpeg?im_w=1200", alt_text: "Rooftop Deck", caption: "Rooftop deck" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/3cbc9692-8644-405b-8fc3-7284686f137c.jpeg?im_w=1200", alt_text: "Viewing Deck", caption: "2nd floor viewing deck with lake views" },
  // Laundry
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/a7fc4fb7-02cb-4d71-b971-9a489ae61fad.jpeg?im_w=1200", alt_text: "Laundry Area", caption: "Laundry area" },
  // Exterior
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6Njk1NTI4NzI3Nzk0MDI1ODk5/original/fd0ed367-193d-4647-b48c-cc0c899de8c2.jpeg?im_w=1200", alt_text: "Exterior", caption: "Exterior" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/fccdd5bc-5f9a-4ecb-8856-e545d5a88662.jpeg?im_w=1200", alt_text: "Front Exterior", caption: "Front exterior of home" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/f4e727ee-21c9-4e46-9392-21e04fb09fc7.jpeg?im_w=1200", alt_text: "Front Exterior Wide", caption: "Front exterior - Room for 5 cars in back and free street parking" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/a09a48be-c4cb-43b8-b227-0564e6c30096.jpeg?im_w=1200", alt_text: "Exterior Detail", caption: null },
  // Game room
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/4e29b18a-10d3-44e6-a47a-ef8a66f78225.jpeg?im_w=1200", alt_text: "Game Room", caption: "Game room" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/2a31ddb5-b40b-4fbb-8e23-64c311c58112.jpeg?im_w=1200", alt_text: "Game Room 2", caption: "Game room" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/29a057f4-ab55-46e3-9628-e1cb469f2a78.jpeg?im_w=1200", alt_text: "Game Room 3", caption: "Game room" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/55709a30-6135-4656-b879-ac719d09b6a4.jpeg?im_w=1200", alt_text: "Game Room 4", caption: "Game room" },
  // Additional photos
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/164cea2b-538e-4ce3-a374-70c7a97fcebf.jpeg?im_w=1200", alt_text: "Entryway and Staircase", caption: "Entryway and staircase off of front door with built in seating" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/89abc5ab-0034-41d3-96d6-4ea1ca69e221.jpeg?im_w=1200", alt_text: "Entryway Bench", caption: "Entryway with built in bench seating" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/f6bb05b9-2d2d-4f57-8b83-b3fa0e765ee8.jpeg?im_w=1200", alt_text: "Peg Art by MACLIN", caption: "Peg art by MACLIN" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/1f631635-f415-4178-8091-d692ecf11207.jpeg?im_w=1200", alt_text: "Interior Detail", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/4851c65a-7769-4070-8589-a64d43017240.jpeg?im_w=1200", alt_text: "Interior Detail 2", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/e2dac4e2-7213-459f-94d7-28302d6488bd.jpeg?im_w=1200", alt_text: "2nd Floor Hallway", caption: "2nd floor hallway with mini fridge and coffee maker, walkout to back upper deck" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/ae7bea22-1307-481a-818b-556abfb0aaef.jpeg?im_w=1200", alt_text: "Interior Detail 3", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/681b1f12-ec05-4a60-9827-361cc50d62ef.jpeg?im_w=1200", alt_text: "2nd Floor Counter", caption: "2nd floor built in counter" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-695528727794025899/original/b6b1002c-9a5e-4aa4-b396-8f7b3f6d607f.jpeg?im_w=1200", alt_text: "Staircase to 3rd Floor", caption: "Staircase to the 3rd floor loft area" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/505d0bfd-22bc-45c3-9120-ad4f07a51465.jpeg?im_w=1200", alt_text: "Interior Detail 4", caption: null },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/01d36070-7d02-4035-986b-7608a07b1f62.jpeg?im_w=1200", alt_text: "Interior Detail 5", caption: null },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-695528727794025899/original/7c85c2a3-3705-4bc4-a91f-c567470be159.jpeg?im_w=1200", alt_text: "Interior Detail 6", caption: null },
]

async function main() {
  const { data: projects, error: projectError } = await supabase
    .from('projects')
    .select('id, title, slug')
    .or('title.ilike.%primary%,slug.ilike.%primary%')

  if (projectError) {
    console.error('Error finding project:', projectError)
    return
  }

  if (!projects || projects.length === 0) {
    console.log('No "The Primary" project found. Creating one...')

    const { data: newProject, error: createError } = await supabase
      .from('projects')
      .insert({
        title: 'The Primary',
        subtitle: 'A Modern Home Inspired by Color',
        slug: 'the-primary',
        description: 'Unlike anything else in the area. This one of a kind, color inspired modern century home will not disappoint. A spacious well appointed stay designed perfectly for large parties. Offering 5 bedrooms, 4 full baths, large front porch, large back yard with parking, and large viewing deck. Details everywhere you look. Original art curated by local artists. Updated and restored thoughtfully.',
        category: 'residential',
        status: 'completed',
        location: 'Cleveland, Ohio',
        featured_image_url: photos[0].url,
        featured: true,
        sort_order: 1,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating project:', createError)
      return
    }

    console.log('Created project:', newProject.title, '(', newProject.id, ')')
    await insertMedia(newProject.id)
  } else {
    const project = projects[0]
    console.log('Found project:', project.title, '(', project.id, ')')

    await supabase
      .from('projects')
      .update({ featured_image_url: photos[0].url })
      .eq('id', project.id)

    await insertMedia(project.id)
  }
}

async function insertMedia(projectId: string) {
  const { error: deleteError } = await supabase
    .from('media')
    .delete()
    .eq('project_id', projectId)

  if (deleteError) {
    console.error('Error deleting existing media:', deleteError)
  }

  const mediaRecords = photos.map((photo, index) => ({
    project_id: projectId,
    type: 'image' as const,
    url: photo.url,
    alt_text: photo.alt_text,
    caption: photo.caption,
    sort_order: index,
  }))

  const { data, error } = await supabase
    .from('media')
    .insert(mediaRecords)
    .select()

  if (error) {
    console.error('Error inserting media:', error)
    return
  }

  console.log(`Successfully inserted ${data.length} photos for The Primary!`)
}

main().catch(console.error)
