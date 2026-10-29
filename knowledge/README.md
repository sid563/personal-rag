# Knowledge base for the sidharthsingh.dev chatbot

One markdown file per category. The file name without `.md` is the category stored with each chunk:
`about`, `experience`, `projects`, `skills`, `education-and-awards`, `learning-and-roadmap`, `contact-and-faq`.

## Format

- The single `#` title at the top of a file is ignored.
- Every `## Heading` starts one chunk. The chunk is the heading plus everything under it until the next `##`. No `###` levels.
- Each chunk stands alone: it names Sidharth (or Sidharth Singh), never relies on a previous chunk, and runs about 60 to 180 words. Plain prose or short bullet lists; no tables.
- Only URLs the site already publishes (sidharthsingh.dev paths, GitHub, LinkedIn, 1buy.ai).
- A chunk whose body starts with `TODO` is skipped by the seed script. Fill it in or delete it.

## Rules for the content

- Professional, marketing tone. No limitations, no "honest notes", no attribution of work to teammates.
- Every number must be traceable to a file in the sidharthsingh.dev repo (projects, resume, skills, site data, now, roadmap, progress).
- The order-fulfilment backend has no Kafka; never say it does.
- No secrets, hostnames, mailboxes, customer names, salary or phone number. The public email is fine.

## Re-seeding

```bash
npm run seed
```

This wipes the collection and re-embeds every non-TODO chunk from this folder.

## Private chunks

Files in `knowledge/private/` follow the same format and are seeded too, but the folder is git-ignored. Put answers there that should not live in the public repository (for example notice period or work authorisation). The category is the file name, so `private/contact-and-faq.md` merges with the public `contact-and-faq` category.
