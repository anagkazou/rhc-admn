import { parsePage, SubmissionsListView } from '../list-view'

export default async function ContactSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  return (
    <SubmissionsListView
      table="contact_submissions"
      title="Contact submissions"
      basePath="/dashboard/contact"
      page={parsePage(pageParam)}
    />
  )
}
