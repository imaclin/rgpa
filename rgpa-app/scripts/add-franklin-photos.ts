import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// All photos scraped from the Airbnb listing
const photos = [
  { url: "https://a0.muscache.com/im/pictures/130030b5-da05-4b2a-b798-7df40401a0d0.jpg?im_w=1200", alt_text: "The Franklin Grand - Hero", caption: "The Franklin Grand, a modern Victorian mansion" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/46bf8338-5e7f-46e5-8dfb-d8410260b876.jpeg?im_w=1200", alt_text: "Franklin Grand Interior", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/e68527a8-5006-4d7f-bf75-46d3c45e4bfe.jpeg?im_w=1200", alt_text: "Franklin Grand Exterior - Victorian Architecture", caption: "This grand Victorian is over 140 years old and still in amazing condition" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/e9ac5c91-c34b-47f5-a5c7-35e5bbcffc6a.jpeg?im_w=1200", alt_text: "Franklin Grand Foyer", caption: "The grand foyer that greets you upon arrival" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/0bbb94d7-fb88-4820-8621-77bd98fe3fc5.jpeg?im_w=1200", alt_text: "Franklin Grand Interior Detail", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/a8a6d6e2-3f54-49c8-8645-76d3fcfb1da4.jpeg?im_w=1200", alt_text: "Bedroom 1", caption: "Bedroom 1 - Queen bed" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/58d2596f-b65f-4d20-b5b6-cc75fe23a4ca.jpeg?im_w=1200", alt_text: "Bedroom 2", caption: "Bedroom 2 - King bed" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/aaedf409-ca7d-4219-ba14-69f1b24eaba5.jpeg?im_w=1200", alt_text: "Bedroom 3", caption: "Bedroom 3 - Two double beds" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/4efd7a53-9f51-4a92-8278-f0acc35cc7fa.jpeg?im_w=1200", alt_text: "Bedroom 4", caption: "Bedroom 4 - King bed" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-630536104281303746/original/ff343f91-9858-4b11-a420-53b29f6a962e.jpeg?im_w=1200", alt_text: "Bedroom 5", caption: "Bedroom 5 - Queen bed" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/7112267a-30be-43d0-8262-6788dd8fba1e.jpeg?im_w=1200", alt_text: "Living Room", caption: "Living room with sofa bed" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/5d04e160-3254-4088-ad63-3f99851d229d.jpeg?im_w=1200", alt_text: "Full Bathroom 1", caption: "Full bathroom 1" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/d82743dc-ae3e-4c5e-85d4-978ed18687ea.jpeg?im_w=1200", alt_text: "Full Bathroom 2", caption: "Full bathroom 2" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/8f4c4681-299a-4451-8108-f79ae39b9b91.jpeg?im_w=1200", alt_text: "Full Bathroom 3", caption: "Full bathroom 3" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/76bc25aa-5ec4-41ef-b7b5-19c8b5173700.jpeg?im_w=1200", alt_text: "Full Bathroom 4", caption: "Full bathroom 4" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/e1981805-853a-49ac-93a9-cfd25edbf493.jpeg?im_w=1200", alt_text: "Full Bathroom 4 Detail", caption: "Full bathroom 4 detail" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/f8936ba5-4a36-4548-bf61-e3c64b01c4ca.jpeg?im_w=1200", alt_text: "Half Bathroom", caption: "Half bathroom" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/3a911d04-c3ff-4f82-ab5a-82e3e689cb33.jpeg?im_w=1200", alt_text: "Backyard", caption: "Backyard" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-630536104281303746/original/9945d0b5-d1e4-4437-b7d0-6700c40f6c97.jpeg?im_w=1200", alt_text: "Laundry Area", caption: "Laundry area" },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-630536104281303746/original/334284cc-c396-49d2-a2f9-b417c04700f6.jpeg?im_w=1200", alt_text: "Laundry Area 2", caption: "Laundry area" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/94eb49a3-a1c7-4e7b-ab25-ab00843064bb.jpeg?im_w=1200", alt_text: "Exterior View", caption: "Exterior view" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/ec0710c1-7efd-4410-b166-6d9b441f86f1.jpeg?im_w=1200", alt_text: "Victorian Exterior", caption: "This beautiful Victorian is over 140 years old" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/a6b0b850-bb88-415e-bfa6-d889b1cc64e9.jpeg?im_w=1200", alt_text: "Exterior Detail", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/077d7dfa-bb0e-44d4-bed1-ec5912ba932d.jpeg?im_w=1200", alt_text: "Exterior View 2", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/99073ab5-a885-4ba8-89f6-09dc25e2d59c.jpeg?im_w=1200", alt_text: "Exterior View 3", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/2bd2d59f-910f-4877-bf0c-67a589e73ad0.jpeg?im_w=1200", alt_text: "Interior Detail", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/812fc1ff-9f83-4106-bf0a-5c1449d9e4c5.jpeg?im_w=1200", alt_text: "Interior Detail 2", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/256ff099-a678-4910-ad26-2d3695225d1c.jpeg?im_w=1200", alt_text: "Hand Painted Mural Wall", caption: "Hand painted mural wall" },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/e7a0a88e-985b-4949-85f2-377bdc80b802.jpeg?im_w=1200", alt_text: "Interior Detail 3", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/de2e8559-cb27-4001-aad8-67e45675c511.jpeg?im_w=1200", alt_text: "Interior Detail 4", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/68e082dc-a3af-49d9-b10e-6657616400dd.jpeg?im_w=1200", alt_text: "Interior Detail 5", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/61cffb9c-9f1f-4315-9948-8f0c7dd1054d.jpeg?im_w=1200", alt_text: "Interior Detail 6", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/dfce7978-3287-4681-b5af-56595d8f4531.jpeg?im_w=1200", alt_text: "Interior Detail 7", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/64f8650f-053c-4c5e-b1a1-e2fb09160711.jpeg?im_w=1200", alt_text: "Interior Detail 8", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/c28f3c9c-a6c7-4764-b349-781f06e1f2db.jpeg?im_w=1200", alt_text: "Interior Detail 9", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/e7baf737-4177-40e8-9697-46e2f863640e.jpeg?im_w=1200", alt_text: "Interior Detail 10", caption: null },
  { url: "https://a0.muscache.com/im/pictures/miso/Hosting-630536104281303746/original/aeea3097-27dd-44c5-aca9-e9adb9b1a42b.jpeg?im_w=1200", alt_text: "Interior Detail 11", caption: null },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-630536104281303746/original/6e72c1d2-c25b-43e5-a3de-75a4aab907a6.jpeg?im_w=1200", alt_text: "Interior Detail 12", caption: null },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-630536104281303746/original/50fcca56-8c51-42de-be92-9f9afd39f8cc.jpeg?im_w=1200", alt_text: "Interior Detail 13", caption: null },
  { url: "https://a0.muscache.com/im/pictures/hosting/Hosting-630536104281303746/original/6e853679-3a07-4573-8392-d7655deea39b.jpeg?im_w=1200", alt_text: "Interior Detail 14", caption: null },
]

async function main() {
  // Find the Franklin Grand project
  const { data: projects, error: projectError } = await supabase
    .from('projects')
    .select('id, title, slug')
    .or('title.ilike.%franklin%,slug.ilike.%franklin%')

  if (projectError) {
    console.error('Error finding project:', projectError)
    return
  }

  if (!projects || projects.length === 0) {
    console.log('No Franklin Grand project found. Creating one...')
    
    const { data: newProject, error: createError } = await supabase
      .from('projects')
      .insert({
        title: 'The Franklin Grand',
        subtitle: 'A Modern Victorian Mansion',
        slug: 'the-franklin-grand',
        description: 'This magnificent Modern Victorian Mansion will blow you away the minute you approach the grand exterior and walk through the door. Every detail of this home has been restored to its original grandeur. Located in the heart of Ohio City, Cleveland.',
        category: 'residential',
        status: 'completed',
        location: 'Ohio City, Cleveland',
        featured_image_url: photos[0].url,
        featured: true,
        sort_order: 0,
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
    
    // Update featured image
    await supabase
      .from('projects')
      .update({ featured_image_url: photos[0].url })
      .eq('id', project.id)
    
    await insertMedia(project.id)
  }
}

async function insertMedia(projectId: string) {
  // First delete existing media for this project to avoid duplicates
  const { error: deleteError } = await supabase
    .from('media')
    .delete()
    .eq('project_id', projectId)

  if (deleteError) {
    console.error('Error deleting existing media:', deleteError)
  }

  // Insert all photos
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

  console.log(`Successfully inserted ${data.length} photos for Franklin Grand!`)
}

main().catch(console.error)
