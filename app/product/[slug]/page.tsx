export default async function ProductCakePage({ params, }: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    return (
        <div>
            {/* TODO: Disini nanti isi image deskripsi nama kue dll lah ya pokoknya dari API di fetch datanya - david */}
            <h1>{slug}</h1>
        </div>
    )
}