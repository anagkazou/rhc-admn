import { parsePage, SubmissionsListView } from '../list-view'

export default async function PlayerSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  return (
    <SubmissionsListView
      table="contact_submissions"
      title="Player submissions"
      basePath="/dashboard/player"
      page={parsePage(pageParam)}
    />
  )
}
