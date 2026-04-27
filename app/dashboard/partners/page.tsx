import { parsePage, SubmissionsListView } from '../list-view'

export default async function PartnerSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  return (
    <SubmissionsListView
      table="partner_submissions"
      title="Partner submissions"
      basePath="/dashboard/partners"
      page={parsePage(pageParam)}
    />
  )
}
