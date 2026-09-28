export function slugify(text) {
  const slug = String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || 'item';
}

// Appends -2, -3, … until the slug is free (optionally ignoring one document).
export async function uniqueSlug(Model, base, ignoreId = null) {
  let slug = base;
  let n = 2;
  for (;;) {
    const query = { slug };
    if (ignoreId) query._id = { $ne: ignoreId };
    const clash = await Model.findOne(query).select('_id').lean();
    if (!clash) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
}
