import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const photos = [
  // Hero / overview
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/266d3867-7ed9-427b-920d-e004a70cf85d.jpeg?im_w=1200", alt_text: "The Bamboo Haus - Living Room", caption: "The Bamboo Haus - Mid Century Home in Ohio City" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/4687af85-ff62-40d9-b4ea-5ef4f12ebbe3.jpeg?im_w=1200", alt_text: "Exterior View", caption: null },
  { url: "https://a0.muscache.com/im/pictures/ef78aa73-43ef-41e6-a1fd-e2a8078e8218.jpg?im_w=1200", alt_text: "Patio", caption: null },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-567985744329150362/original/b4fe95e3-a796-4d96-91ee-e4b19a55117e.jpeg?im_w=1200", alt_text: "Bedroom 4", caption: null },
  { url: "https://a0.muscache.com/im/pictures/690144ad-41ae-4af0-97ab-02a4ed38fb68.jpg?im_w=1200", alt_text: "Living Room Detail", caption: null },
  // Living room 1
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/3ba0970b-e052-4fc1-81f2-902d8dcf7fb3.jpeg?im_w=1200", alt_text: "Living Room 1", caption: "Living room" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/3a76a012-5501-46d5-a357-bdbf78155480.jpeg?im_w=1200", alt_text: "Living Room 1 Detail", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/3550c0ea-6c02-48ea-8c64-3e31fdb03984.jpeg?im_w=1200", alt_text: "Living Room 1 Detail 2", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/51e7c36d-27f6-4aa6-89ff-3eafb7f54aab.jpeg?im_w=1200", alt_text: "Living Room 1 Detail 3", caption: null },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-567985744329150362/original/c4db0a0b-96b4-4f54-9ae0-1c4d349b986f.jpeg?im_w=1200", alt_text: "Living Room 1 Detail 4", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/7e9e0eab-f438-4df8-b7e2-2106213b0d98.jpeg?im_w=1200", alt_text: "Living Room 1 Detail 5", caption: null },
  // Living room 2
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/8d9b8ac2-72e8-45f7-a4ce-850c3e4bee58.jpeg?im_w=1200", alt_text: "Living Room 2", caption: "Second living room" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/c816a602-e232-4c0a-bfba-9bb69250c66e.jpeg?im_w=1200", alt_text: "Living Room 2 Detail", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/3783c20e-45f6-418f-8abe-ab760792c55e.jpeg?im_w=1200", alt_text: "Living Room 2 Detail 2", caption: null },
  // Kitchen
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/be823062-733e-4b89-8d7b-edb31db26572.jpeg?im_w=1200", alt_text: "Kitchen 1", caption: "Full kitchen" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/26613cb1-af92-4dcc-bad4-5924a418597f.jpeg?im_w=1200", alt_text: "Kitchen 1 Detail", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/e4cc16aa-f975-4c42-b4db-461de452ad16.jpeg?im_w=1200", alt_text: "Kitchen 2", caption: "Second kitchen" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/c2402e7b-0f2d-4f9c-ad8f-6400d666b304.jpeg?im_w=1200", alt_text: "Kitchen 2 Detail", caption: null },
  // Dining
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/05c766d0-39c1-4a9c-9289-ddd2d4abaf5b.jpeg?im_w=1200", alt_text: "Dining Area", caption: "Dining area" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/0511d3e0-1fb6-48f3-931b-375df68cfe80.jpeg?im_w=1200", alt_text: "Dining Area Detail", caption: null },
  // Bedrooms
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/2b704a77-f20a-448a-bf4c-64daba5afbab.jpeg?im_w=1200", alt_text: "Bedroom 1", caption: "Bedroom 1 - Queen bed" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/25cbca21-a568-40de-aca7-c06686271a0d.jpeg?im_w=1200", alt_text: "Bedroom 2", caption: "Bedroom 2 - King bed" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/71c5ab0a-886b-43f6-a783-a064887604d4.jpeg?im_w=1200", alt_text: "Bedroom 3", caption: "Bedroom 3 - Double bed and single bed" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/40ce70c4-37b7-4ca9-be68-21291f60de49.jpeg?im_w=1200", alt_text: "Bedroom 3 Detail", caption: null },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-567985744329150362/original/576bcc25-ea8a-4c44-a24a-28717cb143ed.jpeg?im_w=1200", alt_text: "Bedroom 4", caption: "Bedroom 4 - Queen bed" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-567985744329150362/original/aad2df4d-5e27-4bbe-8ff1-53035821e9c0.jpeg?im_w=1200", alt_text: "Bedroom 4 Detail", caption: null },
  // Bathrooms
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/a6f6e38e-7114-4c55-84f2-ffb75a203356.jpeg?im_w=1200", alt_text: "Full Bathroom 1", caption: "Full bathroom 1" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/891222f6-f54c-4be9-a79d-3c9009f70bd6.jpeg?im_w=1200", alt_text: "Full Bathroom 1 Detail", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/370ab969-5f1a-4587-b75b-e95c3d0365d6.jpeg?im_w=1200", alt_text: "Full Bathroom 2", caption: "Full bathroom 2" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/4bfbd3af-4e89-42bb-a8eb-31685b9bd707.jpeg?im_w=1200", alt_text: "Full Bathroom 3", caption: "Full bathroom 3" },
  // Patio
  { url: "https://a0.muscache.com/im/pictures/d754f7a8-4b50-409e-a6d3-bd90c20a8ba2.jpg?im_w=1200", alt_text: "Patio", caption: "Patio" },
  // Garage
  { url: "https://a0.muscache.com/im/pictures/65c96821-9281-4c68-89ac-a5d04c547951.jpg?im_w=1200", alt_text: "Garage", caption: "Garage - 2 spaces" },
  // Exterior
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/90e619eb-a281-4a9e-8c83-b3df8a42b7d1.jpeg?im_w=1200", alt_text: "Exterior", caption: "Exterior" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/47b03ad9-fe5f-455d-b164-cf1b457ead47.jpeg?im_w=1200", alt_text: "Exterior 2", caption: null },
  // Sunroom
  { url: "https://a0.muscache.com/im/pictures/38ab5a30-3c1c-401b-9dc8-f056aaea27d7.jpg?im_w=1200", alt_text: "Sunroom", caption: "Sunroom" },
  // Additional
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/cc5d3977-2f89-4df4-9202-73c9153afbf4.jpeg?im_w=1200", alt_text: "Interior Detail", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/bb0c5a5c-e16c-4d0b-b1c0-60ab235be4c4.jpeg?im_w=1200", alt_text: "Interior Detail 2", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-567985744329150362/original/2f3886d5-baba-4f3e-9142-8d5da673070d.jpeg?im_w=1200", alt_text: "Interior Detail 3", caption: null },
]

async function main() {
  const { data: projects, error: projectError } = await supabase
    .from('projects')
    .select('id, title, slug')
    .or('title.ilike.%bamboo%,slug.ilike.%bamboo%')

  if (projectError) {
    console.error('Error finding project:', projectError)
    return
  }

  if (!projects || projects.length === 0) {
    console.log('No Bamboo Haus project found. Creating one...')
    const { data: newProject, error: createError } = await supabase
      .from('projects')
      .insert({
        title: 'The Bamboo Haus',
        subtitle: 'Mid Century Home in Ohio City',
        slug: 'the-bamboo-haus',
        description: 'This mid century home will truly inspire your soul! Japanese and Scandinavian design influence the space to provide a truly fun and unique experience. Vintage furniture, books, and art complement this home\'s unique shapes and clean lines. The combination of warm woods, pops of color, and cool walls will leave you feeling ZEN.',
        category: 'residential',
        status: 'completed',
        location: 'Ohio City, Cleveland',
        featured_image_url: photos[0].url,
        featured: true,
        sort_order: 2,
      })
      .select()
      .single()

    if (createError) { console.error('Error creating project:', createError); return }
    console.log('Created project:', newProject.title, '(', newProject.id, ')')
    await insertMedia(newProject.id)
  } else {
    const project = projects[0]
    console.log('Found project:', project.title, '(', project.id, ')')
    await supabase.from('projects').update({ featured_image_url: photos[0].url }).eq('id', project.id)
    await insertMedia(project.id)
  }
}

async function insertMedia(projectId: string) {
  await supabase.from('media').delete().eq('project_id', projectId)
  const mediaRecords = photos.map((photo, index) => ({
    project_id: projectId, type: 'image' as const, url: photo.url,
    alt_text: photo.alt_text, caption: photo.caption, sort_order: index,
  }))
  const { data, error } = await supabase.from('media').insert(mediaRecords).select()
  if (error) { console.error('Error inserting media:', error); return }
  console.log(`Successfully inserted ${data.length} photos for The Bamboo Haus!`)
}

main().catch(console.error)
