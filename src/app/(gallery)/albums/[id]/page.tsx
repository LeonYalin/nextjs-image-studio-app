import AlbumDetail from "@/components/AlbumDetail";

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AlbumDetail albumId={id} />;
}
